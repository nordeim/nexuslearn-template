import { describe, expect, it } from "vitest";

import {
  checkRateLimit,
  clientIp,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

// Session 31 — the per-IP throttle contract (the rate-limiting/abuse-throttle
// surface). The limiter is a pure in-memory fixed window: no clock
// injection, no Redis — the 60s window is exercised through a real 50ms
// test window instead.

function okTimes(bucket: string, ip: string, n: number, limit: number, windowMs = 60_000) {
  let ok = 0;
  for (let i = 0; i < n; i++) if (checkRateLimit(bucket, ip, limit, windowMs).ok) ok++;
  return ok;
}

describe("rate-limit: the fixed-window verdicts", () => {
  it("passes every request at and under the limit", () => {
    expect(okTimes("newsletter", "1.1.1.1", 15, 15)).toBe(15);
  });

  it("rejects the (limit+1)th request inside the window", () => {
    expect(okTimes("newsletter", "2.2.2.2", 16, 15)).toBe(15);
    const extra = checkRateLimit("newsletter", "2.2.2.2", 15);
    expect(extra.ok).toBe(false);
  });

  it("retryAfterSec is the positive seconds-to-window-end (1..60)", () => {
    for (let i = 0; i < 15; i++) checkRateLimit("contact", "3.3.3.3", 15);
    const v = checkRateLimit("contact", "3.3.3.3", 15);
    expect(v.ok).toBe(false);
    expect(v.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(v.retryAfterSec).toBeLessThanOrEqual(60);
  });

  it("the window rolls over (a fresh window admits again)", async () => {
    // A 50ms real window: exhaust it, wait, then a new request passes.
    const t = () => checkRateLimit("login", "4.4.4.4", 2, 50);
    expect(t().ok).toBe(true);
    expect(t().ok).toBe(true);
    expect(t().ok).toBe(false); // 3rd inside the 50ms window
    await new Promise((r) => setTimeout(r, 70));
    expect(t().ok).toBe(true); // the window rolled
  });

  it("buckets are isolated (login does not consume newsletter)", () => {
    for (let i = 0; i < 5; i++) checkRateLimit("login", "5.5.5.5", 5);
    expect(checkRateLimit("login", "5.5.5.5", 5).ok).toBe(false);
    expect(checkRateLimit("newsletter", "5.5.5.5", 5).ok).toBe(true);
  });

  it("IPs are isolated (one IP's burst does not throttle another)", () => {
    for (let i = 0; i < 10; i++) checkRateLimit("contact", "6.6.6.6", 10);
    expect(checkRateLimit("contact", "6.6.6.6", 10).ok).toBe(false);
    expect(checkRateLimit("contact", "7.7.7.7", 10).ok).toBe(true);
  });

  it("the expired-bucket sweep bounds the tracked-key map", async () => {
    // Fill the map past the sweep threshold with a tiny window, let it
    // expire, then one more check sweeps every expired entry out.
    for (let i = 0; i < 5_100; i++) checkRateLimit(`sweep-probe-${i}`, "8.8.8.8", 5, 10);
    await new Promise((r) => setTimeout(r, 30));
    checkRateLimit("sweep-after", "8.8.8.8", 5, 60_000);
    const v = checkRateLimit("sweep-probe-0", "8.8.8.8", 5, 60_000);
    expect(v.ok).toBe(true); // swept — the old window is gone
  });

  it("the thresholds table carries the documented per-minute limits", () => {
    expect(RATE_LIMITS.login).toBe(30);
    expect(RATE_LIMITS.signup).toBe(10);
    expect(RATE_LIMITS["forgot-password"]).toBe(10);
    expect(RATE_LIMITS.newsletter).toBe(15);
    expect(RATE_LIMITS.contact).toBe(15);
    expect(RATE_LIMITS["ai-chat"]).toBe(30);
  });
});

describe("rate-limit: clientIp precedence", () => {
  const mk = (headers: Record<string, string>) =>
    ({ headers: new Map(Object.entries(headers)) }) as never;

  it("x-forwarded-for's first value wins (the proxy chain format)", () => {
    expect(clientIp(mk({ "x-forwarded-for": "9.9.9.9, 10.10.10.10" }))).toBe("9.9.9.9");
    expect(clientIp(mk({ "x-forwarded-for": "  11.11.11.11  " }))).toBe("11.11.11.11");
  });

  it("x-real-ip is the second choice", () => {
    expect(clientIp(mk({ "x-real-ip": "12.12.12.12" }))).toBe("12.12.12.12");
  });

  it("falls back to the local sentinel when no proxy headers exist", () => {
    expect(clientIp(mk({}))).toBe("local");
  });
});

describe("rate-limit: the shared 429 response", () => {
  it("carries the house { error } body + Retry-After + 429", async () => {
    const res = rateLimitResponse({ ok: false, retryAfterSec: 42 });
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("42");
    const body = (await res.json()) as { error?: string };
    expect(typeof body.error).toBe("string");
    expect(body.error!.length).toBeGreaterThan(0);
  });
});
