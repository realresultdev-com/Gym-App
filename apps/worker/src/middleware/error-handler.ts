import type { ErrorHandler } from 'hono';
import type { AppContext } from '../types/env';

export const errorHandler: ErrorHandler<AppContext> = (err, c) => {
  console.error('[Worker Error]', err);

  const status = (err as any).status || 500;
  return c.json({
    success: false,
    error: {
      code: (err as any).code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      ...(c.env.ENVIRONMENT === 'development' ? { stack: err.stack } : {}),
    },
  }, status);
};

