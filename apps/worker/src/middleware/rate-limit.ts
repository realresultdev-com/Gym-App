import type { MiddlewareHandler } from 'hono';
import type { AppContext } from '../types/env';

export function rateLimiter(limit = 120, windowSec = 60): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    // Skip rate limiting if KV is not configured
    if (!c.env.GYM_CACHE) {
      await next();
      return;
    }

    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'local';
    const currentWindow = Math.floor(Date.now() / (windowSec * 1000));
    const key = `ratelimit:${ip}:${currentWindow}`;

    try {
      const current = await c.env.GYM_CACHE.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= limit) {
        return c.json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please slow down and try again shortly.',
          },
        }, 429);
      }

      await c.env.GYM_CACHE.put(key, (count + 1).toString(), {
        expirationTtl: windowSec + 10,
      });
    } catch {
      // Degrade gracefully if KV fails so users are not blocked
    }

    await next();
  };
}

