import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 47 — the platform-surface source pins (fresh-eyes families A/B/C:
 * the new CSS media tiers, the Web-Share census, the idle-tier census —
 * the session_104 suggested directions, all three probed parity-clean on
 * both sites).
 *
 * The censuses (run on BOTH sites, all 9 app routes signed in + the two
 * auth routes signed out, layer-aware CSSOM walking):
 *
 * - THE NEW MEDIA TIERS: zero prefers-contrast + zero
 *   prefers-reduced-transparency rules on EITHER site's app routes, and
 *   emulating either tier (plus both at once) changes NOTHING on either
 *   site — no heights, no computed styles (the s22 no-adaptation contract
 *   extended to the two newer media features). The LIVE's AUTH routes
 *   carry platform-sheet rules the clone does not: 2 prefers-contrast
 *   rules that are the GOOGLE IDENTITY SERVICES button chrome (the
 *   injected googleidentityservice_button_styles sheet — s43 counted
 *   them, s47 identified the owner) + 8 prefers-reduced-motion rules
 *   (the auth-shell bundle's motion-safe/motion-reduce view-transition
 *   and toast utilities) — ALL INERT (the render tier is byte-identical
 *   under contrast:more and reduced-motion:reduce; the platform-chrome
 *   documentation family, like the s43 43-keyframes + the s46 message
 *   listener).
 *
 * - THE CENSUS-METHODOLOGY CORRECTION: the s43 media-census walker never
 *   recursed into @layer blocks, so it only saw UNLAYERED rules — and
 *   Tailwind v4 emits ALL utilities inside @layer. The layer-aware walk
 *   finds the clone ships 1 forced-colors rule per route: Tailwind v4's
 *   own .outline-hidden accessibility helper (a transparent outline —
 *   renders nothing; select.tsx's shadcn class has carried outline-hidden
 *   since commit 1; Tailwind v3 has no such utility, so the live ships 0).
 *   The s43 NUMBERS were the under-count; the s43 RENDER conclusion
 *   (forced-colors = the UA forced palette, unchanged layout) re-verified
 *   correct.
 *
 * - THE WEB-SHARE CENSUS: the ZERO-share surface on BOTH sites — the API
 *   absent in the shared context, zero instrumented calls, zero
 *   share-labeled UI, no share_target in either manifest.
 *
 * - THE IDLE CENSUS: the ZERO-idle surface on BOTH sites — the APIs exist
 *   in the shared context (requestIdleCallback, IdleDetector) but zero
 *   registrations fire anywhere (instrumented, 3s settle).
 *
 * These pins freeze the clone's zero-stance posture at the SOURCE tier
 * (the s44 lifecycle pattern): any future client code adding a Web-Share
 * button, an idle-scheduled task, or a prefers-* adaptation must pass
 * through the documentation gate instead of drifting silently.
 */

const SRC_ROOT = "src";

function listSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      listSources(full, acc);
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const SOURCES = listSources(SRC_ROOT);
const ALL_SOURCE_TEXT = SOURCES.map((f) => ({ file: f, text: readFileSync(f, "utf8") }));

/** The Web-Share API surface (the s47 family B census definition). */
const WEB_SHARE_APIS = [
  "navigator.share",
  "navigator.canShare",
  "share_target",
] as const;

/** The idle-API surface (the s47 family C census definition). */
const IDLE_APIS = [
  "requestIdleCallback",
  "cancelIdleCallback",
  "IdleDetector",
] as const;

/** The prefers-* media families (the s47 family A census definition — the
 * two NEW tiers + the s41/s43 no-adaptation contracts they extend). */
const PREFERS_FAMILIES = [
  "prefers-contrast",
  "prefers-reduced-transparency",
  "prefers-reduced-motion",
  "prefers-color-scheme",
] as const;

describe("session-47: the platform-surface source census", () => {
  it("the app source tree is swept (a non-empty, ts/tsx/css-only source set)", () => {
    // 70+ sources at s47 (ts/tsx + globals.css); the floor catches a
    // broken/partial sweep without pinning the exact count.
    expect(SOURCES.length).toBeGreaterThan(60);
    expect(SOURCES.every((f) => f.startsWith("src/"))).toBe(true);
  });

  it("ZERO Web-Share API references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no share surface — no navigator.share call,
    // no canShare probe, no PWA share_target registration. The live ships
    // none either (the probed parity); neither site exposes a share button,
    // a share handler, or a manifest share target.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEB_SHARE_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO idle-API references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone schedules no idle work — no requestIdleCallback
    // registration, no IdleDetector usage (the APIs exist in the context
    // on both sites; neither site's code touches them). The only "idle"
    // strings in src/ are the form status-machine literals.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of IDLE_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO prefers-* media families anywhere in src/ (the family A no-adaptation contract)", () => {
    // The pin: the clone adapts to NO media-preference tier — not the two
    // NEW features (prefers-contrast, prefers-reduced-transparency — this
    // session's census: zero rules + no render adaptation on either site),
    // not prefers-reduced-motion (the s41 no-adaptation contract: both
    // sites animate their scroll-reveal under reduce), not
    // prefers-color-scheme (the s43 zinc contract, extended here from
    // globals.css-only to the whole source tree). The live's only rules in
    // these families are its platform chrome (the auth-shell GIS +
    // motion-safe sheets) — all inert.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const fam of PREFERS_FAMILIES) {
        if (text.includes(fam)) offenders.push(`${file}: ${fam}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
