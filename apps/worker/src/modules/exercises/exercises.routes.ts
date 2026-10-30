import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';

export const exercisesRoutes = new Hono<AppContext>();

exercisesRoutes.use('*', authMiddleware);

// GET /api/exercises/categories - Public exercise category list (cached in KV)
exercisesRoutes.get('/categories', async (c) => {
  const gymId = c.get('gym_id');
  const cacheKey = `exercise_cats:${gymId}`;

  if (c.env.GYM_CACHE) {
    try {
      const cached = await c.env.GYM_CACHE.get(cacheKey);
      if (cached) return c.json(jsonResponse(JSON.parse(cached)));
    } catch {}
  }

  const rows = await c.env.DB.prepare(
    `SELECT * FROM exercise_categories WHERE gym_id = ? ORDER BY sort_order ASC`
  ).bind(gymId).all();

  const categories = rows.results || [];

  if (c.env.GYM_CACHE && categories.length > 0) {
    try {
      await c.env.GYM_CACHE.put(cacheKey, JSON.stringify(categories), { expirationTtl: 86400 }); // 24h
    } catch {}
  }

  return c.json(jsonResponse(categories));
});

// GET /api/exercises - Exercise library
exercisesRoutes.get('/', async (c) => {
  const gymId = c.get('gym_id');
  const categoryId = c.req.query('category_id');
  const muscle = c.req.query('muscle');
  const search = (c.req.query('search') || '').trim();

  let query = `
    SELECT e.*, c.name as category_name
    FROM exercises e
    JOIN exercise_categories c ON e.category_id = c.id
    WHERE e.gym_id = ?
  `;
  const params: any[] = [gymId];

  if (categoryId && categoryId !== 'cat-all') {
    query += ` AND e.category_id = ?`;
    params.push(categoryId);
  }
  if (muscle) {
    query += ` AND e.target_muscle LIKE ?`;
    params.push(`%${muscle}%`);
  }
  if (search) {
    query += ` AND (e.name LIKE ? OR e.target_muscle LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY e.name ASC`;

  const rows = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(jsonResponse(rows.results || []));
});

// POST /api/exercises - Create exercise (Admin or Trainer)
exercisesRoutes.post('/', requireRole('ADMIN', 'TRAINER'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const { category_id, name, target_muscle, equipment, difficulty, instructions, image_url, tips_json } = body;

  if (!category_id || !name || !target_muscle) {
    return c.json(errorResponse('VALIDATION_ERROR', 'category_id, name, and target_muscle are required'), 400);
  }

  const id = generateUUID();

  await c.env.DB.prepare(
    `INSERT INTO exercises (id, gym_id, category_id, name, target_muscle, equipment, difficulty, instructions, image_url, tips_json, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    id,
    gymId,
    category_id,
    name,
    target_muscle,
    equipment || null,
    difficulty || 'INTERMEDIATE',
    instructions || null,
    image_url || null,
    tips_json || null
  ).run();

  return c.json(jsonResponse({ id, name, message: 'Exercise added to library' }), 201);
});

