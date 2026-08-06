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

/**
 * Each key gets its own 5-per-10-minutes budget. Never throws: Redis being
 * down must not lock people out of their own account.
 */
async function check(keys: string[]): Promise<{ allowed: boolean }> {
  const rl = getLimiter();
  if (!rl) return { allowed: true }; // Upstash not configured — skip (dev/test)
  try {
    const results = await Promise.all(keys.map((k) => rl.limit(k)));
    return { allowed: results.every((r) => r.success) };
  } catch (err) {
    // Redis unreachable — fail open. Losing rate limiting is bad; locking every
    // admin out of the dashboard because Redis is down is worse.
    console.error('[rate-limit] Redis unavailable, allowing request', err);
    return { allowed: true };
  }
}

export async function checkLoginRateLimit(ip: string): Promise<{ allowed: boolean }> {
  return check([`login:${ip}`]);
}

/**
 * Throttles password-reset requests on the IP *and* the target address.
 * Without the email key, an attacker spread across addresses could still flood
 * one victim's inbox; without the IP key, one host could hit many victims.
 */
export async function checkPasswordResetRateLimit(
  ip: string,
  email: string
): Promise<{ allowed: boolean }> {
  return check([`pwreset:ip:${ip}`, `pwreset:email:${email.trim().toLowerCase()}`]);
}
