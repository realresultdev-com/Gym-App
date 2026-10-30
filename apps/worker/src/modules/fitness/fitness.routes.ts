import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';
import { recordFitnessMeasurementSchema } from '@gym-app/shared-validation';

export const fitnessRoutes = new Hono<AppContext>();

fitnessRoutes.use('*', authMiddleware);

// GET /api/fitness/measurements - Member measurements history
fitnessRoutes.get('/measurements', async (c) => {
  const gymId = c.get('gym_id');
  const role = c.get('role');
  const userId = c.get('user_id');
  const memberId = c.req.query('member_id') || userId;

  if (role === 'MEMBER' && memberId !== userId) {
    return c.json(errorResponse('FORBIDDEN', 'Access denied to other member measurements'), 403);
  }

  const rows = await c.env.DB.prepare(
    `SELECT * FROM fitness_measurements
     WHERE gym_id = ? AND member_id = ?
     ORDER BY recorded_at DESC LIMIT 30`
  ).bind(gymId, memberId).all();

  return c.json(jsonResponse(rows.results || []));
});

// POST /api/fitness/measurements - Record new body metrics
fitnessRoutes.post('/measurements', async (c) => {
  const gymId = c.get('gym_id');
  const role = c.get('role');
  const authUserId = c.get('user_id');

  const body = await c.req.json();
  const parsed = recordFitnessMeasurementSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid measurement payload', parsed.error.format()), 400);
  }

  const d = parsed.data;
  let targetMemberId = authUserId;
  if ((role === 'ADMIN' || role === 'TRAINER') && d.member_id) {
    targetMemberId = d.member_id;
  }

  // Calculate BMI if height is available
  let bmi: number | null = null;
  if (d.height_cm && d.height_cm > 0) {
    const heightM = d.height_cm / 100;
    bmi = parseFloat((d.weight_kg / (heightM * heightM)).toFixed(1));
  }

  const id = generateUUID();

  await c.env.DB.prepare(
    `INSERT INTO fitness_measurements (id, gym_id, member_id, recorded_at, weight_kg, height_cm, bmi, body_fat_percentage, muscle_mass_kg, chest_cm, waist_cm, hips_cm, biceps_cm, notes, created_at)
     VALUES (?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    id,
    gymId,
    targetMemberId,
    d.weight_kg,
    d.height_cm || null,
    bmi,
    d.body_fat_percentage || null,
    d.muscle_mass_kg || null,
    d.chest_cm || null,
    d.waist_cm || null,
    d.hips_cm || null,
    d.biceps_cm || null,
    d.notes || null
  ).run();

  return c.json(jsonResponse({
    id,
    weight_kg: d.weight_kg,
    bmi,
    message: 'Measurement recorded successfully',
  }), 201);
});

