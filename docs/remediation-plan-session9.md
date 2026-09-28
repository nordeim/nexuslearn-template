# NexusLearn Remediation Plan — Session 9

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; desktop 1920×1080 + mobile 375×667 height sweeps across 13
routes + a like-for-like CourseDetail sweep across all 9 courses with the live course ids,
per-route unique class-set diffs on the `main` subtree, **a NEW chrome-subtree (nav +
footer) class-set diff**, computed-margin walks of every `space-y-*`/`space-x-*` container
on both sites, stylesheet rule extraction for `space-y-1`, head-metadata spot checks on 3
routes, and the full mobile-menu interaction battery; agent-browser sessions `live` +
`clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include`, playwright `testDir`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
122/122 e2e ✓ (session-8 state, commit `2efb24e`, confirmed green on the pulled clone).

**Session-9 focus**: sessions 1–8 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design and seed-idempotency parity. This session's audit re-swept every surface
with fresh eyes — again with particular attention to the **mobile navigation menu** (the
standing Tailwind v4 watchpoint) — and found this session's findings concentrated in the
**Navbar chrome**, a surface that had escaped every previous class-set audit because the
audit script walks `main *` only and the Navbar renders outside `main` (root layout).
The headline finding is a **genuine, previously undocumented Tailwind v4 engine bug**
(the fourth v4 trap in this project's history): the `space-y-*` utility's selector was
rewritten between v3 and v4, and it silently changes rendered layout whenever a child
carries its own margin utility.

---

## A. Findings inventory (live vs clone)

### The Tailwind v4 space-y engine trap (the session headline)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Tailwind v4 rewrote the `space-y-*`/`space-x-*` engine — direct margin utilities on children now WIN.** Extracted from the two stylesheets: **live (v3-compiled)** ships `.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: calc(.25rem * …) }` — selector specificity (0,2,0), so it OVERRIDES a child's own `.mt-3` (0,1,0). **clone (v4)** ships `:where(.space-y-1 > :not(:last-child)) { margin-block-end: calc(var(--spacing) * …) }` — `:where()` contributes ZERO specificity, so a child's `.mt-3` WINS, and the margin moved from margin-top-of-subsequent-siblings to margin-bottom-of-all-but-last. Consequence: any `space-y-*` container whose child carries an explicit `mt-*`/`mb-*` utility renders **different gaps and a different total height** on v4 than the v3 reference, despite byte-identical class attributes. | **Critical** |
| 2 | **The mobile nav panel is 8px taller than live (413 vs 405) with a 12px vs 4px pre-CTA gap.** The clone's panel container is `px-4 py-4 space-y-1` (byte-identical to live) and its last child — the "My Dashboard" CTA `<Link>` — carries `block mt-3`. Under v3 the `mt-3` was dead (overridden by space-y's margin-top → 4px gap). Under v4 the `mt-3` resurrects: the previous link's `margin-block-end` 4px collapses with the CTA's 12px margin-top → 12px gap, +8px total panel height (413px vs live's 405px; measured on both sites, plus per-child computed-margin dumps). **Blast radius swept across every route on the clone: this is the ONLY `space-y` container in the app with an explicit-margin child** — a ground-truth computed-margin walk of all `space-*` containers on 12 routes found no other case. | **High** |

### Navbar chrome class drift (found via the NEW chrome-subtree class diff)

| # | Finding | Severity |
|---|---------|----------|
| 3 | **Desktop "My Dashboard" button is missing the shadcn base trio + `hover:bg-primary/90`.** Live (verbatim): `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium rounded-xl px-6 py-2.5 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-105`. The clone omits `disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90` (and carries a duplicate `font-medium`, order-insensitive). The live app evidently received the same button-base sweep the landing/Pricing/AI/Contact buttons got in session 7 — the navbar was outside every previous audit's scope. | Medium |
| 4 | **Mobile-panel "My Dashboard" button is missing `transition-colors` + the base trio + `hover:bg-primary/90`.** Live (verbatim): `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-xl py-3`. The clone omits `transition-colors` + the same five tokens. | Medium |
| 5 | **The mobile trigger carries extra hover/transition classes.** Live is BARE: `md:hidden p-2 rounded-lg text-white/80` over the dark hero, `md:hidden p-2 rounded-lg text-gray-700` on white-nav pages — no hover, no transition. The clone adds `transition-colors` + `hover:text-white` / `hover:text-gray-900` (a hover-only visual variance). Align to the bare reference strings; the invisible ARIA wiring (`type="button"`, `aria-expanded`, `aria-controls`, `aria-label`) stays as documented a11y hardening. | Low |
| 6 | **Logo span class ORDER differs** (order-insensitive, same utilities): live `text-lg font-bold text-white transition-colors duration-300`; clone `text-lg font-bold transition-colors duration-300 text-white`. Normalize while editing (kills the byte diff). | Low |

### Verified matching (no action)

**Mobile navigation menu — full battery on BOTH sites at 375×667 (the standing Tailwind
v4 watchpoint — NO display-mismatch bug):** trigger + panel symmetric `md:hidden`;
desktop row `hidden md:flex` renders `display:none` at 375px on both sites; the icon
swaps to `lucide lucide-x h-6 w-6` on both; route-change closes on both; **8 panel links
with byte-identical class strings** (7 nav links + the CTA link wrapper); the panel
content structure (`px-4 py-4 space-y-1`, 7×44px links) identical. Live renders the
panel via conditional mount (closed → absent from the DOM, no animation, no ARIA, no
scroll lock, no Escape handling); the clone's grid-rows animation + ARIA + scroll lock +
Escape remain the documented deliberate hardening. Head metadata per route (title,
og:title, og:url, canonical — all mirror correctly, origin aside). All `main`-subtree
class sets IDENTICAL on /AIAssistant, /About, /BecomeInstructor, /Pricing, /login,
/Dashboard; / and /Courses differ only in the documented gradient class form; /Contact
only in the documented subject-trigger class order. **Footer: IDENTICAL chrome class
set.** Desktop heights byte-exact on /Pricing, /Contact, /BecomeInstructor,
/AIAssistant, /Dashboard, /login, 404, /Home (−30 documented band); CourseDetail
like-for-like on all 9 courses within the documented bands (7× +1px, WebDev/UIUX −25px
font band); mobile heights within all documented font bands; the space-y engine
swap is visually equivalent on every OTHER space-y container in the app (no explicit
margin utilities anywhere else).

### Accepted variances (documented, no action)

The chrome-subtree diffs that remain after remediation: the live panel is conditionally
mounted (the clone's grid-rows `:where`-safe animation wrapper `min-h-0 overflow-hidden`
+ `px-4 py-4 space-y-1` classes exist only in the clone DOM — mechanism variance, same
as session 8); the clone's ARIA/scroll-lock/Escape hardening; the CTA link's class form
(`block` vs live's `block mt-3` — the space-y engine-variance fix, same precedent as
the hero gradient class form); lucide `aria-hidden` attrs; clone dev-tools overlay.
Font-metric wrap bands unchanged from session 8.

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/mobile-navigation.spec.ts` new `session-9 parity` describe block
  (mobile viewport, same file conventions):
  - **The space-y trap guard**: with the panel open, the "My Dashboard" CTA link's
    computed `margin-top` is `0px` and the last nav link's computed `margin-bottom` is
    `4px` (the v3-reference gap semantics — RED now: `12px`).
  - **Panel open height = 405px** (RED now: `413px`).
  - **Panel CTA button base**: carries `transition-colors`, `disabled:opacity-50`,
    `[&_svg]:size-4`, `[&_svg]:shrink-0`, `hover:bg-primary/90` (RED now: absent).
- [1b] `tests/e2e/nexuslearn.spec.ts` new `session-9 parity` describe block (desktop):
  - **Trigger is the bare reference string**: on `/` the trigger's class attribute is
    EXACTLY `md:hidden p-2 rounded-lg text-white/80`; on `/Courses` exactly
    `md:hidden p-2 rounded-lg text-gray-700` (RED now: the clone's hover variants).
  - **Desktop "My Dashboard" button base**: carries `disabled:opacity-50`,
    `[&_svg]:size-4`, `[&_svg]:shrink-0`, `hover:bg-primary/90` (RED now: absent).
  - **Logo span byte-order**: `text-lg font-bold text-white transition-colors
    duration-300` over the hero (RED now: reordered).
- [1c] Verify RED: run the new specs against the current build — expect all 6 to FAIL
  for exactly the pinned reasons (12px margin / 413px height / missing tokens / hover
  classes / order).

### Phase 2 — GREEN: the Navbar fixes (findings 1–6)

- [2a] `src/components/Navbar.tsx` — the panel CTA `<Link>` drops `mt-3` (class becomes
  `block`): under v4 semantics the previous sibling's `margin-block-end` (4px) alone
  produces the reference gap, and the panel renders the reference 405px. Comment the
  trap in place (reference: `block mt-3` + v3 engine = 4px; v4 `:where()` loses to
  `.mt-3` → 12px — engine-variance class-form fix, same precedent as the hero gradient).
- [2b] Desktop "My Dashboard" button re-pinned on the live string verbatim (base trio +
  `hover:bg-primary/90`, single `font-medium`).
- [2c] Panel "My Dashboard" button re-pinned on the live string verbatim
  (`transition-colors` + base trio + `hover:bg-primary/90`).
- [2d] Trigger aligned to the bare reference strings (`md:hidden p-2 rounded-lg
  text-white/80` over hero / `text-gray-700` otherwise) — `transition-colors` and the
  `hover:text-*` pair removed; the ARIA wiring + `type="button"` stay.
- [2e] Logo span class list reordered to the live byte order.

### Phase 3 — Verification

- [3a] Full gate: `lint → typecheck → test → build → test:e2e` (122 → 128 expected).
- [3b] agent-browser re-verification vs live: the chrome-subtree class diff clean
  (modulo the documented mechanism/hardening variances); the open panel height 405px =
  live; the pre-CTA gap 4px = live; the trigger strings byte-identical; mobile battery
  re-run (route-close, icon swap, Escape, scroll lock); desktop + mobile height sweeps
  spot-checked for regressions.

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set,
  desktop + mobile + the open mobile menu at the corrected 405px height).
- [4b] Docs: README (test counts, the new trap description), AGENTS.md (gotcha 27: the
  space-y v4 engine trap + the navbar button bases; gotcha 8 note updated), CLAUDE.md
  (pyramid + parity behaviors), PAD ([S9] revision + §10 resolved line + test
  distribution), `nexuslearn-template_SKILL.md` v2.7.0 (the fourth Tailwind v4 trap),
  `docs/Tailwind-V4-Validation-Report.md` (the space-y section), `.env.example`
  re-verify, this plan, `docs/session_14.md` session log, `worklog.md`.

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push; key shredded.

---

## C. Extracted reference data (verbatim live strings)

**Live stylesheet (v3 engine)**: `.space-y-1 > :not([hidden]) ~ :not([hidden]) {
--tw-space-y-reverse: 0; margin-top: calc(.25rem * calc(1 - var(--tw-space-y-reverse)));
margin-bottom: calc(.25rem * var(--tw-space-y-reverse)); }`

**Clone stylesheet (v4 engine)**: `:where(.space-y-1 > :not(:last-child)) {
--tw-space-y-reverse: 0; margin-block-start: calc(var(--spacing) *
var(--tw-space-y-reverse)); margin-block-end: calc(var(--spacing) * calc(1 -
var(--tw-space-y-reverse))); }`

**Live panel (open, 375×667)**: height 405px; children margins: links 1–7 mt=4px (v3
space-y), CTA mt=4px (its `mt-3` overridden); 7 links 44px each; CTA 36px (`h-9`
wins over `py-3`); inner `px-4 py-4 space-y-1` = 404px + 1px border-t.

**Desktop My Dashboard (live, verbatim)**:
`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm
focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
[&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r
from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white
font-medium rounded-xl px-6 py-2.5 shadow-lg shadow-purple-500/20 transition-all
duration-300 hover:shadow-purple-500/30 hover:scale-105`

**Panel My Dashboard (live, verbatim)**:
`inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm
transition-colors focus-visible:outline-none focus-visible:ring-1
focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow
hover:bg-primary/90 h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600
text-white font-medium rounded-xl py-3`

**Trigger (live, verbatim)**: over hero `md:hidden p-2 rounded-lg text-white/80`;
white-nav pages `md:hidden p-2 rounded-lg text-gray-700`. No ARIA, no hover, no
transition (the clone keeps ARIA as hardening).

**Logo span (live, verbatim)**: `text-lg font-bold text-white transition-colors
duration-300` (hero) / `text-lg font-bold text-gray-900 transition-colors
duration-300` (white nav).
