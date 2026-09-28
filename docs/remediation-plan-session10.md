# NexusLearn Remediation Plan — Session 10

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; desktop 1920×1080 + mobile 375×667 height sweeps across 11
routes, a like-for-like CourseDetail sweep across all 9 courses with the live course ids,
per-route unique class-set diffs on the `main` + `nav` + `footer` subtrees, a ground-truth
computed-margin walk of every `space-y-*`/`space-x-*` container on 12 clone routes, head
metadata spot checks on 3 routes, course-data spot checks (prices, display order,
testimonials, lesson-row counts), the not-found state comparison, the signed-out
dashboard state, an AI-chat round trip, and the full mobile-menu interaction battery on
both sites; agent-browser sessions `live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
128/128 e2e ✓ (session-9 state, commit `d0fcaff`, confirmed green on the fresh clone).

**Session-10 focus**: sessions 1–9 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order,
section-design, seed-idempotency, space-y-engine and navbar-chrome parity. This
session re-swept every surface with fresh eyes — again with particular attention to the
**mobile navigation menu** (the standing Tailwind v4 watchpoint) — and found the
session's findings concentrated in **route-state chrome**: the `/Home` navbar visual
state (a surface no previous audit had compared, because `/Home` was only ever checked
as "renders the landing content + the −30px height band", never its navbar state) and a
documentation/pinning gap on the 404 wrapper.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **`/Home` renders the WHITE-nav state on the clone; the live app renders `/Home` with the full landing HERO treatment.** Measured on both sites at 1920×1080 and 375×667: on `/Home` at scroll 0 the live navbar is `bg-transparent` with the `text-white` logo and the `text-white/80` mobile trigger (byte-identical to `/`), and it flips to `bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm` after scrolling — exactly like `/`. The clone renders the white-nav state on `/Home` at scroll 0 (`bg-white/95…`, `text-gray-900` logo, `text-gray-700` trigger). Root cause: `src/components/Navbar.tsx:59` — `const overHero = pathname === "/" && !scrolled;` — the hero detection covers only `/`, while the active-link logic directly below (lines 95–100) already treats `/Home` as the landing. The live `/Home` page IS the landing (height 7949 = `/` on both sites), so its navbar must behave like the landing's. | **High** |
| 2 | **404 wrapper: the clone's `main.min-h-dvh` vs the live's landmark-less `div.min-h-screen` — deliberate hardening, but undocumented at the component and unpinned.** The live 404 renders `div#root > div.min-h-screen.flex.items-center.justify-center.p-6.bg-slate-50` with NO `main` element, NO nav, NO footer; the clone renders `main.min-h-dvh.flex…` (same inner content byte-for-byte; heights equal at both viewports). The `min-h-dvh` page-root form is the project's documented mobile URL-bar-warp hardening (SKILL.md "Page roots use min-h-dvh (not min-h-screen)"; session-4 remediation [3a]; AGENTS.md gotcha 8) and the `main` landmark is the same class of invisible a11y improvement as the ARIA wiring on the mobile trigger. But unlike the trigger, the 404's docblock does NOT record the decision, and no spec pins the wrapper — a future agent auditing chrome parity could "fix" it backwards to the reference's landmark-less div. | **Low** (document + pin; no markup change) |

### Verified matching (no action)

**Mobile navigation menu — full battery on BOTH sites at 375×667 (the standing Tailwind
v4 watchpoint — NO display-mismatch bug, NO space-y resurrection):** the trigger is the
BARE reference string in both states (`md:hidden p-2 rounded-lg text-white/80` over the
hero, `md:hidden p-2 rounded-lg text-gray-700` on white-nav pages); the open panel
measures the reference 404px inner / 405px total on BOTH sites; the panel CTA renders
the reference 4px pre-CTA gap (clone `block` + prev-sibling 4px margin-block-end = live
`block mt-3` under the v3 engine's 4px); both "My Dashboard" buttons carry the shadcn
base trio + `hover:bg-primary/90` verbatim; 8 panel links; desktop row `display:none`
at 375px; route-change closes on both; icon swap `lucide-menu`↔`lucide-x`; live has NO
Escape close, NO scroll lock, NO ARIA and conditionally mounts the panel — the clone's
grid-rows animation + ARIA + scroll lock + Escape stay as documented deliberate
hardening. **The space-y trap sweep is clean on all 12 clone routes** (no `space-*`
container anywhere in the app has a child with an explicit `mt-*`/`mb-*`/`my-*`
utility). Desktop heights: byte-exact on /AIAssistant, /Pricing, /Contact,
/BecomeInstructor, /Dashboard, /login, 404; documented font bands on / (−30), /Home
(−30), /Courses (−49), /About (−29). Mobile heights: ALL exactly at the documented
session-8 bands ( / −299, /Courses −121, /AIAssistant −50, /Pricing −46, /About −45,
/Contact −22, BI −58, /Dashboard −22, /login −44). CourseDetail like-for-like on all 9
courses with the live course ids: 7× +1px, WebDev/UIUX −25px (documented bands; 380
lesson rows byte-identical on WebDev). Class-set diffs: `main` subtrees IDENTICAL on
/AIAssistant, /About, /BecomeInstructor, /Pricing, /Dashboard, /login, /Contact; the
documented gradient class form on / + /Courses (computed-identical) and the documented
panel-mechanism clone-only classes in the `nav` subtree; footers IDENTICAL everywhere.
Head metadata parity (title, og:title, og:url, canonical — origin aside). Course data
identical (9 prices, display order, testimonials order/avatars, lesson rows). The
CourseDetail unknown-id in-page not-found state identical. Signed-out Dashboard renders
the zeroed "Welcome back" state on the clone (reference behavior). AI chat returns real
LLM answers on the clone. Prices/testimonials/categories match.

### Accepted variances (documented, no action)

The font-metric wrap bands listed above (live resolves system "Inter" with no
@font-face); the hero gradient class form (clone's sRGB arbitrary form — computed
identical); the clone's a11y hardening (ARIA wiring, scroll lock, Escape, `main`
landmark on the 404, `min-h-dvh` page roots, alt text, aria-hidden on icons); live's
scroll-reveal wrappers + classless per-card wrapper divs; real enrollment vs live's
dead Enroll button; working Python course image; clone's dev-only Next.js dev-tools
overlay; lucide path-count variants (identical glyphs); the /Contact subject trigger
class ORDER (same utilities).

### Audit methodology note (recorded for future sessions)

The initial CourseDetail sweep produced an apparent +1300…+3300px drift that was an
**audit-script bug**: the clone agent-browser session was still at 375×667 from the
mobile battery while the live session had been reset to 1920×1080 (the sweep script
reset only the live viewport). Every height comparison MUST set BOTH sessions'
viewports in the same command (the shipped `scripts/audit-heights.sh` does this; ad-hoc
sweeps must too). After correcting, all 9 CourseDetail rows landed on the documented
bands. The lesson is recorded in the SKILL doc's audit checklist.

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` new `session-10 parity` describe block (desktop):
  - **`/Home` renders the hero-state navbar**: on `/Home` the `nav` carries
    `bg-transparent` (NOT `bg-white/95`) and the logo span is `text-white` (RED now:
    white-nav + `text-gray-900`).
  - **`/Home` flips to the white-nav after scroll**: `mouse.wheel(0, 400)` on `/Home`
    → the `nav` carries `bg-white/95 backdrop-blur-xl` (RED now: the white state is
    already on at scroll 0, so the assertion pair "transparent at 0 AND white after
    scroll" cannot pass pre-fix).
  - **The 404 wrapper pins the deliberate hardening**: the not-found route renders
    `main.min-h-dvh` (documents + pins the variance vs the live landmark-less
    `div.min-h-screen` — GREEN now, exists to prevent backwards "fixes").
- [1b] `tests/e2e/mobile-navigation.spec.ts` new `session-10 parity` describe block
  (mobile viewport, same file conventions):
  - **On `/Home` the trigger is the hero string**: EXACTLY
    `md:hidden p-2 rounded-lg text-white/80` (RED now: `text-gray-700`).
- [1c] Verify RED: run the 3 new failing specs against the current build — expect the
  3 /Home assertions to FAIL for exactly the pinned reasons (white-nav state), and the
  404 hardening pin to PASS (it pins existing state; it is a documentation guard, not a
  fix spec — marked as such in the spec comment).

### Phase 2 — GREEN: the Navbar fix + the 404 docblock

- [2a] `src/components/Navbar.tsx:59`:
  `const overHero = (pathname === "/" || pathname === "/Home") && !scrolled;` — and the
  "Over hero" comment updated to record that BOTH routes render the landing hero (the
  reference footer links to `/Home`; the live app renders it with the identical
  hero-state navbar + scroll flip). No other line changes: the scroll listener, the
  active-link logic (already covers `/Home`), the trigger, the panel and the button
  strings are untouched.
- [2b] `src/app/not-found.tsx` docblock: document the two deliberate variances (the
  `main` landmark + `min-h-dvh` root vs the live `div.min-h-screen`) with the same
  rationale references as the Navbar's ARIA note (SKILL.md page-root rule; live 404
  ships no landmark at all).

### Phase 3 — Verification

- [3a] Full gate: `lint → typecheck → test → build → test:e2e` (128 → 132 expected:
  +4 session-10 specs).
- [3b] agent-browser re-verification vs live (BOTH sessions at matching viewports):
  the clone `/Home` navbar transparent at scroll 0 + `bg-white/95` after scroll =
  live byte-exact; the mobile `/Home` trigger `text-white/80` = live; the `/` navbar
  unchanged (regression check); the `/Home` height band unchanged (−30); the chrome
  class diff on `/Home` still shows only the documented variances; the mobile battery
  re-run green on `/` and `/Home`.

### Phase 4 — Screenshots & docs

- [4a] Fresh dev-server screenshots → `docs/screenshots/` (the standard route set —
  desktop + mobile + the open mobile menu — plus `/Home` hero-state capture that shows
  the fix, and the 404).
- [4b] Docs: README (badge 163, testing rows + the session-10 description), AGENTS.md
  (gotcha 6/8 updates: `/Home` renders the landing AND its hero-state navbar; 132
  specs), CLAUDE.md (pyramid 31+132, parity behaviors), PAD ([S10] revision + §10),
  `nexuslearn-template_SKILL.md` v2.8.0 (the `/Home` hero-state navbar + the
  synced-viewport audit rule), `.env.example` re-verify, this plan,
  `docs/session_16.md` session log, `worklog.md`.

### Phase 5 — Ship

- [5a] Final full gate; single commit on `main`; SSH-wrapper push (with `--remote`
  pointed at this repo); operator key shredded.

---

## C. Extracted reference data (verbatim live strings)

**Live `/Home` navbar (1920×1080, scroll 0)**:
`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent`;
logo span `text-lg font-bold text-white transition-colors duration-300`;
mobile trigger `md:hidden p-2 rounded-lg text-white/80`.

**Live `/Home` navbar (scrolled >24px)**:
`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/95
backdrop-blur-xl border-b border-gray-100 shadow-sm` — identical to every other
route's scrolled state and to `/`.

**Live 404 wrapper**: `div#root > div.min-h-screen.flex.items-center.justify-center.p-6.bg-slate-50`
(no `main` element, no nav, no footer; the fixed `z-[100]` toast column is base44
platform chrome, not app markup). Clone (deliberate, now documented):
`main.min-h-dvh.flex.items-center.justify-center.p-6.bg-slate-50`.
