import type { MiddlewareHandler } from 'hono';
import type { AppContext } from '../types/env';
import type { UserRole } from '@gym-app/shared-types';

export function requireRole(...allowedRoles: UserRole[]): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    const role = c.get('role');
    if (!role || !allowedRoles.includes(role)) {
      return c.json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`,
        },
      }, 403);
    }
    await next();
  };
}

export async function verifyTrainerMemberAccess(
  db: D1Database,
  gymId: string,
  trainerUserId: string,
  targetMemberUserId: string
): Promise<boolean> {
  const assignment = await db.prepare(
    `SELECT id FROM trainer_member_assignments
     WHERE gym_id = ? AND trainer_id = ? AND member_id = ? AND status = 'ACTIVE'`
  ).bind(gymId, trainerUserId, targetMemberUserId).first();

  return !!assignment;
}

