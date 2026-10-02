import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Session 36 — the unverified-login surface (a REAL functional parity
// drift, found by fresh-eyes probing the LIVE through its own UI):
// the reference app BLOCKS signing in with an unverified account —
// the live shows "Please verify your email before logging in. Check your
// email for the verification code." in the signin card and mints NO
// session. The clone minted a FULL session for the same account (probed:
// the nexus_session cookie set, landed on /) — the entire signup-
// verification flow was decorative for login purposes.
//
// The fix shape (source-pinned here, e2e-pinned in the session-36 block):
// the login route checks user.emailVerified AFTER the password-compare
// 401 gate (the order matters — checking BEFORE the scrypt compare would
// leak account existence + state to a wrong-password caller) and returns
// 403 with the EXACT reference message.

const LOGIN_ROUTE = join(
  import.meta.dirname,
  "..",
  "src/app/api/auth/login/route.ts"
);

/** The live's exact error text (probed on the reference UI, session 36). */
export const UNVERIFIED_LOGIN_MESSAGE =
  "Please verify your email before logging in. Check your email for the verification code.";

describe("session-36: the unverified-login gate (the login route source pin)", () => {
  const src = readFileSync(LOGIN_ROUTE, "utf8");

  it("the route carries the exact reference message", () => {
    expect(src).toContain("Please verify your email before logging in. Check your email for the verification code.");
  });

  it("the gate returns the 403 status (valid credentials, forbidden account state — 401 stays the bad-credentials family)", () => {
    expect(src).toMatch(/status: 403/);
  });

  it("the gate checks user.emailVerified AFTER the password-compare 401 gate (no new enumeration oracle)", () => {
    const gatePos = src.indexOf("emailVerified");
    expect(gatePos, "the gate exists").toBeGreaterThan(-1);
    // The 401 gate (invalid credentials) must come FIRST.
    const denyPos = src.indexOf("Invalid email or password");
    expect(denyPos, "the 401 gate exists").toBeGreaterThan(-1);
    expect(
      gatePos,
      "emailVerified is only consulted after the password compare"
    ).toBeGreaterThan(denyPos);
    // And the equalizer line stays (the session-33 pin re-stated here).
    expect(src).toContain("user?.passwordHash ?? timingEqualizerHash()");
  });
});
