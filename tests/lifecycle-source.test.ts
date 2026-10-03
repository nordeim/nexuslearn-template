import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 44 — the page-lifecycle source pins (fresh-eyes family B: the
 * tab-discvisibility / Page-Lifecycle census, never probed before s44).
 *
 * The listener census (the s43 registration-instrumentation pattern, run on
 * both sites) found: the LIVE's platform registers pagehide + offline x2 +
 * visibilitychange x2 + online x1 (the Base44 runtime's lifecycle listeners —
 * the platform family, like its 43 platform keyframes + 2 prefers-contrast
 * rules); the CLONE ships ZERO app-level lifecycle listeners — only Next's
 * own pagehide/pageshow framework wiring (node_modules, not app source) +
 * the app's scroll/keydown/popstate registrations (the s43 history family).
 * The synthetic visibilitychange dispatch reacts on NEITHER site; the CDP
 * freeze/resume tier accepts on both but does not pause JS in the headless
 * probe context (a probe-context note, not a site difference).
 *
 * These pins freeze the clone's zero-app-listener posture (the s22
 * zero-storage pin family): any future client code adding a lifecycle-family
 * registration — a visibility-driven carousel, an online/offline banner, a
 * beforeunload guard — must pass through the documentation gate instead of
 * drifting silently. The live's platform listeners never mutate the app DOM
 * (its own telemetry), so the app-visible contract on both sites is:
 * no lifecycle reaction anywhere.
 */

/** The lifecycle-family event set (the s44 census definition). */
const LIFECYCLE_EVENTS = [
  "visibilitychange",
  "freeze",
  "resume",
  "pagehide",
  "pageshow",
  "beforeunload",
  "last-prerendering",
  "online",
  "offline",
] as const;

/** The app-source registration surface (scroll/keydown/popstate — the s43
 * history family + the nav's own listeners; NONE of the lifecycle family). */
const APP_REGISTRATIONS = [
  'addEventListener("scroll"',
  'addEventListener("keydown"',
  'addEventListener("popstate"',
] as const;

const SRC_ROOT = "src";

function listSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      listSources(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const SOURCES = listSources(SRC_ROOT);
const ALL_SOURCE_TEXT = SOURCES.map((f) => ({ file: f, text: readFileSync(f, "utf8") }));

describe("session-44: the page-lifecycle source census", () => {
  it("the app source tree is swept (a non-empty, ts/tsx-only source set)", () => {
    // 72 sources at s44; the floor catches a broken/partial sweep (0 files,
    // a single directory) without pinning the exact count.
    expect(SOURCES.length).toBeGreaterThan(60);
    expect(SOURCES.every((f) => f.startsWith("src/"))).toBe(true);
  });

  it("ZERO lifecycle-family listener registrations anywhere in src/", () => {
    // The pin: the clone ships no app-level lifecycle listeners. The live's
    // platform registers them (its own telemetry — the platform family);
    // the app-visible contract is no reaction on either site.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const evt of LIFECYCLE_EVENTS) {
        const needle = `addEventListener("${evt}"`;
        if (text.includes(needle)) offenders.push(`${file}: ${needle}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the ONLY app-level addEventListener registrations are the nav + history family (scroll/keydown/popstate)", () => {
    // The complete inventory of addEventListener calls in src/: the Navbar's
    // scroll + Escape keydown, and ScrollRestoreNormalizer's popstate (the
    // s43 history family). Any new registration must consciously update
    // this pin — the exact-set assertion discipline (the s33 api-guard
    // precedent).
    const found = new Set<string>();
    for (const { text } of ALL_SOURCE_TEXT) {
      for (const reg of APP_REGISTRATIONS) {
        if (text.includes(reg)) found.add(reg);
      }
      for (const match of text.matchAll(/addEventListener\("([a-z]+)"/g)) {
        found.add(`addEventListener("${match[1]}"`);
      }
    }
    const sorted = [...found].sort();
    expect(sorted).toEqual([...APP_REGISTRATIONS].sort());
  });

  it("no document.wasDiscarded / prerendering lifecycle-state reads in src/", () => {
    // The Page-Lifecycle state surface: neither site reads it (probed:
    // wasDiscarded false + visibilityState visible + prerendering false on
    // both). The pin keeps future code from branching on discard state
    // without the documentation gate.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      if (text.includes("wasDiscarded")) offenders.push(`${file}: wasDiscarded`);
      if (text.includes(".prerendering")) offenders.push(`${file}: prerendering`);
    }
    expect(offenders).toEqual([]);
  });
});
