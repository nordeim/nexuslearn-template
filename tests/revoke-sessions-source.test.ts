import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Session 35 — the revoke-sessions route source pin. The session-34 epoch
// lever (bump User.sessionVersion) existed ONLY as raw SQL in DEPLOYMENT.md
// §12 — an account owner who suspects a leaked cookie had no first-party way
// to revoke their own sessions. POST /api/auth/revoke-sessions is the authed,
// deliberately-unthrottled lever: ONE indexed increment kills every
// outstanding token for the caller (including the presented one — the cookie
// is cleared with the session-32 attribute-symmetric deletion form). Zero
// visual footprint: the byte-exact parity contract is untouched (the UI
// affordance is deliberately deferred — any Dashboard/login surface addition
// would break the pinned heights; documented as a future beyond-reference
// decision).

const REPO = join(import.meta.dirname, "..");

describe("session-35: the revoke-sessions route source pin", () => {
  const src = readFileSync(join(REPO, "src/app/api/auth/revoke-sessions/route.ts"), "utf8");

  it("requires a session (the authed-route 401 contract)", () => {
    expect(src).toContain("getSession");
    expect(src).toContain("401");
  });

  it("bumps the per-user epoch (the session-34 lever)", () => {
    expect(src).toMatch(/sessionVersion:\s*\{\s*increment:\s*1\s*\}/);
  });

  it("clears the cookie with the session-32 attribute-symmetric deletion form", () => {
    expect(src).toContain("sessionCookieOptions");
    expect(src).toMatch(/maxAge:\s*0/);
    expect(src).toContain(SESSION_COOKIE_NAME());
  });

  it("is deliberately NOT rate-limited (the authed-route family)", () => {
    expect(src, "the authed routes stay unthrottled (session 31)").not.toContain("checkRateLimit(");
  });

  it("the api-guard seven-route pin is unaffected (the new route is authed, not public)", () => {
    const guard = readFileSync(join(REPO, "tests/api-guard-source.test.ts"), "utf8");
    expect(guard).toContain("toBe(7)");
    expect(guard, "revoke-sessions must NOT join the public set").not.toContain("revoke-sessions");
  });
});

function SESSION_COOKIE_NAME(): string {
  return "SESSION_COOKIE";
}
