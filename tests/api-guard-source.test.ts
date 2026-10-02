import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Session 31 — the API-guard SOURCE pin: every public POST route must
// carry the rate-limit check + the body-size pre-check (the session-30
// source-guard pattern — a future refactor cannot silently drop a route's
// protection). Session 33 re-pins to SEVEN: the signup-verification route
// POST /api/auth/verify (which MINTS the session cookie) had escaped the
// session-31 net — the exact-set assertion is the discipline that catches
// the next public route. Session 37 re-pins to EIGHT: POST
// /api/auth/reset-password (the password-reset consumption route) joins
// the set deliberately (the drill's step 6 — the live ships the flow; see
// docs/remediation-plan-session37.md). The skills/ folder is not app code
// and never appears here.

const REPO = join(import.meta.dirname, "..");

const ROUTES: Record<string, string> = {
  "POST /api/auth/login": "src/app/api/auth/login/route.ts",
  "POST /api/auth/signup": "src/app/api/auth/signup/route.ts",
  "POST /api/auth/verify": "src/app/api/auth/verify/route.ts",
  "POST /api/auth/forgot-password": "src/app/api/auth/forgot-password/route.ts",
  "POST /api/auth/reset-password": "src/app/api/auth/reset-password/route.ts",
  "POST /api/contact": "src/app/api/contact/route.ts",
  "POST /api/newsletter": "src/app/api/newsletter/route.ts",
  "POST /api/ai/chat": "src/app/api/ai/chat/route.ts",
};

const source = (rel: string) => readFileSync(join(REPO, rel), "utf8");

describe("api-guard source pin: the eight public POST routes", () => {
  for (const [label, rel] of Object.entries(ROUTES)) {
    it(`${label} wires the rate limiter + the body-size pre-check`, () => {
      const src = source(rel);
      expect(src, `${rel} imports the limiter`).toMatch(/from "@\/lib\/rate-limit"/);
      expect(src, `${rel} calls checkRateLimit`).toContain("checkRateLimit(");
      expect(src, `${rel} imports the request guard`).toMatch(/from "@\/lib\/request-guard"/);
      expect(src, `${rel} checks the body size`).toContain("bodyTooLarge(");
      // The limiter runs BEFORE the body is parsed (the cheap rejection):
      // the checkRateLimit call must precede the first req.json()/formData().
      const limitPos = src.indexOf("checkRateLimit(");
      const parsePos = src.search(/req\.(json|formData)\(/);
      expect(limitPos).toBeGreaterThan(-1);
      expect(parsePos).toBeGreaterThan(-1);
      expect(limitPos, `${rel}: the limiter must run before the body parse`).toBeLessThan(parsePos);
    });
  }

  it("the guarded routes are exactly the eight public ones (the authed routes stay unthrottled)", () => {
    const walk = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) => {
        const p = join(dir, f);
        return statSync(p).isDirectory() ? walk(p) : p.endsWith("route.ts") ? [p] : [];
      });
    const all = walk(join(REPO, "src", "app", "api"));
    const guarded = all.filter((p) => readFileSync(p, "utf8").includes("checkRateLimit("));
    expect(guarded.length).toBe(8);
    // The exact set: the eight PUBLIC POST routes (and nothing else). The
    // authed routes are deliberately NOT in the set (documented in
    // docs/remediation-plan-session31.md §B-2c): enrollments, progress,
    // logout, me require a session cookie.
    const toRoute = (p: string) => p.slice(p.indexOf("src/app/api/") + "src/app/api/".length, -"/route.ts".length);
    expect(guarded.map(toRoute).sort()).toEqual([
      "ai/chat",
      "auth/forgot-password",
      "auth/login",
      "auth/reset-password",
      "auth/signup",
      "auth/verify",
      "contact",
      "newsletter",
    ]);
  });

  it("session-33: the verify route caps the email field (the unbounded lookup key)", () => {
    const src = source("src/app/api/auth/verify/route.ts");
    expect(src).toContain("fieldTooLong(email, FIELD_LIMITS.email)");
  });
});
