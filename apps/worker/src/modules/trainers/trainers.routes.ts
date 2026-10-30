import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID, hashPassword } from '../../utils/crypto';
import { createTrainerSchema } from '@gym-app/shared-validation';

export const trainersRoutes = new Hono<AppContext>();

trainersRoutes.use('*', authMiddleware);

// GET /api/trainers/me/clients - get assigned clients for current trainer
trainersRoutes.get('/me/clients', requireRole('TRAINER'), async (c) => {
  const trainerId = c.get('user_id');
  const gymId = c.get('gym_id');

  const clients = await c.env.DB.prepare(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
            m.fitness_goal, m.target_weight_kg, m.height_cm, m.join_date,
            s.status as subscription_status, p.name as plan_name,
            tma.assigned_at, tma.notes as assignment_notes
     FROM trainer_member_assignments tma
     JOIN users u ON tma.member_id = u.id
     JOIN member_profiles m ON u.id = m.user_id
     LEFT JOIN member_subscriptions s ON u.id = s.member_id AND s.status = 'ACTIVE'
     LEFT JOIN membership_plans p ON s.plan_id = p.id
     WHERE tma.trainer_id = ? AND tma.gym_id = ? AND tma.status = 'ACTIVE' AND u.deleted_at IS NULL
     ORDER BY tma.assigned_at DESC`
  ).bind(trainerId, gymId).all();

  return c.json(jsonResponse(clients.results || []));
});

// GET /api/trainers - list trainers
trainersRoutes.get('/', async (c) => {
  const gymId = c.get('gym_id');

  const trainers = await c.env.DB.prepare(
    `SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.avatar_url,
            t.specialization, t.bio, t.experience_years, t.certification, t.hourly_rate,
            (SELECT COUNT(*) FROM trainer_member_assignments WHERE trainer_id = u.id AND status = 'ACTIVE') as client_count
     FROM users u
     JOIN trainer_profiles t ON u.id = t.user_id
     WHERE u.gym_id = ? AND u.role = 'TRAINER' AND u.status = 'ACTIVE' AND u.deleted_at IS NULL
     ORDER BY u.first_name ASC`
  ).bind(gymId).all();

  return c.json(jsonResponse(trainers.results || []));
});

// POST /api/trainers - create trainer (ADMIN only)
trainersRoutes.post('/', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = createTrainerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid trainer data', parsed.error.format()), 400);
  }

  const data = parsed.data;
  const newUserId = generateUUID();
  const newProfileId = generateUUID();

  // Check email/phone uniqueness
  const existing = await c.env.DB.prepare(
    `SELECT id FROM users WHERE gym_id = ? AND (email = ? OR phone = ?) AND deleted_at IS NULL`
  ).bind(gymId, data.email.toLowerCase(), data.phone).first();

  if (existing) {
    return c.json(errorResponse('DUPLICATE_USER', 'Trainer email or phone already registered'), 409);
  }

  const passwordHash = await hashPassword(data.password || 'TrainerPass123!');

  await c.env.DB.batch([
    c.env.DB.prepare(
      `INSERT INTO users (id, gym_id, email, phone, password_hash, first_name, last_name, role, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'TRAINER', 'ACTIVE', datetime('now'), datetime('now'))`
    ).bind(newUserId, gymId, data.email.toLowerCase(), data.phone, passwordHash, data.first_name, data.last_name),

    c.env.DB.prepare(
      `INSERT INTO trainer_profiles (id, user_id, gym_id, specialization, bio, experience_years, certification, hourly_rate, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      newProfileId,
      newUserId,
      gymId,
      data.specialization,
      data.bio || null,
      data.experience_years,
      data.certification || null,
      data.hourly_rate || 0
    ),
  ]);

  return c.json(jsonResponse({
    id: newUserId,
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    message: 'Trainer account created',
  }), 201);
});

