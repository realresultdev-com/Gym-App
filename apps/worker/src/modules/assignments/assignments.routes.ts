import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';

export const assignmentsRoutes = new Hono<AppContext>();

assignmentsRoutes.use('*', authMiddleware, requireRole('ADMIN'));

// GET /api/assignments
assignmentsRoutes.get('/', async (c) => {
  const gymId = c.get('gym_id');
  const rows = await c.env.DB.prepare(
    `SELECT tma.*,
            t.first_name as trainer_first, t.last_name as trainer_last,
            m.first_name as member_first, m.last_name as member_last
     FROM trainer_member_assignments tma
     JOIN users t ON tma.trainer_id = t.id
     JOIN users m ON tma.member_id = m.id
     WHERE tma.gym_id = ?
     ORDER BY tma.assigned_at DESC`
  ).bind(gymId).all();

  return c.json(jsonResponse(rows.results || []));
});

// POST /api/assignments
assignmentsRoutes.post('/', async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const { trainer_id, member_id, notes } = body;

  if (!trainer_id || !member_id) {
    return c.json(errorResponse('VALIDATION_ERROR', 'trainer_id and member_id are required'), 400);
  }

  const id = generateUUID();

  // Atomically update member profile and insert assignment
  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE trainer_member_assignments SET status = 'INACTIVE' WHERE member_id = ? AND gym_id = ?`
    ).bind(member_id, gymId),

    c.env.DB.prepare(
      `INSERT INTO trainer_member_assignments (id, gym_id, trainer_id, member_id, assigned_at, status, notes)
       VALUES (?, ?, ?, ?, datetime('now'), 'ACTIVE', ?)`
    ).bind(id, gymId, trainer_id, member_id, notes || null),

    c.env.DB.prepare(
      `UPDATE member_profiles SET assigned_trainer_id = ?, updated_at = datetime('now')
       WHERE user_id = ? AND gym_id = ?`
    ).bind(trainer_id, member_id, gymId),
  ]);

  return c.json(jsonResponse({ id, message: 'Trainer assigned successfully' }), 201);
});

// DELETE /api/assignments/:id
assignmentsRoutes.delete('/:id', async (c) => {
  const gymId = c.get('gym_id');
  const assignmentId = c.req.param('id');

  const assignment = await c.env.DB.prepare(
    `SELECT member_id FROM trainer_member_assignments WHERE id = ? AND gym_id = ?`
  ).bind(assignmentId, gymId).first<{ member_id: string }>();

  if (!assignment) {
    return c.json(errorResponse('NOT_FOUND', 'Assignment not found'), 404);
  }

  await c.env.DB.batch([
    c.env.DB.prepare(
      `UPDATE trainer_member_assignments SET status = 'INACTIVE' WHERE id = ?`
    ).bind(assignmentId),

    c.env.DB.prepare(
      `UPDATE member_profiles SET assigned_trainer_id = NULL, updated_at = datetime('now')
       WHERE user_id = ? AND gym_id = ?`
    ).bind(assignment.member_id, gymId),
  ]);

  return c.json(jsonResponse({ message: 'Assignment revoked' }));
});

