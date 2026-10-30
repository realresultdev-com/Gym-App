import { Hono } from 'hono';
import type { AppContext } from '../../types/env';
import { authMiddleware } from '../../middleware/authentication';
import { requireRole } from '../../middleware/authorization';
import { jsonResponse, errorResponse, parsePagination } from '../../utils/d1';
import { generateUUID } from '../../utils/crypto';
import { PaymentService } from '../../services/payment.service';
import { recordPaymentSchema } from '@gym-app/shared-validation';

export const paymentsRoutes = new Hono<AppContext>();

// POST /api/payments/webhook - Webhook from payment gateway (Public, verified via signature)
paymentsRoutes.post('/webhook', async (c) => {
  const signature = c.req.header('x-webhook-signature') || '';
  const bodyText = await c.req.text();

  const secret = (c.env as any).PAYMENT_WEBHOOK_SECRET || 'dev_secret';
  const isValid = PaymentService.verifyWebhookSignature(bodyText, signature, secret);

  if (!isValid && c.env.ENVIRONMENT === 'production') {
    return c.json(errorResponse('UNAUTHORIZED', 'Invalid webhook signature'), 401);
  }

  // Parse webhook payload
  try {
    const data = JSON.parse(bodyText);
    console.log('[Payment Webhook Received]', data.event);
    // Process external gateway payment event
    return c.json(jsonResponse({ received: true }));
  } catch {
    return c.json(errorResponse('INVALID_PAYLOAD', 'Invalid webhook payload'), 400);
  }
});

// All following routes require authentication
paymentsRoutes.use('*', authMiddleware);

// POST /api/payments - Record a payment (Cash, UPI, Card, Bank Transfer)
paymentsRoutes.post('/', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const body = await c.req.json();
  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(errorResponse('VALIDATION_ERROR', 'Invalid payment payload', parsed.error.format()), 400);
  }

  const { subscription_id, member_id, amount, payment_method, transaction_ref, notes } = parsed.data;

  // Retrieve subscription
  const sub = await c.env.DB.prepare(
    `SELECT s.*, p.name as plan_name FROM member_subscriptions s
     JOIN membership_plans p ON s.plan_id = p.id
     WHERE s.id = ? AND s.gym_id = ?`
  ).bind(subscription_id, gymId).first<any>();

  if (!sub) {
    return c.json(errorResponse('NOT_FOUND', 'Subscription not found'), 404);
  }

  const payId = generateUUID();
  const receiptNumber = PaymentService.generateReceiptNumber();
  const newPaidAmount = sub.paid_amount + amount;
  const newOutstanding = Math.max(0, sub.total_amount - newPaidAmount);

  const statements: D1PreparedStatement[] = [
    // 1. Insert Payment
    c.env.DB.prepare(
      `INSERT INTO payments (id, gym_id, subscription_id, member_id, amount, payment_method, payment_status, transaction_ref, receipt_number, paid_at, notes, recorded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?, datetime('now'), ?, ?, datetime('now'))`
    ).bind(payId, gymId, subscription_id, member_id, amount, payment_method, transaction_ref || null, receiptNumber, notes || null, c.get('user_id')),

    // 2. Update Subscription balances
    c.env.DB.prepare(
      `UPDATE member_subscriptions
       SET paid_amount = ?, outstanding_balance = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).bind(newPaidAmount, newOutstanding, subscription_id),

    // 3. Create Receipt Record
    c.env.DB.prepare(
      `INSERT INTO payment_receipts (id, gym_id, payment_id, receipt_pdf_key, receipt_data_json, issued_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'))`
    ).bind(
      generateUUID(),
      gymId,
      payId,
      `receipts/${receiptNumber}.pdf`,
      JSON.stringify({
        receipt_number: receiptNumber,
        member_id,
        plan_name: sub.plan_name,
        amount_paid: amount,
        payment_method,
        outstanding_balance: newOutstanding,
      })
    ),
  ];

  await c.env.DB.batch(statements);

  return c.json(jsonResponse({
    payment_id: payId,
    receipt_number: receiptNumber,
    amount_paid: amount,
    outstanding_balance: newOutstanding,
    message: 'Payment recorded successfully',
  }), 201);
});

// GET /api/payments - List payments (ADMIN only)
paymentsRoutes.get('/', requireRole('ADMIN'), async (c) => {
  const gymId = c.get('gym_id');
  const { limit, offset, page } = parsePagination(c);

  const rows = await c.env.DB.prepare(
    `SELECT p.*, u.first_name, u.last_name, u.email, pl.name as plan_name
     FROM payments p
     JOIN users u ON p.member_id = u.id
     JOIN member_subscriptions s ON p.subscription_id = s.id
     JOIN membership_plans pl ON s.plan_id = pl.id
     WHERE p.gym_id = ?
     ORDER BY p.paid_at DESC LIMIT ? OFFSET ?`
  ).bind(gymId, limit, offset).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

// GET /api/payments/my - Member's payment history
paymentsRoutes.get('/my', async (c) => {
  const gymId = c.get('gym_id');
  const userId = c.get('user_id');
  const { limit, offset, page } = parsePagination(c);

  const rows = await c.env.DB.prepare(
    `SELECT p.*, pl.name as plan_name
     FROM payments p
     JOIN member_subscriptions s ON p.subscription_id = s.id
     JOIN membership_plans pl ON s.plan_id = pl.id
     WHERE p.gym_id = ? AND p.member_id = ?
     ORDER BY p.paid_at DESC LIMIT ? OFFSET ?`
  ).bind(gymId, userId, limit, offset).all();

  return c.json(jsonResponse(rows.results || [], { page, limit }));
});

// GET /api/payments/:id/receipt
paymentsRoutes.get('/:id/receipt', async (c) => {
  const gymId = c.get('gym_id');
  const paymentId = c.req.param('id');
  const role = c.get('role');
  const userId = c.get('user_id');

  const receipt = await c.env.DB.prepare(
    `SELECT r.*, p.amount, p.payment_method, p.paid_at, p.receipt_number,
            u.first_name, u.last_name, u.email, u.phone,
            g.name as gym_name, g.phone as gym_phone, g.address as gym_address, g.currency
     FROM payment_receipts r
     JOIN payments p ON r.payment_id = p.id
     JOIN users u ON p.member_id = u.id
     JOIN gym_settings g ON r.gym_id = g.gym_id
     WHERE p.id = ? AND r.gym_id = ?`
  ).bind(paymentId, gymId).first<any>();

  if (!receipt) {
    return c.json(errorResponse('NOT_FOUND', 'Receipt not found'), 404);
  }

  // Member authorization check
  if (role === 'MEMBER') {
    const payment = await c.env.DB.prepare(`SELECT member_id FROM payments WHERE id = ?`).bind(paymentId).first<any>();
    if (payment?.member_id !== userId) {
      return c.json(errorResponse('FORBIDDEN', 'Access denied to this receipt'), 403);
    }
  }

  return c.json(jsonResponse(receipt));
});

