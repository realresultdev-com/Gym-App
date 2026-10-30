import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';
import { createMembershipPlanSchema, assignSubscriptionSchema } from '@gym-app/shared-validation';

export const membershipsRoutes = new Hono<AppContext>();

membershipsRoutes.use('*', authMiddleware);

// GET /api/memberships/plans - List membership plans (cached in KV)
membershipsRoutes.get('/plans', async (c) => {
  const gymId = c.get('gym_id');
  const cacheKey = `plans:${gymId}`;

  // Check KV cache first (free tier optimization)
  if (c.env.GYM_CACHE) {
    try {
      const cached = await c.env.GYM_CACHE.get(cacheKey);
      if (cached) {
        return c.json(jsonResponse(JSON.parse(cached)));
      }
    } catch {}
  }

  const rows = await c.env.DB.prepare(
    `SELECT * FROM membership_plans WHERE gym_id = ? AND is_active = 1 ORDER BY price ASC`
  ).bind(gymId).all();

  const plans = rows.results || [];

  // Cache in KV for 1 hour
  if (c.env.GYM_CACHE && plans.length > 0) {
    try {
      await c.env.GYM_CACHE.put(cacheKey, JSON.stringify(plans), { expirationTtl: 3600 });
    } catch {}
  }

  return c.json(jsonResponse(plans));
});

// POST /api/memberships/plans - Create plan (ADMIN only)
membershipsRoutes.post('/plans', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = createMembershipPlanSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid plan payload', parsed.error.format()), 400);
  }

  const id = generateUUID();
  const d = parsed.data;

  await c.env.DB.prepare(
    `INSERT INTO membership_plans (id, gym_id, name, description, duration_days, price, admission_fee, features_json, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`
  ).bind(id, gymId, d.name, d.description || null, d.duration_days, d.price, d.admission_fee, d.features_json || null).run();

  // Invalidate cache
  if (c.env.GYM_CACHE) {
    await c.env.GYM_CACHE.delete(`plans:${gymId}`);
  }

  return c.json(jsonResponse({ id, name: d.name, message: 'Membership plan created' }), 201);
});

// POST /api/memberships/subscriptions - Assign plan to member
membershipsRoutes.post('/subscriptions', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = assignSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid subscription payload'), 400);
  }

  const { member_id, plan_id, start_date, paid_amount, payment_method } = parsed.data;

  const plan = await c.env.DB.prepare(
    `SELECT * FROM membership_plans WHERE id = ? AND gym_id = ?`
  ).bind(plan_id, gymId).first<any>();

  if (!plan) {
    return c.json(errorResponse('NOT_FOUND', 'Membership plan not found'), 404);
  }

  const subId = generateUUID();
  const totalAmount = plan.price + plan.admission_fee;
  const initialPaid = Math.min(totalAmount, paid_amount || 0);
  const outstanding = Math.max(0, totalAmount - initialPaid);
  const startDateStr = start_date || new Date().toISOString();

  const statements: D1PreparedStatement[] = [
    // Mark previous active subscriptions cancelled or completed
    c.env.DB.prepare(
      `UPDATE member_subscriptions SET status = 'CANCELLED', updated_at = datetime('now')
       WHERE member_id = ? AND gym_id = ? AND status = 'ACTIVE'`
    ).bind(member_id, gymId),

    // Insert new subscription
    c.env.DB.prepare(
      `INSERT INTO member_subscriptions (id, gym_id, member_id, plan_id, start_date, end_date, status, total_amount, paid_amount, outstanding_balance, auto_renew, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime(?, '+' || ? || ' days'), 'ACTIVE', ?, ?, ?, 0, datetime('now'), datetime('now'))`
    ).bind(subId, gymId, member_id, plan.id, startDateStr, startDateStr, plan.duration_days, totalAmount, initialPaid, outstanding),
  ];

  // If initial payment was made, record payment and receipt
  if (initialPaid > 0) {
    const payId = generateUUID();
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    statements.push(
      c.env.DB.prepare(
        `INSERT INTO payments (id, gym_id, subscription_id, member_id, amount, payment_method, payment_status, receipt_number, paid_at, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, datetime('now'), ?, datetime('now'))`
      ).bind(payId, gymId, subId, member_id, initialPaid, payment_method, receiptNum, c.get('user_id')),

      c.env.DB.prepare(
        `INSERT INTO payment_receipts (id, gym_id, payment_id, receipt_pdf_key, receipt_data_json)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        generateUUID(),
        gymId,
        payId,
        `receipts/${receiptNum}.pdf`,
        JSON.stringify({ plan: plan.name, amount: initialPaid, member_id })
      )
    );
  }

  await c.env.DB.batch(statements);

  return c.json(jsonResponse({
    subscription_id: subId,
    plan_name: plan.name,
    total_amount: totalAmount,
    paid_amount: initialPaid,
    outstanding_balance: outstanding,
    message: 'Subscription assigned successfully',
  }), 201);
});

// POST /api/memberships/renew - Renew subscription
membershipsRoutes.post('/renew', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const { subscription_id, paid_amount, payment_method } = body;

  const current = await c.env.DB.prepare(
    `SELECT s.*, p.duration_days, p.price FROM member_subscriptions s
     JOIN membership_plans p ON s.plan_id = p.id
     WHERE s.id = ? AND s.gym_id = ?`
  ).bind(subscription_id, gymId).first<any>();

  if (!current) {
    return c.json(errorResponse('NOT_FOUND', 'Subscription not found'), 404);
  }

  // Extend by plan duration from existing end_date or now (whichever is later)
  const baseDate = new Date(current.end_date) > new Date() ? current.end_date : new Date().toISOString();
  const subId = generateUUID();
  const planPrice = current.price;
  const initialPaid = Math.min(planPrice, paid_amount || 0);
  const outstanding = Math.max(0, planPrice - initialPaid);

  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      `UPDATE member_subscriptions SET status = 'EXPIRED', updated_at = datetime('now') WHERE id = ?`
    ).bind(subscription_id),

    c.env.DB.prepare(
      `INSERT INTO member_subscriptions (id, gym_id, member_id, plan_id, start_date, end_date, status, total_amount, paid_amount, outstanding_balance, auto_renew, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime(?, '+' || ? || ' days'), 'ACTIVE', ?, ?, ?, 0, datetime('now'), datetime('now'))`
    ).bind(subId, gymId, current.member_id, current.plan_id, baseDate, baseDate, current.duration_days, planPrice, initialPaid, outstanding),
  ];

  if (initialPaid > 0) {
    const payId = generateUUID();
    const receiptNum = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    statements.push(
      c.env.DB.prepare(
        `INSERT INTO payments (id, gym_id, subscription_id, member_id, amount, payment_method, payment_status, receipt_number, paid_at, recorded_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, datetime('now'), ?, datetime('now'))`
      ).bind(payId, gymId, subId, current.member_id, initialPaid, payment_method || 'CASH', receiptNum, c.get('user_id'))
    );
  }

  await c.env.DB.batch(statements);

  return c.json(jsonResponse({ subscription_id: subId, message: 'Membership renewed successfully' }));
});

// GET /api/memberships/my-subscription
membershipsRoutes.get('/my-subscription', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');

  const sub = await c.env.DB.prepare(
    `SELECT s.*, p.name as plan_name, p.description, p.features_json
     FROM member_subscriptions s
     JOIN membership_plans p ON s.plan_id = p.id
     WHERE s.member_id = ? AND s.gym_id = ? AND s.status = 'ACTIVE'
     ORDER BY s.end_date DESC LIMIT 1`
  ).bind(userId, gymId).first();

  return c.json(jsonResponse(sub || null));
});

