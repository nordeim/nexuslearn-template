import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 40 — source pins for the trailing-slash resolution wiring (the
 * fresh-eyes family A fix). The seam decides (pure, unit-tested in
 * tests/slash-resolution.test.ts); the proxy adapts; the config flag hands
 * the single-trailing-slash shapes to the app layer.
 *
 * The wiring contract:
 *  - next.config.ts ships skipTrailingSlashRedirect: true (Next's built-in
 *    pre-proxy 308 would otherwise own every slash shape before the proxy
 *    can see it — empirically verified).
 *  - the proxy runs the verb guard + the request-header injection FIRST,
 *    then the slash resolution, then the s17 case-rewrite.
 *  - the redirect branch constructs the RELATIVE Location (NextResponse.redirect
 *    would emit the absolute form — the s24 pin asserts "/Courses").
 *  - the not-found branch rewrites to an internal unmatched path (the router
 *    renders not-found.tsx — a REAL 404 per the s24 principle).
 *  - CONTENT_ROUTES lives in ONE place (the seam) — the proxy imports it.
 */

const REPO = join(import.meta.dirname, "..");
const read = (rel: string) => readFileSync(join(REPO, rel), "utf8");

const CONFIG = read("next.config.ts");
const PROXY = read("src/proxy.ts");

describe("slash-resolution source pins (session 40)", () => {
  it("next.config.ts hands single-trailing-slash handling to the app layer", () => {
    expect(CONFIG).toMatch(/skipTrailingSlashRedirect:\s*true/);
  });

  it("the proxy imports the seam (one canonical CONTENT_ROUTES list)", () => {
    expect(PROXY).toMatch(/from "@\/lib\/slash-resolution"/);
    expect(PROXY).toContain("resolveSlashPath(");
    // The route list moved to the seam — no duplicated array in the proxy.
    expect(PROXY).not.toMatch(/const CANONICAL_ROUTES/);
  });

  it("the verb guard precedes the slash resolution (method beats path resolution)", () => {
    const guardPos = PROXY.indexOf("ALLOWED_METHODS.has(req.method)");
    const slashPos = PROXY.indexOf("resolveSlashPath(");
    expect(guardPos).toBeGreaterThan(-1);
    expect(slashPos).toBeGreaterThan(-1);
    expect(guardPos, "the verb guard must run first").toBeLessThan(slashPos);
  });

  it("the request-header injection precedes the slash resolution (the 404 derivations need the raw path)", () => {
    const headerPos = PROXY.indexOf('requestHeaders.set("x-nexus-raw-path"');
    const slashPos = PROXY.indexOf("resolveSlashPath(");
    expect(headerPos).toBeGreaterThan(-1);
    expect(headerPos).toBeLessThan(slashPos);
  });

  it("the redirect branch targets the ABSOLUTE URL (the adapter relativizes same-host Locations)", () => {
    // The s24 pin asserts the RELATIVE "/Courses" Location. A relative
    // Location passed straight through CRASHES Next's middleware adapter
    // (NextURL requires absolute — empirically verified); the absolute form
    // is relativized BACK by the adapter for same-host targets
    // (server/web/adapter.js: getRelativeURL). So: NextResponse.redirect +
    // the seam's location resolved against the request origin.
    expect(PROXY).toMatch(/new URL\(slash\.location,\s*req\.nextUrl\.toString\(\)\)/);
    expect(PROXY).toMatch(/NextResponse\.redirect\(\s*target/);
    expect(PROXY).toMatch(/status:\s*308/);
  });

  it("the not-found branch rewrites to the internal 404 path (a REAL 404 render)", () => {
    expect(PROXY).toContain("__nexus-slash-404__");
  });

  it("the s17 case-rewrite survives (no-slash case variants still render at the typed URL)", () => {
    expect(PROXY).toContain('r.toLowerCase() === pathname.toLowerCase()');
    expect(PROXY).toContain("NextResponse.rewrite");
  });
});
