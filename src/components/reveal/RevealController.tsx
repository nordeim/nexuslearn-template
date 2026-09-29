"use client";

import { useEffect } from "react";

/**
 * RevealController — replicates the reference app's scroll-reveal system
 * (session 15; see docs/remediation-plan-session15.md §A finding 2).
 *
 * The live app (Base44 + framer-motion) pre-hides 103 reveal targets across
 * 9 routes with inline `opacity: 0; transform: translate…` styles at mount,
 * reveals each element ONCE when it scrolls into view (any-pixel
 * intersection, ~10-36ms intrinsic latency, sibling cards staggered ~100ms),
 * and leaves inline `opacity: 1; transform: none;` FOREVER — the same
 * mechanism session 14 proved permanently kills the popular pricing card's
 * `scale-105`. The clone ships the pre-hide state in the SSR markup (the
 * first paint matches the live, which never shows below-fold content either)
 * and this controller normalizes the style serialization to the live's exact
 * form, then reveals through the Web Animations API — zero dependencies, the
 * library is an implementation detail, not a rendered surface.
 *
 * Families (frame-resolution curve fits from the live):
 *   a       "snappy"  — opacity ~310ms ease-out + transform spring
 *                      (zeta=0.561, wn=27.1: settle ~280ms, 12% overshoot)
 *   b       "floaty"  — the same opacity tween + a slow back-loaded
 *                      transform ease ~728ms (no overshoot)
 *   hero    the / + /Home hero blocks — a coupled ~770ms ease-out from y=30
 *   hero-op the / hero stats bar — opacity-only, the hero timing
 *   x-30/x30 the ±30px sliders — the opacity tween + a stiffer transform
 *           spring (~260ms settle, ~12% overshoot)
 *   faq     the /Pricing FAQ items — a slower coupled pair (~610/~560ms
 *           from y=10)
 *
 * Mount behavior: elements in the initial viewport reveal at mount through
 * the same IntersectionObserver (threshold 0 — any pixel, like the live —
 * verified on every route incl. /About, whose below-fold values cards stay
 * hidden until scrolled, exactly like the live). Elements jumped PAST by an
 * instant scroll never intersect and stay hidden (IO semantics — measured on
 * the live). Newly-mounted targets (the /Courses catalog re-rendering on
 * search/filter — measured live) are picked up by a MutationObserver and
 * re-reveal exactly like the live's remount.
 */

type Family = "a" | "b" | "hero" | "hero-op" | "x-30" | "x30" | "faq";

const STAGGER_MS = 100;

/** The live's exact pre-hide style strings (measured). */
const PRE_HIDE: Record<Family, string> = {
  a: "opacity: 0; transform: translateY(20px);",
  b: "opacity: 0; transform: translateY(20px);",
  hero: "opacity: 0; transform: translateY(30px);",
  "hero-op": "opacity: 0;",
  "x-30": "opacity: 0; transform: translateX(-30px);",
  x30: "opacity: 0; transform: translateX(30px);",
  faq: "opacity: 0; transform: translateY(10px);",
};

/** The live's exact end-state style strings (measured). */
const END_STYLE: Record<Family, string> = {
  a: "opacity: 1; transform: none;",
  b: "opacity: 1; transform: none;",
  hero: "opacity: 1; transform: none;",
  "hero-op": "opacity: 1;",
  "x-30": "opacity: 1; transform: none;",
  x30: "opacity: 1; transform: none;",
  faq: "opacity: 1; transform: none;",
};

/** The universal opacity tween (~310ms, sampled from the live's curve). */
const OP_KEYFRAMES = [
  { offset: 0, opacity: 0 },
  { offset: 0.16, opacity: 0.25 },
  { offset: 0.32, opacity: 0.56 },
  { offset: 0.48, opacity: 0.79 },
  { offset: 0.65, opacity: 0.92 },
  { offset: 0.81, opacity: 0.99 },
  { offset: 1, opacity: 1 },
];

/** The hero's slower opacity curve (the coupled ~770ms timeline's op track). */
const OP_HERO_KEYFRAMES = [
  { offset: 0, opacity: 0 },
  { offset: 0.04, opacity: 0.16 },
  { offset: 0.38, opacity: 0.58 },
  { offset: 0.6, opacity: 0.82 },
  { offset: 0.82, opacity: 0.96 },
  { offset: 1, opacity: 1 },
];

/** Family A transform — damped spring from translateY(20px):
 *  zeta=0.561, wn=27.1 rad/s (overshoot -2.38px at ~140ms, settle ~320ms). */
const A_TRANSFORM = [
  { offset: 0, transform: "translateY(20px)" },
  { offset: 0.0625, transform: "translateY(17.63px)" },
  { offset: 0.125, transform: "translateY(12.56px)" },
  { offset: 0.1875, transform: "translateY(7.1px)" },
  { offset: 0.25, transform: "translateY(2.6px)" },
  { offset: 0.3125, transform: "translateY(-0.41px)" },
  { offset: 0.375, transform: "translateY(-1.96px)" },
  { offset: 0.4375, transform: "translateY(-2.38px)" },
  { offset: 0.5, transform: "translateY(-2.1px)" },
  { offset: 0.5625, transform: "translateY(-1.5px)" },
  { offset: 0.625, transform: "translateY(-0.85px)" },
  { offset: 0.6875, transform: "translateY(-0.31px)" },
  { offset: 0.75, transform: "translateY(0.05px)" },
  { offset: 0.8125, transform: "translateY(0.23px)" },
  { offset: 0.875, transform: "translateY(0.28px)" },
  { offset: 0.9375, transform: "translateY(0.25px)" },
  { offset: 1, transform: "translateY(0px)" },
];

/** X-family transform — stiffer spring from translateX(±30px):
 *  zeta=0.55, wn=32 rad/s (overshoot ~-3.8px, settle ~260ms). */
const X_TRANSFORM_POS = [
  { offset: 0, transform: "translateX(30px)" },
  { offset: 0.0769, transform: "translateX(25.23px)" },
  { offset: 0.1538, transform: "translateX(15.7px)" },
  { offset: 0.2308, transform: "translateX(6.53px)" },
  { offset: 0.3077, transform: "translateX(0.13px)" },
  { offset: 0.3846, transform: "translateX(-3.07px)" },
  { offset: 0.4615, transform: "translateX(-3.78px)" },
  { offset: 0.5385, transform: "translateX(-3.06px)" },
  { offset: 0.6154, transform: "translateX(-1.83px)" },
  { offset: 0.6923, transform: "translateX(-0.7px)" },
  { offset: 0.7692, transform: "translateX(0.05px)" },
  { offset: 0.8462, transform: "translateX(0.41px)" },
  { offset: 0.9231, transform: "translateX(0.47px)" },
  { offset: 1, transform: "translateX(0px)" },
];
const X_TRANSFORM_NEG = X_TRANSFORM_POS.map((k) => {
  const m = (k.transform as string).match(/^translateX\((-?)([\d.]+)px\)$/);
  const value = m ? (m[2] === "0" ? "0px" : `${m[1] ? "" : "-"}${m[2]}px`) : k.transform;
  return { offset: k.offset, transform: `translateX(${value})` };
});

/** FAQ transform — the A spring softened (wn=15.2) from translateY(10px). */
const FAQ_TRANSFORM = [
  { offset: 0, transform: "translateY(10px)" },
  { offset: 0.0714, transform: "translateY(8.55px)" },
  { offset: 0.1429, transform: "translateY(5.6px)" },
  { offset: 0.2143, transform: "translateY(2.65px)" },
  { offset: 0.2857, transform: "translateY(0.47px)" },
  { offset: 0.3571, transform: "translateY(-0.75px)" },
  { offset: 0.4286, transform: "translateY(-1.18px)" },
  { offset: 0.5, transform: "translateY(-1.08px)" },
  { offset: 0.5714, transform: "translateY(-0.76px)" },
  { offset: 0.6429, transform: "translateY(-0.39px)" },
  { offset: 0.7143, transform: "translateY(-0.11px)" },
  { offset: 0.7857, transform: "translateY(0.06px)" },
  { offset: 0.8571, transform: "translateY(0.13px)" },
  { offset: 0.9286, transform: "translateY(0.14px)" },
  { offset: 1, transform: "translateY(0px)" },
];

/** Family B transform — the live's measured slow back-loaded ease (~728ms). */
const B_TRANSFORM = [
  { offset: 0, transform: "translateY(20px)" },
  { offset: 0.1, transform: "translateY(19.9px)" },
  { offset: 0.41, transform: "translateY(19.4px)" },
  { offset: 0.48, transform: "translateY(18.8px)" },
  { offset: 0.55, transform: "translateY(16.7px)" },
  { offset: 0.62, transform: "translateY(12.2px)" },
  { offset: 0.69, transform: "translateY(7.4px)" },
  { offset: 0.76, transform: "translateY(4.3px)" },
  { offset: 0.82, transform: "translateY(2.4px)" },
  { offset: 0.89, transform: "translateY(1.2px)" },
  { offset: 0.96, transform: "translateY(0.5px)" },
  { offset: 1, transform: "translateY(0px)" },
];

/** The / hero — one coupled timeline (opacity + y=30 together, ~770ms). */
const HERO_KEYFRAMES = [
  { offset: 0, opacity: 0, transform: "translateY(30px)" },
  { offset: 0.04, opacity: 0.16, transform: "translateY(27.5px)" },
  { offset: 0.38, opacity: 0.58, transform: "translateY(14.5px)" },
  { offset: 0.6, opacity: 0.82, transform: "translateY(6.1px)" },
  { offset: 0.82, opacity: 0.96, transform: "translateY(1.5px)" },
  { offset: 1, opacity: 1, transform: "translateY(0px)" },
];

function transformTable(family: Family) {
  switch (family) {
    case "a":
      return { keyframes: A_TRANSFORM, duration: 320 };
    case "b":
      return { keyframes: B_TRANSFORM, duration: 728 };
    case "x-30":
      return { keyframes: X_TRANSFORM_NEG, duration: 260 };
    case "x30":
      return { keyframes: X_TRANSFORM_POS, duration: 260 };
    case "faq":
      return { keyframes: FAQ_TRANSFORM, duration: 560 };
    default:
      return null;
  }
}

function reveal(el: HTMLElement) {
  const family = (el.dataset.reveal || "a") as Family;
  // Normalize the pre-hide serialization (React SSRs `opacity:0;…` — the
  // live's exact form has the spaces and the trailing semicolon).
  el.setAttribute("style", PRE_HIDE[family] ?? PRE_HIDE.a);

  const anims: Animation[] = [];
  if (family === "hero") {
    anims.push(el.animate(HERO_KEYFRAMES, { duration: 770, fill: "forwards" }));
  } else if (family === "hero-op") {
    anims.push(el.animate(OP_HERO_KEYFRAMES, { duration: 770, fill: "forwards" }));
  } else {
    anims.push(el.animate(OP_KEYFRAMES, { duration: family === "faq" ? 610 : 310, fill: "forwards" }));
    const tr = transformTable(family);
    if (tr) anims.push(el.animate(tr.keyframes, { duration: tr.duration, fill: "forwards" }));
  }

  Promise.all(anims.map((a) => a.finished))
    .then(() => {
      // The live's one-way inline end state — byte-identical serialization.
      el.setAttribute("style", END_STYLE[family] ?? END_STYLE.a);
      anims.forEach((a) => a.cancel());
    })
    .catch(() => {
      /* an interrupted animation (e.g. unmount) — nothing to restore */
    });
}

function staggerDelay(el: HTMLElement): number {
  const parent = el.parentElement;
  if (!parent) return 0;
  const sibs = Array.from(parent.children).filter(
    (c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute("data-reveal")
  );
  const idx = sibs.indexOf(el);
  return Math.max(0, idx) * STAGGER_MS;
}

export function RevealController() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          const delay = staggerDelay(el);
          if (delay > 0) window.setTimeout(() => reveal(el), delay);
          else reveal(el);
        }
      },
      { threshold: 0 }
    );

    const register = (el: HTMLElement) => {
      const family = (el.dataset.reveal || "a") as Family;
      // Already revealed (e.g. a StrictMode re-run) — never re-hide.
      if (el.getAttribute("style") === (END_STYLE[family] ?? END_STYLE.a)) return;
      el.setAttribute("style", PRE_HIDE[family] ?? PRE_HIDE.a);
      io.observe(el);
    };

    document.querySelectorAll<HTMLElement>("[data-reveal]").forEach(register);

    // The /Courses catalog re-renders its cards on search/filter — newly
    // mounted targets re-reveal exactly like the live's remount (measured).
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (!(n instanceof HTMLElement)) continue;
          if (n.hasAttribute("data-reveal")) register(n);
          n.querySelectorAll<HTMLElement>("[data-reveal]").forEach(register);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
