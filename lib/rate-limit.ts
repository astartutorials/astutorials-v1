import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  limiter = new Ratelimit({
    // One retry, not the default five. The default backoff (Math.exp(i) * 50ms)
    // adds ~4.3s of sleeping before giving up, which stalls every login attempt
    // for the whole duration of a Redis outage.
    redis: Redis.fromEnv({ retry: { retries: 1, backoff: () => 50 } }),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: false,
  });
  return limiter;
}

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const rl = getLimiter();
  if (!rl) return { allowed: true }; // Upstash not configured — skip (dev/test)
  try {
    const { success } = await rl.limit(`login:${ip}`);
    return { allowed: success };
  } catch (err) {
    // Redis unreachable — fail open. Losing rate limiting is bad; locking every
    // admin out of the dashboard because Redis is down is worse.
    console.error('[rate-limit] Redis unavailable, allowing request', err);
    return { allowed: true };
  }
}
