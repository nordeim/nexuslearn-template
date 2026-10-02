import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  TIMING_EQUALIZER_PASSWORD,
  timingEqualizerHash,
  verifyPassword,
} from "@/lib/session";

// Session 33 — the login timing equalizer. The pre-fix login 401 path
// short-circuited on user-not-found (~6ms) while the user-exists +
// wrong-password path burned scryptSync (~35ms) — a 29ms user-existence
// timing oracle (measured 12/12 cleanly separated). The equalizer makes
// BOTH paths burn the same scrypt cost.

const REPO = join(import.meta.dirname, "..");

describe("session-33: the login timing equalizer", () => {
  it("timingEqualizerHash() returns a real scrypt salt:hash shape", () => {
    // 32 hex chars salt + ":" + 128 hex chars (64-byte) hash — the exact
    // shape hashPassword() produces and verifyPassword() parses.
    expect(timingEqualizerHash()).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it("verifies against its own source constant (a genuine scrypt hash)", () => {
    expect(verifyPassword(TIMING_EQUALIZER_PASSWORD, timingEqualizerHash())).toBe(true);
  });

  it("rejects a different password (it is a real hash, not a magic value)", () => {
    expect(verifyPassword("not-the-equalizer-password", timingEqualizerHash())).toBe(false);
  });

  it("is computed once and cached (identical on repeat calls)", () => {
    expect(timingEqualizerHash()).toBe(timingEqualizerHash());
  });

  it("source pin: the login route burns the equalizer on the user-not-found path", () => {
    const src = readFileSync(join(REPO, "src/app/api/auth/login/route.ts"), "utf8");
    expect(src, "imports the equalizer").toMatch(/from "@\/lib\/(session|auth)"/);
    expect(src, "always burns the compare — user or not").toContain(
      "user?.passwordHash ?? timingEqualizerHash()"
    );
  });
});
