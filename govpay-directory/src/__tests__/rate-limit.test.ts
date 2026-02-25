import { describe, it, expect, beforeEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset module state between tests
    vi.resetModules();
  });

  it("allows requests under the limit", async () => {
    const { rateLimit: rl } = await import("@/lib/rate-limit");
    const result = rl("test-ip-1");
    expect(result.ok).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("returns rate limit headers", () => {
    const result = rateLimit("test-ip-headers");
    expect(result.headers["X-RateLimit-Limit"]).toBe("30");
    expect(result.headers["X-RateLimit-Remaining"]).toBeDefined();
    expect(result.headers["X-RateLimit-Reset"]).toBeDefined();
  });

  it("blocks after exceeding the limit", async () => {
    const { rateLimit: rl } = await import("@/lib/rate-limit");
    const ip = "test-ip-flood";

    for (let i = 0; i < 30; i++) {
      rl(ip);
    }

    const result = rl(ip);
    expect(result.ok).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks different IPs independently", async () => {
    const { rateLimit: rl } = await import("@/lib/rate-limit");

    for (let i = 0; i < 30; i++) {
      rl("ip-a");
    }

    const resultA = rl("ip-a");
    const resultB = rl("ip-b");

    expect(resultA.ok).toBe(false);
    expect(resultB.ok).toBe(true);
  });
});
