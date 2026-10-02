import { describe, expect, it } from "vitest";

import {
  createSessionToken,
  verifySessionToken,
  hashPassword,
  verifyPassword,
} from "@/lib/session";

describe("session tokens (HMAC cookie auth)", () => {
  it("round-trips a session user", () => {
    const token = createSessionToken({ userId: "u1", email: "a@b.co", name: "Ada" });
    const session = verifySessionToken(token);
    // session-34: the round-trip carries the epoch (ver: 0 — the default mint).
    expect(session).toEqual({ userId: "u1", email: "a@b.co", name: "Ada", ver: 0 });
  });

  it("rejects tampered payloads", () => {
    const token = createSessionToken({ userId: "u1", email: "a@b.co", name: "Ada" });
    const [payload] = token.split(".");
    const forged = `eyJ1c2VySWQiOiJldmlsIn0.${token.split(".")[1]}`;
    expect(payload).toBeTruthy();
    expect(verifySessionToken(forged)).toBeNull();
  });

  it("rejects garbage and empty tokens", () => {
    expect(verifySessionToken(null)).toBeNull();
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("not-a-token")).toBeNull();
  });
});

describe("password hashing (scrypt)", () => {
  it("verifies the right password and rejects the wrong one", () => {
    const stored = hashPassword("$Abcd1234");
    expect(verifyPassword("$Abcd1234", stored)).toBe(true);
    expect(verifyPassword("wrong-password", stored)).toBe(false);
  });

  it("salts every hash (no two alike)", () => {
    expect(hashPassword("same")).not.toBe(hashPassword("same"));
  });
});
