import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  limiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: false,
  });
  return limiter;
}

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const rl = getLimiter();
  if (!rl) return { allowed: true }; // Upstash not configured — skip (dev/test)
  const { success } = await rl.limit(`login:${ip}`);
  return { allowed: success };
}
