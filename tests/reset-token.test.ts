import { describe, expect, it } from "vitest";

import {
  RESET_TOKEN_TTL_MS,
  VERIFICATION_CODE_TTL_MS,
  codeMatches,
  codeExpiryFromNow,
  generateVerificationCode,
  hashCodeForStorage,
  generateResetToken,
  hashResetTokenForStorage,
  resetTokenMatches,
  resetExpiryFromNow,
  isCodeExpired,
} from "@/lib/verification";

// Session 37 — the reset-token pure seam (the drill's step 6, the backend of
// the /reset-password parity gap: the LIVE ships the route; the clone 404'd).
// The same generate -> hash -> expire contract as the session-35 6-digit
// code, domain-separated by the HMAC input prefix (a code hash can never be
// replayed as a token hash and vice versa) and with a BEARER-token entropy
// budget (a reset link IS a credential; a 6-digit code is not).

const SECRET = "unit-test-secret-0123456789abcdef";

describe("session-37: the reset-token seam", () => {
  it("generateResetToken returns a 64-char hex string (32 bytes — a bearer credential's entropy)", () => {
    const token = generateResetToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generateResetToken mints unique tokens (no reuse across calls)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 32; i++) seen.add(generateResetToken());
    expect(seen.size).toBe(32);
  });

  it("hashResetTokenForStorage is deterministic and keyed by the secret", () => {
    const a = hashResetTokenForStorage("tok-abc", SECRET);
    const b = hashResetTokenForStorage("tok-abc", SECRET);
    const c = hashResetTokenForStorage("tok-abc", "different-secret");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("the r1: prefix domain-separates the reset hash from the v1: code hash (no cross-replay)", () => {
    const code = "123456";
    const token = code; // the SAME string, hashed through both seams
    const codeHash = hashCodeForStorage(code, SECRET);
    const tokenHash = hashResetTokenForStorage(token, SECRET);
    expect(codeHash).not.toBe(tokenHash);
    // And neither seam matches the other's storage:
    expect(resetTokenMatches(codeHash, token, SECRET)).toBe(false);
    expect(codeMatches(tokenHash, code, SECRET)).toBe(false);
  });

  it("resetTokenMatches: the exact token matches its stored hash (timing-safe path)", () => {
    const token = generateResetToken();
    const stored = hashResetTokenForStorage(token, SECRET);
    expect(resetTokenMatches(stored, token, SECRET)).toBe(true);
  });

  it("resetTokenMatches: a wrong token, a different secret, or absent storage never match", () => {
    const stored = hashResetTokenForStorage("real-token", SECRET);
    expect(resetTokenMatches(stored, "wrong-token", SECRET)).toBe(false);
    expect(resetTokenMatches(stored, "real-token", "other-secret")).toBe(false);
    expect(resetTokenMatches(null, "real-token", SECRET)).toBe(false);
    expect(resetTokenMatches(undefined, "real-token", SECRET)).toBe(false);
  });

  it("resetTokenMatches: a length-mismatched stored hash fails closed (no throw)", () => {
    expect(resetTokenMatches("abc123", "real-token", SECRET)).toBe(false);
  });

  it("resetExpiryFromNow: the 10-minute window (the industry-standard reset window)", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expiry = resetExpiryFromNow(now);
    expect(expiry.getTime() - now.getTime()).toBe(RESET_TOKEN_TTL_MS);
    expect(RESET_TOKEN_TTL_MS).toBe(10 * 60 * 1000);
    // The same window as the verification code (the shared TTL policy):
    expect(RESET_TOKEN_TTL_MS).toBe(VERIFICATION_CODE_TTL_MS);
  });

  it("the reset expiry is fail-closed through isCodeExpired (absent = expired)", () => {
    expect(isCodeExpired(null)).toBe(true);
    expect(isCodeExpired(undefined)).toBe(true);
    expect(isCodeExpired(new Date(Date.now() - 1000))).toBe(true);
    expect(isCodeExpired(new Date(Date.now() + 60_000))).toBe(false);
  });

  it("the verification-code seam stays intact (the s35 contract unchanged)", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(codeMatches(hashCodeForStorage(code, SECRET), code, SECRET)).toBe(true);
    const expiry = codeExpiryFromNow(new Date("2026-01-01T00:00:00Z"));
    expect(expiry.getTime() - new Date("2026-01-01T00:00:00Z").getTime()).toBe(VERIFICATION_CODE_TTL_MS);
  });
});
