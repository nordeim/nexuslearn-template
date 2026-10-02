import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 41 — the auth-shell head family source pins (fresh-eyes family A:
 * the per-route head census found the live's two platform-AUTH routes —
 * /login + /reset-password — carrying a head family the app routes never
 * see: viewport-fit=cover + theme-color #000000 + apple-touch-icon
 * sizes=180x180 + the og:image dimensions/alt family). The pins freeze the
 * WIRING: only the two auth pages opt into the family (the authShell flag
 * through pageMetadata -> routeMetadata), only they export the
 * viewport-fit/theme-color viewport, and the shared app payload stays
 * URL-only (the live's app shape).
 */
const read = (f: string) => readFileSync(f, "utf8");

const AUTH_PAGES = ["src/app/login/page.tsx", "src/app/reset-password/page.tsx"];

const APP_PAGES = [
  "src/app/page.tsx",
  "src/app/Home/page.tsx",
  "src/app/Courses/page.tsx",
  "src/app/CourseDetail/page.tsx",
  "src/app/Pricing/page.tsx",
  "src/app/About/page.tsx",
  "src/app/Contact/page.tsx",
  "src/app/BecomeInstructor/page.tsx",
  "src/app/AIAssistant/page.tsx",
  "src/app/Dashboard/page.tsx",
];

describe("auth-head — the auth-shell head family wiring (session 41)", () => {
  it("both auth pages pass authShell: true to pageMetadata", () => {
    for (const f of AUTH_PAGES) {
      const src = read(f);
      expect(src, `${f} calls pageMetadata with authShell`).toMatch(
        /pageMetadata\(\s*\{[^}]*authShell:\s*true/
      );
    }
  });

  it("no app page passes the authShell flag (the family is auth-only)", () => {
    for (const f of APP_PAGES) {
      const src = read(f);
      expect(src.includes("authShell"), `${f} must not carry authShell`).toBe(false);
    }
  });

  it("both auth pages export the viewport family: viewportFit cover + themeColor #000000", () => {
    for (const f of AUTH_PAGES) {
      const src = read(f);
      expect(src, `${f} exports a viewport`).toMatch(/export const viewport/);
      expect(src, `${f} pins viewportFit cover`).toMatch(/viewportFit:\s*"cover"/);
      expect(src, `${f} pins themeColor #000000`).toMatch(/themeColor:\s*"#000000"/);
      // The merged output must stay complete: the pages restate the base
      // width + initialScale (the closest viewport wins per key).
      expect(src).toMatch(/width:\s*"device-width"/);
      expect(src).toMatch(/initialScale:\s*1/);
    }
  });

  it("no app page or the layout exports viewportFit or themeColor (the app viewport stays plain)", () => {
    for (const f of [...APP_PAGES, "src/app/layout.tsx"]) {
      const src = read(f);
      expect(src.includes("viewportFit"), `${f} must not carry viewportFit`).toBe(false);
      expect(src.includes("themeColor"), `${f} must not carry themeColor`).toBe(false);
    }
  });

  it("routeMetadata carries the auth-shell image payload (the seam's decision layer)", () => {
    const src = read("src/lib/metadata.ts");
    expect(src).toContain("authShell");
    // The platform alt string mirrored byte-exactly (the platform-404-body
    // precedent — the observable contract is the string itself).
    expect(src).toContain('"Base44 link preview"');
  });

  it("pageMetadata passes the authShell flag through to routeMetadata", () => {
    const src = read("src/lib/page-metadata.ts");
    expect(src).toContain("authShell");
  });

  it("the root layout's 404-family payload is the URL-only app shape (the live's 404 is app-shell)", () => {
    const src = read("src/app/layout.tsx");
    // The layout's generateMetadata must NOT carry the dimensioned image
    // payload — the live's /nope og:image is URL-only (probed).
    expect(src.includes("width: 1200"), "layout must not carry image dims").toBe(false);
    expect(src.includes("height: 630"), "layout must not carry image dims").toBe(false);
  });

  it("the apple-touch-icon link is emitted through the auth pages' icons payload", () => {
    const seam = read("src/lib/metadata.ts");
    // The auth payload ships the apple icon with the live's sizes attribute
    // (sizes="180x180" — probed on the live's auth shell).
    expect(seam).toMatch(/apple:\s*\[\s*\{\s*url:\s*"\/logo\.png",\s*sizes:\s*"180x180"/);
  });
});
