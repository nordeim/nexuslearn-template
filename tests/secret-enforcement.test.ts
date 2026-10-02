import { describe, expect, it } from "vitest";

import { resolveSessionSecret, SessionSecretError } from "@/lib/session";

// Session 33 — the production AUTH_SECRET enforcement. Pre-fix: a
// production deployment without AUTH_SECRET only console.warned and then
// SIGNED AND VERIFIED tokens with the PUBLIC repo fallback constant — a
// token forged with nothing but the source code was accepted (verified
// end-to-end on a deliberately secretless production standalone). The
// fix: resolveSessionSecret() throws a typed SessionSecretError in
// production; dev/test keep the documented zero-config fallback.

describe("session-33: the production AUTH_SECRET enforcement", () => {
  it("throws in production when AUTH_SECRET is unset", () => {
    expect(() => resolveSessionSecret({ NODE_ENV: "production" })).toThrow(/AUTH_SECRET/);
  });

  it("throws in production when AUTH_SECRET is shorter than 16 characters", () => {
    expect(() => resolveSessionSecret({ NODE_ENV: "production", AUTH_SECRET: "short" })).toThrow(/AUTH_SECRET/);
  });

  it("throws in production when AUTH_SECRET is empty (the .env default)", () => {
    expect(() => resolveSessionSecret({ NODE_ENV: "production", AUTH_SECRET: "" })).toThrow(/AUTH_SECRET/);
  });

  it("returns the secret in production when it is strong", () => {
    const secret = "a".repeat(32);
    expect(resolveSessionSecret({ NODE_ENV: "production", AUTH_SECRET: secret })).toBe(secret);
  });

  it("falls back to the documented dev constant outside production (zero-config dev)", () => {
    expect(resolveSessionSecret({})).toBe("nexuslearn-dev-only-insecure-secret");
    expect(resolveSessionSecret({ NODE_ENV: "development" })).toBe("nexuslearn-dev-only-insecure-secret");
    expect(resolveSessionSecret({ NODE_ENV: "test" })).toBe("nexuslearn-dev-only-insecure-secret");
  });

  it("the error is a typed SessionSecretError (an Error subclass)", () => {
    expect(SessionSecretError).toBeInstanceOf(Function);
    const err = new SessionSecretError("boom");
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("SessionSecretError");
  });

  it("the thrown production error carries the actionable fix in its message", () => {
    try {
      resolveSessionSecret({ NODE_ENV: "production" });
      expect.unreachable("must throw");
    } catch (e) {
      expect(e instanceof SessionSecretError).toBe(true);
      expect((e as Error).message).toContain("openssl rand -hex 32");
    }
  });
});
