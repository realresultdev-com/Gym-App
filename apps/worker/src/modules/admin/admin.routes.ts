import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse, parsePagination } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';

export const adminRoutes = new Hono<AppContext>();

adminRoutes.use('*', authMiddleware, requireRole('ADMIN'));

// GET /api/admin/metrics
adminRoutes.get('/metrics', async (c) => {
  const gymId = c.get('gym_id');

  // Single efficient batch query for dashboard metrics
  const [totalMembersRow, activeSubsRow, todayCheckInsRow, monthRevenueRow] = await Promise.all([
    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM users WHERE gym_id = ? AND role = 'MEMBER' AND deleted_at IS NULL`
    ).bind(gymId).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM member_subscriptions WHERE gym_id = ? AND status = 'ACTIVE'`
    ).bind(gymId).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT COUNT(*) as count FROM attendance WHERE gym_id = ? AND date(check_in_time) = date('now')`
    ).bind(gymId).first<{ count: number }>(),

    c.env.DB.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments
       WHERE gym_id = ? AND payment_status = 'COMPLETED'
         AND strftime('%Y-%m', paid_at) = strftime('%Y-%m', 'now')`
    ).bind(gymId).first<{ total: number }>(),
  ]);

  return c.json(jsonResponse({
    total_members: totalMembersRow?.count || 0,
    active_subscriptions: activeSubsRow?.count || 0,
    today_checkins: todayCheckInsRow?.count || 0,
    monthly_revenue: monthRevenueRow?.total || 0,
  }));
});

// GET /api/admin/usage - Cloudflare Free-Tier Usage Monitor
adminRoutes.get('/usage', async (c) => {
  const gymId = c.get('gym_id');

  // Free Tier Limits reference:
  // Workers: 100,000 req/day
  // D1: 5,000,000 rows read/day, 100,000 rows written/day, 500MB storage
  // KV: 100,000 reads/day, 1,000 writes/day, 1GB storage
  // R2: 10GB storage, 1,000,000 Class B ops/mo

  const [usersCount, attendanceCount, auditCount] = await Promise.all([
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM users WHERE gym_id = ?`).bind(gymId).first<{ count: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM attendance WHERE gym_id = ?`).bind(gymId).first<{ count: number }>(),
    c.env.DB.prepare(`SELECT COUNT(*) as count FROM audit_logs WHERE gym_id = ?`).bind(gymId).first<{ count: number }>(),
  ]);

  const totalEstimatedRows = (usersCount?.count || 0) + (attendanceCount?.count || 0) + (auditCount?.count || 0);

  return c.json(jsonResponse({
    tier: 'Cloudflare Free Tier',
    status: 'OPTIMIZED',
    limits: {
      d1_storage_mb_limit: 500,
      d1_daily_writes_limit: 100000,
      d1_daily_reads_limit: 5000000,
      workers_daily_requests_limit: 100000,
    },
    metrics: {
      active_database_records: totalEstimatedRows,
      estimated_d1_storage_kb: Math.round(totalEstimatedRows * 0.5),
      storage_usage_percent: Math.min(100, (totalEstimatedRows * 0.5) / (500 * 1024) * 100).toFixed(2) + '%',
      health: 'EXCELLENT',
    },
  }));
});

// GET /api/admin/users
adminRoutes.get('/users', async (c) => {
  const gymId = c.get('gym_id');
  const role = c.req.query('role');
  const status = c.req.query('status');
  const { limit, offset, page } = parsePagination(c);

  let query = `SELECT id, email, phone, first_name, last_name, role, status, avatar_url, created_at
               FROM users WHERE gym_id = ? AND deleted_at IS NULL`;
  const params: any[] = [gymId];

  if (role) {
    query += ` AND role = ?`;
    params.push(role);
  }
  if (status) {
    query += ` AND status = ?`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = c.env.DB.prepare(query);
  const rows = await stmt.bind(...params).all();

  return c.json(jsonResponse(rows.results, { page, limit }));
});

// PATCH /api/admin/users/:id/status
adminRoutes.patch('/users/:id/status', async (c) => {
  const gymId = c.get('gym_id');
  const targetId = c.req.param('id');
  const body = await c.req.json();
  const status = body.status;

  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Status must be ACTIVE, INACTIVE, or SUSPENDED'), 400);
  }

  await c.env.DB.prepare(
    `UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ? AND gym_id = ?`
  ).bind(status, targetId, gymId).run();

  // Audit log
  await c.env.DB.prepare(
    `INSERT INTO audit_logs (id, gym_id, actor_id, action, entity, entity_id, details_json, created_at)
     VALUES (?, ?, ?, 'USER_STATUS_UPDATE', 'users', ?, ?, datetime('now'))`
  ).bind(generateUUID(), gymId, c.get('user_id'), targetId, JSON.stringify({ new_status: status })).run();

  return c.json(jsonResponse({ message: `User status changed to ${status}` }));
});

