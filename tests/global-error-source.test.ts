import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 43 — the global-error boundary source pins (fresh-eyes family A:
 * the root-crash census). The clone shipped error.tsx (the s42 page-segment
 * boundary) but NO global-error.tsx — a client error in the ROOT segment
 * (the root layout's client tree: the scroll normalizer's effect + the
 * router's own components) escaped every error.tsx boundary and landed in
 * Next 16's built-in root boundary: "This page couldn't load" chrome that
 * ALSO strips the replacement document (an <html> carrying only an id — no
 * document language, no design classes; probed on the production build via
 * the scoped history-listener sabotage). The live's equivalent tier ships
 * NO recovery UI at all (its SPA freezes blank/shell — probed).
 *
 * src/app/global-error.tsx is the deliberate-better root tier (the s42
 * error.tsx precedent, one segment up): the same slate-50 design language,
 * wrapped in the root layout's exact document shape so the crash-time
 * contract keeps the document language + the font classes. The pins freeze
 * the STRUCTURE: the client directive, the { error, reset } contract, the
 * own-<html>/<body> rendering (the root-tier requirement — the boundary
 * REPLACES the root layout), the lang preservation, the reset wiring, the
 * plain-anchor home link (no router dependency at the crashed-root tier), and
 * the sabotage-survival guarantees (no count formatting, no history-listener
 * registration, no framework default copy).
 */
const read = (f: string) => readFileSync(f, "utf8");

const GLOBAL_ERROR_PAGE = "src/app/global-error.tsx";

describe("global-error — the explicit root-crash surface (session 43)", () => {
  it("the file exists at the app root (the root-layout crash tier)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src.length).toBeGreaterThan(0);
  });

  it("is a client component (root boundaries receive reset — a client-only prop)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src.startsWith('"use client"') || src.startsWith("'use client'")).toBe(true);
  });

  it("default-exports the boundary component", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/export\s+default\s+function\s+\w+\s*\(/);
  });

  it("accepts the Next error-boundary prop shape ({ error, reset })", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/\{\s*error\s*,\s*reset\s*,?\s*\}|\{\s*reset\s*,\s*error\s*,?\s*\}/);
  });

  it("renders its own <html> + <body> (the root-tier requirement — the boundary replaces the root layout)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/<html[\s>]/);
    expect(src).toMatch(/<body[\s>]/);
  });

  it("preserves the document language through the crash (lang=\"en\" — the probed default STRIPS it)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/<html[^>]*lang="en"/);
  });

  it("keeps the root layout's document shape (the scroll-behavior declaration + the font classes)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/data-scroll-behavior="smooth"/);
    expect(src).toMatch(/<body[^>]*font-sans/);
    expect(src).toMatch(/antialiased/);
  });

  it("renders the Something went wrong heading + the recovery copy", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toContain("Something went wrong");
    expect(src).toMatch(/Try again|try again/);
  });

  it("wires the Try again button to reset (the root re-render)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/onClick=\{\s*\(\s*\)\s*=>\s*reset\(\s*\)\s*\}/);
  });

  it("ships the Back to Home link as a PLAIN anchor (no router dependency at the crashed-root tier)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toMatch(/href=["']\/["']/);
    expect(src).toContain("Back to Home");
    expect(src.includes('from "next/link"')).toBe(false);
    expect(src.includes("from 'next/link'")).toBe(false);
  });

  it("uses the not-found design language (light slate-50, centered, min-h-dvh)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src).toContain("bg-slate-50");
    expect(src).toContain("min-h-dvh");
    expect(src).toMatch(/max-w-md/);
  });

  it("renders NO count formatting (the boundary survives the count-format sabotage family)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src.includes("toLocaleString")).toBe(false);
    expect(src.includes("NumberFormat")).toBe(false);
  });

  it("registers NO history-event listeners (the boundary survives the root-tier sabotage that forced the crash)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    // No listener registration anywhere in the file — and no mention of the
    // history event either (the doc-comment hazard rule: comments avoid the
    // literal strings the pins match).
    expect(src.includes("addEventListener")).toBe(false);
    expect(src.includes("popstate")).toBe(false);
  });

  it("replaces the framework default (NOT the Next 16 shipped copy — which also strips the document)", () => {
    const src = read(GLOBAL_ERROR_PAGE);
    expect(src.includes("This page couldn't load")).toBe(false);
    expect(src.includes("This page couldn’t load")).toBe(false);
    expect(src.includes("Application error")).toBe(false);
  });
});
