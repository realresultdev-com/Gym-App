import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { hashPassword, verifyPassword, createJwt, generateRandomToken, generateUUID } from '../../utils/crypto';
import { authMiddleware } from '../../middleware/authentication';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { loginSchema, changePasswordSchema, refreshTokenSchema } from '@gym-app/shared-validation';
import type { SafeUser } from '@gym-app/shared-types';

export const authRoutes = new Hono<AppContext>();

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Identifier and password are required'), 400);
  }

  const { identifier, password } = parsed.data;

  // Find user by email or phone
  const user = await c.env.DB.prepare(
    `SELECT * FROM users
     WHERE (email = ? OR phone = ?) AND deleted_at IS NULL`
  ).bind(identifier.toLowerCase(), identifier).first<any>();

  if (!user) {
    return c.json(errorResponse('INVALID_CREDENTIALS', 'Invalid email/phone or password'), 401);
  }

  if (user.status !== 'ACTIVE') {
    return c.json(errorResponse('FORBIDDEN', `Account is currently ${user.status.toLowerCase()}`), 403);
  }

  const validPassword = await verifyPassword(password, user.password_hash);
  if (!validPassword) {
    return c.json(errorResponse('INVALID_CREDENTIALS', 'Invalid email/phone or password'), 401);
  }

  // 1 hour access token
  const token = await createJwt(
    { id: user.id, role: user.role, gym_id: user.gym_id },
    c.env.JWT_SECRET,
    3600
  );

  // 30 day refresh token
  const rawRefreshToken = generateRandomToken();
  const refreshTokenHash = await hashPassword(rawRefreshToken);
  const refreshTokenId = generateUUID();

  await c.env.DB.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, datetime('now', '+30 days'), datetime('now'))`
  ).bind(refreshTokenId, user.id, refreshTokenHash).run();

  const safeUser: SafeUser = {
    id: user.id,
    gym_id: user.gym_id,
    email: user.email,
    phone: user.phone,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    status: user.status,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return c.json(jsonResponse({
    user: safeUser,
    token,
    refresh_token: rawRefreshToken,
    expires_in: 3600,
  }));
});

// POST /api/auth/refresh
authRoutes.post('/refresh', async (c) => {
  const body = await c.req.json();
  const parsed = refreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Refresh token required'), 400);
  }

  const { refreshToken } = parsed.data;

  // Find active refresh tokens
  const tokens = await c.env.DB.prepare(
    `SELECT rt.id, rt.user_id, rt.token_hash, u.id as u_id, u.gym_id, u.email, u.phone,
            u.first_name, u.last_name, u.role, u.status, u.avatar_url, u.created_at, u.updated_at
     FROM refresh_tokens rt
     JOIN users u ON rt.user_id = u.id
     WHERE rt.revoked_at IS NULL AND rt.expires_at > datetime('now') AND u.deleted_at IS NULL
     ORDER BY rt.created_at DESC LIMIT 50`
  ).all<any>();

  let matchedUser: any = null;
  let matchedTokenId: string | null = null;

  for (const t of tokens.results || []) {
    const isMatch = await verifyPassword(refreshToken, t.token_hash);
    if (isMatch) {
      matchedUser = t;
      matchedTokenId = t.id;
      break;
    }
  }

  if (!matchedUser || !matchedTokenId) {
    return c.json(errorResponse('INVALID_TOKEN', 'Refresh token is invalid or expired'), 401);
  }

  // Revoke old refresh token (Token Rotation pattern)
  await c.env.DB.prepare(
    `UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE id = ?`
  ).bind(matchedTokenId).run();

  // Create new access token and refresh token
  const token = await createJwt(
    { id: matchedUser.u_id, role: matchedUser.role, gym_id: matchedUser.gym_id },
    c.env.JWT_SECRET,
    3600
  );

  const newRawRefreshToken = generateRandomToken();
  const newHash = await hashPassword(newRawRefreshToken);
  const newId = generateUUID();

  await c.env.DB.prepare(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, datetime('now', '+30 days'), datetime('now'))`
  ).bind(newId, matchedUser.u_id, newHash).run();

  const safeUser: SafeUser = {
    id: matchedUser.u_id,
    gym_id: matchedUser.gym_id,
    email: matchedUser.email,
    phone: matchedUser.phone,
    first_name: matchedUser.first_name,
    last_name: matchedUser.last_name,
    role: matchedUser.role,
    status: matchedUser.status,
    avatar_url: matchedUser.avatar_url,
    created_at: matchedUser.created_at,
    updated_at: matchedUser.updated_at,
  };

  return c.json(jsonResponse({
    user: safeUser,
    token,
    refresh_token: newRawRefreshToken,
    expires_in: 3600,
  }));
});

// POST /api/auth/logout
authRoutes.post('/logout', authMiddleware, async (c) => {
  const userId = c.get('user_id');
  await c.env.DB.prepare(
    `UPDATE refresh_tokens SET revoked_at = datetime('now') WHERE user_id = ? AND revoked_at IS NULL`
  ).bind(userId).run();

  return c.json(jsonResponse({ message: 'Logged out successfully' }));
});

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json(jsonResponse(user));
});

// POST /api/auth/change-password
authRoutes.post('/change-password', authMiddleware, async (c) => {
  const body = await c.req.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Current and new password required'), 400);
  }

  const userId = c.get('user_id');
  const user = await c.env.DB.prepare(
    `SELECT password_hash FROM users WHERE id = ?`
  ).bind(userId).first<{ password_hash: string }>();

  if (!user) {
    return c.json(errorResponse('USER_NOT_FOUND', 'User not found'), 404);
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, user.password_hash);
  if (!isValid) {
    return c.json(errorResponse('INVALID_PASSWORD', 'Current password is incorrect'), 400);
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await c.env.DB.prepare(
    `UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(newHash, userId).run();

  return c.json(jsonResponse({ message: 'Password updated successfully' }));
});

// POST /api/auth/forgot-password
authRoutes.post('/forgot-password', async (c) => {
  const body = await c.req.json();
  const email = (body.email || '').trim().toLowerCase();

  // Return generic success to prevent email enumeration
  return c.json(jsonResponse({
    message: 'If the email exists in our records, password reset instructions have been sent.',
  }));
});

