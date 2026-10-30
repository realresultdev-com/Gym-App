import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, parsePagination } from '../../utils/d1';

export const auditRoutes = new Hono<AppContext>();

auditRoutes.use('*', authMiddleware, requireRole('ADMIN'));

// GET /api/audit/logs - Admin audit trail
auditRoutes.get('/logs', async (c) => {
  const gymId = c.get('gym_id');
  const { limit, offset, page } = parsePagination(c);

  const rows = await c.env.DB.prepare(
    `SELECT a.*, u.first_name, u.last_name, u.email
     FROM audit_logs a
     LEFT JOIN users u ON a.actor_id = u.id
     WHERE a.gym_id = ?
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
  ).bind(gymId, limit, offset).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

