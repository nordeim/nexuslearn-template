# Session 14 — Parity pass: the rendered font + FIVE more v4 traps + the skills CSS leak

Continuing from session 13 (`639b081` + the pulled `docs/session_23.md`
transcript, remote at `e0398ba`). Sessions 1–13 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state, computed-shadow, focus-ring, scroll and card-structure
parity; this session re-swept every standing surface and added THREE
fresh-eyes audit surfaces (both suggested by the session-13 transcript):
the **print stylesheet comparison**, the **`::selection`/cursor/caret
sweep**, and — following the cursor sweep's lead — the **computed
font/line-height surface** plus the **per-element space-y sibling-gap
audit**.

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667)

7 findings → `docs/remediation-plan-session14.md`. Highlights:

1. **The rendered font differed — the reference ships NO webfont (High —
   the root cause of 13 sessions of "font-metric height bands").** The
   reference (Base44 + v3) declares
   `body { font-family: Inter, system-ui, -apple-system, sans-serif }`
   through a runtime-injected inline sheet on 9 of 10 routes (absent on
   /login, which falls to the v3 default stack) and loads NO @font-face
   anywhere — `document.fonts` is EMPTY on every route (the /login runtime
   bundle declares only unused Wix Madefor/Dazzed/Azeret faces). Every
   visitor renders their SYSTEM font (probe width 546.02 = system-ui; real
   Inter would measure 509). The clone bundled next/font Inter and rendered
   real Inter glyphs the reference never shows — different letterforms on
   every line, and the root cause of every documented height band (the
   −30/−49/−29 desktop bands, the −299/−121/−46/−45/−22/−58/−22/−44 mobile
   bands, the CourseDetail +1/−25 bands). After the fix every height
   measurement in the project is BYTE-EXACT for the first time: 11 routes ×
   2 viewports + all 9 CourseDetail pages.
2. **The v4 button-cursor preflight drop (High — the SIXTH v4 trap).** v4
   removed v3's `button, [role="button"] { cursor: pointer }` preflight
   rule; every button on the clone rendered the UA-default arrow cursor
   (42 default-cursor elements on /; 4 buttons + 8 descendants on /login)
   while the reference rendered the hand cursor everywhere (ZERO
   default-cursor elements — its static AND runtime sheets both carry the
   rule). A preflight delta is the FOURTH structural-blind-spot class with
   byte-identical classes.
3. **The v3↔v4 line-height composition flip (High — the SEVENTH v4
   trap).** On elements carrying BOTH a responsive `text-*` and a plain
   `leading-*`, v3's variant-block emission (media blocks AFTER every base
   utility) makes the SIZE utility's OWN line-height win — the reference's
   hero H1 renders lh 1 (72px line boxes at 72px font), the hero P lh
   1.75rem (28px), the CTA H2 lh 1 (48px). v4's `--tw-leading`
   custom-property composition makes `leading-*` win regardless of order —
   the clone rendered 90px/32.5px/60px line boxes (+36/+14/+12px). +50px
   on the hero content column; the residual / + /Home delta after the font
   fix. Below the variant breakpoints both engines agree — the drift only
   exists where the responsive size activates.
4. **The dead popular-card scale (High — the NINTH v4 trap + a session-13
   record correction).** The reference ships a scroll-reveal system that
   pre-hides offscreen sections with INLINE `opacity: 0; transform:
   translateY(20px)` (35 elements on /; 4–6 on /Pricing, /About,
   /Courses, /BecomeInstructor) and, once each element scrolls into view,
   leaves INLINE `opacity: 1; transform: none` FOREVER. Inline styles beat
   every stylesheet rule — the popular pricing card's `scale-105` is
   permanently DEAD on the reference (both live cards render unscaled,
   498px). The clone (no reveal system) applied v4's standalone
   `scale: 1.05` — 5% larger (523px), with every rect-based measurement
   inside the card 1.05× inflated (16.8px feature gaps, 21px icons).
   CORRECTION: session-13's "zero offscreen-hidden elements" record was
   wrong — the reveal system exists and fires on scroll (the probe read
   the wrong property); the reveal ENTRY animation stays a documented
   variance (the end states match).
5. **The skills/docs/tests CSS leak (Medium).** Tailwind v4's automatic
   source detection scans every non-gitignored file: the repo's skills/
   folder (283 files with class-like strings) leaked **1027 unused utility
   rules — 51% of the compiled stylesheet** (canaries: the
   `.selection:bg-red-200`/`.selection:text-red-900` demo string from
   `skills/gift-evaluator/html_tools.py`, plus `.bg-indigo-500`,
   `.bg-lime-50`, `.bg-teal-600`, `.bg-amber-400` — zero src/ usage). The
   parity SPECS themselves (and the session docs) re-leak quoted class
   names through tests/ and docs/. Closed by `@source not` directives for
   skills/, docs/, tests/, test-results/ and the root agent markdown
   files: 2014 → 933 CSSOM rules on dev, 157KB → 82KB production CSS.
   Invisible to every DOM-based surface (leaked utilities match no
   elements) — found by the ::selection CSSOM sweep.
6. **The inline-label space-y gap loss (Medium — the EIGHTH v4 trap).**
   v4's space-y engine assigns the gap to NON-LAST children as
   `margin-block-end` via `:where()` — vertically INERT when the child is
   inline. The login form's `<label>`s are `display: inline`: the 6px gap
   to the input wrapper vanished (each field group 6px short, the email +
   password block −12px, the whole mobile /login delta). v3's
   follower-side `margin-top` landed on the block wrapper and always
   worked. Desktop was masked by the h-screen viewport clamp.
7. **The overridden back-button gap (Medium — the TENTH v4 trap).** A
   child's OWN margin utility replaces v4's zero-specificity `:where()`
   gap carrier: the login card's "Back to sign in" button carries `-mb-2`,
   which on v4 replaced the header block's 16/24px space-y gap with −8px —
   pulling the view heading up INTO the button on the signup/reset/verify
   views (gaps [−8, 16] vs the reference [8, 16]; [−8, 24] vs [16, 24];
   the header blocks −16px/−24px). Found by the NEW per-view sibling-gap
   audit (the standing height sweep measures the signin view only, and
   desktop /login heights are viewport-clamped — the drift was invisible
   for 13 sessions).

**Verified matching (no action):** print (zero `@media print` rules on
either side on all 10 routes; print-emulated layout = screen layout),
::selection (NO element on ANY route of either site carries `selection:`
classes — the live's 8 /login rules are inert runtime presets, an accepted
variance), caret-color (the /login rgb(9,9,11) vs rgb(10,10,10) micro-delta
is the documented `--ring` family; /Contact + /AIAssistant byte-identical),
cursor specials (IDENTICAL on all routes), user-select (all-auto on both),
the mono stacks (engine defaults match), dark-scheme emulation (identical
body bg/color), the hover-variant scale rules (different class names —
untouched by the dead-scale pin). **Standing surfaces re-verified green:**
desktop + mobile height sweeps, the CourseDetail ×9 sweep, class diffs
(documented variances only; /login IDENTICAL), the space-y trap sweep, the
FULL mobile-menu battery on both sites (the 404px panel, 8 links, route-
close, the /Home hero state — **no Tailwind v4 display or breakpoint
bug**), text diffs (IDENTICAL ×4), the computed shadow sweep (the
session-12 `--shadow-sm` pin holds), the session-13 focus-ring pin (the
byte-identical slate-400 slot).

**Audit-methodology findings**: (a) always probe CourseDetail with PER-SITE
ids (the live's `?id=seed-1` renders its not-found state — a 32,648px false
delta); (b) a font-family STRING match means nothing if one side loads the
webfont — probe `document.fonts` + a measured probe-string width; (c)
font-metric-dependent absolute assertions are browser-build-dependent (the
live's login field group measures 74 in one Chromium and 78 in another) —
pin margins and structural relationships, not glyph-metric-derived heights;
(d) height sweeps are blind to interior drift on viewport-clamped pages
(h-screen) and to non-default component views — the sibling-gap audit must
run per view.

## Remediation (TDD)

- **RED first**: 16 new e2e specs (the `session-14 parity` blocks — 7 fix
  blocks + GUARD specs for the labels/input cursor, the hover:scale-105
  rule, and the popular-card unscaled box) — **14/16 verified failing**
  against the pre-fix build for exactly the pinned reasons; 2 GUARDs
  passed by design. Two spec-side fixes during GREEN: the label-group
  height assertion became browser-independent (the absolute 74 was an
  agent-browser font-metric value; Playwright's Chromium measures 78 on
  the LIVE too — the spec now pins the margin + structure and leaves the
  absolute number to the mobile-height spec), and the leak spec's own
  canary strings re-leaked through tests/ (the `@source not` set extended
  to docs/ + tests/ + the root agent markdown).
- **GREEN**: `globals.css` — the `--font-sans: Inter, system-ui,
  -apple-system, sans-serif` token (replacing the next/font variable), the
  restored v3 `button, [role="button"] { cursor: pointer }` preflight rule
  in `@layer base`, the four UNLAYERED media-scoped line-height pins, the
  UNLAYERED `.scale-105 { scale: none }` pin, the `@source not` exclusion
  set (app source only), and the two space-y follower-gap pins
  (`.space-y-1\.5 > label + *` + `.space-y-4 > .\-mb-2 + *` with its
  sm:space-y-6 twin); `layout.tsx` — the next/font import, the inter
  const and the html className removed (no webfont loads; the html element
  matches the reference's classless state). Zero class-string changes —
  every fix is a token, a base rule or an unlayered cascade pin.
- Gates: **171/171 e2e** (155 → 171, +16; zero regressions — every
  session-5/9/11/12/13 spec stayed green), 31/31 unit. Visual
  re-verification: **every height measurement byte-exact** (11 routes × 2
  viewports + CourseDetail ×9 — the first fully byte-exact state in the
  project's history); the gap audits 20/20 route×viewport + 4/4 login
  views at parity; the cursor histograms zero-default on both sites; the
  popular card 498px unscaled on both; the leak canaries absent; the
  regression battery green.

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **171/171 e2e ✓** (155 → 171).

## Ship

- 22 fresh dev-server screenshots in `docs/screenshots/` (the standard 12
  desktop routes + 3 login views + the focus-ring close-up + the NEW
  pricing-popular-card-unscaled close-up + 5 mobile + both open-menu
  states, captured at the new byte-exact rendering).
- Docs aligned: README (badge 202), AGENTS (gotchas 35–39 — the
  font-parity principle, the button-cursor preflight, the line-height
  composition flip, the space-y engine failure modes, the reveal-killed
  scale + the CSS-leak exclusion), CLAUDE (pyramid 31+171), PAD ([S14] +
  §7.1 + §10 resolved + the corrected scroll-reveal record),
  `nexuslearn-template_SKILL.md` v3.2.0 (§4.4d the session-14 trap family
  + the font-parity principle + the leak exclusion + Appendix A surfaces
  10–15), `docs/remediation-plan-session14.md`, this session log
  (`docs/session_24.md`). `.env.example` re-verified (the session changed
  no environment surface).
