import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse } from '../../utils/d1';

export const reportsRoutes = new Hono<AppContext>();

reportsRoutes.use('*', authMiddleware, requireRole('ADMIN'));

// GET /api/reports/revenue
reportsRoutes.get('/revenue', async (c) => {
  const gymId = c.get('gym_id');

  const [monthlyRows, methodRows] = await Promise.all([
    c.env.DB.prepare(
      `SELECT strftime('%Y-%m', paid_at) as month, SUM(amount) as total_amount, COUNT(*) as count
       FROM payments
       WHERE gym_id = ? AND payment_status = 'COMPLETED'
       GROUP BY month
       ORDER BY month DESC LIMIT 12`
    ).bind(gymId).all(),

    c.env.DB.prepare(
      `SELECT payment_method, SUM(amount) as total_amount, COUNT(*) as count
       FROM payments
       WHERE gym_id = ? AND payment_status = 'COMPLETED'
       GROUP BY payment_method`
    ).bind(gymId).all(),
  ]);

  return c.json(jsonResponse({
    monthly_trend: monthlyRows.results || [],
    by_payment_method: methodRows.results || [],
  }));
});

// GET /api/reports/attendance - Peak hours and daily distribution
reportsRoutes.get('/attendance', async (c) => {
  const gymId = c.get('gym_id');

  const [hourlyPeak, dailyCount] = await Promise.all([
    c.env.DB.prepare(
      `SELECT strftime('%H', check_in_time) as hour, COUNT(*) as visits
       FROM attendance
       WHERE gym_id = ? AND check_in_time >= datetime('now', '-30 days')
       GROUP BY hour
       ORDER BY hour ASC`
    ).bind(gymId).all(),

    c.env.DB.prepare(
      `SELECT date(check_in_time) as date, COUNT(*) as count
       FROM attendance
       WHERE gym_id = ? AND check_in_time >= datetime('now', '-14 days')
       GROUP BY date
       ORDER BY date ASC`
    ).bind(gymId).all(),
  ]);

  return c.json(jsonResponse({
    hourly_peak_times: hourlyPeak.results || [],
    daily_attendance_trend: dailyCount.results || [],
  }));
});

// GET /api/reports/retention
reportsRoutes.get('/retention', async (c) => {
  const gymId = c.get('gym_id');

  const statusRows = await c.env.DB.prepare(
    `SELECT status, COUNT(*) as count
     FROM member_subscriptions
     WHERE gym_id = ?
     GROUP BY status`
  ).bind(gymId).all();

  return c.json(jsonResponse({
    subscription_distribution: statusRows.results || [],
  }));
});

