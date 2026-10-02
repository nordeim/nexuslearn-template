import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 39 — the real-route canonical conversion source pins (fresh-eyes
 * family B's wiring): every page's `export const metadata = routeMetadata(...)`
 * became `export async function generateMetadata()` delegating to
 * `pageMetadata` (src/lib/page-metadata.ts — the header-reading half; the
 * pure half stays in src/lib/metadata.ts so the unit import stays safe).
 *
 * The pages read the PROXY-INJECTED `x-nexus-raw-search` request header (the
 * s38 wiring) — the SAME header the root layout's 404 derivation reads. The
 * canonical carries the PROCESSED query (the live's pinned algorithm:
 * utm/ad-id exclusion, stable alpha-sort, URLSearchParams serialization).
 */
const read = (f: string) => readFileSync(f, "utf8");

const PAGES: Array<[file: string, title: string | null, canonical: string]> = [
  ["src/app/page.tsx", null, "/"],
  ["src/app/Home/page.tsx", null, "/"],
  ["src/app/Courses/page.tsx", "Courses", "/Courses"],
  ["src/app/Pricing/page.tsx", "Pricing", "/Pricing"],
  ["src/app/About/page.tsx", "About", "/About"],
  ["src/app/Contact/page.tsx", "Contact", "/Contact"],
  ["src/app/BecomeInstructor/page.tsx", "Become Instructor", "/BecomeInstructor"],
  ["src/app/AIAssistant/page.tsx", "AI Assistant", "/AIAssistant"],
  ["src/app/Dashboard/page.tsx", "Dashboard", "/Dashboard"],
  ["src/app/login/page.tsx", null, "/login"],
  ["src/app/CourseDetail/page.tsx", "Course Detail", "/CourseDetail"],
  ["src/app/reset-password/page.tsx", null, "/reset-password"],
];

/** Extract the generateMetadata block's pageMetadata(...) arguments. */
function pageMetadataArgs(src: string): { title: string | null; canonical: string | null } {
  const call = src.match(
    /pageMetadata\(\s*\{([\s\S]*?)\}\s*\)/
  );
  if (!call) return { title: null, canonical: null };
  const titleMatch = call[1].match(/title:\s*"([^"]*)"/);
  const canonicalMatch = call[1].match(/canonical:\s*"([^"]*)"/);
  return { title: titleMatch?.[1] ?? null, canonical: canonicalMatch?.[1] ?? null };
}

describe("page-metadata — the header-reading helper (session 39)", () => {
  it("page-metadata.ts reads x-nexus-raw-search via headers() and delegates to routeMetadata", () => {
    const src = read("src/lib/page-metadata.ts");
    expect(src).toContain('from "next/headers"');
    expect(src).toContain("x-nexus-raw-search");
    expect(src).toContain("routeMetadata");
  });

  it("the pure half stays pure: metadata.ts carries NO next/headers import (the unit-import safety)", () => {
    expect(read("src/lib/metadata.ts")).not.toContain('from "next/headers"');
  });
});

describe("the page conversions — every route derives its canonical through the search header (session 39)", () => {
  for (const [file, title, canonical] of PAGES) {
    it(`${file}: generateMetadata delegates to pageMetadata({ title: ${JSON.stringify(title)}, canonical: ${JSON.stringify(canonical)} })`, () => {
      const src = read(file);
      expect(src).toContain("export async function generateMetadata");
      expect(src).toContain("pageMetadata(");
      expect(src).not.toMatch(/export const metadata = routeMetadata/);
      const args = pageMetadataArgs(src);
      expect(args.canonical).toBe(canonical);
      expect(args.title).toBe(title);
    });
  }

  it("CourseDetail's metadata no longer builds the canonical from searchParams (the raw search carries the id)", () => {
    const src = read("src/app/CourseDetail/page.tsx");
    const metaBlock = src.slice(
      src.indexOf("generateMetadata"),
      src.indexOf("export default")
    );
    expect(metaBlock).not.toContain("searchParams");
  });

  it("reset-password's metadata no longer extracts the token (the raw search carries it)", () => {
    const src = read("src/app/reset-password/page.tsx");
    const metaBlock = src.slice(
      src.indexOf("generateMetadata"),
      src.indexOf("export default")
    );
    expect(metaBlock).not.toContain("token");
    expect(metaBlock).not.toContain("searchParams");
  });
});
