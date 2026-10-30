import type { MiddlewareHandler } from 'hono';
import type { AppContext } from '../types/env';
import { verifyJwt } from '../utils/crypto';
import type { SafeUser } from '@gym-app/shared-types';

export const authMiddleware: MiddlewareHandler<AppContext> = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
    }, 401);
  }

  const token = authHeader.substring(7).trim();
  const payload = await verifyJwt<{ id: string; role: any; gym_id: string }>(token, c.env.JWT_SECRET);

  if (!payload || !payload.id) {
    return c.json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token is invalid or expired' },
    }, 401);
  }

  // Optimize D1 query: single indexed lookup
  const user = await c.env.DB.prepare(
    `SELECT id, gym_id, email, phone, first_name, last_name, role, status, avatar_url, created_at, updated_at
     FROM users
     WHERE id = ? AND deleted_at IS NULL`
  ).bind(payload.id).first<SafeUser>();

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'Account no longer exists' },
    }, 401);
  }

  if (user.status !== 'ACTIVE') {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: `Account is ${user.status.toLowerCase()}` },
    }, 403);
  }

  c.set('user', user);
  c.set('user_id', user.id);
  c.set('gym_id', user.gym_id);
  c.set('role', user.role);

  await next();
};

