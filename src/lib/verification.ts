import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

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
 *
 * Session 37 — the password-reset token family (the drill's step 6, the
 * backend of the /reset-password parity gap: the LIVE ships the route).
 * Same generate -> hash -> expire shape, but a BEARER credential's entropy
 * budget: a 32-byte hex token (a reset link IS the credential; a 6-digit
 * code is not) and the `r1:` HMAC domain prefix (a `v1:` code hash can
 * never be replayed as a reset-token hash and vice versa).
 */

/** The code lifetime: 10 minutes (the industry-standard OTP window). */
export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;

/** The reset-token lifetime: the same 10-minute window (one policy). */
export const RESET_TOKEN_TTL_MS = 10 * 60 * 1000;

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

// ---------------------------------------------------------------------------
// Session 37 — the password-reset token family (the drill's step 6).
// ---------------------------------------------------------------------------

/**
 * Generate a fresh reset token: 32 bytes of crypto-random hex (64 chars,
 * URL-safe by construction). A reset link is a BEARER credential — unlike
 * the 6-digit code (10^6 space, bounded by the throttle), the token's
 * 2^256 space makes guessing a non-issue even offline-less.
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a reset token for storage — HMAC-SHA256 keyed by the AUTH_SECRET
 * over the `r1:` domain (the `v1:` prefix of the code hashes guarantees a
 * stored code hash can never be replayed as a reset-token hash and vice
 * versa). Never the raw token at rest: a DB leak must not expose live
 * reset links.
 */
export function hashResetTokenForStorage(token: string, secret: string): string {
  return createHmac("sha256", secret).update(`r1:${token}`).digest("hex");
}

/**
 * Timing-safe compare of a submitted reset token against the stored hash.
 * Absent storage (null/undefined) never matches (fail-closed).
 */
export function resetTokenMatches(
  stored: string | null | undefined,
  submitted: string,
  secret: string
): boolean {
  if (!stored) return false;
  const computed = Buffer.from(hashResetTokenForStorage(submitted, secret), "hex");
  const expected = Buffer.from(stored, "hex");
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
}

/** The expiry timestamp for a reset token minted now (or a reference instant). */
export function resetExpiryFromNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + RESET_TOKEN_TTL_MS);
}
