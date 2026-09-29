# NexusLearn Remediation Plan — Session 16

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(the demo user; Playwright parity probes + agent-browser sessions with synced viewports at
1920×1080 + 375×667, plus the production standalone build on :3100 for the performance
surface). The audit re-verified every standing surface from sessions 1–15 and added TWO
fresh-eyes surfaces suggested by the session-15 transcript (`docs/session_27.md`): the
**scroll-position-restoration / navigation-transition sweep** and the **performance surface
(LCP/CLS/bundle-size)**.

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`, the session-14 `@source not` set including the
session-15 `worklog.md` addition — the compiled CSS stays app-source-only).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
193/193 e2e ✓ — the shipped session-15 tree is fully green (no post-gate regression
this time; the leak-spec-last rule held). All standing visual surfaces re-verified
GREEN at the byte-exact state: desktop heights 11/11, mobile heights 11/11,
CourseDetail ×9, class diffs (documented variances only), the space-y sweep (clean
×10), text diffs (IDENTICAL), the FULL mobile-menu battery on both sites (405px panel,
8 links at byte-identical positions, 4px pre-CTA gap, route-close, Escape-close,
scroll lock, /Home hero + scrolled states — **no Tailwind v4 display or breakpoint
bug**), the computed shadow sweep (46 documented form-variance pairs), the session-13
focus-ring pin (the slate-400 4px slot byte-identical), and the session-15 reveal
inventory (COUNT-MATCH on all 10 routes).

**Session-16 focus**: sessions 1–15 closed every static, content, state, computed-style,
cascade, font, preflight and entry-animation surface. This session's fresh-eyes surfaces
examined the NAVIGATION layer — what happens to scroll position, title, focus and layout
stability when the user moves between routes — plus the performance profile.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Back/forward scroll restoration: the reference snaps INSTANTLY, the clone GLIDES — and the glide exposes a restore-to-0 race.** The reference is a CSR SPA whose router never calls `scrollTo` — popstate restoration is the BROWSER-NATIVE instant snap (measured: mobile / footer-nav back → `saved=14483 → trajectory 14483`, one frame, done; desktop menu-nav back → 2000/3000 instantly; 10+ observations, zero misses). The clone (Next.js App Router) restores via `window.scrollTo(0, saved)` — which the session-13 universal `* { scroll-behavior: smooth }` pin (the same rule the reference ships) turns into a ~0.9–1.5s ANIMATED GLIDE (measured trajectories: desktop `9 → 233 → 1289 → 2214 → 2568 → 2772 → 2894 → 2963 → 2997 → 3000`; mobile `4 → 235 → 1092 → 3543 → … → 14483`; reproduced on BOTH the dev server and the production standalone build). Worse, when the navigation click fires while a smooth scroll is still in flight (Playwright `locator.click()` scroll-into-view on a footer link, mobile viewport), the clone's restoration races to **0** — 3/3 reproductions (the reference restores correctly under identical conditions). Root cause chain: (a) the reference's restoration is browser-native and immune to `scroll-behavior`; (b) Next.js's `scrollTo`-based restoration reads the CSS rule → animates; (c) the animated restore can be canceled at ≈0 by the competing scroll events of the mid-flight click sequence. The universal smooth rule itself is CORRECT parity (session 13 pinned it; the reference ships it) — the defect is its interaction with Next.js's restoration path, a surface no prior session probed. | **High** |
| 2 | **In-app navigation scroll semantics: the reference NEVER resets scroll (unmanaged SPA soft-nav); the clone resets to top (Next.js managed).** Measured on the reference across every path: nav-link click from scrolled position → the position CARRIES OVER, clamped by the new page's height at swap time (which, for data routes, is the CSR loading shell ≈1573px → max scroll 493): `/`@2000 → /Courses lands 493 (shell clamp), `/`@500 → /Courses lands 493, `/`@2000 → /AIAssistant lands 493 (real max), course-card click /Courses@800 → CourseDetail lands 492, footer link `/`@7000 → /Pricing lands 1289 (Pricing is static → full height immediately), same-route clicks are no-ops. The clone lands at TOP (scrollY 0) on every in-app navigation (Next.js default), the reset itself animated by the same smooth rule (`1441 → 1301 → 306 → 6 → 0`). **Decision — deliberate-better parity (the unhardened-reference family)**: the reference's carryover is a Base44 router artifact (no SPA scroll management), landing users mid-page on every scrolled navigation; exact replication is also impossible without replicating the CSR loading shell (a `scroll={false}` clone would land at 1441 where the reference lands at 493 — a third behavior that matches neither). The clone keeps Next.js's managed reset — the same family as the documented ARIA/scroll-lock/Escape hardening (AGENTS.md: "do not 'fix' the clone to match the reference's unhardened version"). The behavior is PINNED by spec (3c) so the decision is intentional and regression-guarded. | **Medium** (documented decision) |
| 3 | **`document.title` on soft navigation: the reference keeps the STALE title; the clone updates per-route.** Fresh loads carry correct per-route titles on BOTH sites (byte-identical: "Pricing \| NexusLearn" etc.). But after SPA soft-nav on the reference (`/` → /Pricing, /Courses, /About via nav links), the tab title stays the PREVIOUS route's ("NexusLearn" in all three cases) — the Base44 router never updates it. The clone updates correctly (Next.js metadata). **Decision — deliberate-better**: a stale tab title is an accessibility and UX defect any user would report; replicating it would require actively suppressing correct behavior. PINNED by spec (3d). | **Medium** (documented decision) |
| 4 | **Focus management after soft-nav: the reference keeps focus on the clicked link; the clone resets focus to body.** After a nav-link click the reference's `document.activeElement` remains the stale `<a>` (unmanaged CSR router); the clone moves focus to `body` (Next.js's managed pattern — the screen-reader-correct "new page" announcement). Same deliberate-better family as findings 2–3; framework-managed internals are too brittle to pin by spec — documentation only. | **Low** (documented) |
| 5 | **Reload scroll restoration: the reference lands at 0; the clone restores natively.** Reload at scroll 3000 on `/`: the reference's initial CSR shell is too short for the browser to restore → lands 0, stays 0; the clone's SSR ships full height → the browser's native restoration lands 3020. Structural CSR-vs-SSR variance (the mount-latency precedent from session 15); the clone's behavior is what every MPA does natively. No action; documented. | **Low** (accepted variance) |
| 6 | **Performance surface: VERIFIED AT PARITY (no action) — the profile recorded.** CLS **0.0000 on BOTH sites on every probed route** (/, /Courses, /login, /CourseDetail — the layout-stability metric is byte-equal). LCP/FCP comparable-or-better on the clone's production standalone build (localhost, same machine): `/` 1760/840 vs live 1892/1000 · `/Courses` 712/196 vs 1076/800 · `/login` 176/176 vs 1140/908 · `/CourseDetail` 800/244 vs 1236/1028 (the live's absolute numbers include real-network latency; the structural point is no clone-side pathology). Resource mix is structural: the live ships 1 cached CSR bundle + 6–7 XHR per route (htmlKB 3–6); the clone ships 12–15 code-split chunks + 16–24 RSC prefetches (htmlKB 13–49, the SSR payload). domNodes: `/` 916 vs 884, `/Courses` 487 vs 458 (the clone's hidden mobile panel + reveal wrappers — documented), /CourseDetail 2554 vs 128-at-sample (the live's CSR had not finished rendering; its settled count matches). | **Low** (methodology) |

### Verified matching (no action)

**Standing surfaces re-verified green on the session-16 baseline** (all at the
session-15 byte-exact state): desktop heights 11/11, mobile heights 11/11, CourseDetail
×9, class diffs on / (the documented gradient form), NAV (the documented panel mechanism
+ the session-9 dead-`mt-3` decision — re-confirmed via the NEW open-menu class diff:
live-only `mt-3` is the CTA's v3-space-y-killed class the session-9 remediation
deliberately drops; the rendered geometry byte-identical at 417/405/4px), FOOTER
(IDENTICAL), the space-y trap sweep (clean ×10), text diffs (IDENTICAL), the FULL
mobile-menu battery (panel 405 byte-exact, 8 links at byte-identical tops 81–369, CTA
417/h36, 4px pre-CTA gap, route-close ✓ both, Escape-close + scroll lock = the clone's
documented hardening, /Home hero + scrolled states byte-identical), the computed shadow
sweep (all diff lines in the three documented form families: oklab/rgba color forms,
9999px/infinity radius forms, empty-slot ring forms), the session-13 focus-ring pin
(the slate-400 `rgb(148, 163, 184) 0px 0px 0px 4px` slot byte-identical; the clone's
empty-slot prefixes = documented), and the session-15 reveal inventory (COUNT-MATCH ×10
routes: 40/12/10/12/6/13/3/5/0/40; the Y30/DONE split differences at a single sample
instant are the documented WAAPI-vs-framer timing artifacts; the end state is
spec-pinned).

**New-surface verifications at parity**: the reveal system's back-nav re-animation is
IDENTICAL (both sites re-hide at popstate and re-reveal in-view elements at the restored
position — measured 4/4 elements near scroll-3000 on both); same-route link clicks are
no-ops on both; fresh-load scroll starts at 0 on both; `history.scrollRestoration` is
"auto" on both; `document.title` on FRESH loads byte-identical; the mobile-menu link
nav restores scroll identically on both (6/6 clean trials on the clone, 3041/3000 on the
live); the CLS byte-equality (finding 6).

### Accepted variances (documented, no action)

Findings 2, 4 and 5 (the deliberate-better decisions + the structural CSR/SSR variance)
plus every previously documented variance (oklab color forms, infinity-radius forms,
empty-slot shadow forms, the gradient class form, the panel mechanism, the ARIA/
scroll-lock/Escape hardening, lucide path-count variants, the /login engine-default
font stack, the reveal system's WAAPI-vs-framer implementation, mount-time latency).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-16 parity` describe blocks
  (production build; the scroll specs run on the public surface, logged-out, matching
  the file's default storageState):
  - **Block 1 — the restoration instantness pin (finding 1)**: on `/` scroll to 3000,
    nav to /Courses, `page.goBack()` → sample `scrollY` at +250ms → it must be ≥ 90% of
    the saved position (the reference's native snap lands within one frame; the current
    clone glide is at ~43% at +250ms — RED now: measured 1289 of 3000).
  - **Block 2 — the mid-smooth-scroll click race pin (finding 1)**: mobile viewport
    (375×667): on `/` scroll to 3000, `locator.click()` the footer Pricing link (the
    scroll-into-view fires a smooth scroll; the click lands mid-animation — the exact
    measured repro), nav, `goBack()` → the restored position must be > 1000 (RED now:
    0; the fix restores 14219 — the position captured at click time).
  - **Block 3 — the managed nav reset pin (finding 2, GREEN by design)**: on `/`
    scrolled to 2000, click the /Courses nav link → after settle the clone lands at
    top (scrollY ≤ 5) — the deliberate-better decision, with the reference's
    carryover-493 behavior recorded in the spec comment.
  - **Block 4 — the title-on-soft-nav pin (finding 3, GREEN by design)**: click the
    /Pricing nav link → `document.title` becomes "Pricing | NexusLearn" (the
    reference's stale-title defect recorded in the comment).
  - **Block 5 — the CLS-zero guard (finding 6, GREEN by design)**: on `/` and
    /Courses, sum the buffered layout-shift entries over a 3s window post-load →
    expect 0 (guards the reveal system + image loading against future layout-shift
    regressions).

### Phase 2 — GREEN (implementation)

- [2a] **`src/components/ScrollRestoreNormalizer.tsx`** (new client component, renders
  null): on `popstate`, set `document.documentElement.dataset.scrollRestore = ""` and
  clear it after 700ms (covers Next.js's post-commit restoration window, measured
  <300ms; re-arms on repeated popstates). Registered in a `useEffect` — the listener
  lands AFTER Next.js's own popstate listener but Next.js issues its `scrollTo` only
  after the route re-render commits (an effect), so the suppression attribute is always
  in place before the restore fires (verified by prototype: instant restoration on dev
  AND the production standalone build, 2/2 + 2/2).
- [2b] **`src/app/globals.css`** — one scoped rule at the end of the unlayered pin
  block (after the session-14 space-y pins):
  `html[data-scroll-restore], html[data-scroll-restore] * { scroll-behavior: auto; }`
  — UNLAYERED, so it beats the session-13 universal pin's `@layer base` origin
  regardless of specificity (and outranks it on specificity too: 0,1,1 vs 0,0,0);
  it applies only while the attribute is set. The universal pin itself is
  untouched (the session-13 spec stays green).
- [2c] **`src/app/layout.tsx`** — mount `<ScrollRestoreNormalizer />` (one line).
- [2d] **Docs**: README (badge + testing rows + the restoration behavior), AGENTS.md
  (the gotcha: the smooth-pin × Next-restoration interaction + the deliberate-better
  navigation decisions), CLAUDE.md (pyramid + the normalizer), PAD ([S16] + §7.1),
  `nexuslearn-template_SKILL.md` (v3.4.0 — the navigation-transition surface + the
  scroll-audit methodology), this plan (results), `docs/session_28.md`, the repo
  worklog.

### Phase 3 — VERIFY (gates + live re-audit)

- [3a] Full gate suite: lint → typecheck → 31/31 unit → build → e2e (193 + the new
  session-16 specs, zero regressions).
- [3b] Live-vs-clone re-verification on the dev server: the restoration battery
  (desktop + mobile × nav-link/footer-link/menu-link paths — instant, correct position,
  no race) + the standing surfaces (heights ×11 ×2 — the normalizer must move no
  layout; class diffs; the mobile battery; the shadow sweep; the focus pin; the reveal
  inventory).
- [3c] **The leak spec re-runs LAST** after every doc write (the session-15 process
  rule — including this plan's own canary-adjacent mentions).
- [3d] Screenshots: the standard set under `docs/screenshots/` (the session's surfaces
  are behavioral — scroll positions — which stills cannot capture directly; the set
  re-certifies the rendered state on the remediated build).
- [3e] `.env.example` re-verified (the session changes no environment surface).
- [3f] Commit to main + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py`).

### Phase 3 results (executed — recorded after GREEN)

- **RED verified**: Block 1 (the instantness pin) failed against the pre-fix
  production build for exactly the pinned reason (the glide: ~43% of the distance
  at the +250ms sample). Blocks 2–5 passed by design — with one GREEN-phase
  correction to the record: **the mid-smooth-scroll race is DEV-SERVER-ONLY**
  (re-verified 3/3 against the production standalone build: the exact failing
  sequence restores 14219 correctly; the race reproduced 3/3 on the dev server's
  slower streaming). Block 2 therefore pins the correct production behavior (and
  guards the race class) rather than red-verifying — the finding-1 severity for
  the shipped production tree rests on the GLIDE alone.
- **GREEN corrections**: (a) the first e2e run after the build reused a stale
  manually-started :3100 server (the pre-fix build) — both "failures" were the
  stale server; after killing it, 5/5 green. Lesson recorded: the playwright
  `reuseExistingServer` default reuses ANY live server on the port — kill manual
  servers before gated runs. (b) A pre-existing **session-15 spec flake** surfaced
  in the full-suite run: the pre-hide style-string probe can land in the
  SSR→normalized serialization gap (React's compact `opacity:0;transform:…` form
  before the controller re-serializes to the live's spaced form) — the spec now
  accepts BOTH serializations (the pin's intent — the family + values + end
  state — unchanged; verified stable 3/3 + the full suite green).
- **Gates**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · 198/198 e2e ✓
  (193 → 198, zero regressions — every session-4/5/8/9/10/11/12/13/14/15 spec
  green through the layout/CSS changes).
- **Visual re-verification**: the restoration battery ALL GREEN (desktop + mobile
  nav-link restores land INSTANT at exactly 3000; the dev-only footer race now
  restores 14219; forward restoration correct; the universal smooth rule still
  animates every programmatic scroll outside popstate — the session-13 pin
  intact); every height still byte-exact (desktop 11/11, mobile 11/11); the
  class diffs (documented variances only), text diffs (IDENTICAL) and the reveal
  inventory (COUNT-MATCH ×10) unchanged. 24 screenshots re-captured — 20 of them
  byte-identical to the session-15 files (the remediation moved no rendered
  pixel; the 4 differing files are full-page-stitch timing artifacts).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The 700ms suppression window closes before a slow restore fires (RSC refetch on back) | Next.js restores from the router cache on back-nav (measured <300ms); if a future case exceeds it, the restore glides (the pre-fix behavior) — degrades gracefully, never wrong. |
| The suppression attribute leaks (a stuck `data-scroll-restore`) and permanently kills smooth scrolling | The attribute is set ONLY in the popstate handler and always cleared by the timer; a duplicate popstate re-arms (clearTimeout + reset); worst case a reload clears it (it is not persisted). |
| The attribute selector collides with an existing `data-*` usage | `data-scroll-restore` is unique (grep-verified against src/); the rule is scoped to `html[data-scroll-restore]` descendants only. |
| The timing-based Block 1/2 assertions flake on slow CI | The +250ms sample point sits between the instant landing (<100ms, warm) and the glide's 43% mark — a 2x margin both ways; Block 2's threshold (>1000) sits far from both 0 and 14219. |
| The race fix masks a deeper Next.js scroll bug | The fix addresses the CSS-interaction layer only (the measured root cause); the captured-position semantics (14219 vs 14483 mid-flight) match the reference's browser-native capture behavior. |
