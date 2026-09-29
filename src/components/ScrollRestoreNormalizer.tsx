"use client";

import { useEffect } from "react";

/**
 * ScrollRestoreNormalizer — makes back/forward scroll restoration INSTANT,
 * matching the reference app (session 16; see
 * docs/remediation-plan-session16.md §A finding 1).
 *
 * The reference is a CSR SPA whose router never calls scrollTo — popstate
 * restoration is the BROWSER-NATIVE instant snap (measured: the saved
 * position lands within one frame, on every route and viewport). The clone
 * (Next.js App Router) restores via window.scrollTo AFTER the route
 * re-render commits — and the session-13 universal
 * `* { scroll-behavior: smooth }` pin (the same rule the reference ships)
 * makes that restoration GLIDE for ~0.9-1.5s instead of snapping. On the
 * dev server the animated restore can additionally race to 0 when the
 * navigation click fired mid-smooth-scroll (a footer link clicked while its
 * scroll-into-view animation settles).
 *
 * The fix: while a popstate restoration is in flight, set
 * `data-scroll-restore` on <html> — the scoped globals.css rule
 * `html[data-scroll-restore], html[data-scroll-restore] *` (unlayered, so it
 * beats the @layer-base universal pin) switches scroll-behavior to auto for
 * exactly that window. Next.js issues its restore scrollTo only after the
 * route re-render commits (a React effect — always after every popstate
 * listener, including this one, has run synchronously), so the suppression
 * is guaranteed to be in place before the restore fires. The attribute
 * clears after 700ms (the measured restoration window is <300ms; a repeated
 * popstate re-arms the timer). The universal smooth rule itself is
 * untouched — every other programmatic scroll (nav resets, scrollIntoView,
 * the Radix Select viewport) keeps the reference-pinned smooth behavior.
 */
export function ScrollRestoreNormalizer() {
  useEffect(() => {
    let timer: number | undefined;

    const onPopState = () => {
      document.documentElement.setAttribute("data-scroll-restore", "");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        document.documentElement.removeAttribute("data-scroll-restore");
      }, 700);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
