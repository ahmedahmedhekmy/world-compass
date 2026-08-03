/**
 * Simple in-memory rate limiter for API endpoints.
 * For production, use Redis or a service like Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

/**
 * Check if a request should be rate limited.
 * Returns { allowed: true } if within limits, { allowed: false, retryAfter: ms } if limited.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60_000, maxRequests: 100 }
): { allowed: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let entry = store.get(key);
  
  if (!entry || entry.resetAt < now) {
    // Create new window
    entry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, entry);
    return { allowed: true, remaining: config.maxRequests - 1 };
  }
  
  entry.count++;
  
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: entry.resetAt - now,
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
  };
}

/**
 * Create a rate limit headers object for HTTP responses.
 */
export function rateLimitHeaders(result: { allowed: boolean; remaining: number; retryAfter?: number }, windowMs: number) {
  return {
    "X-RateLimit-Limit": String(result.remaining + (result.allowed ? 1 : 0)),
    "X-RateLimit-Remaining": String(Math.max(0, result.remaining)),
    "X-RateLimit-Reset": String(Math.ceil((Date.now() + windowMs) / 1000)),
    ...(result.retryAfter ? { "Retry-After": String(Math.ceil(result.retryAfter / 1000)) } : {}),
  };
}

// Preset configurations
export const rateLimits = {
  // Strict: 10 requests per minute (for sensitive operations)
  strict: { windowMs: 60_000, maxRequests: 10 },
  
  // Standard: 60 requests per minute (for general API)
  standard: { windowMs: 60_000, maxRequests: 60 },
  
  // Relaxed: 300 requests per minute (for public data)
  relaxed: { windowMs: 60_000, maxRequests: 300 },
  
  // Contact form: 5 submissions per hour
  contact: { windowMs: 3_600_000, maxRequests: 5 },
  
  // Checkout: 10 attempts per hour
  checkout: { windowMs: 3_600_000, maxRequests: 10 },
} as const;
