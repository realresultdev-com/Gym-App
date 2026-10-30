import type { Env } from '../types/env';
import { NotificationService } from '../services/notification.service';

export async function processPaymentReminders(env: Env): Promise<{ remindersSent: number }> {
  let remindersSent = 0;

  // Find members with outstanding balances on active subscriptions
  const dueList = await env.DB.prepare(
    `SELECT s.id, s.gym_id, s.member_id, s.outstanding_balance, p.name as plan_name, g.currency
     FROM member_subscriptions s
     JOIN membership_plans p ON s.plan_id = p.id
     JOIN gym_settings g ON s.gym_id = g.gym_id
     WHERE s.status = 'ACTIVE' AND s.outstanding_balance > 0`
  ).all<{ id: string; gym_id: string; member_id: string; outstanding_balance: number; plan_name: string; currency: string }>();

  for (const item of dueList.results || []) {
    // Only send at most once every 3 days to avoid spamming
    const recent = await env.DB.prepare(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = 'PAYMENT_REMINDER'
         AND date(created_at) >= date('now', '-3 days')`
    ).bind(item.member_id).first();

    if (!recent) {
      await NotificationService.send(
        env.DB,
        item.gym_id,
        item.member_id,
        'Pending Fee Reminder',
        `You have an outstanding balance of ${item.currency} ${item.outstanding_balance} for ${item.plan_name}. Please settle it at the front desk or via UPI.`,
        'PAYMENT_REMINDER',
        { subscription_id: item.id, balance: item.outstanding_balance }
      );
      remindersSent++;
    }
  }

  return { remindersSent };
}

