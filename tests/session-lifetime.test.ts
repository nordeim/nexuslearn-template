import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  verifySessionToken,
  SESSION_MAX_AGE,
  SESSION_MAX_AGE_MS,
  SESSION_CLOCK_SKEW_MS,
} from "@/lib/session";

/**
 * Session 32 — the server-side session-lifetime specs (RED first).
 *
 * The 7-day lifetime was previously enforced ONLY by the browser cookie jar
 * (`maxAge` on `nexus_session`): the server never looked at the token's
 * embedded `iat`. These specs pin the server-side bound — the cookie's
 * promise must hold even for a restored/backed-up/exported cookie.
 */

const DAY = 24 * 60 * 60 * 1000;
const user = { userId: "u1", email: "a@b.co", name: "Ada" };

/** Mint a token whose payload claims a DIFFERENT iat (validly signed). */
function mintWithIat(claim: number): string {
  // Same construction as createSessionToken, with the iat pinned — this is
  // what an attacker (or a backup restore) controls: the payload, never the
  // MAC (they would need the secret).
  const payload = Buffer.from(JSON.stringify({ ...user, iat: claim })).toString("base64url");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHmac } = require("node:crypto") as typeof import("node:crypto");
  const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16 ? process.env.AUTH_SECRET : "nexuslearn-dev-only-insecure-secret";
  const mac = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

describe("session-lifetime (server-side iat enforcement)", () => {
  it("a freshly-issued token verifies", () => {
    expect(verifySessionToken(createSessionToken(user))).toEqual(user);
  });

  it("a 6-day-old token is still within the window", () => {
    expect(verifySessionToken(mintWithIat(Date.now() - 6 * DAY))).toEqual(user);
  });

  it("an 8-day-old token is REJECTED (past the 7-day window)", () => {
    expect(verifySessionToken(mintWithIat(Date.now() - 8 * DAY))).toBeNull();
  });

  it("a 7-day-plus-1-hour-old token is REJECTED", () => {
    expect(verifySessionToken(mintWithIat(Date.now() - 7 * DAY - 60 * 60 * 1000))).toBeNull();
  });

  it("a future-issued token beyond the skew window is REJECTED", () => {
    expect(verifySessionToken(mintWithIat(Date.now() + 2 * 60 * 1000))).toBeNull();
  });

  it("a future-issued token within the 60s clock skew still verifies", () => {
    expect(verifySessionToken(mintWithIat(Date.now() + 30 * 1000))).toEqual(user);
  });

  it("a token without iat is REJECTED (the field is now mandatory)", () => {
    expect(verifySessionToken(mintWithIat(Number.NaN))).not.toBe(user);
    // A payload genuinely missing the iat key (hand-built, validly signed):
    const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createHmac } = require("node:crypto") as typeof import("node:crypto");
    const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16 ? process.env.AUTH_SECRET : "nexuslearn-dev-only-insecure-secret";
    const mac = createHmac("sha256", secret).update(payload).digest("base64url");
    expect(verifySessionToken(`${payload}.${mac}`)).toBeNull();
  });

  it("a token with a malformed (string) iat is REJECTED", () => {
    const payload = Buffer.from(JSON.stringify({ ...user, iat: "not-a-number" })).toString("base64url");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createHmac } = require("node:crypto") as typeof import("node:crypto");
    const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16 ? process.env.AUTH_SECRET : "nexuslearn-dev-only-insecure-secret";
    const mac = createHmac("sha256", secret).update(payload).digest("base64url");
    expect(verifySessionToken(`${payload}.${mac}`)).toBeNull();
  });
});

describe("session-lifetime constants (the single source of truth)", () => {
  it("SESSION_MAX_AGE is the 7-day cookie contract (604800 seconds)", () => {
    expect(SESSION_MAX_AGE).toBe(604_800);
  });

  it("SESSION_MAX_AGE_MS is the same window in milliseconds", () => {
    expect(SESSION_MAX_AGE_MS).toBe(604_800_000);
  });

  it("SESSION_CLOCK_SKEW_MS is the 60s future tolerance", () => {
    expect(SESSION_CLOCK_SKEW_MS).toBe(60_000);
  });
});
