import { describe, expect, it } from "vitest";

import {
  bodyTooLarge,
  FIELD_LIMITS,
  fieldTooLong,
  MAX_BODY_BYTES,
} from "@/lib/request-guard";

// Session 31 — the request-size guard contract (the request-size/payload-
// depth surface). The limits table is the DOCUMENTED contract: a future edit
// that casually bumps a cap (or drops one) must fail here first.

describe("request-guard: the body-size pre-check", () => {
  it("rejects strictly above MAX_BODY_BYTES (1MB)", () => {
    expect(MAX_BODY_BYTES).toBe(1_000_000);
    expect(bodyTooLarge(1_000_001)).toBe(true);
    expect(bodyTooLarge(2 * 1024 * 1024)).toBe(true);
  });

  it("accepts at and under MAX_BODY_BYTES", () => {
    expect(bodyTooLarge(0)).toBe(false); // absent/chunked — the field caps still guard
    expect(bodyTooLarge(1)).toBe(false);
    expect(bodyTooLarge(1_000_000)).toBe(false);
  });
});

describe("request-guard: the field-length caps", () => {
  it("the limits table carries the documented values", () => {
    // RFC 5321 practical max; a real password is <= 128 chars (1024 = 8x);
    // a long support message is ~2 screens of text; the AI composer sends
    // the last 12 turns (100 = defense-in-depth).
    expect(FIELD_LIMITS.email).toBe(254);
    expect(FIELD_LIMITS.password).toBe(1024);
    expect(FIELD_LIMITS.name).toBe(200);
    expect(FIELD_LIMITS.subject).toBe(200);
    expect(FIELD_LIMITS.message).toBe(10_000);
    expect(FIELD_LIMITS.chatTurns).toBe(100);
    expect(FIELD_LIMITS.resetToken).toBe(128);
  });

  it("fieldTooLong is the strict boundary (254 ok, 255 rejects)", () => {
    expect(fieldTooLong("x".repeat(254), FIELD_LIMITS.email)).toBe(false);
    expect(fieldTooLong("x".repeat(255), FIELD_LIMITS.email)).toBe(true);
    expect(fieldTooLong("", FIELD_LIMITS.message)).toBe(false);
  });
});
