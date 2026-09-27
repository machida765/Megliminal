import { createHash } from 'crypto';

/** 同一メール・同一接続元あたり、この時間内の送信回数を制限する */
export const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;
export const CONTACT_EMAIL_LIMIT = 3;
export const CONTACT_IP_LIMIT = 8;

export function hashContactKey(value: string): string {
  return createHash('sha256')
    .update(`megliminal-contact:${value}`)
    .digest('hex');
}

export function contactClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const first = forwarded?.split(',')[0]?.trim();
  if (first) return first.slice(0, 200);
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 200);
  return 'unknown';
}
