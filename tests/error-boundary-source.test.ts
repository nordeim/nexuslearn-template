import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 42 — the explicit error-boundary source pins (fresh-eyes family B:
 * the crash census). The clone shipped NO error.tsx — a persistent client
 * render error showed Next 16's built-in default boundary ("This page
 * couldn't load" — version-dependent framework chrome; the Next 16 default
 * already silently replaced the old "Application error" string). The live's
 * forced-crash UX is a BLANK WHITE SCREEN (no boundary, no recovery — the
 * platform ships no visible crash UX). The explicit src/app/error.tsx is the
 * deliberate-better tier (the s10 real-404 precedent): an on-brand boundary
 * ("Something went wrong" + Try again + Back to Home) whose contract is
 * stable across framework upgrades and pinnable. The pins freeze the
 * STRUCTURE: the client directive, the { error, reset } contract, the reset
 * wiring, the home link, and the no-count-formatting guarantee (the boundary
 * must render under the toLocaleString sabotage the e2e uses to force the
 * error — CourseCard.tsx's students.toLocaleString(locale) is the injection
 * point).
 */
const read = (f: string) => readFileSync(f, "utf8");

const ERROR_PAGE = "src/app/error.tsx";

describe("error-boundary — the explicit crash surface (session 42)", () => {
  it("the file exists at the app-root segment (catches every route below the root layout)", () => {
    const src = read(ERROR_PAGE);
    expect(src.length).toBeGreaterThan(0);
  });

  it("is a client component (Next error boundaries receive reset — a client-only prop)", () => {
    const src = read(ERROR_PAGE);
    expect(src.startsWith('"use client"') || src.startsWith("'use client'")).toBe(true);
  });

  it("default-exports the boundary component", () => {
    const src = read(ERROR_PAGE);
    expect(src).toMatch(/export\s+default\s+function\s+\w+\s*\(/);
  });

  it("accepts the Next error-boundary prop shape ({ error, reset })", () => {
    const src = read(ERROR_PAGE);
    expect(src).toMatch(/\{\s*error\s*,\s*reset\s*,?\s*\}|\{\s*reset\s*,\s*error\s*,?\s*\}/);
  });

  it("renders the Something went wrong heading + the recovery copy", () => {
    const src = read(ERROR_PAGE);
    expect(src).toContain("Something went wrong");
    expect(src).toMatch(/Try again|try again/);
  });

  it("wires the Try again button to reset (the segment re-render)", () => {
    const src = read(ERROR_PAGE);
    expect(src).toMatch(/onClick=\{\s*\(\s*\)\s*=>\s*reset\(\s*\)\s*\}/);
  });

  it("ships the Back to Home link targeting / (the second recovery path)", () => {
    const src = read(ERROR_PAGE);
    expect(src).toMatch(/href=["']\/["']/);
    expect(src).toMatch(/Back to Home/);
  });

  it("uses the not-found design language (light slate-50, centered, min-h-dvh)", () => {
    const src = read(ERROR_PAGE);
    expect(src).toContain("bg-slate-50");
    expect(src).toContain("min-h-dvh");
    expect(src).toMatch(/max-w-md/);
  });

  it("renders NO count formatting (the boundary survives the toLocaleString sabotage)", () => {
    const src = read(ERROR_PAGE);
    expect(src.includes("toLocaleString")).toBe(false);
    expect(src.includes("NumberFormat")).toBe(false);
  });

  it("replaces the framework default (NOT the Next 16 shipped copy)", () => {
    const src = read(ERROR_PAGE);
    // The Next 16 default boundary's copy must not leak into ours — the
    // boundary is the app's OWN surface now.
    expect(src.includes("This page couldn't load")).toBe(false);
    expect(src.includes("Application error")).toBe(false);
  });
});
