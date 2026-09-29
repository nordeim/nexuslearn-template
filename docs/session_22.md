# Session 13 — Parity pass: the login focus-ring cascade pin + the reference card nesting + the universal scroll rule

Continuing from session 12 (`7cbd26a` + the pulled `docs/session_21.md`
transcript, remote at `2291105`). Sessions 1–12 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state and computed-shadow parity; this session re-swept every
standing surface and added TWO fresh-eyes audit surfaces (both suggested by
the session-12 transcript): the **focus-ring parity sweep** (keyboard-focus
every interactive element type, diff the computed ring/outline state) and
the **scroll-behavior / scroll-reveal comparison** (the computed
scroll-behavior on every element tier + an offscreen-hidden-element probe
for reveal animations).

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667)

3 findings → `docs/remediation-plan-session13.md`. Highlights:

1. **The login inputs' focus-ring cascade flip (High — the third
   structural-blind-spot class).** The reference (Tailwind v3 + the Base44
   runtime) injects a page-level utility `<style>` sheet AFTER its static
   build; on `/login` that runtime sheet re-asserts
   `.focus:ring-slate-400:focus` at a later cascade position, which wins
   `--tw-ring-color` over the static `.focus-visible:ring-ring` whenever
   BOTH pseudos match (keyboard focus — the norm for text inputs). The
   reference's login inputs render a **slate-400** keyboard-focus ring
   (`rgb(148 163 184) 0px 0px 0px 4px` over a 2px white offset); the
   clone's single compiled v4 sheet emits the focus-visible variant later,
   so the ring rendered the `--ring` **near-black**. Byte-identical class
   strings — invisible to class diffs, text diffs, height sweeps AND
   computed-shadow buckets (the third blind spot after the session-12
   token VALUES and this session's nesting finding). Verified NOT
   affected: the /Courses search + selects, the /Contact controls (the
   identical `rgb(10,10,10) 1px` ring on both sites — their class strings
   carry no `focus:ring-slate-400`) and every button (both render the
   `--ring` ring; the live's own `--ring` token drifts between
   `hsl(240 10% 3.9%)` and `hsl(0 0% 3.9%)` per page — the 1/255
   micro-delta is within the reference's own drift).
2. **The signin-view DOM nesting drift (Medium — a latent v4 space-y
   trap).** The live card interior: `div.w-full > [div.space-y-3 (the
   Google button ONLY), div.relative.my-6 (the OR divider),
   form.space-y-4]`. The clone nested the OR divider + the form INSIDE the
   space-y-3. The 24px/24px gaps measured IDENTICAL on both sites — but
   only because the block container collapses the margins (the clone's
   `:where()` space-y-3 gives Google a `margin-block-end: 12px` that
   collapses against the OR divider's `my-6` 24px; the live's plain
   `div.w-full` has no space-y at all). Found by the space-y trap sweep
   (the only route hit) + parent-chain dumps; invisible to class-set
   diffs (a set of tokens is blind to nesting).
3. **The universal scroll-behavior (Low).** The reference's runtime ships
   `* { scroll-behavior: smooth }` — every element (html, body, head,
   sections, buttons) computes smooth; the clone only smoothed `html`
   (body = auto). Same page scrolling (html is the scroller — smooth on
   both), but every programmatic scroll inside inner scroll containers
   (`scrollIntoView`/`scrollTo` without an explicit behavior) animates on
   the live and snaps on the clone — e.g. the Radix SelectContent viewport
   during dropdown keyboard navigation.

**Audit-methodology findings** (documentation): (a) the UA-default
`outline: auto` computes DYNAMIC values — Chromium reports
contrast-adaptive colors and animation-dependent widths/alphas
(1px/2px/3px, `rgba(10,10,10,0.5)`, `rgb(48,61,79)`…) that differ
run-to-run; focus probes must read the site-CSS-controlled properties
(`--tw-ring-color`, explicit outlines); (b) elements carrying
`transition-all` render their focus ring MID-TRANSITION on an immediate
computed read (the ring slots read zero-alpha — a false "no ring" reading
that cost two probe iterations); wait ≥ 2× the transition duration; (c)
v4's ring composition prefixes every box-shadow with empty zero-alpha
slots — the sweep's 90-char truncation hid the clone's ring entirely.

**Verified matching (no action):** the /Courses + /Contact form-control
rings (the identical `rgb(10,10,10) 1px` ring + white offset + shadow-sm
on both sites), every button ring (the `--ring` ring engages identically —
geometry and color — on the Sign in + My Dashboard buttons), the nav links
(no ring classes on either site), the Google button (no focus utilities on
either site), html `scroll-behavior: smooth` + programmatic-scroll
animation (both), scroll-snap/overscroll (none/auto on both), and the
scroll-reveal probe (ZERO offscreen-hidden elements on either site — the
documented "scroll-reveal wrappers" variance has no visible reveal
animation to match). **Standing surfaces re-verified green:** desktop +
mobile height sweeps (documented bands), the CourseDetail ×9 sweep, class
diffs (documented variances only; /login IDENTICAL), the space-y sweep
(clean on 11 of 12 routes — the /login hit WAS finding 2), the FULL
mobile-menu battery on both sites (the 404px panel, bare triggers, the 4px
pre-CTA gap, route-close, the `/Home` hero state — **no Tailwind v4
display or breakpoint bug**), text diffs (IDENTICAL on /, /Courses,
/login, /Pricing), the computed shadow sweep (the session-12 `--shadow-sm`
pin holds on every route).

## Remediation (TDD)

- **RED first**: 8 new e2e specs (the `session-13 parity` blocks) — the
  signin/signup/reset inputs' keyboard-focus ring reads slate-400 (3
  specs), 2 GUARD specs (the /Contact input + the Sign in button keep the
  `--ring` near-black — the button read waits out the 200ms
  transition-all), the signin-view nesting (the OR divider + form are the
  space-y-3's siblings inside the `div.w-full`, the space-y-3 wraps ONLY
  the Google button), the 24px-gap guard, and the universal
  scroll-behavior — **5/8 verified failing** against the pre-fix build for
  exactly the pinned reasons (the ring specs received `#0a0a0a`, the
  nesting spec received the space-y-3 parents, the scroll spec received
  `auto` on body). One spec-side fix during GREEN: the ring assertion
  reads the pinned token LITERAL `#94a3b8` (the production build resolves
  the var to the literal; the live reports the same sRGB color as
  `rgb(148 163 184 / 1)` — a form variance; the RENDERED slot
  `rgb(148, 163, 184) 0px 0px 0px 4px` is byte-identical on both sites).
- **GREEN**: `src/app/globals.css` — the UNLAYERD cascade pin
  (`.focus\:ring-slate-400:focus { --tw-ring-color: var(--color-slate-400); }`
  — unlayered beats every `@layer` rule; the selector matches ONLY the
  login inputs' class strings) + the universal
  `* { scroll-behavior: smooth; }` in `@layer base` (replacing the
  html-only rule); `src/components/LoginForm.tsx` — the signin branch
  restructured to the reference nesting (the space-y-3 closes after the
  Google button; the OR divider + the form become its siblings inside the
  `div.w-full` — byte-identical classes, the gaps stay 24/24).
- Gates: **155/155 e2e** (147 → 155, +8; zero regressions — the
  session-5/11 login specs and the session-9 space-y specs all stayed
  green through the restructure), 31/31 unit. Visual re-verification:
  the focused login inputs render the byte-identical slot
  `rgb(148, 163, 184) 0px 0px 0px 4px` on BOTH sites; the /login heights
  byte-exact (1080 desktop, the −44 mobile band); the /login class diff
  IDENTICAL (MAIN/NAV/FOOTER); the space-y sweep clean on all 12 routes
  (the /login hit is gone); the reset/signup views' structures unchanged
  (identical to the live dumps).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **155/155 e2e ✓** (147 → 155).

## Ship

- 23 fresh dev-server screenshots in `docs/screenshots/` (12 desktop
  routes, the NEW login-focused-input-ring close-up showing the pinned
  slate-400 ring, the login signin/reset/signup views, 5 mobile captures,
  both open-menu states).
- Docs aligned: README (badge 186), AGENTS (gotchas 33–34 — the
  runtime-cascade pin / the third structural blind spot; the focus-audit
  methodology + the universal scroll rule), CLAUDE (pyramid 31+155), PAD
  ([S13] revision + §7.1 12+143 + §10 resolved line),
  `nexuslearn-template_SKILL.md` v3.1.0 (§4.4c the runtime-cascade pin +
  the focus/scroll surfaces in Appendix A + the 13-session description +
  test inventory), `docs/remediation-plan-session13.md`, this session log
  (`docs/session_22.md`). `.env.example` re-verified (the session changed
  no environment surface).
