import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse, parsePagination } from '../../utils/d1';
import { generateUUID, createJwt, verifyJwt } from '../../utils/crypto';
import { checkInSchema, checkOutSchema } from '@gym-app/shared-validation';

export const attendanceRoutes = new Hono<AppContext>();

attendanceRoutes.use('*', authMiddleware);

// GET /api/attendance/live-occupancy - Current active gym attendance
attendanceRoutes.get('/live-occupancy', async (c) => {
  const gymId = c.get('gym_id');

  const [activeCountRow, gymSettings] = await Promise.all([
    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM attendance
       WHERE gym_id = ? AND status = 'CHECKED_IN'`
    ).bind(gymId).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT capacity_limit, opening_time, closing_time FROM gym_settings WHERE gym_id = ?`
    ).bind(gymId).first<any>(),
  ]);

  const activeCount = activeCountRow?.count || 0;
  const capacity = gymSettings?.capacity_limit || 100;
  const percentage = Math.round((activeCount / capacity) * 100);

  let crowdingStatus = 'Not Busy';
  if (percentage > 75) crowdingStatus = 'Peak Busy';
  else if (percentage > 45) crowdingStatus = 'Moderate';

  return c.json(jsonResponse({
    active_occupants: activeCount,
    capacity_limit: capacity,
    occupancy_percentage: percentage,
    crowding_status: crowdingStatus, // "Nicht zu stark besucht" / "Not Busy"
    opening_time: gymSettings?.opening_time || '06:00',
    closing_time: gymSettings?.closing_time || '22:00',
  }));
});

// GET /api/attendance/qr/generate - Generate dynamic QR token for gym front desk
attendanceRoutes.get('/qr/generate', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const now = Math.floor(Date.now() / 1000);

  // 120-second validity dynamic QR code token
  const qrToken = await createJwt(
    { gym_id: gymId, type: 'GYM_ATTENDANCE_QR', nonce: generateUUID() },
    c.env.JWT_SECRET,
    120
  );

  return c.json(jsonResponse({
    qr_token: qrToken,
    expires_in_sec: 120,
    timestamp: now,
  }));
});

// POST /api/attendance/check-in
attendanceRoutes.post('/check-in', async (c) => {
  const gymId = c.get('gym_id');
  const role = c.get('role');
  const authUserId = c.get('user_id');

  const body = await c.req.json();
  const parsed = checkInSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid check-in parameters'), 400);
  }

  // Determine target member
  let targetMemberId = authUserId;
  if (role === 'ADMIN' || role === 'TRAINER') {
    if (parsed.data.member_id) {
      targetMemberId = parsed.data.member_id;
    }
  }

  // If QR check-in, verify token
  if (parsed.data.method === 'QR_CODE' && parsed.data.qr_token) {
    const qrData = await verifyJwt<{ gym_id: string; type: string }>(parsed.data.qr_token, c.env.JWT_SECRET);
    if (!qrData || qrData.type !== 'GYM_ATTENDANCE_QR' || qrData.gym_id !== gymId) {
      return c.json(errorResponse('INVALID_QR', 'Invalid or expired QR code'), 400);
    }
  }

  // Prevent duplicate active check-ins using strict D1 query
  const existingActive = await c.env.DB.prepare(
    `SELECT id, check_in_time FROM attendance
     WHERE gym_id = ? AND member_id = ? AND status = 'CHECKED_IN'`
  ).bind(gymId, targetMemberId).first<{ id: string; check_in_time: string }>();

  if (existingActive) {
    return c.json(errorResponse('ALREADY_CHECKED_IN', 'Member is already checked in.', {
      attendance_id: existingActive.id,
      check_in_time: existingActive.check_in_time,
    }), 409);
  }

  // Check active membership subscription
  const activeSub = await c.env.DB.prepare(
    `SELECT id, status, end_date FROM member_subscriptions
     WHERE gym_id = ? AND member_id = ? AND status = 'ACTIVE' AND end_date >= datetime('now')`
  ).bind(gymId, targetMemberId).first();

  if (!activeSub) {
    return c.json(errorResponse('NO_ACTIVE_MEMBERSHIP', 'No active membership plan found. Please renew membership.'), 403);
  }

  const attendanceId = generateUUID();
  const checkInTime = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO attendance (id, gym_id, member_id, check_in_time, status, method, created_at)
     VALUES (?, ?, ?, ?, 'CHECKED_IN', ?, datetime('now'))`
  ).bind(attendanceId, gymId, targetMemberId, checkInTime, parsed.data.method).run();

  return c.json(jsonResponse({
    attendance_id: attendanceId,
    member_id: targetMemberId,
    check_in_time: checkInTime,
    status: 'CHECKED_IN',
    method: parsed.data.method,
    message: 'Check-in successful! Have a great workout.',
  }), 201);
});

// POST /api/attendance/check-out
attendanceRoutes.post('/check-out', async (c) => {
  const gymId = c.get('gym_id');
  const role = c.get('role');
  const authUserId = c.get('user_id');

  const body = await c.req.json();
  const parsed = checkOutSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid check-out parameters'), 400);
  }

  let targetMemberId = authUserId;
  if ((role === 'ADMIN' || role === 'TRAINER') && parsed.data.member_id) {
    targetMemberId = parsed.data.member_id;
  }

  // Find active check-in
  const activeRecord = await c.env.DB.prepare(
    `SELECT id, check_in_time FROM attendance
     WHERE gym_id = ? AND member_id = ? AND status = 'CHECKED_IN'
     ORDER BY check_in_time DESC LIMIT 1`
  ).bind(gymId, targetMemberId).first<{ id: string; check_in_time: string }>();

  if (!activeRecord) {
    return c.json(errorResponse('NOT_CHECKED_IN', 'No active check-in session found to check out.'), 404);
  }

  const checkOutTime = new Date().toISOString();
  const durationMinutes = Math.max(
    1,
    Math.round((new Date(checkOutTime).getTime() - new Date(activeRecord.check_in_time).getTime()) / 60000)
  );

  await c.env.DB.prepare(
    `UPDATE attendance
     SET status = 'CHECKED_OUT', check_out_time = ?, duration_minutes = ?
     WHERE id = ?`
  ).bind(checkOutTime, durationMinutes, activeRecord.id).run();

  return c.json(jsonResponse({
    attendance_id: activeRecord.id,
    check_in_time: activeRecord.check_in_time,
    check_out_time: checkOutTime,
    duration_minutes: durationMinutes,
    status: 'CHECKED_OUT',
    message: 'Checked out successfully.',
  }));
});

// GET /api/attendance/my - Member's own attendance history
attendanceRoutes.get('/my', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');
  const { limit, offset, page } = parsePagination(c);

  const rows = await c.env.DB.prepare(
    `SELECT * FROM attendance
     WHERE gym_id = ? AND member_id = ?
     ORDER BY check_in_time DESC LIMIT ? OFFSET ?`
  ).bind(gymId, userId, limit, offset).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

// GET /api/attendance/admin - Admin view of all gym attendance
attendanceRoutes.get('/admin', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const status = c.req.query('status');
  const dateStr = c.req.query('date');
  const { limit, offset, page } = parsePagination(c);

  let query = `
    SELECT a.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url
    FROM attendance a
    JOIN users u ON a.member_id = u.id
    WHERE a.gym_id = ?
  `;
  const params: any[] = [gymId];

  if (status) {
    query += ` AND a.status = ?`;
    params.push(status);
  }
  if (dateStr) {
    query += ` AND date(a.check_in_time) = date(?)`;
    params.push(dateStr);
  }

  query += ` ORDER BY a.check_in_time DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

// GET /api/attendance/member/:id - History for specific member
attendanceRoutes.get('/member/:id', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const targetId = c.req.param('id');
  const { limit, offset, page } = parsePagination(c);

  const rows = await c.env.DB.prepare(
    `SELECT * FROM attendance
     WHERE gym_id = ? AND member_id = ?
     ORDER BY check_in_time DESC LIMIT ? OFFSET ?`
  ).bind(gymId, targetId, limit, offset).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

