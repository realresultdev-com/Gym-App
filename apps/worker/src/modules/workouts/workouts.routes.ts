import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';
import {
  createWorkoutPlanSchema,
  startWorkoutSessionSchema,
  logExerciseSetSchema,
  finishWorkoutSessionSchema,
} from '@gym-app/shared-validation';

export const workoutsRoutes = new Hono<AppContext>();

workoutsRoutes.use('*', authMiddleware);

// GET /api/workouts/plans/active - Active plan for member
workoutsRoutes.get('/plans/active', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');

  // Find personalized plan or default template
  const plan = await c.env.DB.prepare(
    `SELECT * FROM workout_plans
     WHERE gym_id = ? AND (assigned_to_member_id = ? OR is_template = 1)
     ORDER BY is_template ASC LIMIT 1`
  ).bind(gymId, userId).first<any>();

  if (!plan) {
    return c.json(jsonResponse(null));
  }

  // Fetch days and exercises
  const days = await c.env.DB.prepare(
    `SELECT * FROM workout_plan_days WHERE plan_id = ? ORDER BY day_of_week ASC`
  ).bind(plan.id).all<any>();

  const dayIds = (days.results || []).map((d: any) => d.id);
  let exercises: any[] = [];

  if (dayIds.length > 0) {
    const placeholders = dayIds.map(() => '?').join(',');
    const exRows = await c.env.DB.prepare(
      `SELECT wpe.*, e.name as exercise_name, e.target_muscle, e.image_url, e.tips_json
       FROM workout_plan_exercises wpe
       JOIN exercises e ON wpe.exercise_id = e.id
       WHERE wpe.day_id IN (${placeholders})
       ORDER BY wpe.sort_order ASC`
    ).bind(...dayIds).all();
    exercises = exRows.results || [];
  }

  const daysWithExercises = (days.results || []).map((day: any) => ({
    ...day,
    exercises: exercises.filter((ex: any) => ex.day_id === day.id),
  }));

  return c.json(jsonResponse({
    ...plan,
    days: daysWithExercises,
  }));
});

// POST /api/workouts/plans - Create workout plan (ADMIN or TRAINER)
workoutsRoutes.post('/plans', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');
  const body = await c.req.json();
  const parsed = createWorkoutPlanSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid workout plan', parsed.error.format()), 400);
  }

  const { title, description, difficulty, duration_weeks, assigned_to_member_id, is_template, days } = parsed.data;
  const planId = generateUUID();

  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `INSERT INTO workout_plans (id, gym_id, created_by, assigned_to_member_id, title, description, difficulty, duration_weeks, is_template, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(
      planId,
      gymId,
      userId,
      assigned_to_member_id || null,
      title,
      description || null,
      difficulty,
      duration_weeks,
      is_template ? 1 : 0
    ),
  ];

  for (const day of days) {
    const dayId = generateUUID();
    statements.push(
      c.env.DB.prepare(
        `INSERT INTO workout_plan_days (id, plan_id, day_of_week, title, rest_day, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(dayId, planId, day.day_of_week, day.title, day.rest_day ? 1 : 0, day.day_of_week)
    );

    for (let i = 0; i < day.exercises.length; i++) {
      const ex = day.exercises[i];
      statements.push(
        c.env.DB.prepare(
          `INSERT INTO workout_plan_exercises (id, day_id, exercise_id, sets, target_reps, target_weight_kg, rest_seconds, sort_order, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(generateUUID(), dayId, ex.exercise_id, ex.sets, ex.target_reps, ex.target_weight_kg || 0, ex.rest_seconds, i, ex.notes || null)
      );
    }
  }

  await c.env.DB.batch(statements);

  return c.json(jsonResponse({ id: planId, title, message: 'Workout plan created successfully' }), 201);
});

// POST /api/workouts/sessions/start - Start a live workout session
workoutsRoutes.post('/sessions/start', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');
  const body = await c.req.json();
  const parsed = startWorkoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid session data'), 400);
  }

  const sessionId = generateUUID();
  const startTime = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO workout_sessions (id, gym_id, member_id, plan_day_id, start_time, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(sessionId, gymId, userId, parsed.data.plan_day_id || null, startTime, parsed.data.notes || null).run();

  return c.json(jsonResponse({
    session_id: sessionId,
    start_time: startTime,
    message: 'Workout session started! Get after it!',
  }), 201);
});

// POST /api/workouts/sessions/log-set - Record completed set
workoutsRoutes.post('/sessions/log-set', async (c) => {
  const body = await c.req.json();
  const parsed = logExerciseSetSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid set log data'), 400);
  }

  const { session_id, exercise_id, set_number, reps_completed, weight_kg, completed, rest_seconds_taken } = parsed.data;
  const logId = generateUUID();

  await c.env.DB.prepare(
    `INSERT INTO workout_exercise_logs (id, session_id, exercise_id, set_number, reps_completed, weight_kg, completed, rest_seconds_taken, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    logId,
    session_id,
    exercise_id,
    set_number,
    reps_completed,
    weight_kg,
    completed ? 1 : 0,
    rest_seconds_taken || null
  ).run();

  return c.json(jsonResponse({ log_id: logId, set_number, reps_completed, weight_kg }));
});

// POST /api/workouts/sessions/finish - Finish session
workoutsRoutes.post('/sessions/finish', async (c) => {
  const body = await c.req.json();
  const parsed = finishWorkoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid finish session data'), 400);
  }

  const { session_id, calories_burned, notes } = parsed.data;

  const session = await c.env.DB.prepare(
    `SELECT start_time FROM workout_sessions WHERE id = ?`
  ).bind(session_id).first<{ start_time: string }>();

  if (!session) {
    return c.json(errorResponse('NOT_FOUND', 'Session not found'), 404);
  }

  const endTime = new Date().toISOString();
  const durationSeconds = Math.max(1, Math.round((new Date(endTime).getTime() - new Date(session.start_time).getTime()) / 1000));

  await c.env.DB.prepare(
    `UPDATE workout_sessions
     SET end_time = ?, total_duration_seconds = ?, calories_burned = ?, notes = COALESCE(?, notes)
     WHERE id = ?`
  ).bind(endTime, durationSeconds, calories_burned || Math.round(durationSeconds * 0.12), notes || null, session_id).run();

  return c.json(jsonResponse({
    session_id,
    total_duration_seconds: durationSeconds,
    calories_burned: calories_burned || Math.round(durationSeconds * 0.12),
    message: 'Workout finished! Great job!',
  }));
});

// GET /api/workouts/sessions/history
workoutsRoutes.get('/sessions/history', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');

  const rows = await c.env.DB.prepare(
    `SELECT ws.*,
            (SELECT COUNT(*) FROM workout_exercise_logs WHERE session_id = ws.id) as total_sets_logged
     FROM workout_sessions ws
     WHERE ws.gym_id = ? AND ws.member_id = ?
     ORDER BY ws.start_time DESC LIMIT 20`
  ).bind(gymId, userId).all();

  return c.json(jsonResponse(rows.results || []));
});

