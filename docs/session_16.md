# Session 10 — Parity pass: the /Home hero-state navbar + the 404 hardening pin

Continuing from session 9 (`b8bb845` + the pulled `docs/session_15.md`
transcript, remote at `d0fcaff`). Sessions 1–9 closed static, shell, content,
sub-section, interactive-state, head-metadata, OG-identity, class-verbatim,
display-order, section-design, seed-idempotency, space-y-engine and
navbar-chrome parity; this session re-swept every surface with fresh eyes —
again with particular attention to the **mobile navigation menu** (the standing
Tailwind v4 watchpoint) — and found the session's findings concentrated in
**route-state chrome**: `/Home` had passed every previous audit as "renders the
landing content at the documented −30px height band" while its NAVBAR rendered
the wrong visual state, a surface no audit had ever compared per-route.

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667)

2 findings → `docs/remediation-plan-session10.md`. Highlights:

1. **The /Home hero-state navbar (High).** The live app renders `/Home` (the
   reference footer target) with the FULL landing hero treatment:
   `bg-transparent` navbar + `text-white` logo + `text-white/80` mobile
   trigger at scroll 0, flipping to `bg-white/95 backdrop-blur-xl` after
   scroll — byte-identical to `/` (verified at both viewports). The clone's
   `overHero` detection (`Navbar.tsx`) covered only `/`, so `/Home` shipped
   the white-nav state over its own dark hero. The active-link logic 40 lines
   below already treated both routes as the landing — only the visual state
   drifted. Found by clicking the mobile panel's Home link during the battery
   and noticing the trigger class flip to `text-gray-700` on arrival.
2. **The 404 wrapper hardening gap (Low — documentation/pinning).** The live
   404 ships a landmark-less `div.min-h-screen` inside `#root` (no `main`,
   no nav, no footer); the clone deliberately ships `main.min-h-dvh` (the
   documented page-root dvh hardening + a `main` landmark — the same doctrine
   as the Navbar's ARIA wiring). The decision was never recorded at the
   component and no spec pinned it — a future chrome audit could have "fixed"
   it backwards. Now documented in the component docblock + pinned.

**Audit-methodology lesson (recorded in the SKILL doc):** the initial
CourseDetail like-for-like sweep reported +1300…+3300px drift — an audit-script
bug: the live session had been reset to 1920×1080 while the clone session was
still at 375×667 from the mobile battery. After syncing viewports, all 9
courses landed exactly on the documented bands (7× +1px, WebDev/UIUX −25px).
Rule: set BOTH sessions' viewports in the same command.

**Re-verified green (no action):** the mobile navigation menu on BOTH sites —
the full battery (trigger bare strings in both nav states, icon swap, 8 panel
links, desktop row `display:none`, route-change close, the 404px inner/405px
open panel, the 4px pre-CTA gap via the session-9 `block` form, both My
Dashboard buttons on the shadcn base trio + `hover:bg-primary/90`; live has no
Escape/scroll-lock/ARIA and conditionally mounts the panel — the clone's
hardening stays). The space-y trap sweep on 12 clone routes: clean. Desktop
heights byte-exact on /AIAssistant, /Pricing, /Contact, /BecomeInstructor,
/Dashboard, /login, 404; documented bands on / (−30), /Home (−30), /Courses
(−49), /About (−29). Mobile heights ALL exactly at the documented session-8
bands. CourseDetail like-for-like on all 9 courses (documented bands; 380
lesson rows byte-identical on WebDev). Class-set diffs: only the documented
variances (gradient class form, panel mechanism, Contact trigger order).
Head metadata per route (titles, OG, canonicals — origin aside). Course data
(prices, display order, testimonials, lesson rows), the CourseDetail
not-found state, the signed-out Dashboard, AI chat (real answers), newsletter
and contact flows.

## Remediation (TDD)

- **RED first**: 5 new e2e specs (the `session-10 parity` blocks — the /Home
  hero-state navbar on desktop (transparent + white logo at scroll 0), the
  scroll flip to the white-nav, the /Home mobile trigger as the hero string,
  the /Home panel geometry guard (405px + margin-top 0), and the 404 wrapper
  hardening pin) — 3 verified failing against the pre-fix build for exactly
  the pinned reasons; the 2 pin/guard specs green (they pin existing state).
- **GREEN**: `src/components/Navbar.tsx` — `overHero` now covers BOTH `/` and
  `/Home` (one line + comments); `src/app/not-found.tsx` — the docblock
  records the two deliberate variances (`main` landmark, `min-h-dvh` root).
- Gates: **133/133 e2e** (128 → 133), zero regressions. Visual re-verification
  on the dev server: the clone `/Home` navbar transparent + white logo at
  scroll 0 and `bg-white/95` after scroll = live byte-exact; the `/` and
  `/Courses` navbar states unchanged (regression check); the mobile `/Home`
  trigger `text-white/80` = live; the `/Home` mobile height band −299 = `/`;
  the `/Home` chrome class diff still shows only the documented variances.

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **133/133 e2e ✓** (128 → 133).

## Ship

- 19 fresh dev-server screenshots in `docs/screenshots/` (12 desktop routes
  incl. the new `home-hero-state--desktop.png` + the 404, 5 mobile incl.
  `home-hero-state--mobile.png`, and both open-menu captures:
  `mobile-menu-open--mobile.png` (landing) + `home-mobile-menu-open--mobile.png`
  (/Home hero state)).
- Docs aligned: README (badge 164, testing rows + the session-10 description),
  AGENTS (gotcha 6 update: /Home renders the landing WITH its hero-state
  navbar; 133 specs), CLAUDE (pyramid 31+133, parity behaviors, route bullet),
  PAD ([S10] revision + §7.1 distribution + §10 resolved line),
  the SKILL doc v2.8.0 (the route-STATE audit pattern + the synced-viewport
  rule + the 10-session description), `docs/remediation-plan-session10.md`,
  this session log (`docs/session_16.md`). `.env.example` re-verified
  (DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL cover all code
  references; no new vars).
