/**
 * Fixed-window request limiter kept in process memory.
 *
 * It is per server instance, so on a multi-instance deploy the effective limit
 * is `limit × instances`. That is enough to stop one client from hammering the
 * CPU-heavy planner endpoints; put a shared limiter (edge/WAF) in front if the
 * site ever needs a hard global cap.
 */
export class RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    /** Bound on tracked keys so a flood of spoofed IPs cannot grow memory. */
    private readonly maxKeys = 10_000
  ) {}

  /** Records one hit for `key`; returns seconds to wait when over the limit. */
  check(
    key: string,
    now = Date.now()
  ): { ok: true } | { ok: false; retryAfterS: number } {
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (this.hits.size >= this.maxKeys) this.sweep(now);
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return { ok: true };
    }
    entry.count += 1;
    if (entry.count > this.limit) {
      return {
        ok: false,
        retryAfterS: Math.ceil((entry.resetAt - now) / 1000),
      };
    }
    return { ok: true };
  }

  private sweep(now: number): void {
    for (const [k, v] of this.hits) if (v.resetAt <= now) this.hits.delete(k);
    // Still full of live windows: drop the oldest entries.
    while (this.hits.size >= this.maxKeys) {
      const first = this.hits.keys().next().value;
      if (first === undefined) break;
      this.hits.delete(first);
    }
  }
}
