import type { Env } from '../types/env';
import { checkMembershipExpiry } from './membership-expiry';
import { processPaymentReminders } from './payment-reminders';
import { runCleanupJobs } from './cleanup';

export async function handleScheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  console.log(`[Cron Trigger] Scheduled task executed at ${new Date(event.scheduledTime).toISOString()}`);

  try {
    const expiry = await checkMembershipExpiry(env);
    console.log('[Cron] Expiry check complete:', expiry);

    const payments = await processPaymentReminders(env);
    console.log('[Cron] Payment reminders complete:', payments);

    const cleanup = await runCleanupJobs(env);
    console.log('[Cron] Cleanup complete:', cleanup);
  } catch (error) {
    console.error('[Cron Error] Scheduled handler failed:', error);
  }
}

