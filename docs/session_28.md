# Session 16 — Parity pass: the navigation-transition surface (scroll restoration, titles, focus) + the performance profile

Continuing from session 15 (`ecb4846` + the pulled `docs/session_27.md`
transcript, remote at `3257f45`). Sessions 1–15 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state, computed-shadow, focus-ring, scroll, card-structure,
rendered-font, preflight, engine-cascade and reveal-entry parity — every
height measurement byte-exact, the reveal inventory matching on all 9
routes. This session re-swept every standing surface and added TWO
fresh-eyes audit surfaces (both suggested by the session-15 transcript):
the **scroll-position-restoration / navigation-transition sweep** and the
**performance surface (LCP/CLS/bundle-size)**.

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667 + the production standalone build)

6 findings → `docs/remediation-plan-session16.md`. Highlights:

1. **Back/forward scroll restoration: the reference snaps INSTANTLY, the
   clone GLIDED (High).** The reference is a CSR SPA whose router never
   calls `scrollTo` — its popstate restoration is the browser-native
   instant snap (10+ observations, zero misses). The clone's Next.js App
   Router restores via `window.scrollTo` after the route re-render
   commits — which the session-13 universal `* { scroll-behavior: smooth }`
   pin (correct parity; the reference ships the same rule) turned into a
   ~0.9-1.5s glide, reproduced on both the dev server and the production
   build. On the dev server only, a navigation click fired mid-smooth-scroll
   (a footer link clicked while its scroll-into-view animation settles)
   additionally raced the restore to 0 (3/3; the production build restores
   correctly under the identical sequence — verified 3/3).
2. **The reference's unmanaged in-app navigation scroll carryover (Medium —
   deliberate-better decision).** The reference NEVER resets scroll on any
   in-app navigation — the position carries over, clamped by the new page's
   CSR LOADING SHELL height (measured: `/`@2000 → /Courses lands 493 — the
   shell is ~1573px at swap time; `/`@7000 → /Pricing lands 1289;
   /Courses@800 → CourseDetail lands 492; same-route clicks are no-ops).
   The clone keeps Next.js's managed reset-to-top — exact shell-clamp
   replication is impossible without faking the loading shell, and the
   reference behavior lands users mid-page. Pinned by spec.
3. **The stale `document.title` on soft navigation (Medium —
   deliberate-better decision).** Fresh-load titles are byte-identical on
   both sites — but after SPA soft-nav the reference's tab KEEPS THE
   PREVIOUS ROUTE'S TITLE ("NexusLearn" after nav to /Pricing, /Courses,
   /About; its router never touches the title). The clone keeps the
   per-route update. Pinned by spec.
4. **Focus after soft-nav (Low — documented).** The reference keeps focus
   on the clicked link; the clone resets to body (the a11y-correct
   pattern). Framework internals — documentation only.
5. **Reload scroll restoration (Low — accepted structural variance).** The
   reference lands at 0 (its CSR shell is too short for the browser's
   native restoration); the clone restores natively (SSR full height).
6. **Performance surface: VERIFIED AT PARITY.** CLS **0.0000 on BOTH sites
   on every probed route**; the clone's production LCP/FCP
   comparable-or-better (1760/840 vs 1892/1000 on /, 712/196 vs 1076/800
   on /Courses, 176/176 vs 1140/908 on /login, 800/244 vs 1236/1028 on
   /CourseDetail); the resource mix is structural (1 cached CSR bundle +
   XHR vs 12-15 code-split chunks + RSC prefetches).

**Standing surfaces re-verified green at the byte-exact state**: desktop +
mobile heights ×11 routes, CourseDetail ×9, class diffs (documented
variances only — including the NEW open-menu class diff, which re-confirmed
the CTA's live-only `mt-3` as the documented session-9 dead-class decision
with byte-identical rendered geometry: panel 405, CTA top 417, 4px gap),
the space-y sweep (clean ×10), text diffs IDENTICAL, the FULL mobile-menu
battery on both sites (no Tailwind v4 display or breakpoint bug), the
computed shadow sweep (all diff lines in the three documented form
families), the session-13 focus-ring pin (the slate-400 slot
byte-identical), the session-15 reveal inventory (COUNT-MATCH ×10 routes)
**and** the reveal system's back-nav re-animation (IDENTICAL on both
sites — both re-hide at popstate and re-reveal at the restored position).

## Remediation (TDD)

5 new e2e specs (the session-16 navigation-transition blocks) written RED
first — Block 1 (the restoration-instantness pin) verified failing against
the pre-fix production build for exactly the pinned reason (the glide at
~43% of the distance at the +250ms sample); Blocks 2-5 green by design
(the race turned out dev-only; 2-4 pin the deliberate-better decisions,
5 is the zero-CLS guard) → GREEN:

- **`src/components/ScrollRestoreNormalizer.tsx`** (new, renders null): on
  popstate, set `data-scroll-restore` on `<html>` for 700ms.
- **`src/app/globals.css`**: the scoped UNLAYERED rule
  `html[data-scroll-restore], html[data-scroll-restore] * { scroll-behavior:
  auto; }` — beats the @layer-base universal pin for exactly the popstate
  window, so the restoration snaps like the reference while every other
  programmatic scroll keeps the pinned smooth behavior (verified: a
  programmatic `window.scrollTo` still animates 77 → 781 → 1467 → … → 2000).
  The mechanism was PROVEN BY PROTOTYPE before implementation (injected
  style + listener: instant restoration on dev AND production, 2/2 each).
- **`src/app/layout.tsx`**: mounts the normalizer.

GREEN-phase corrections (both caught by the verification battery): (a) the
first post-build e2e run silently reused a stale manually-started :3100
server (the pre-fix build) — kill manual servers before gated runs (the
playwright `reuseExistingServer` default); (b) a pre-existing session-15
spec flake surfaced — the pre-hide style-string probe can land in the
SSR→normalized serialization gap (React's compact form vs the live's spaced
form); the spec now accepts both serializations (intent unchanged, verified
stable 3/3).

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **198/198 e2e ✓** (193 → 198,
zero regressions). The restoration battery on the remediated dev build:
desktop + mobile nav-link restores land INSTANT at exactly 3000, the
dev-only footer race now restores 14219, forward restoration correct, and
the session-13 universal-smooth spec still green.

## Ship

- 24 screenshots re-captured in `docs/screenshots/` (the standard 12 desktop
  routes through the incremental reveal sweep + the 5 login views + 6 mobile
  + both open-menu states) — **20 of them byte-identical to the session-15
  files** (the remediation moved no rendered pixel; the 4 differing files
  are full-page-stitch timing artifacts).
- Docs aligned: README (badge 229 + the session-16 row), AGENTS (gotchas
  42-43 — the smooth-pin × Next-restoration interaction + the
  deliberate-better navigation decisions + the components list), CLAUDE
  (pyramid 31+198), PAD ([S16] + §7.1), `nexuslearn-template_SKILL.md`
  v3.4.0 (§4.4f the navigation-transition surface + Appendix A surface 17 +
  the 16-session description), `docs/remediation-plan-session16.md` (with
  the GREEN-phase corrections), this session log (`docs/session_28.md`).
  `.env.example` re-verified (the session changed no environment surface).
  The leak spec re-ran LAST, after every doc write (the session-15 process
  rule).
