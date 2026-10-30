import type { Context, MiddlewareHandler } from 'hono';
import type { ZodSchema } from 'zod';
import type { AppContext } from '../types/env';

export function validateBody<T>(schema: ZodSchema<T>): MiddlewareHandler<AppContext> {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        return c.json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: result.error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        }, 400);
      }
      c.set('validatedBody' as any, result.data);
      await next();
    } catch {
      return c.json({
        success: false,
        error: { code: 'INVALID_JSON', message: 'Malformed JSON payload' },
      }, 400);
    }
  };
}

