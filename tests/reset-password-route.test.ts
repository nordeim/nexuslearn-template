import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Session 37 — the reset-password route source pins (the drill's step 6, the
// consumption leg): POST /api/auth/reset-password is the EIGHTH public POST
// route (the api-guard exact-set pin moves 7 -> 8 — the deliberate update),
// and the forgot-password route swaps its stub for the token lifecycle.

const REPO = join(import.meta.dirname, "..");
const source = (rel: string) => readFileSync(join(REPO, rel), "utf8");

const RESET_ROUTE = "src/app/api/auth/reset-password/route.ts";
const FORGOT_ROUTE = "src/app/api/auth/forgot-password/route.ts";

describe("session-37: the reset-password route source pins", () => {
  it("the route file exists", () => {
    expect(existsSync(join(REPO, RESET_ROUTE)), "src/app/api/auth/reset-password/route.ts").toBe(true);
  });

  it("wires the guard stack (limiter FIRST, then the 413 pre-check, then the field caps)", () => {
    const src = source(RESET_ROUTE);
    expect(src).toMatch(/from "@\/lib\/rate-limit"/);
    expect(src).toContain("checkRateLimit(");
    expect(src).toMatch(/from "@\/lib\/request-guard"/);
    expect(src).toContain("bodyTooLarge(");
    const limitPos = src.indexOf("checkRateLimit(");
    const parsePos = src.search(/req\.json\(/);
    expect(limitPos).toBeGreaterThan(-1);
    expect(parsePos).toBeGreaterThan(-1);
    expect(limitPos, "the limiter runs before the body parse").toBeLessThan(parsePos);
  });

  it("returns the EXACT reference error for the invalid/expired/absent token (the live's alert text)", () => {
    const src = source(RESET_ROUTE);
    expect(src).toContain("Invalid or expired reset token");
  });

  it("consumes single-use: the success update sets the new hash, CLEARS both token fields, and BUMPS sessionVersion (a reset kills outstanding sessions)", () => {
    const src = source(RESET_ROUTE);
    expect(src).toMatch(/resetTokenHash:\s*null/);
    expect(src).toMatch(/resetTokenExpiresAt:\s*null/);
    expect(src).toMatch(/sessionVersion:\s*\{\s*increment:\s*1\s*\}/);
    expect(src).toMatch(/passwordHash/);
  });

  it("validates the password length (the >= 8 contract, the signup convention)", () => {
    const src = source(RESET_ROUTE);
    expect(src).toMatch(/password\.length\s*<\s*8/);
  });
});

describe("session-37: the forgot-password token lifecycle source pins", () => {
  it("mints + persists + delivers for an EXISTING user (the reset round trip)", () => {
    const src = source(FORGOT_ROUTE);
    expect(src).toContain("generateResetToken");
    expect(src).toContain("resetTokenHash");
    expect(src).toContain("resetTokenExpiresAt");
    expect(src).toContain("sendPasswordResetEmail");
    expect(src).toMatch(/reset-password\?token=/);
  });

  it("pays the timing equalizer (the s33 precedent — no CPU-time enumeration oracle)", () => {
    const src = source(FORGOT_ROUTE);
    // The shared-cost form: the token mint + hash run BEFORE the user
    // lookup branches, so the hit and the miss paths pay the same crypto.
    const mintPos = src.indexOf("generateResetToken()");
    const lookupPos = src.indexOf("findUnique");
    expect(mintPos).toBeGreaterThan(-1);
    expect(lookupPos).toBeGreaterThan(-1);
    expect(mintPos, "the mint precedes the lookup — both paths pay it").toBeLessThan(lookupPos);
  });

  it("SWALLOWS the MailerError into the ok response (the no-enumeration override — a delivery error only for existing emails IS the oracle)", () => {
    const src = source(FORGOT_ROUTE);
    expect(src).toContain("MailerError");
    // The route must NOT carry a 502 (the signup's fail-loud shape is the
    // documented exception here — the caller of forgot-password has NOT
    // proven the email exists).
    expect(src).not.toMatch(/status:\s*502/);
  });

  it("keeps the ALWAYS-OK response shape (the pinned reference contract)", () => {
    const src = source(FORGOT_ROUTE);
    expect(src).toContain("{ ok: true }");
  });
});

describe("session-37: the api-guard pin moves to EIGHT (the deliberate exact-set update)", () => {
  it("the reset-password route joins the guarded set in tests/api-guard-source.test.ts", () => {
    const src = readFileSync(join(REPO, "tests/api-guard-source.test.ts"), "utf8");
    expect(src).toContain("auth/reset-password");
    expect(src).toMatch(/guarded\.length\)\.toBe\(8\)/);
    expect(src).toContain("auth/forgot-password");
  });

  it("the schema carries the reset-token columns (the s35 persistence pattern)", () => {
    const src = readFileSync(join(REPO, "prisma/schema.prisma"), "utf8");
    expect(src).toMatch(/resetTokenHash\s+String\?/);
    expect(src).toMatch(/resetTokenExpiresAt\s+DateTime\?/);
  });
});
