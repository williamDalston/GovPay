// Rate limit configuration - can be overridden via environment variables
function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = parseInt(value ?? String(fallback), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const RATE_LIMIT_CONFIG = {
  /** Time window in milliseconds (default: 1 minute) */
  windowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60000),
  /** Maximum requests per window (default: 30) */
  maxRequests: parsePositiveInt(process.env.RATE_LIMIT_MAX_REQUESTS, 30),
  /** Prune interval in milliseconds (default: 5 minutes) */
  pruneIntervalMs: parsePositiveInt(process.env.RATE_LIMIT_PRUNE_INTERVAL_MS, 300000),
} as const;

const hits = new Map<string, number[]>();

// Prune stale entries periodically to prevent memory leaks
let lastPrune = Date.now();
function prune() {
  const now = Date.now();
  if (now - lastPrune < RATE_LIMIT_CONFIG.pruneIntervalMs) return;
  lastPrune = now;
  const cutoff = now - RATE_LIMIT_CONFIG.windowMs;
  for (const [key, timestamps] of hits) {
    const filtered = timestamps.filter((t) => t > cutoff);
    if (filtered.length === 0) hits.delete(key);
    else hits.set(key, filtered);
  }
}

export function rateLimit(ip: string): {
  ok: boolean;
  remaining: number;
  headers: Record<string, string>;
} {
  prune();
  const now = Date.now();
  const { windowMs, maxRequests } = RATE_LIMIT_CONFIG;
  const cutoff = now - windowMs;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > cutoff);
  timestamps.push(now);
  hits.set(ip, timestamps);

  const remaining = Math.max(0, maxRequests - timestamps.length);
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(maxRequests),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil((cutoff + windowMs) / 1000)),
  };

  return { ok: timestamps.length <= maxRequests, remaining, headers };
}
