# Session 12 — Parity pass: the Tailwind v4 shadow-scale pin + the hover-audit methodology

Continuing from session 11 (`c1e07a8` + the pulled `docs/session_19.md`
transcript, remote at `8e6543a`). Sessions 1–11 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph and
component-state parity; this session re-swept every standing surface and
added FOUR fresh-eyes audit surfaces: a **computed box-shadow +
border-radius sweep** (the surface that found this session's drift),
a **hover-state computed-style diff**, a **prefers-reduced-motion probe**
and an **AI-chat streaming probe** — the last two clearing the PAD §10
open items as reference-matched (the live ships neither).

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667)

1 finding → `docs/remediation-plan-session12.md`. Highlights:

1. **The Tailwind v4 shadow-scale shift (High — the FIFTH v4 trap).**
   v4 renamed v3's `shadow-sm` (`0 1px 2px rgb(0 0 0/0.05)`) to
   `shadow-xs` and moved `shadow-sm` up to v3's bare-`shadow` geometry
   (`0 1px 3px/0.1 + 0 1px 2px −1px/0.1`). Every byte-identical
   `shadow-sm` class rendered ONE NOTCH heavier on the clone — most
   visibly the WHITE NAVBAR on every white-nav route (measured
   `rgba(0,0,0,0.05) 0px 1px 2px 0px` on the live vs the shifted
   `0.1/0px 1px 3px` form on the clone), plus 21 usages (LoginForm's
   Sign in + Google-hover, the hero secondary CTA, ContactForm,
   NewsletterForm, AIAssistantChat, CourseCatalog, MyCourses, ui/card,
   ui/select, ui/input, ui/button variants) and every `hover:shadow-sm`
   (the 380-per-course lesson rows). Class diffs are structurally blind
   to it — same classes, different token value. Found by the new computed
   shadow sweep (the live's `0.05 0px 1px 2px` bucket was empty on the
   clone on every route).

**Audit-methodology findings** (documentation): (a) v4 wraps `hover:`
variants in `@media (hover: hover)` — the touch-emulating agent-browser
session matches `:hover` but never applies the hover rules (a false
"hover is broken" reading that cleared instantly in Playwright, whose
Chromium reports `hover: hover` true); (b) v4 renders `translate-y-*` /
`scale-*` through the standalone CSS properties (`translate: 0px -8px`,
`scale: 1.1`) where v3 uses `transform: matrix(...)` — computed-style
assertions must read the right property per stack; (c) Next 16's
dev-origin protection silently blocked the dev chunks for the
`127.0.0.1` origin (an unhydrated page whose forms fell back to native
GET submits — `/login?`); `allowedDevOrigins: ["127.0.0.1"]` restores
both origins (verified: login via 127.0.0.1 hydrates + works).

**Verified matching (no action):** the full hover battery — the featured
card lift (live `matrix(…,−8)` / clone `translate: 0px −8px` + the same
purple 25px/50px/−12px shadow), the image zoom (1.1 both), the hero +
pricing CTA scale (1.05 both + shadow-lg geometry), nav-link hover
(purple-50/purple-600 both), the path card (shadow-2xl purple/0.1 both),
the catalog search focus states; `prefers-reduced-motion` (no rules on
EITHER site); AI-chat streaming (the live's own chat is a one-shot
`Core/InvokeLLM` XHR rendering the complete answer in a single frame at
~2.7s — no progressive render); `rounded-sm` (both sites render 4px —
the reference's own v3 config maps sm to 4px); the CourseDetail price
card + 380 lesson rows like-for-like (identical shadows/radii/hover
borders); and the v4 form variances (oklab strings for alpha-modified
colors, `calc(infinity*1px)` rounded-full, the empty shadow-composition
slots, the 4-property `transition-transform` — all computed-identical).
**Standing surfaces re-verified green:** desktop + mobile height sweeps
(documented bands), the CourseDetail ×9 sweep, class diffs (documented
variances only), the space-y sweep (12 routes), the FULL mobile-menu
battery on both sites (the 404px panel, bare triggers, the 4px pre-CTA
gap, route-close, the `/Home` hero state — no Tailwind v4 display or
breakpoint bug), text diffs (IDENTICAL on /, /Courses, /login, /Pricing).

## Remediation (TDD)

- **RED first**: 6 new e2e specs (the `session-12 parity` block) — the
  white navbar / login Sign in / hero secondary CTA / lesson-row-hover
  computed shadows pinned at the v3 `rgba(0,0,0,0.05) 0px 1px 2px 0px`
  form (v4's empty composition slots stripped parens-aware), plus 2
  GUARD specs proving shadow-lg/2xl were never shifted — 4/6 verified
  failing against the pre-fix build for exactly the pinned reason (one
  spec-side fix during GREEN: the lesson-row read needed a 300ms wait
  for the 150ms `transition-all` to finish).
- **GREEN**: `src/app/globals.css` — the `--shadow-sm:
  0 1px 2px 0 rgb(0 0 0 / 0.05)` token pin in `@theme inline` (the
  ADR-005 palette-pin precedent: one line, zero class changes, fixes all
  21 usages + every hover); `next.config.ts` —
  `allowedDevOrigins: ["127.0.0.1"]` (dev-only hardening).
- Gates: **147/147 e2e** (141 → 147, +6; zero regressions), 31/31 unit.
  Visual re-verification: the computed shadow sweep now shows the
  shadow-sm buckets at parity on every route (only the documented
  oklab/rounded-full form-variance pairs remain); the CourseDetail
  like-for-like sweep clean; the hover battery green; the mobile
  battery + class diffs + heights unchanged (the pin moves no layout).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **147/147 e2e ✓** (141 → 147).

## Ship

- 26 fresh dev-server screenshots in `docs/screenshots/` (12 desktop
  routes, the navbar shadow close-up, the login signin/reset/signup/
  verify/reset-sent views, 5 mobile captures, both open-menu states —
  captured via `127.0.0.1:3000`, exercising the dev-origins fix).
- Docs aligned: README (badge 178), AGENTS (gotchas 30–32 — the
  shadow-scale shift, the hover-audit methodology, the dev-origins
  trap), CLAUDE (pyramid 31+147, the token-pin principle), PAD ([S12]
  revision + §7.1 12+135 + §10 resolved + the reference-matched
  annotations on the reduced-motion/streaming rows), the SKILL doc
  v3.0.0 (the fifth v4 trap + the shadow/radius + hover audit surfaces
  in Appendix A + the 12-session description + test inventory),
  `docs/Tailwind-V4-Validation-Report.md` (the trap-5 project log),
  `docs/remediation-plan-session12.md`, this session log
  (`docs/session_20.md`). `.env.example` re-verified (the session
  changed no environment surface).
