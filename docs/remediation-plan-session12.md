# NexusLearn Remediation Plan — Session 12

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; Playwright parity probes at 1920×1080 + the agent-browser
sessions per the synced-viewport rule). The audit re-verified every standing surface from
sessions 1–11 (desktop + mobile height sweeps across 11 routes — all at the documented
bands; the like-for-like CourseDetail sweep across all 9 courses with the live course ids;
class-set diffs on the `main`/`nav`/`footer` subtrees — only the documented variances; the
space-y trap sweep on 12 routes — clean; the full mobile-menu interaction battery on both
sites — the 404px panel, the bare trigger strings, the 4px pre-CTA gap, route-close, the
`/Home` hero state; the visible-text content diff on `/`, `/Courses`, `/login`, `/Pricing` —
IDENTICAL) and added FOUR fresh-eyes surfaces for session 12: a **hover-state
computed-style diff** (hover the cards/buttons/links on both sites and compare the
computed transform/translate/scale, shadow, color and transition values), a **computed
box-shadow + border-radius sweep** (walk every visible element on 10 routes, bucket the
computed shadows/radii, diff live vs clone — the surface that found this session's drift),
a **prefers-reduced-motion probe** (neither site ships a reduced-motion override), and an
**AI-chat streaming probe** (the live's own chat is a one-shot `InvokeLLM` XHR that renders
the complete answer in a single frame — the clone's JSON route is at behavioral parity).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
141/141 e2e ✓ (session-11 state, commit `8e6543a`, confirmed green on the pulled clone).

**Session-12 focus**: sessions 1–11 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design, seed-idempotency, space-y-engine, navbar-chrome, route-state-chrome,
copy + glyph and component-state parity. The remaining drift found by the new
computed-shadow sweep concentrates in the **Tailwind v4 shadow-scale shift** — a
byte-identical `shadow-sm` class renders ONE NOTCH heavier on v4 than on the v3
reference, and class-set diffs are structurally blind to it (the class string is
identical; only the token's VALUE changed between engines).

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Tailwind v4 shifted the shadow scale — every `shadow-sm` renders one notch heavier than the v3 reference.** v4 renamed v3's `shadow-sm` (0 1px 2px rgb(0 0 0/0.05)) to `shadow-xs` and moved `shadow-sm` up to v3's bare-`shadow` geometry (0 1px 3px/0.1 + 0 1px 2px −1px/0.1). Measured on both sites: the white navbar (every white-nav route) renders `rgba(0,0,0,0.05) 0px 1px 2px 0px` on the live vs `rgba(0,0,0,0.1) 0px 1px 3px 0px, rgba(0,0,0,0.1) 0px 1px 2px -1px` on the clone — a visibly heavier drop shadow under the fixed navbar on EVERY page. The same shift hits 21 `shadow-sm` usages (Navbar.tsx white-nav state, LoginForm's Sign in + compact submit + Google-hover, the landing hero secondary CTA + "View All Courses" button, CourseDetail's outline button, ContactForm ×2, NewsletterForm, AIAssistantChat textarea, CourseCatalog search, MyCourses button, ui/card, ui/select, ui/input, ui/button default/outline/secondary/destructive variants) plus every `hover:shadow-sm` (the 380-per-course lesson rows, the Google button hover). Found by the new computed box-shadow sweep (the shadow buckets differ on every route: the live's `0.05 0px 1px 2px` bucket is empty on the clone and the clone's `0.1 0px 1px 3px` bucket over-counts). md/lg/xl/2xl are UNCHANGED in v4 (verified: the price card's shadow-2xl, the CTA's shadow-lg and the card-hover 2xl geometry are byte-identical). | **High** |
| 2 | **Tailwind v4 wraps `hover:` variants in `@media (hover: hover)` — hover-state audits break in touch-emulating headless browsers** (audit-methodology finding). The clone's dev CSS gates every hover utility behind `@media (hover: hover)` (v3 emitted them unconditionally). In the agent-browser daemon (launched with touch emulation — `matchMedia("(hover: hover)")` is false there), the hovered card matched `:hover` but the translate/shadow rules never applied — a FALSE parity failure. The repo's Playwright Chromium (the e2e environment) reports `hover: hover` true and the hover effects work perfectly. Consequence 1: hover-state parity must be probed in a hover-capable context (Playwright), not via the touch-emulating agent-browser session. Consequence 2 (real-world): on touch devices the v3 reference applies sticky-hover styles on tap while v4 does not — an intentional v4 behavior change (documented variance, an improvement, not a bug). | **Low** (methodology + documentation) |
| 3 | **Tailwind v4's translate/scale/rotate moved to the standalone CSS properties — computed-style gates must read the right property per stack** (audit-methodology finding). The live (v3) renders the card hover as `transform: matrix(1, 0, 0, 1, 0, -8)`; the clone (v4) renders `translate: 0px -8px` and the image zoom as `scale: 1.1` (v3: `transform: matrix(1.1, …)`). Visually identical (−8px lift, 1.1 zoom, verified on both), but a computed-style assertion reading `.transform` on the clone reports "none" — the session-12 hover probes read both properties per stack. Also: v4's `transition-transform` transitions 4 properties (`transform, translate, scale, rotate`) vs v3's 1 — same 0.7s duration, form variance. | **Low** (methodology + documentation) |
| 4 | **Dev-server origin hardening: `next dev` accessed via `http://127.0.0.1:3000` serves an unhydrated page** (DX finding, no parity impact). Next.js 16's dev-origin protection blocks the dev CSS/JS chunks when the Origin/Referer host (`127.0.0.1`) differs from the server's own (`localhost`) — the page renders as static HTML, forms fall back to native GET submits (`/login?`), and the audit initially read a false "login broken" state. The production build and `localhost:3000` are unaffected. Fix: `allowedDevOrigins: ["127.0.0.1"]` in next.config.ts (the dev server's own warning message recommends exactly this). | **Low** (dev-only hardening) |

### Verified matching (no action)

**Standing surfaces re-verified green on the session-12 baseline**: desktop heights (/,/Home
−30; /Courses −49; /About −29; the rest byte-exact), mobile heights (ALL at the documented
session-8 bands), the CourseDetail like-for-like sweep (7× +1px, WebDev/UIUX −25px), the
class-set diffs on `/`, `/Courses`, `/login` (only the documented gradient-form + panel-
mechanism variances), the space-y trap sweep (clean on all 12 routes), the mobile-menu
battery on BOTH sites (bare trigger strings in both nav states, the 404px panel, the 4px
pre-CTA gap, 8 links, desktop-row `display:none`, route-change close, the `/Home` hero
trigger — NO Tailwind v4 display bug, NO breakpoint bug), and the text-content diffs
(IDENTICAL on /, /Courses, /login, /Pricing).

**New surfaces verified green**: the **hover-state diff** — featured card (−8px lift +
25px/50px/−12px purple shadow on both; live matrix vs clone translate), featured-card image
(1.1 zoom on both), hero CTA (scale 1.05 + purple/0.25 shadow-lg geometry on both), the
pricing "Start Pro" button (1.05 + shadow-lg on both), nav links (purple-50 bg + purple-600
text on both), the path card (shadow-2xl purple/0.1 geometry on both), the catalog search
focus/hover states; the **CourseDetail deep-dive** — the price card (`bg-white rounded-2xl
shadow-2xl overflow-hidden`, 16px radius, 0.25/25px/50px/−12px shadow on both) and the 380
lesson rows (identical classes, 12px radius, identical child radii, the purple-200 hover
border engages on both); the **SelectItem `rounded-sm`** (both sites render 4px — the
reference's own v3 config maps sm to 4px, so the v4 shift does NOT apply there); the
**prefers-reduced-motion probe** (no `@media (prefers-reduced-motion)` rules on EITHER
site — the PAD §10 item stays an open enhancement, now with evidence the reference doesn't
ship it either); the **AI-chat streaming probe** (the live's chat is a one-shot
`Core/InvokeLLM` XHR — the answer appears complete in a single frame at ~2.7s, no
progressive render — the clone's JSON route is at behavioral parity; the PAD §10 item
mirrors the reference's own behavior).

### Accepted variances (documented, no action)

The v4 color-FORM variances (all computed-identical to the reference, invisible): the
`oklab()`/`color-mix` form for alpha-modified colors (`bg-white/10` →
`oklab(0.999994 … / 0.1)` vs the live's `rgba(255,255,255,0.1)`; the purple shadow colors
→ `oklab(0.626841 …)` vs `rgba(168,85,247,…)`) — same family as the documented
gradient-class-form and sRGB-palette variances (ADR-005 pinned the NAMED palette; alpha
variants still compile through v4's color-mix, which emits oklab strings that resolve to
the same sRGB values); the rounded-full form (`calc(infinity * 1px)` → computed
`3.35544e+07px` vs v3's `9999px` — both fully round); the v4 shadow composition's empty
zero-alpha slots (`rgba(0,0,0,0) 0px 0px 0px 0px, …` prefixes — invisible, must be
stripped when diffing computed shadows); the v4 `transition-transform` 4-property list;
the preflight default `border-color` (v4's neutral-flavored gray-200 vs v3's gray-200 —
2/255 per channel, only on elements with `border-width: 0` — no visible border anywhere
uses the default; the clone pins no bare-`border` usages); the `@media (hover: hover)`
gate itself (v4's sticky-hover removal on touch devices — an improvement over the v3
reference); live's scroll-reveal wrappers; the clone's ARIA/scroll-lock hardening; the
documented gradient class form and panel mechanism classes.

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference shadow state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-12 parity: the v4 shadow-scale pin`
  describe block (production build, desktop viewport; every assertion reads the COMPUTED
  `box-shadow`, normalized by stripping v4's empty `rgba(0, 0, 0, 0) 0px 0px 0px 0px`
  slots):
  - **The white navbar carries the v3 shadow-sm**: on `/Courses` (a white-nav route) the
    navbar's normalized computed box-shadow is exactly `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`
    (RED now: the shifted `0.1 0px 1px 3px + 0.1 0px 1px 2px -1px` form).
  - **The login Sign in button carries the v3 shadow-sm**: normalized computed shadow =
    `rgba(0, 0, 0, 0.05) 0px 1px 2px 0px` (RED now).
  - **The hero secondary CTA carries the v3 shadow-sm at rest** (landing, "Start Learning"
    button) (RED now).
  - **The lesson-row hover carries the v3 hover:shadow-sm**: hover the first curriculum
    row on `/CourseDetail?id=seed-1` → normalized shadow = `rgba(0, 0, 0, 0.05) 0px 1px
    2px 0px` (RED now).
  - **The untouched-scale guard (green by design, prevents over-fixing)**: the CourseDetail
    price card's rest shadow contains `0.25) 0px 25px 50px -12px` (shadow-2xl) and the
    hero primary CTA's rest shadow contains `0px 10px 15px -3px` (shadow-lg geometry) —
    v4 did not shift md/lg/xl/2xl and the pin must not touch them.
- [1b] Verify RED: run the new specs against the pre-fix build — expect the 4 shadow-sm
  specs to fail for exactly the pinned reason (the 0.1/1px-3px geometry) and the 2 guard
  specs to pass.

### Phase 2 — GREEN: the two fixes

- [2a] `src/app/globals.css` — add the v3 shadow-scale pin to the `@theme inline` block:
  `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);` with the engine-variance comment (the
  ADR-005 palette-pin precedent: pin the token, keep every class byte-identical — one
  line fixes all 21 `shadow-sm` usages + every `hover:shadow-sm`). Mechanism pre-validated
  on the dev server: the navbar's computed shadow collapses to the live's
  `rgba(0,0,0,0.05) 0px 1px 2px 0px`.
- [2b] `next.config.ts` — add `allowedDevOrigins: ["127.0.0.1"]` (dev-only hardening; the
  production build is unaffected). Verified mechanism: Next 16's dev-origin protection
  blocks dev chunks for the `127.0.0.1` origin → silent no-hydration; the allowlist
  restores it (the dev server's own warning recommends exactly this form).
- [2c] GATES: `lint → typecheck → test → build → test:e2e` (expect 141 → 147:
  the 4 shadow-sm specs + the 2 guard specs).

### Phase 3 — Verification

- [3a] Full gate green (147/147, zero regressions).
- [3b] Playwright re-verification vs live (both contexts at 1920×1080):
  - re-run the computed shadow sweep on the affected routes — the shadow-sm buckets must
    collapse to parity (only the documented oklab/empty-slot form variances remain);
  - re-run the hover battery (card −8px lift, image 1.1, CTA 1.05, lesson-row hover
    shadow-sm at the v3 geometry);
  - the regression surfaces: the mobile-menu battery, the `/` + `/login` class diffs, the
    desktop height sweep (the shadow pin must not move any layout).
- [3c] Dev-server verification via `http://127.0.0.1:3000` (post-[2b]): the login form
  hydrates and submits via the API (no native GET fallback).

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set:
  12 desktop routes + the landing/login close-ups + mobile captures incl. both open-menu
  states; the shadow fix is chrome-level, so the navbar-inclusive captures refresh the
  visual record).
- [4b] Docs: README (badge 177, testing rows + the session-12 description), AGENTS.md
  (NEW gotcha: the v4 shadow-scale shift — the FIFTH Tailwind v4 trap; update the
  hover-audit methodology note — `@media (hover: hover)` + the translate/scale computed
  properties), CLAUDE.md (pyramid 31+147), PAD ([S12] revision + §10 resolved line +
  the shadow pin in the engine-variance fixes), `nexuslearn-template_SKILL.md` v3.0.0
  (the fifth v4 trap + the hover-state audit surface + the computed-property rule + the
  12-session description + test inventory), `docs/Tailwind-V4-Validation-Report.md`
  (the shadow-scale-shift entry in the project trap log), `.env.example` re-verify,
  this plan, `docs/session_20.md`, `worklog.md`.

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push (with `--remote`
  pointed at this repo); operator key shredded.

---

## C. Extracted reference data (verbatim live values)

**Live white-navbar computed box-shadow** (v3 `shadow-sm`, measured on /Courses):
`rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

**Live login Sign in button computed box-shadow** (v3 `shadow-sm`):
`rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px`

**v3 shadow scale** (the live's stylesheet, extracted from `index-BVMIxsxQ.css`):
- `shadow-sm`: `0 1px 2px 0 #0000000d`
- `shadow` (bare): `0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a`
- `shadow-md`: `0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a`
- `shadow-lg`: `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a`
- `shadow-xl`: `0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a`
- `shadow-2xl`: `0 25px 50px -12px #00000040`

**v4 shadow scale** (the clone's dev CSS — the shift): `shadow-xs` = v3's sm;
`shadow-sm` = v3's bare `shadow`; md/lg/xl/2xl byte-identical to v3.

**The pin**: `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);` in the `@theme inline` block
(restores the v3 value; `shadow-xs` is unused by the codebase and needs no pin).
