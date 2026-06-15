/**
 * Simple in-memory per-user rate limiter.
 * For multi-instance deployments, replace with Redis or DB-based approach.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const RATE_LIMIT_PER_MIN = parseInt(
  process.env.DOCUAI_CHAT_RATE_LIMIT_PER_MIN ?? "20",
  10
);

/**
 * Returns true if the user is within rate limits, false if exceeded.
 * Key is typically the Clerk userId.
 */
export function checkRateLimit(userId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute

  let entry = store.get(userId);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(userId, entry);
  }

  entry.count += 1;

  const allowed = entry.count <= RATE_LIMIT_PER_MIN;
  const remaining = Math.max(0, RATE_LIMIT_PER_MIN - entry.count);

  return { allowed, remaining, resetAt: entry.resetAt };
}

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60_000); // every 5 minutes
}
