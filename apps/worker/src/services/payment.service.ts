export class PaymentService {
  static generateReceiptNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `REC-${year}-${random}`;
  }

  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // In production, compare computed HMAC-SHA256 with header signature
    return Boolean(payload && signature && secret);
  }
}

