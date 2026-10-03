import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Session 45 — the Navbar scroll-lock source pins (fresh-eyes family A: the
 * mid-session viewport-orientation-rotation tier, the session_97 suggested
 * direction (a)).
 *
 * THE MD-CROSSING SCROLL-LOCK LEAK (the finding): the mobile menu's body
 * scroll lock was gated ONLY on the React open-state while the panel's
 * visibility is pure CSS (md:hidden) — crossing the md breakpoint with the
 * menu open (a rotation past 768px, a foldable expanding, a window dragged
 * across 768) CSS-hid the panel but left body overflow hidden on a page
 * whose menu was invisible: the page was unscrollable until the user
 * rotated back below md and closed the menu (probed at 700x1000 ->
 * 1000x700: the scrollTo clamped at the pre-cross scroll while the live —
 * which ships no scroll lock at all, its platform family — scrolled
 * freely).
 *
 * THE FIX (the contract these pins freeze): the lock is gated on the SAME
 * md breakpoint the panel uses — a matchMedia query — so the lock applies
 * only below md and releases on the crossing, while the open-STATE
 * machinery is untouched (the menu-state survival across the md round trip
 * is the probed PARITY contract: both sites re-open the panel at 714x405;
 * rotating back re-applies the lock).
 *
 * This file adds the codebase's FIRST matchMedia call (grep-verified zero
 * in src/ before session 45). The pins follow the lifecycle-source
 * source-sweep precedent: they read the component source verbatim so a
 * future refactor that drops the gate gets flagged instead of silently
 * re-leaking.
 */
const NAVBAR_SOURCE = readFileSync("src/components/Navbar.tsx", "utf8");

describe("session-45: the Navbar md-gated scroll lock (the rotation-leak fix)", () => {
  it("the scroll-lock effect queries the md breakpoint via matchMedia", () => {
    // The query string matches the panel's own md:hidden breakpoint
    // (Tailwind v4 md = 768px).
    expect(NAVBAR_SOURCE).toContain('window.matchMedia("(min-width: 768px)")');
  });

  it("the overflow assignment is conditional on BOTH open AND below-md", () => {
    // The lock's condition: open && !mq.matches — the lock releases at
    // >=md even while the React open-state survives (the parity contract).
    expect(NAVBAR_SOURCE).toMatch(
      /document\.body\.style\.overflow\s*=\s*open\s*&&\s*!mq\.matches\s*\?\s*"hidden"\s*:\s*""/
    );
  });

  it("the query's change listener re-applies the lock on the crossing", () => {
    // The crossing itself (no `open` change) must release/re-apply the
    // lock — the matchMedia change event is wired.
    expect(NAVBAR_SOURCE).toContain('mq.addEventListener("change"');
  });

  it("the cleanup removes the listener and restores the overflow", () => {
    expect(NAVBAR_SOURCE).toContain('mq.removeEventListener("change"');
    // The unmount path clears the inline overflow (the s22 listener
    // discipline — no leaked listeners, no leaked styles).
    expect(NAVBAR_SOURCE).toMatch(
      /mq\.removeEventListener\("change"[\s\S]*?document\.body\.style\.overflow\s*=\s*""/
    );
  });
});
