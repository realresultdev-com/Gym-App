import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole, verifyTrainerMemberAccess } from '../../middleware/authorization';
import { jsonResponse, errorResponse, parsePagination } from '../../utils/d1';
import { generateUUID, hashPassword } from '../../utils/crypto';
import { createMemberSchema, updateMemberSchema } from '@gym-app/shared-validation';

export const membersRoutes = new Hono<AppContext>();

membersRoutes.use('*', authMiddleware);

// GET /api/members/me/dashboard
membersRoutes.get('/me/dashboard', async (c) => {
  const userId = c.get('user_id');
  const gymId = c.get('gym_id');

  // Single efficient batch lookup
  const [profile, subscription, activePlan, recentAttendance] = await Promise.all([
    c.env.DB.prepare(
      `SELECT m.*, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
              t.first_name as trainer_first_name, t.last_name as trainer_last_name
       FROM member_profiles m
       JOIN users u ON m.user_id = u.id
       LEFT JOIN users t ON m.assigned_trainer_id = t.id
       WHERE m.user_id = ? AND m.gym_id = ?`
    ).bind(userId, gymId).first<any>(),

    c.env.DB.prepare(
      `SELECT s.*, p.name as plan_name, p.duration_days
       FROM member_subscriptions s
       JOIN membership_plans p ON s.plan_id = p.id
       WHERE s.member_id = ? AND s.gym_id = ? AND s.status = 'ACTIVE'
       ORDER BY s.end_date DESC LIMIT 1`
    ).bind(userId, gymId).first<any>(),

    c.env.DB.prepare(
      `SELECT * FROM workout_plans
       WHERE (assigned_to_member_id = ? OR is_template = 1) AND gym_id = ?
       ORDER BY is_template ASC LIMIT 1`
    ).bind(userId, gymId).first<any>(),

    c.env.DB.prepare(
      `SELECT * FROM attendance
       WHERE member_id = ? AND gym_id = ?
       ORDER BY check_in_time DESC LIMIT 7`
    ).bind(userId, gymId).all<any>(),
  ]);

  return c.json(jsonResponse({
    profile,
    subscription,
    active_workout_plan: activePlan,
    recent_attendance: recentAttendance.results || [],
    streak_days: (recentAttendance.results || []).length,
  }));
});

// GET /api/members - list members
membersRoutes.get('/', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const role = c.get('role');
  const userId = c.get('user_id');
  const search = (c.req.query('search') || '').trim();
  const { limit, offset, page } = parsePagination(c);

  let query = `
    SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.status, u.avatar_url, u.created_at,
           m.fitness_goal, m.join_date, m.assigned_trainer_id,
           s.status as subscription_status, p.name as plan_name, s.end_date as subscription_end
    FROM users u
    JOIN member_profiles m ON u.id = m.user_id
    LEFT JOIN member_subscriptions s ON u.id = s.member_id AND s.status = 'ACTIVE'
    LEFT JOIN membership_plans p ON s.plan_id = p.id
    WHERE u.gym_id = ? AND u.role = 'MEMBER' AND u.deleted_at IS NULL
  `;
  const params: any[] = [gymId];

  // If trainer, only show assigned members
  if (role === 'TRAINER') {
    query += ` AND m.assigned_trainer_id = ?`;
    params.push(userId);
  }

  if (search) {
    query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = await c.env.DB.prepare(query).bind(...params).all();

  return c.json(jsonResponse(rows.results, { page, limit }));
});

// POST /api/members - create member (ADMIN only)
membersRoutes.post('/', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = createMemberSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid member creation data', parsed.error.format()), 400);
  }

  const data = parsed.data;
  const newUserId = generateUUID();
  const newProfileId = generateUUID();

  // Check email or phone conflict
  const existing = await c.env.DB.prepare(
    `SELECT id FROM users WHERE gym_id = ? AND (email = ? OR phone = ?) AND deleted_at IS NULL`
  ).bind(gymId, data.email.toLowerCase(), data.phone).first();

  if (existing) {
    return c.json(errorResponse('DUPLICATE_USER', 'A user with this email or phone already exists'), 409);
  }

  const defaultPassword = data.password || 'Welcome123!';
  const passwordHash = await hashPassword(defaultPassword);

  // D1 Batch transaction for atomic creation
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `INSERT INTO users (id, gym_id, email, phone, password_hash, first_name, last_name, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'MEMBER', 'ACTIVE', datetime('now'), datetime('now'))`
    ).bind(newUserId, gymId, data.email.toLowerCase(), data.phone, passwordHash, data.first_name, data.last_name),

    c.env.DB.prepare(
      `INSERT INTO member_profiles (id, user_id, gym_id, emergency_contact, date_of_birth, gender, address, height_cm, target_weight_kg, fitness_goal, medical_conditions, join_date, assigned_trainer_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, datetime('now'), datetime('now'))`
    ).bind(
      newProfileId,
      newUserId,
      gymId,
      data.emergency_contact || null,
      data.date_of_birth || null,
      data.gender || null,
      data.address || null,
      data.height_cm || null,
      data.target_weight_kg || null,
      data.fitness_goal || null,
      data.medical_conditions || null,
      data.assigned_trainer_id || null
    ),
  ];

  // If initial membership plan specified, subscribe them
  if (data.plan_id) {
    const plan = await c.env.DB.prepare(`SELECT * FROM membership_plans WHERE id = ? AND gym_id = ?`).bind(data.plan_id, gymId).first<any>();
    if (plan) {
      const subId = generateUUID();
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO member_subscriptions (id, gym_id, member_id, plan_id, start_date, end_date, status, total_amount, paid_amount, outstanding_balance, auto_renew, created_at, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+' || ? || ' days'), 'ACTIVE', ?, 0, ?, 0, datetime('now'), datetime('now'))`
        ).bind(subId, gymId, newUserId, plan.id, plan.duration_days, plan.price + plan.admission_fee, plan.price + plan.admission_fee)
      );
    }
  }

  // If assigned trainer, record assignment
  if (data.assigned_trainer_id) {
    statements.push(
      c.env.DB.prepare(
        `INSERT INTO trainer_member_assignments (id, gym_id, trainer_id, member_id, assigned_at, status)
         VALUES (?, ?, ?, ?, datetime('now'), 'ACTIVE')`
      ).bind(generateUUID(), gymId, data.assigned_trainer_id, newUserId)
    );
  }

  await c.env.DB.batch(statements);

  return c.json(jsonResponse({
    id: newUserId,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    message: 'Member successfully created',
  }), 201);
});

// GET /api/members/:id - get member profile
membersRoutes.get('/:id', async (c) => {
  const targetId = c.req.param('id');
  const role = c.get('role');
  const userId = c.get('user_id');
  const gymId = c.get('gym_id');

  // Access check
  if (role === 'MEMBER' && targetId !== userId) {
    return c.json(errorResponse('FORBIDDEN', 'Access denied to other members profiles'), 403);
  }

  if (role === 'TRAINER') {
    const isAssigned = await verifyTrainerMemberAccess(c.env.DB, gymId, userId, targetId);
    if (!isAssigned) {
      return c.json(errorResponse('FORBIDDEN', 'Member is not assigned to you'), 403);
    }
  }

  const member = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.phone, u.first_name, u.last_name, u.status, u.avatar_url, u.created_at,
            m.*, t.first_name as trainer_first_name, t.last_name as trainer_last_name
     FROM users u
     JOIN member_profiles m ON u.id = m.user_id
     LEFT JOIN users t ON m.assigned_trainer_id = t.id
     WHERE u.id = ? AND u.gym_id = ? AND u.deleted_at IS NULL`
  ).bind(targetId, gymId).first();

  if (!member) {
    return c.json(errorResponse('NOT_FOUND', 'Member not found'), 404);
  }

  return c.json(jsonResponse(member));
});

// PUT /api/members/:id - update member
membersRoutes.put('/:id', async (c) => {
  const targetId = c.req.param('id');
  const role = c.get('role');
  const userId = c.get('user_id');
  const gymId = c.get('gym_id');

  if (role !== 'ADMIN' && targetId !== userId) {
    return c.json(errorResponse('FORBIDDEN', 'Cannot update other members profiles'), 403);
  }

  const body = await c.req.json();
  const parsed = updateMemberSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid update data'), 400);
  }

  const data = parsed.data;

  await c.env.DB.prepare(
    `UPDATE member_profiles
     SET emergency_contact = COALESCE(?, emergency_contact),
         height_cm = COALESCE(?, height_cm),
         target_weight_kg = COALESCE(?, target_weight_kg),
         fitness_goal = COALESCE(?, fitness_goal),
         medical_conditions = COALESCE(?, medical_conditions),
         address = COALESCE(?, address),
         updated_at = datetime('now')
     WHERE user_id = ? AND gym_id = ?`
  ).bind(
    data.emergency_contact || null,
    data.height_cm || null,
    data.target_weight_kg || null,
    data.fitness_goal || null,
    data.medical_conditions || null,
    data.address || null,
    targetId,
    gymId
  ).run();

  return c.json(jsonResponse({ message: 'Profile updated successfully' }));
});

// DELETE /api/members/:id - soft delete member
membersRoutes.delete('/:id', requireRole('ADMIN'), async (c) => {
  const targetId = c.req.param('id');
  const gymId = c.get('gym_id');

  await c.env.DB.prepare(
    `UPDATE users SET deleted_at = datetime('now'), status = 'INACTIVE'
     WHERE id = ? AND gym_id = ?`
  ).bind(targetId, gymId).run();

  return c.json(jsonResponse({ message: 'Member deactivated and removed' }));
});

