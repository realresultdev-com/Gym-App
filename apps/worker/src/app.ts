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
    const acceptHeader = c.req.header('accept') || '';
    if (acceptHeader.includes('text/html')) {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FITPULSE – Cloudflare Serverless Platform</title>
  <meta http-equiv="refresh" content="2; url=https://gym-management-web.pages.dev">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
    <div class="w-16 h-16 rounded-3xl bg-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-400/30 mx-auto">
      ⚡
    </div>
    
    <div>
      <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
        ✓ Edge Backend Online
      </span>
      <h1 class="text-2xl font-black text-slate-900 mt-3">FITPULSE Serverless API</h1>
      <p class="text-xs font-semibold text-slate-500 mt-1">
        Running 100% on Cloudflare Workers, D1 SQLite, KV & R2
      </p>
    </div>

    <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
      <div class="flex justify-between font-bold">
        <span class="text-slate-500">Relational Database:</span>
        <span class="text-slate-900 font-mono font-black">Cloudflare D1 (SQLite)</span>
      </div>
      <div class="flex justify-between font-bold">
        <span class="text-slate-500">Object Storage:</span>
        <span class="text-slate-900 font-mono font-black">Cloudflare R2</span>
      </div>
      <div class="flex justify-between font-bold">
        <span class="text-slate-500">Cache Layer:</span>
        <span class="text-slate-900 font-mono font-black">Cloudflare KV</span>
      </div>
      <div class="flex justify-between font-bold">
        <span class="text-slate-500">Cron Triggers:</span>
        <span class="text-slate-900 font-mono font-black">Daily 00:00 UTC</span>
      </div>
    </div>

    <div class="space-y-3">
      <a href="https://gym-management-web.pages.dev"
         class="w-full inline-block py-3.5 px-6 rounded-2xl bg-slate-950 text-white font-black text-sm shadow-md hover:bg-slate-800 transition">
        Launch FITPULSE Web App →
      </a>
      <p class="text-[11px] font-semibold text-slate-400">
        Auto-redirecting to Web App in 2 seconds...
      </p>
    </div>

    <div class="pt-2 border-t border-slate-100 flex justify-center space-x-4 text-xs font-bold text-slate-500">
      <a href="/api/health" class="hover:text-slate-900 underline">API Health JSON</a>
      <span>•</span>
      <a href="https://github.com/realresultdev-com/Gym-App" class="hover:text-slate-900 underline" target="_blank">GitHub Repo</a>
    </div>
  </div>
</body>
</html>`;
      return c.html(html);
    }

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

