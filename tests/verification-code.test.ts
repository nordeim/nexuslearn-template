import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Session 35 — the verification-code persistence surface (the first half of
// the DEPLOYMENT §13 SMTP drill). Pre-fix: the signup route generated a
// 6-digit code, logged it via console.info, and DISCARDED it — the User row
// carried no verificationCode/codeExpiresAt columns, and POST /api/auth/verify
// accepted ANY complete 6-digit code (probe: the wrong code "000000" verified
// the account, minted the session, and flipped emailVerified). The fix: the
// code is persisted as an HMAC-SHA256 hash with a 10-minute expiry; the verify
// route compares for real when AUTH_DELIVERY=smtp (the env gate — the
// simulated any-code contract stays the dev/test default per the drill's
// step 5), and BOTH fields are cleared on every successful verify.

const REPO = join(import.meta.dirname, "..");
const source = (rel: string) => readFileSync(join(REPO, rel), "utf8");

import {
  generateVerificationCode,
  hashCodeForStorage,
  codeExpiryFromNow,
  isCodeExpired,
  codeMatches,
  codeComparisonEnabled,
  VERIFICATION_CODE_TTL_MS,
} from "@/lib/verification";

const TEST_SECRET = "unit-test-verification-secret";

describe("session-35: the verification-code pure seam", () => {
  it("generateVerificationCode returns a 6-digit numeric string (100 draws)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
      seen.add(code);
    }
    // Crypto-random 6 digits over 100 draws: collisions are possible but a
    // single distinct value across 100 draws would indicate a broken RNG.
    expect(seen.size).toBeGreaterThan(50);
  });

  it("hashCodeForStorage is deterministic and distinct per code and per secret", () => {
    const a = hashCodeForStorage("123456", TEST_SECRET);
    expect(a, "deterministic").toBe(hashCodeForStorage("123456", TEST_SECRET));
    expect(a, "distinct per code").not.toBe(hashCodeForStorage("654321", TEST_SECRET));
    expect(a, "distinct per secret").not.toBe(hashCodeForStorage("123456", "another-secret"));
    expect(a, "HMAC-SHA256 hex").toMatch(/^[0-9a-f]{64}$/);
  });

  it("codeMatches accepts the right code and rejects a wrong code", () => {
    const stored = hashCodeForStorage("123456", TEST_SECRET);
    expect(codeMatches(stored, "123456", TEST_SECRET)).toBe(true);
    expect(codeMatches(stored, "654321", TEST_SECRET)).toBe(false);
    expect(codeMatches(null, "123456", TEST_SECRET), "no stored code -> no match").toBe(false);
    expect(codeMatches(undefined, "123456", TEST_SECRET)).toBe(false);
  });

  it("codeExpiryFromNow lands 10 minutes out; isCodeExpired flips at the boundary", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const expires = codeExpiryFromNow(now);
    expect(expires.getTime() - now.getTime()).toBe(VERIFICATION_CODE_TTL_MS);
    expect(VERIFICATION_CODE_TTL_MS).toBe(10 * 60 * 1000);

    expect(isCodeExpired(expires, new Date(now.getTime() + 9 * 60 * 1000)), "9 minutes in: valid").toBe(false);
    expect(isCodeExpired(expires, new Date(now.getTime() + 11 * 60 * 1000)), "11 minutes in: expired").toBe(true);
    expect(isCodeExpired(null, now), "no expiry stored -> treat as expired").toBe(true);
    expect(isCodeExpired(undefined, now)).toBe(true);
  });

  it("codeComparisonEnabled: the AUTH_DELIVERY=smtp gate (simulated stays the default)", () => {
    expect(codeComparisonEnabled({}), "unset -> simulated").toBe(false);
    expect(codeComparisonEnabled({ AUTH_DELIVERY: undefined }), "undefined -> simulated").toBe(false);
    expect(codeComparisonEnabled({ AUTH_DELIVERY: "" }), "empty -> simulated").toBe(false);
    expect(codeComparisonEnabled({ AUTH_DELIVERY: "smtp" }), "smtp -> real comparison").toBe(true);
    expect(codeComparisonEnabled({ AUTH_DELIVERY: "console" }), "any other value -> simulated").toBe(false);
    expect(codeComparisonEnabled({ AUTH_DELIVERY: "SMTP" }), "case-sensitive (the documented value is lowercase)").toBe(false);
  });
});

describe("session-35: the verification-code source pins", () => {
  it("prisma/schema.prisma declares the persistence columns", () => {
    const schema = source("prisma/schema.prisma");
    expect(schema).toMatch(/verificationCode\s+String\?/);
    expect(schema).toMatch(/codeExpiresAt\s+DateTime\?/);
  });

  it("the signup route persists the hash + expiry in BOTH branches (create + unverified resend)", () => {
    const src = source("src/app/api/auth/signup/route.ts");
    expect(src).toContain("hashCodeForStorage");
    expect(src).toContain("codeExpiryFromNow");
    // The create branch AND the unverified-resend branch both write the pair.
    const writes = src.match(/verificationCode:\s*hashCodeForStorage/g) ?? [];
    expect(writes.length, "both branches persist the code hash").toBe(2);
    const expiries = src.match(/codeExpiresAt:\s*codeExpiryFromNow/g) ?? [];
    expect(expiries.length, "both branches persist the expiry").toBe(2);
    // The simulated-delivery log line stays (it IS the delivery channel
    // until an operator wires SMTP — the DEPLOYMENT §13 drill).
    expect(src).toContain("simulated delivery");
  });

  it("the verify route compares under the gate + clears both fields on success", () => {
    const src = source("src/app/api/auth/verify/route.ts");
    expect(src, "the AUTH_DELIVERY gate").toContain("codeComparisonEnabled");
    expect(src, "the real comparison").toContain("codeMatches");
    expect(src, "the expiry check").toContain("isCodeExpired");
    // The clear runs on EVERY successful verify (both modes — the
    // persistence housekeeping).
    expect(src).toMatch(/verificationCode:\s*null/);
    expect(src).toMatch(/codeExpiresAt:\s*null/);
  });
});
