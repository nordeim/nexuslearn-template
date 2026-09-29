# NexusLearn Remediation Plan — Session 13

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; Playwright parity probes + agent-browser sessions with synced
viewports at 1920×1080 + 375×667). The audit re-verified every standing surface from
sessions 1–12 (desktop + mobile height sweeps across 11 routes — all at the documented
font-metric bands; the like-for-like CourseDetail sweep across all 9 courses with the live
course ids; class-set diffs on the `main`/`nav`/`footer` subtrees — only the documented
variances; the space-y trap sweep on 12 routes; the FULL mobile-menu interaction battery
on both sites — the 404px panel, the bare trigger strings, the 4px pre-CTA gap, route-close,
the `/Home` hero state — **NO Tailwind v4 display or breakpoint bug**; the visible-text
content diff on `/`, `/Courses`, `/login`, `/Pricing` — IDENTICAL; the computed box-shadow +
border-radius sweep — the session-12 `--shadow-sm` pin holds, only the documented
oklab/rounded-full form-variance pairs remain) and added TWO fresh-eyes surfaces for
session 13, both suggested by the session-12 transcript (`docs/session_21.md`): the
**focus-ring parity sweep** (keyboard-focus every interactive element type and diff the
computed ring/outline state) and the **scroll-behavior / scroll-reveal comparison**.

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
147/147 e2e ✓ (session-12 state, remote `2291105`, confirmed green on the pulled clone).

**Session-13 focus**: sessions 1–12 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design, seed-idempotency, space-y-engine, navbar-chrome, route-state-chrome,
copy + glyph, component-state and computed-shadow parity. The remaining drift found by
the two new surfaces concentrates in (a) the **login inputs' keyboard-focus ring color**
(a cascade-order variance between the reference's runtime-injected v3 stylesheet and
the clone's single compiled v4 sheet), (b) a **login signin-view DOM nesting variance**
(visual today only by accident of margin collapse — a latent v4 space-y trap), and
(c) the **universal scroll-behavior rule** the reference's runtime ships.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The login inputs' keyboard-focus ring renders NEAR-BLACK on the clone but SLATE-400 on the live.** Measured (Playwright, real Tab focus, both pseudos matching): the live's email/password inputs render `--tw-ring-color: rgb(148 163 184)` (slate-400) with the 2px-white-offset + 4px-slate ring; the clone renders `#0a0a0a` (the `--ring` token) with the same geometry. **Root cause — a cascade-ORDER variance, invisible to class diffs (the class strings are byte-identical)**: the reference (Tailwind v3 + Base44) injects a page-level runtime `<style>` sheet AFTER its static build; on `/login` that runtime sheet re-asserts `.focus\:ring-slate-400:focus` at a later cascade position, which wins `--tw-ring-color` over the static `.focus-visible\:ring-ring:focus-visible` whenever BOTH pseudos match (keyboard focus — the norm for text inputs). The clone's single compiled v4 sheet emits `focus-visible:ring-ring` after `focus:ring-slate-400` (alphabetical variant order in both engines), so `--ring` wins. All three login input variants are affected (`INPUT_CLS` signin email/password, `COMPACT_INPUT_CLS` signup, `RESET_INPUT_CLS` reset). Verified NOT affected: the /Courses search input + select triggers and the /Contact form controls (their class strings carry no `focus:ring-slate-400`; both sites render the identical `rgb(10,10,10) 1px` ring) and every button (both sites render the `--ring` near-black ring; the Sign in button's `rgb(9,9,11)` vs `rgb(10,10,10)` micro-delta is within the reference's OWN per-page `--ring` drift — the live resolves `hsl(240 10% 3.9%)` on /login but `hsl(0 0% 3.9%)` on /Contact, i.e. the reference itself doesn't hold the token stable). | **High** |
| 2 | **The login signin-view DOM nesting drifts from the reference — a latent Tailwind v4 space-y trap.** The live's card interior: `div.w-full > [div.space-y-3 (the Google button ONLY), div.relative.my-6 (the OR divider), form.space-y-4.sm:space-y-5]`. The clone shipped: `div.w-full > div.space-y-3 > [Google button, OR divider, form]` — the OR divider and the form nested INSIDE the space-y-3. **Invisible to every standing surface** (the class-set diff is a set of tokens, blind to nesting; the gaps measure 24px/24px on BOTH sites today because the block container collapses the margins — the clone's `:where()` space-y-3 gives Google a `margin-block-end: 12px` that collapses against the OR divider's `my-6` 24px). The drift is a latent trap (any future child margin < 12px would render a different gap than the v3 reference — the session-9 trap family) and a DOM-structure difference on the highest-traffic card. Found by the space-y sweep (the only route hit: `space-y-3` container with a `my-6` child) + direct parent-chain dumps. | **Medium** |
| 3 | **The reference's runtime ships a UNIVERSAL `* { scroll-behavior: smooth }` — the clone only smooths `html`.** Measured: on the live, EVERY element (html, body, head, main, nav, buttons) computes `scroll-behavior: smooth`; on the clone only `html` does (body = auto). The rule lives in the live's runtime-injected sheet (S1), not the static build. Visible effect: identical page scrolling on both sites (html is the document scroller — smooth on both), but every programmatic scroll inside inner scroll containers (`scrollIntoView`/`scrollTo` without an explicit `behavior`) animates on the live and snaps on the clone — e.g. the Radix SelectContent viewport during dropdown keyboard navigation. Also a computed-style diff on every element. | **Low** |
| 4 | **Audit-methodology findings (documentation)**: (a) the UA-default `outline: auto` computed values are DYNAMIC — Chromium reports contrast-adaptive colors and animation-dependent widths/alphas (1px/2px/3px, `rgba(10,10,10,0.5)`, `rgb(48,61,79)`…) that differ run-to-run; focus-outline probes must read the site-CSS-controlled properties (the `--tw-ring-*` vars, explicit outlines), never the UA-default outline; (b) elements carrying `transition-all` (every shadcn button) render their focus ring MID-TRANSITION on an immediate read — the ring slots read as zero-alpha; focus probes must wait ≥ 2× the transition duration (the session-12 lesson re-confirmed on a new surface); (c) the sweep's 90-char box-shadow truncation hid the clone's ring slots behind v4's empty composition prefixes — full-string reads required. | **Low** (methodology) |

### Verified matching (no action)

**Standing surfaces re-verified green on the session-13 baseline**: desktop heights
(/,/Home −30; /Courses −49; /About −29; the rest byte-exact), mobile heights (ALL at the
documented session-8 bands: / −299, /Courses −121, /Pricing −46, /About −45, /Contact −22,
/BI −58, /Dashboard −22, /login −44, /AIAssistant −50, 404 byte-exact), the CourseDetail
like-for-like sweep (7× +1px, WebDev/UIUX −25px — exactly the documented bands), the
class-set diffs on `/`, `/Courses`, `/login` (only the documented gradient-form +
panel-mechanism variances), the space-y trap sweep (clean on 11 of 12 routes — the /login
hit IS finding 2), the FULL mobile-menu battery on BOTH sites (panel 404px byte-exact,
8 links, the 4px pre-CTA gap in its engine-variance form, desktop-row `display:none`,
route-change close, the `/Home` hero-state trigger — **no Tailwind v4 display or
breakpoint bug**), the text-content diffs (IDENTICAL on /, /Courses, /login, /Pricing),
and the computed shadow/radius sweep (the session-12 `--shadow-sm` pin holds on every
route; only the documented oklab/`calc(infinity*1px)` form-variance pairs remain).

**New surfaces verified green**: the **focus-ring sweep** on /Courses (search input +
all 3 select triggers: the identical `rgb(10,10,10) 1px` ring + white offset +
shadow-sm on both sites), /Contact (name/email/textarea: identical rings on both),
the shadcn buttons (Sign in, My Dashboard: the `--ring` ring engages identically on
both — geometry and color), the nav links (no ring classes on either site — the UA
default applies to both), the Google button (no focus utilities on either site); the
**scroll surface** — html `scroll-behavior: smooth` on both, programmatic scrollTo
animates on both, scroll-snap none on both, overscroll auto on both, and the
**scroll-reveal probe** (ZERO offscreen-hidden elements on either site — the
documented "scroll-reveal wrappers" variance has no visible reveal animation to
match; both sites render all sections fully visible).

### Accepted variances (documented, no action)

The v4 focus-form variances (all computed-identical or invisible): v3's
`focus-visible:outline-none` = `outline: 2px solid transparent` (a forced-colors-mode
fallback) vs v4's `outline-style: none` — both render nothing (v4's `outline-hidden`
exists for the forced-colors case; not a visual difference); v3's ring-offset always
emits the offset slot (`rgb(255,255,255) 0px 0px 0px 0px` at 0 width) while v4
collapses it — same family as the documented empty-slot variance; the `--ring` token
micro-delta (`hsl(240 10% 3.9%)` = rgb(9,9,11) on the live's /login vs `#0a0a0a` =
rgb(10,10,10) on the clone AND on the live's /Contact — the reference's own per-page
drift, 1/255 per channel, imperceptible); the UA-default `outline: auto` dynamic
readings (methodology finding 4a — not a site-CSS surface); plus all previously
documented variances (oklab color forms, `calc(infinity*1px)` rounded-full, the
gradient class form, the panel mechanism, the ARIA/scroll-lock hardening, live's
scroll-reveal wrappers + classless per-card wrappers, lucide path-count variants).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-13 parity` describe blocks
  (production build, desktop viewport):
  - **Block 1 — the login inputs' focus ring color (finding 1)**: focus the email
    input (real `locator.focus()` — `:focus-visible` matches text inputs), read the
    computed `--tw-ring-color` → `rgb(148, 163, 184)` (RED now: `#0a0a0a`); the
    computed box-shadow contains `rgb(148, 163, 184) 0px 0px 0px 4px` (RED now:
    `rgb(10, 10, 10)`); the same for the signup view's name input (navigate to the
    signup view first) and the reset view's email input (RED now).
  - **Block 2 — the signin-view DOM nesting (finding 2)**: on `/login` the OR
    divider's `parentElement` is the `div.w-full` (RED now: the space-y-3); the
    form's `parentElement` is the same `div.w-full` (RED now: the space-y-3); the
    Google button's parent is the `div.space-y-3` and that container has exactly ONE
    child (RED now: three children); the visual gaps stay pinned — Google→OR 24px and
    OR→form 24px (GREEN by design — margin collapse is identical in both nestings).
  - **Block 3 — the universal scroll-behavior (finding 3)**: the computed
    `scroll-behavior` of `document.body` AND a main-section div is `smooth`
    (RED now: `auto`).
- [1b] Verify RED (DONE): run against the pre-fix build (the session-12
  baseline `.next/standalone`) — 5 of 8 failed for exactly the pinned reasons
  (the 3 ring-color specs received `#0a0a0a`; the nesting spec received the
  space-y-3 parents; the scroll spec received `auto` on body) and 3 passed by
  design (the Contact-input GUARD, the Sign-in-button GUARD — added during the
  spec phase, pinning the post-transition `--ring` read — and the 24px-gap
  guard). One spec-side fix during GREEN: the ring-color assertion reads the
  pinned token LITERAL `#94a3b8` (the production build resolves the var to the
  literal; the live reports the same sRGB color as `rgb(148 163 184 / 1)` — a
  form variance; the computed box-shadow slot `rgb(148, 163, 184) 0px 0px 0px
  4px` is byte-identical on both sites).

### Phase 2 — GREEN: the three fixes (already mechanism-validated on the dev server)

- [2a] `src/app/globals.css` — the UNLAYERED cascade pin after the `@layer base`
  block: `.focus\:ring-slate-400:focus { --tw-ring-color: var(--color-slate-400); }`
  with the engine-variance comment (unlayered rules beat every `@layer` rule — the
  ADR-005 precedent applied to a cascade-order variance; zero class changes; the
  `--color-slate-400: #94a3b8` token is already pinned in `@theme`). Mechanism
  validated: the dev server's focused email input reads `--tw-ring-color: #94a3b8` =
  the live's `rgb(148 163 184)`.
- [2b] `src/components/LoginForm.tsx` — restructure the signin branch: close the
  `div.space-y-3` after the Google button; the OR divider (`div.relative.my-6`) and
  the form (`form.space-y-4.sm:space-y-5`) become its SIBLINGS inside the
  `div.w-full` — byte-identical to the live's DOM. Mechanism validated: gaps 24/24
  unchanged, page height unchanged, the OR/form parents = `w-full`, the space-y-3
  has exactly one child. All other views (reset/reset-sent/signup/verify) verified
  IDENTICAL structure on both sites — untouched.
- [2c] `src/app/globals.css` — replace `html { scroll-behavior: smooth; }` with the
  universal `* { scroll-behavior: smooth; }` in `@layer base` (the live's runtime
  ships exactly the universal form; mechanism validated: body/head/main all compute
  `smooth` on the dev server).
- [2d] GATES (DONE): `lint → typecheck → test → build → test:e2e` —
  **155/155 e2e** (147 → 155, +8; zero regressions — the session-5/11 login
  specs and the session-9 space-y specs all stayed green through the
  restructure), 31/31 unit, lint ✓, typecheck ✓.

### Phase 3 — Verification

- [3a] Full gate green (155/155 e2e, zero regressions).
- [3b] Playwright re-verification vs live (both contexts at 1920×1080):
  - re-run the focus-ring probes — the login inputs' ring = slate-400 on BOTH sites;
    the /Courses + /Contact controls and the buttons unchanged (the pin's selector
    matches ONLY the login inputs' class string — verified by grep: the three CLS
    constants in LoginForm.tsx are the only `focus:ring-slate-400` usages in src/);
  - re-run the login per-view probes (the 5 views' class diffs + the card height);
  - the regression surfaces: the mobile-menu battery, the `/` + `/login` class
    diffs, the desktop + mobile height sweeps (the restructure must move no layout);
    the space-y sweep (the /login hit disappears).
- [3c] Dev-server verification: the DOM structure + gaps + ring color + body scroll
  on `localhost:3000/login` (the unlayered pin + the restructure live-reload).

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set:
  12 desktop routes + the login close-ups incl. a FOCUSED-input capture showing the
  slate-400 ring + 5 mobile + both open-menu states).
- [4b] Docs: README (badge 186, testing rows + the session-13 description), AGENTS.md
  (NEW gotchas: the runtime-cascade pin — cascade-ORDER variances are invisible to
  class diffs, the THIRD structural-blind-spot class after token values and
  nesting; the focus-audit methodology — UA-default outlines are dynamic,
  transition-all rings need post-transition reads), CLAUDE.md (pyramid 31+155), PAD
  ([S13] revision + §7.1 + the focus/scroll audit surfaces in the test-patterns
  notes), `nexuslearn-template_SKILL.md` v3.1.0 (the cascade-pin pattern + the
  focus/scroll surfaces + the 13-session description + test inventory),
  `docs/remediation-plan-session13.md` (this plan), `docs/session_22.md`, the repo
  `worklog.md`. `.env.example` re-verify (the session changes no environment
  surface).

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push (with `--remote`
  pointed at this repo); operator key shredded.

---

## C. Extracted reference data (verbatim live values)

**Live login email input, keyboard-focused** (Playwright, post-transition):
- `--tw-ring-color: rgb(148 163 184 / 1)` (slate-400)
- box-shadow: `rgb(255, 255, 255) 0px 0px 0px 2px, rgb(148, 163, 184) 0px 0px 0px 4px, rgba(0, 0, 0, 0) 0px 0px 0px 0px`

**Live login card signin-view nesting** (parent-chain dump):
```
DIV.w-full
  DIV.space-y-3
    BUTTON (Continue with Google)   ← the ONLY child
  DIV.relative.my-6                 (the OR divider — sibling)
  FORM.space-y-4.sm:space-y-5       (sibling)
```

**Live scroll rule** (runtime sheet S1): `* { scroll-behavior: smooth; }` — every
element computes smooth (html, body, head, main, nav, buttons).

**Live login gaps** (bounding-rect): Google→OR = 24px, OR→form = 24px (the OR
divider's `my-6` 24px margins, block-context margin collapse).

**Clone fix targets**: `--tw-ring-color: #94a3b8` (= rgb(148,163,184)); OR/form
parents = `div.w-full`; `document.body` scroll-behavior = `smooth`.
