# Session 9 — Parity pass: the Tailwind v4 space-y engine trap + navbar chrome parity

Continuing from session 8 (`23e9ce2` + the pulled `docs/session_13.md`
transcript, remote at `2efb24e`). Sessions 1–8 closed static, shell, content,
sub-section, interactive-state, head-metadata, OG-identity, class-verbatim,
display-order, section-design and seed-idempotency parity; this session
re-swept every surface with fresh eyes — again with particular attention to
the **mobile navigation menu** (the standing Tailwind v4 watchpoint) — and
closed two bug clusters concentrated in the **Navbar chrome**, a surface every
previous class-set audit had missed because the audit script walks `main *`
and the Navbar renders outside `main` (root layout).

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667)

6 findings → `docs/remediation-plan-session9.md`. Highlights:

1. **The Tailwind v4 space-y engine trap (Critical — the 4th project trap).**
   Extracted from both stylesheets: live (v3-compiled) ships
   `.space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top }` at selector
   specificity (0,2,0) — it OVERRIDES a child's own `.mt-3`; the clone (v4)
   ships `:where(.space-y-1 > :not(:last-child)) { margin-block-end }` —
   `:where()` contributes ZERO specificity, so the child's `.mt-3` WINS, and
   the engine margin moved from top-of-subsequent-siblings to
   bottom-of-non-last. Any `space-y-*` container whose child carries an
   explicit `mt-*`/`mb-*` utility renders **different gaps and a different
   total height** on v4 than the v3 reference despite byte-identical class
   attributes. A ground-truth computed-margin walk of every `space-*`
   container on 12 routes found exactly ONE violation in the app: the mobile
   nav panel's Dashboard CTA (`block mt-3`) — v4 resurrected the mt-3 into a
   12px pre-CTA gap (live: 4px) and an 8px taller panel (clone 413px vs live
   405px, measured per-child on both sites). Found via the mobile-menu
   battery's panel-height check + per-child computed-margin dumps.
2. **Navbar chrome class drift (Medium/Low).** Discovered via a NEW
   chrome-subtree (`nav *` + `footer *`) class-set diff: the live navbar's
   two "My Dashboard" buttons now carry the shadcn base trio +
   `hover:bg-primary/90` (the live app evidently received the same
   button-base sweep the landing got in session 7 — outside every previous
   audit's scope); the clone's mobile trigger carried extra
   `transition-colors` + `hover:text-*` utilities (live ships the BARE
   `md:hidden p-2 rounded-lg text-white/80` / `text-gray-700`); the logo
   span's class order differed (same utilities, order-insensitive). The
   footer diff was IDENTICAL.

**Re-verified green (no action):** the mobile navigation menu on BOTH sites —
the full battery (closed panel collapsed, icon swap to `lucide-x`, 8 links
with byte-identical panel link classes, desktop row `display:none`,
route-change close; live closes on route change but has NO Escape close, NO
scroll lock, NO ARIA and conditionally mounts the panel — the clone's
grid-rows animation + ARIA + scroll lock + Escape stay as documented
deliberate hardening; **no Tailwind v4 display-mismatch bug**). Head metadata
per route; all `main`-subtree class-set diffs (only the two documented
variances: the hero gradient class form, the Contact subject-trigger class
order); desktop heights byte-exact or within the documented font bands
(including a fresh like-for-like CourseDetail sweep across all 9 courses
with the live course ids: 7× +1px, WebDev/UIUX −25px); mobile heights within
all documented bands; catalog display order; auth-independent navbar on both
sites.

## Remediation (TDD)

- **RED first**: 6 new e2e specs (the `session-9 parity` blocks — the space-y
  trap guard: the panel CTA's computed margin-top 0px + the Contact link's
  margin-bottom 4px + the open panel height 405px; the panel + desktop My
  Dashboard button base tokens; the bare trigger string on both nav states;
  the logo span byte order) — all 6 verified failing against the pre-fix
  build for exactly the pinned reasons. Two spec-side bugs found and fixed
  during RED (the new mobile block needed its own `page.goto` beforeEach; the
  trigger spec belongs at the mobile viewport — the `md:hidden` trigger is
  outside the accessibility tree on Desktop Chrome).
- **GREEN**: `src/components/Navbar.tsx` — the panel CTA drops `mt-3` (class
  `block`; under v4 semantics the previous sibling's 4px margin-block-end
  alone produces the reference gap — an engine-variance class-form fix with
  the same precedent as the hero gradient's sRGB arbitrary form); both My
  Dashboard buttons re-pinned on the live strings verbatim (base trio +
  `hover:bg-primary/90`, the panel's with `transition-colors`); the trigger
  aligned to the bare reference strings (hover/transition utilities removed;
  the ARIA wiring + `type="button"` stay as invisible hardening); the logo
  span reordered to the live byte order; the component docblock documents the
  trap.
- Gates: **128/128 e2e** (122 → 128), zero regressions. Visual re-verification:
  the chrome class diff now has ZERO live-only classes (the remaining
  clone-only entries are the documented mechanism/hardening variances); the
  open panel measures **405px = live byte-exact**; the pre-CTA gap 4px =
  live; the mobile battery green; desktop + mobile height sweeps unchanged
  (the navbar is fixed-position — no document-flow impact).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **128/128 e2e ✓** (122 → 128).

## Ship

- 17 fresh dev-server screenshots in `docs/screenshots/` (12 route captures
  desktop + 4 mobile + the open mobile menu at the corrected 405px height).
- Docs aligned: README (badge 159, testing rows + the session-9 description),
  AGENTS (gotchas 27–28: the space-y engine trap + the navbar button bases;
  the Navbar-outside-`<main>` audit rule; gotcha 8 updated with the bare
  trigger; 128 specs), CLAUDE (pyramid 31+128, parity behaviors), PAD ([S9]
  revision + §7.1 distribution + §10 resolved line), the SKILL doc v2.7.0
  (the fourth Tailwind v4 trap + the chrome-subtree audit pattern),
  `docs/Tailwind-V4-Validation-Report.md` (the project trap log appendix),
  this session log (`docs/session_14.md`),
  `docs/remediation-plan-session9.md`. `.env.example` re-verified
  (DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL cover all code
  references).
