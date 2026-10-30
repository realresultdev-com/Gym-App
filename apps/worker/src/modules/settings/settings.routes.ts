import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { updateGymSettingsSchema } from '@gym-app/shared-validation';

export const settingsRoutes = new Hono<AppContext>();

settingsRoutes.use('*', authMiddleware);

// GET /api/settings - Fetch gym settings
settingsRoutes.get('/', async (c) => {
  const gymId = c.get('gym_id');
  const cacheKey = `gym_settings:${gymId}`;

  if (c.env.GYM_CACHE) {
    try {
      const cached = await c.env.GYM_CACHE.get(cacheKey);
      if (cached) return c.json(jsonResponse(JSON.parse(cached)));
    } catch {}
  }

  const settings = await c.env.DB.prepare(
    `SELECT * FROM gym_settings WHERE gym_id = ?`
  ).bind(gymId).first();

  if (c.env.GYM_CACHE && settings) {
    try {
      await c.env.GYM_CACHE.put(cacheKey, JSON.stringify(settings), { expirationTtl: 3600 });
    } catch {}
  }

  return c.json(jsonResponse(settings));
});

// PUT /api/settings - Update gym settings (ADMIN only)
settingsRoutes.put('/', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = updateGymSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid settings', parsed.error.format()), 400);
  }

  const d = parsed.data;

  await c.env.DB.prepare(
    `UPDATE gym_settings
     SET name = COALESCE(?, name),
         currency = COALESCE(?, currency),
         timezone = COALESCE(?, timezone),
         opening_time = COALESCE(?, opening_time),
         closing_time = COALESCE(?, closing_time),
         capacity_limit = COALESCE(?, capacity_limit),
         qr_refresh_interval_sec = COALESCE(?, qr_refresh_interval_sec),
         phone = COALESCE(?, phone),
         email = COALESCE(?, email),
         address = COALESCE(?, address),
         updated_at = datetime('now')
     WHERE gym_id = ?`
  ).bind(
    d.name || null,
    d.currency || null,
    d.timezone || null,
    d.opening_time || null,
    d.closing_time || null,
    d.capacity_limit || null,
    d.qr_refresh_interval_sec || null,
    d.phone || null,
    d.email || null,
    d.address || null,
    gymId
  ).run();

  if (c.env.GYM_CACHE) {
    await c.env.GYM_CACHE.delete(`gym_settings:${gymId}`);
  }

  return c.json(jsonResponse({ message: 'Gym settings updated successfully' }));
});

