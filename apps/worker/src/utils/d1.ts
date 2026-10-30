import type { Context } from 'hono';
import type { AppContext } from '../types/env';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function parsePagination(c: Context<AppContext>): PaginationParams {
  const pageStr = c.req.query('page');
  const limitStr = c.req.query('limit');

  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(limitStr || '20', 10) || 20));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function jsonResponse<T>(data: T, meta?: any) {
  return {
    success: true,
    data,
    meta,
  };
}

export function errorResponse(code: string, message: string, details?: any) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

