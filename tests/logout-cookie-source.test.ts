import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 32 — source pins for the logout deletion-cookie attribute symmetry.
 *
 * The logout route previously cleared the cookie with a bare
 * `{ path: "/", maxAge: 0 }` — omitting the HttpOnly/SameSite/Secure
 * attributes the login cookie carries. RFC 6265 identifies a cookie by
 * name+domain+path so deletion worked, but symmetric attributes are strict
 * hygiene. This pin keeps the route from regressing to the bare form.
 */

const ROUTE = readFileSync(
  join(process.cwd(), "src/app/api/auth/logout/route.ts"),
  "utf8",
);

describe("logout-cookie source pin (session 32)", () => {
  it("the deletion cookie spreads sessionCookieOptions (attribute symmetry)", () => {
    expect(ROUTE).toContain("...sessionCookieOptions");
    expect(ROUTE).toContain("maxAge: 0");
  });

  it("the bare-object deletion form is gone", () => {
    expect(ROUTE).not.toMatch(/cookies\.set\(\s*SESSION_COOKIE,\s*""\s*,\s*\{\s*path:/);
  });
});
