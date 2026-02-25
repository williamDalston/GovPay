const windowMs = 60_000; // 1 minute
const maxRequests = 30;

const hits = new Map<string, number[]>();

// Prune stale entries every 5 minutes
let lastPrune = Date.now();
function prune() {
  const now = Date.now();
  if (now - lastPrune < 300_000) return;
  lastPrune = now;
  const cutoff = now - windowMs;
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
