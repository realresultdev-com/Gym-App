import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppContext } from './types/env';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limit';

// Routes
import { authRoutes } from './modules/auth/auth.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { membersRoutes } from './modules/members/members.routes';
import { trainersRoutes } from './modules/trainers/trainers.routes';
import { assignmentsRoutes } from './modules/assignments/assignments.routes';
import { attendanceRoutes } from './modules/attendance/attendance.routes';
import { membershipsRoutes } from './modules/memberships/memberships.routes';
import { paymentsRoutes } from './modules/payments/payments.routes';
import { exercisesRoutes } from './modules/exercises/exercises.routes';
import { workoutsRoutes } from './modules/workouts/workouts.routes';
import { fitnessRoutes } from './modules/fitness/fitness.routes';
import { notificationsRoutes } from './modules/notifications/notifications.routes';
import { reportsRoutes } from './modules/reports/reports.routes';
import { settingsRoutes } from './modules/settings/settings.routes';
import { storageRoutes } from './modules/storage/storage.routes';
import { auditRoutes } from './modules/audit/audit.routes';

export function createApp() {
  const app = new Hono<AppContext>();

  // Global Middlewares
  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'x-webhook-signature'],
      exposeHeaders: ['Content-Length'],
      maxAge: 86400,
    })
  );
  app.use('*', rateLimiter(150, 60));
  app.onError(errorHandler);

  // Health & Information Check
  app.get('/', (c) => {
    return c.json({
      status: 'online',
      service: 'FITPULSE Cloudflare Serverless Backend',
      runtime: 'Cloudflare Workers (Edge Serverless)',
      database: 'Cloudflare D1 (SQLite Edge Relational)',
      storage: 'Cloudflare R2 Object Storage',
      cache: 'Cloudflare KV Namespace',
      cron_triggers: 'Active (Daily Membership Expiry, Payment Reminders, Cleanup)',
      version: '1.0.0',
    });
  });

  app.get('/api/health', (c) => {
    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      serverless: true,
      free_tier_optimized: true,
    });
  });

  // API Modules
  app.route('/api/auth', authRoutes);
  app.route('/api/admin', adminRoutes);
  app.route('/api/members', membersRoutes);
  app.route('/api/trainers', trainersRoutes);
  app.route('/api/assignments', assignmentsRoutes);
  app.route('/api/attendance', attendanceRoutes);
  app.route('/api/memberships', membershipsRoutes);
  app.route('/api/payments', paymentsRoutes);
  app.route('/api/exercises', exercisesRoutes);
  app.route('/api/workouts', workoutsRoutes);
  app.route('/api/fitness', fitnessRoutes);
  app.route('/api/notifications', notificationsRoutes);
  app.route('/api/reports', reportsRoutes);
  app.route('/api/settings', settingsRoutes);
  app.route('/api/storage', storageRoutes);
  app.route('/api/audit', auditRoutes);

  // 404 Fallback
  app.notFound((c) => {
    return c.json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Route ${c.req.method} ${c.req.path} not found` },
    }, 404);
  });

  return app;
}

