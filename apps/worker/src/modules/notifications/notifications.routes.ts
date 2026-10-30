import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';

export const notificationsRoutes = new Hono<AppContext>();

notificationsRoutes.use('*', authMiddleware);

// GET /api/notifications/my
notificationsRoutes.get('/my', async (c) => {
  const userId = c.get('user_id');
  const gymId = c.get('gym_id');

  const rows = await c.env.DB.prepare(
    `SELECT * FROM notifications
     WHERE user_id = ? AND gym_id = ?
     ORDER BY created_at DESC LIMIT 50`
  ).bind(userId, gymId).all();

  return c.json(jsonResponse(rows.results || []));
});

// PATCH /api/notifications/:id/read
notificationsRoutes.patch('/:id/read', async (c) => {
  const userId = c.get('user_id');
  const id = c.req.param('id');

  await c.env.DB.prepare(
    `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`
  ).bind(id, userId).run();

  return c.json(jsonResponse({ message: 'Marked as read' }));
});

// POST /api/notifications/broadcast - Send gym-wide announcement (ADMIN only)
notificationsRoutes.post('/broadcast', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const { title, message } = body;

  if (!title || !message) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Title and message required'), 400);
  }

  // Get active members
  const members = await c.env.DB.prepare(
    `SELECT id FROM users WHERE gym_id = ? AND role = 'MEMBER' AND status = 'ACTIVE' AND deleted_at IS NULL`
  ).bind(gymId).all<{ id: string }>();

  const statements: D1PreparedStatement[] = (members.results || []).map((m) =>
    c.env.DB.prepare(
      `INSERT INTO notifications (id, gym_id, user_id, title, message, type, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 'SYSTEM', 0, datetime('now'))`
    ).bind(generateUUID(), gymId, m.id, title, message)
  );

  if (statements.length > 0) {
    await c.env.DB.batch(statements);
  }

  return c.json(jsonResponse({ broadcast_count: statements.length, message: 'Broadcast delivered' }));
});

