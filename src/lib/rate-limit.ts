import type { NextRequest } from 'next/server';

interface RateBucket {
  timestamps: number[];
}

const MAX_BUCKETS = 2000;
const buckets = new Map<string, RateBucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp.slice(0, 64);
  return 'local-client';
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;
  const existing = buckets.get(key);
  const recent = existing ? existing.timestamps.filter((t) => t > windowStart) : [];

  if (recent.length >= maxRequests) {
    const oldestInWindow = recent[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000));
    buckets.set(key, { timestamps: recent });
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  recent.push(now);
  if (!buckets.has(key) && buckets.size >= MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey !== undefined) buckets.delete(oldestKey);
  }
  buckets.set(key, { timestamps: recent });

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - recent.length),
    retryAfterSeconds: 0,
  };
}

export function clearRateLimits(): void {
  buckets.clear();
}
