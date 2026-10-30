import { generateUUID } from '../utils/crypto';

export class NotificationService {
  static async send(
    db: D1Database,
    gymId: string,
    userId: string,
    title: string,
    message: string,
    type: 'PAYMENT_REMINDER' | 'MEMBERSHIP_EXPIRY' | 'WORKOUT_ASSIGNED' | 'ATTENDANCE' | 'SYSTEM',
    dataJson?: Record<string, any>
  ): Promise<string> {
    const id = generateUUID();
    await db.prepare(
      `INSERT INTO notifications (id, gym_id, user_id, title, message, type, data_json, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`
    ).bind(
      id,
      gymId,
      userId,
      title,
      message,
      type,
      dataJson ? JSON.stringify(dataJson) : null
    ).run();

    return id;
  }
}

