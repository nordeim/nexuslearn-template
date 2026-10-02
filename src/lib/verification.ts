import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Pure verification-code crypto + policy — no Next.js imports, so unit
 * tests (vitest, node environment) can exercise it directly (the
 * `session.ts` pattern).
 *
 * Session 35 — the first half of the DEPLOYMENT §13 SMTP drill: the
 * signup-verification code used to be generated, logged, and DISCARDED,
 * and `/api/auth/verify` accepted ANY complete 6-digit code. The code is
 * now PERSISTED (as an HMAC-SHA256 hash — never the raw digits: a DB leak
 * must not expose live codes) with a 10-minute expiry, and the verify
 * route compares for real when `AUTH_DELIVERY=smtp` (the env gate — the
 * simulated any-code contract stays the dev/test default per the drill's
 * step 5, so the e2e suite needs no changes until an operator wires real
 * delivery).
 */

/** The code lifetime: 10 minutes (the industry-standard OTP window). */
export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;

/** The env value that switches the verify route to REAL code comparison. */
export const CODE_COMPARISON_DELIVERY = "smtp";

/**
 * Generate a fresh 6-digit numeric code (crypto-random, zero-padded by
 * construction: randomInt is inclusive on both bounds).
 */
export function generateVerificationCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Hash a code for storage — HMAC-SHA256 keyed by the AUTH_SECRET (the
 * same secret that signs session tokens; no new secret to manage, and an
 * attacker with a DB dump but not the secret cannot brute-force the
 * 10^6 code space offline).
 */
export function hashCodeForStorage(code: string, secret: string): string {
  return createHmac("sha256", secret).update(`v1:${code}`).digest("hex");
}

/**
 * Timing-safe compare of a submitted code against the stored hash.
 * Absent storage (null/undefined) never matches.
 */
export function codeMatches(
  stored: string | null | undefined,
  submitted: string,
  secret: string
): boolean {
  if (!stored) return false;
  const computed = Buffer.from(hashCodeForStorage(submitted, secret), "hex");
  const expected = Buffer.from(stored, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

/** The expiry timestamp for a code minted now (or a reference instant). */
export function codeExpiryFromNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + VERIFICATION_CODE_TTL_MS);
}

/**
 * Whether a stored expiry has lapsed. Absent expiry is treated as
 * EXPIRED (fail-closed: a code without a window must not verify forever).
 */
export function isCodeExpired(
  expiresAt: Date | string | null | undefined,
  now: Date = new Date()
): boolean {
  if (!expiresAt) return true;
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  return expiry.getTime() <= now.getTime();
}

/**
 * The AUTH_DELIVERY gate (the DEPLOYMENT §13 drill, step 5): the real code
 * comparison activates only when the operator declares real delivery
 * (`AUTH_DELIVERY=smtp`). The default (unset/anything else) keeps the
 * documented simulated contract — any complete 6-digit code verifies —
 * because without a transport the legitimate user cannot receive the code
 * either.
 */
export function codeComparisonEnabled(env: {
  AUTH_DELIVERY?: string | undefined;
  [key: string]: string | undefined;
}): boolean {
  return env.AUTH_DELIVERY === CODE_COMPARISON_DELIVERY;
}
