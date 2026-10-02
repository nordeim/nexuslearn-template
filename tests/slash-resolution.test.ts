import { describe, expect, it } from "vitest";

import {
  CONTENT_ROUTES,
  EXACT_MATCH_ROUTES,
  resolveSlashPath,
} from "@/lib/slash-resolution";

/**
 * Session 40 — fresh-eyes family A: the trailing-slash resolution tier.
 * The live resolves single-trailing-slash paths through a THREE-tier
 * contract (probed shape-by-shape on the live):
 *
 *  (a) content routes RENDER at the typed slashed URL — /Courses/,
 *      /courses/ (case+slash), /CourseDetail/?id=… all render 200 with the
 *      URL bar preserved and the clean head family;
 *  (b) exact-match routes (/login, /reset-password) + trailing slash → the
 *      platform 404 with the DERIVED head (title "Login | NexusLearn",
 *      canonical /login — the s38 derivation through the raw slashed path);
 *  (c) unknown paths + trailing slash → the same platform-404 family.
 *
 * The clone's resolution (this seam): exact-case content routes canonicalize
 * via the s24 308; case-variant content routes render at the typed URL (the
 * s17 rewrite); exact-match routes force the in-app 404 view (the platform
 * tier's in-app equivalent); unknown slash shapes pass to the router's
 * natural 404 (the head derivations already handle them).
 *
 * The pre-proxy framework-normalization family (leading // and multi-slash
 * shapes) never reaches this seam — the documented deliberate variance
 * (docs/remediation-plan-session40.md finding 2).
 */

describe("slash-resolution: the pass action (no trailing slash — the s17 path)", () => {
  it("clean canonical routes pass through untouched", () => {
    for (const route of CONTENT_ROUTES) {
      expect(resolveSlashPath(route, "")).toEqual({ action: "pass" });
    }
  });

  it("the root path is not a slash variant", () => {
    expect(resolveSlashPath("/", "")).toEqual({ action: "pass" });
  });

  it("case variants without a slash pass (the s17 case-rewrite owns them)", () => {
    expect(resolveSlashPath("/courses", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/cOurSes", "")).toEqual({ action: "pass" });
  });

  it("unknown paths without a slash pass (the router's natural 404)", () => {
    expect(resolveSlashPath("/nope", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/login", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/reset-password", "")).toEqual({ action: "pass" });
  });
});

describe("slash-resolution: the redirect action (exact-case content route + slash — the s24 pin)", () => {
  it("/Courses/ 308-redirects to the bare canonical (the s24 pin's exact value)", () => {
    expect(resolveSlashPath("/Courses/", "")).toEqual({
      action: "redirect",
      location: "/Courses",
    });
  });

  it("every exact-case content route canonicalizes the same way", () => {
    for (const route of CONTENT_ROUTES) {
      expect(resolveSlashPath(`${route}/`, "")).toEqual({
        action: "redirect",
        location: route,
      });
    }
  });

  it("the RAW search rides along on the redirect location (Next's own behavior)", () => {
    expect(resolveSlashPath("/Courses/", "?x=1")).toEqual({
      action: "redirect",
      location: "/Courses?x=1",
    });
    expect(resolveSlashPath("/CourseDetail/", "?id=seed-1&extra=2")).toEqual({
      action: "redirect",
      location: "/CourseDetail?id=seed-1&extra=2",
    });
  });
});

describe("slash-resolution: the rewrite action (case-variant content route + slash — the s17 render contract)", () => {
  it("/courses/ renders at the typed URL (the rewrite targets the canonical)", () => {
    expect(resolveSlashPath("/courses/", "")).toEqual({
      action: "rewrite",
      path: "/Courses",
    });
  });

  it("/COURSES/ and /cOurSes/ rewrite to the canonical route", () => {
    expect(resolveSlashPath("/COURSES/", "")).toEqual({
      action: "rewrite",
      path: "/Courses",
    });
    expect(resolveSlashPath("/cOurSes/", "")).toEqual({
      action: "rewrite",
      path: "/Courses",
    });
  });

  it("/courseDetail/ rewrites to /CourseDetail (the case+slash composite)", () => {
    expect(resolveSlashPath("/courseDetail/", "")).toEqual({
      action: "rewrite",
      path: "/CourseDetail",
    });
  });
});

describe("slash-resolution: the not-found action (exact-match routes + slash — the platform tier)", () => {
  it("/login/ forces the 404 view (the live's platform-404 family)", () => {
    expect(resolveSlashPath("/login/", "")).toEqual({ action: "not-found" });
  });

  it("/reset-password/ forces the 404 view (same platform tier, probed)", () => {
    expect(resolveSlashPath("/reset-password/", "")).toEqual({ action: "not-found" });
  });

  it("the exact-match list is case-SENSITIVE (the s17 convention)", () => {
    // /Login/ is NOT the exact /login — it falls to the router's natural 404
    // (whose derived head "Login | NexusLearn" matches the live anyway).
    expect(resolveSlashPath("/Login/", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/Reset-Password/", "")).toEqual({ action: "pass" });
    expect(EXACT_MATCH_ROUTES).toEqual(["/login", "/reset-password"]);
  });
});

describe("slash-resolution: the unknown slash shapes (the router's natural 404)", () => {
  it("unknown paths with a slash pass through (the head derivations handle them)", () => {
    expect(resolveSlashPath("/nope/", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/xyz/", "")).toEqual({ action: "pass" });
    expect(resolveSlashPath("/Courses/deeper/", "")).toEqual({ action: "pass" });
  });

  it("the boundary shapes: the root and the pre-proxy forms", () => {
    // "//" and "///" never reach the seam in practice (pre-proxy
    // normalization) — the seam still resolves them deterministically.
    // "//" (all slashes) strips to the ROOT: no route match of any tier →
    // pass (the router's natural 404 — the s38 derivations handle it).
    expect(resolveSlashPath("//", "")).toEqual({ action: "pass" });
    // "/Courses//" (multi-trailing-slash) strips to the exact content route:
    // the seam treats it identically to the single-slash shape (the s24
    // canonicalization) — dead-code determinism today (pre-proxy
    // normalization owns the shape), the consistent choice if the framework
    // ever hands it over.
    expect(resolveSlashPath("/Courses//", "")).toEqual({
      action: "redirect",
      location: "/Courses",
    });
  });
});
