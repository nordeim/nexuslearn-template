import { NextRequest, NextResponse } from "next/server";

/**
 * The per-IP rate limiter (session 31 — the rate-limiting/abuse-throttle
 * surface, docs/remediation-plan-session31.md finding 2).
 *
 * Neither the live reference nor the clone throttled anything (12-request
 * rapid bursts x4 sequences produced zero 429s on both sites) — but the
 * live is protected by its PLATFORM layer (external POSTs to
 * newsletter/contact/ai 405; login demands "Security verification" —
 * its SPA submits through the Base44 internal channel), while the clone's
 * first-party API was wide open: any script could hammer /api/auth/login
 * (a scrypt CPU burn per attempt), /api/contact + /api/newsletter
 * (unbounded DB bloat) and /api/ai/chat (LLM cost) with no ceiling.
 *
 * This is the deliberate-better hardening family (the session-24 CSP, the
 * session-26 verb guard): an in-memory fixed-window throttle the live
 * never shipped at the app layer, invisible to the normal UX.
 *
 * DESIGN NOTES
 *  - In-memory on purpose: no Redis, keeping the zero-config template
 *    story (documented in docs/DEPLOYMENT.md — one instance per deployment,
 *    or move the bucket store to shared memory for multi-instance).
 *  - Fixed window (not sliding): the cheapest correct-enough shape for a
 *    template; the 429 carries `Retry-After` (seconds to window end).
 *  - The IP: x-forwarded-for's FIRST value (the proxy-chain convention)
 *    -> x-real-ip -> the "local" sentinel. Behind no proxy every client
 *    shares one bucket — acceptable for the standalone template; the
 *    DEPLOYMENT guide documents the proxy requirement.
 *  - The sweep: expired buckets are dropped when the tracked-key count
 *    passes MAX_TRACKED (spoofed x-forwarded-for values cannot grow the
 *    map without bound).
 *  - Thresholds are sized against the MEASURED e2e load (the 5.3-minute
 *    suite makes ~7 real login POSTs, ~2 newsletter, ~1 contact, 0 real
 *    ai-chat — the AI specs intercept the route): every bucket keeps >= 4x
 *    headroom over the suite's burst rate.
 *  - The authed routes (enrollments, progress, logout, me) are deliberately
 *    NOT throttled: they require a valid session cookie (the public routes
 *    are the abuse surface; the enrollment specs make 6 rapid POSTs a
 *    limiter could flake on).
 */

/** The per-minute thresholds (per bucket, per IP). */
export const RATE_LIMITS = {
  login: 30,
  signup: 10,
  // session-33: the signup-verification route MINTS the session cookie —
  // it is the seventh public POST route (the UI sends exactly one verify
  // per signup; the e2e suite sends exactly one per run → 10x headroom).
  verify: 10,
  "forgot-password": 10,
  // session-37: the reset-consumption route (the eighth public POST route —
  // the drill's step 6). The e2e round-trip spec sends 4 POSTs per run
  // (short-password + consume + replay + expired) → 10x headroom.
  "reset-password": 10,
  newsletter: 15,
  contact: 15,
  "ai-chat": 30,
} as const;

export interface RateVerdict {
  ok: boolean;
  /** Seconds until the current window closes (0 when ok; 1..60 on 429). */
  retryAfterSec: number;
}

const MAX_TRACKED = 5_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * The fixed-window check. Call this FIRST in the handler — before any body
 * parsing (the cheap rejection: a 429 must not pay the parse cost).
 */
export function checkRateLimit(
  bucket: string,
  ip: string,
  limit: number,
  windowMs = 60_000
): RateVerdict {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED) sweep(now);

  const key = `${bucket}|${ip}`;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * The request's client IP: x-forwarded-for's first value -> x-real-ip ->
 * the "local" sentinel (the no-proxy standalone/dev deployment).
 */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "local";
}

/** The shared 429 response: Retry-After + the house { error } body. */
export function rateLimitResponse(verdict: RateVerdict): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    { status: 429, headers: { "Retry-After": String(Math.max(1, verdict.retryAfterSec)) } }
  );
}
