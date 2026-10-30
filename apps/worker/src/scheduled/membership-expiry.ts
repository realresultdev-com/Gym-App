import type { Env } from '../types/env';
import { NotificationService } from '../services/notification.service';

export async function checkMembershipExpiry(env: Env): Promise<{ checked: number; expired: number; reminders: number }> {
  let expiredCount = 0;
  let reminderCount = 0;

  // 1. Mark expired subscriptions
  const expiredResult = await env.DB.prepare(
    `UPDATE member_subscriptions
     SET status = 'EXPIRED', updated_at = datetime('now')
     WHERE status = 'ACTIVE' AND end_date < datetime('now')`
  ).run();
  expiredCount = expiredResult.meta?.changes || 0;

  // 2. Find subscriptions expiring in 7 days and 3 days for reminder notifications
  const upcoming = await env.DB.prepare(
    `SELECT s.id, s.gym_id, s.member_id, s.end_date, p.name as plan_name,
            CAST((julianday(s.end_date) - julianday('now')) AS INTEGER) as days_left
     FROM member_subscriptions s
     JOIN membership_plans p ON s.plan_id = p.id
     WHERE s.status = 'ACTIVE'
       AND (
         date(s.end_date) = date('now', '+7 days') OR
         date(s.end_date) = date('now', '+3 days')
       )`
  ).all<{ id: string; gym_id: string; member_id: string; end_date: string; plan_name: string; days_left: number }>();

  for (const item of upcoming.results || []) {
    // Check if notification already sent today for this subscription
    const existing = await env.DB.prepare(
      `SELECT id FROM notifications
       WHERE user_id = ? AND type = 'MEMBERSHIP_EXPIRY'
         AND date(created_at) = date('now')`
    ).bind(item.member_id).first();

    if (!existing) {
      await NotificationService.send(
        env.DB,
        item.gym_id,
        item.member_id,
        'Membership Renewal Reminder',
        `Your ${item.plan_name} membership expires in ${item.days_left} days (${item.end_date}). Renew to keep uninterrupted gym access!`,
        'MEMBERSHIP_EXPIRY',
        { subscription_id: item.id, days_left: item.days_left }
      );
      reminderCount++;
    }
  }

  return { checked: (upcoming.results || []).length, expired: expiredCount, reminders: reminderCount };
}

