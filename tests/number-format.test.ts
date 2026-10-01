import { describe, expect, it } from "vitest";

import { pickLocale } from "@/lib/number-format";

/**
 * Session 29 (finding 1): the Accept-Language parser behind the SSR locale
 * surface. The live reference (a CSR SPA) formats every student count with
 * the BROWSER locale (de-DE -> 12.450, fr-FR -> 12\u202f450); the clone's
 * server-rendered count rows derive the visitor's locale from the
 * Accept-Language request header — the only locale signal that exists at
 * render time. pickLocale() must implement the browser q-weight semantics
 * and fall back to en-US (the deterministic default every existing e2e
 * expectation is pinned to: Playwright's default context sends NO
 * Accept-Language header at all).
 */
describe("pickLocale (the Accept-Language parser — session 29)", () => {
  it("falls back to en-US for null/undefined/empty input", () => {
    expect(pickLocale(null)).toBe("en-US");
    expect(pickLocale(undefined)).toBe("en-US");
    expect(pickLocale("")).toBe("en-US");
  });

  it("passes a single well-formed tag through", () => {
    expect(pickLocale("de-DE")).toBe("de-DE");
    expect(pickLocale("fr-FR")).toBe("fr-FR");
    expect(pickLocale("en-US")).toBe("en-US");
  });

  it("keeps first-listed order for a full Chrome header (equal q weights)", () => {
    // Chrome's real shape: the preferred locale first, all q=1 unless stated.
    expect(pickLocale("de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("de-DE");
    expect(pickLocale("fr-FR,fr;q=0.9,en-US;q=0.8")).toBe("fr-FR");
  });

  it("orders by q weight when the weights decide", () => {
    expect(pickLocale("de;q=0.5,fr-FR;q=0.9")).toBe("fr-FR");
    expect(pickLocale("de;q=0.9,fr-FR;q=0.5")).toBe("de");
    expect(pickLocale("en-US;q=0.4,de-DE;q=0.6,fr;q=0.2")).toBe("de-DE");
  });

  it("skips q=0 (explicitly unacceptable), the * wildcard, and malformed tokens", () => {
    expect(pickLocale("de;q=0,en-US")).toBe("en-US");
    expect(pickLocale("*,en-US;q=0.3")).toBe("en-US");
    expect(pickLocale(";;,@@@,en-GB")).toBe("en-GB");
    expect(pickLocale("*")).toBe("en-US");
    expect(pickLocale("garbage-header-without-tags")).toBe("en-US");
  });

  it("canonicalizes case: language lowercase, region uppercase", () => {
    expect(pickLocale("DE-de")).toBe("de-DE");
    expect(pickLocale("EN-us")).toBe("en-US");
    expect(pickLocale("de-DE")).toBe("de-DE");
  });

  it("passes regionless tags through (the Intl format is identical)", () => {
    // de formats 12450 exactly like de-DE; the parser must not invent a region.
    expect(pickLocale("de")).toBe("de");
    expect(pickLocale("fr;q=0.9,en;q=0.8")).toBe("fr");
  });
});
