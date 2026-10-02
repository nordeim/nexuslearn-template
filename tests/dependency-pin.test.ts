import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 32 — dependency-audit pins.
 *
 * `bun audit` flagged GHSA-ggr8-5vv4-36mx (deepmerge-ts < 8.0.0, stack
 * exhaustion on recursive merges) via prisma → @prisma/config → the exact
 * 7.1.5 pin. The bun `overrides` forces the patched 8.x line (same
 * `deepmerge` named export @prisma/config imports dynamically). These pins
 * keep the override from being silently dropped.
 */

const PKG = JSON.parse(
  readFileSync(join(process.cwd(), "package.json"), "utf8"),
) as { overrides?: Record<string, string> };

const LOCK = readFileSync(join(process.cwd(), "bun.lock"), "utf8");

describe("dependency pins (session 32)", () => {
  it("package.json overrides deepmerge-ts to the patched ^8 line", () => {
    expect(PKG.overrides?.["deepmerge-ts"]).toMatch(/^\^8\./);
  });

  it("bun.lock resolves deepmerge-ts from the 8.x line (the override applied)", () => {
    expect(LOCK).toMatch(/deepmerge-ts@8\./);
    expect(LOCK).not.toMatch(/"deepmerge-ts@7\./);
  });
});
