import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { routeMetadata } from "@/lib/metadata";

/**
 * Session 38 — source pins for the 404-metadata wiring (fresh-eyes family
 * 1). The live derives the 404 view's title/canonical/og family from the
 * RAW request path (probed: "Definitely Not A Real Route | NexusLearn" for
 * /definitely-not-a-real-route, canonical + og:url + twitter:url carrying
 * the full path + query). The clone shipped the plain root family.
 *
 * The design: the proxy injects the raw path + search as REQUEST headers;
 * the root layout's generateMetadata derives the 404 family from them.
 * Real pages are unaffected ONLY because every page restates its full
 * payload — the four no-title renders (/, /Home, /login, /reset-password)
 * are made explicit (routeMetadata's no-title branch pins the ABSOLUTE
 * plain title) so the derived layout default surfaces ONLY on not-found
 * renders.
 */

const LAYOUT = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");
const PROXY = readFileSync(join(process.cwd(), "src/proxy.ts"), "utf8");
const LANDING = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
const HOME = readFileSync(join(process.cwd(), "src/app/Home/page.tsx"), "utf8");

describe("404-metadata wiring source pins (session 38)", () => {
  it("the proxy injects the raw path + search as request headers", () => {
    expect(PROXY).toContain('x-nexus-raw-path');
    expect(PROXY).toContain('x-nexus-raw-search');
  });

  it("the layout derives the 404 family through the seam (generateMetadata, not the static export)", () => {
    expect(LAYOUT).toContain("generateMetadata");
    expect(LAYOUT).not.toMatch(/export const metadata/);
    expect(LAYOUT).toContain("x-nexus-raw-path");
    expect(LAYOUT).toContain("notFoundTitle");
    expect(LAYOUT).toContain("notFoundCanonical");
  });

  it("the layout derives og/twitter from the same seam (the og:url/og:title mirror contract)", () => {
    expect(LAYOUT).toMatch(/openGraph[\s\S]*notFoundTitle/);
    expect(LAYOUT).toMatch(/openGraph[\s\S]*notFoundCanonical/);
  });

  it("the layout renders twitter:url through the other map (the missing sixth head dimension)", () => {
    // Next's typed Twitter object has no url field — the live ships
    // <meta name="twitter:url"> on every route incl. the 404 (probed).
    expect(LAYOUT).toMatch(/other:\s*\{\s*"twitter:url"/);
    expect(LAYOUT).toContain("new URL(derivedCanonical");
  });

  it("routeMetadata renders twitter:url for every real route (the verbatim other map)", () => {
    const m = routeMetadata({ title: "Courses", canonical: "/Courses" });
    const other = m.other as Record<string, string>;
    expect(other["twitter:url"]).toBe("http://localhost:3000/Courses");
    const q = routeMetadata({ title: "Course Detail", canonical: "/CourseDetail?id=seed-1" });
    expect(((q.other as Record<string, string>)["twitter:url"])).toBe(
      "http://localhost:3000/CourseDetail?id=seed-1"
    );
  });

  it("the landing + /Home carry EXPLICIT metadata (no layout-default dependence)", () => {
    // Session 39 (the deliberate contract change): the export became the
    // async generateMetadata delegating to pageMetadata — still explicit,
    // still the root canonical, now query-aware (the live's /Home?x=1 ->
    // ...?x=1 root+query contract).
    expect(LANDING).toMatch(/export async function generateMetadata/);
    expect(LANDING).toMatch(/pageMetadata\(\s*\{\s*canonical: "\/"\s*\}/);
    expect(HOME).toMatch(/export async function generateMetadata/);
    expect(HOME).toMatch(/pageMetadata\(\s*\{\s*canonical: "\/"\s*\}/);
  });
});

describe("routeMetadata no-title branch — the absolute-title pin (session 38)", () => {
  it("the no-title form pins the ABSOLUTE plain title (no layout-default inheritance)", () => {
    const m = routeMetadata({ canonical: "/login" });
    // The absolute form renders "NexusLearn" regardless of the layout's
    // default — the /login + /reset-password + landing guard.
    expect(m.title).toEqual({ absolute: "NexusLearn" });
    expect(m.openGraph?.title).toBe("NexusLearn");
    expect(m.twitter?.title).toBe("NexusLearn");
  });

  it("the titled form keeps the template-driven segment (unchanged)", () => {
    const m = routeMetadata({ title: "Courses", canonical: "/Courses" });
    expect(m.title).toBe("Courses");
  });
});
