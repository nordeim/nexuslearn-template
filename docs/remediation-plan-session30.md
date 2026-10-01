# NexusLearn Remediation Plan — Session 30

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100 booted with
the exact Playwright webServer env; raw fetch for the API-level probes; the
Next.js 16.3.6 `node_modules` source for the framework-contract evidence).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-29 tree, commit
`ad7bc2e` on top of the pushed `818e648`): lint ✓ · typecheck ✓ · 53/53 unit
✓ · build ✓ · **278/278 e2e ✓** (5.2m, re-verified this session on the
freshly cloned workspace). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` recreated at
the repo root by db:push + db:seed; `.env.example` byte-identical; `db/` at
the repo root).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The enrollment-progress cross-course integrity gap (API surface, fresh-eyes family 1 — request-payload integrity)**: `POST /api/enrollments/progress` validates that the ENROLLMENT belongs to the caller but never validates that the LESSON belongs to the enrollment's course. A signed-in user can submit a `lessonId` from a DIFFERENT course (or any other enrollment's lesson) and the route upserts a `LessonProgress` row linking the enrollment to a foreign lesson — **verified live against the running server**: login → enroll in `seed-1` (WebDev, 380 lessons) → POST progress with `seed-2`'s (DataScience) first lesson id → **200 + `completedLessons: 1`** — the foreign row persists. Consequences: (a) the progress percentage divides foreign completions by the own course's total — on a shorter course the inflation is larger (a 95-lesson course can be driven to 100% by marking 95 foreign lesson ids, awarding a completedAt + "Completed" stat the user never earned); (b) cross-course rows land in the DB (invisible data corruption — the dashboard checklist filters them out, so nothing ever surfaces the inconsistency); (c) the `completedLessonIds` payload carries ids the client never asked for. The route already 400s nonexistent lesson ids (the FK constraint throw is caught) — only the EXISTING-but-foreign class slips through. | MEDIUM (data integrity on the clone's own deliberate-better enrollment feature — the live's Enroll Now is inert, so this is not a parity axis; it is a defect in the clone's own functional surface) | **FIX: validate the lesson belongs to the enrollment's course before the upsert (400 with the house `{ error }` shape otherwise) + e2e pin (RED first)** |
| 2 | **The missing Next.js `data-scroll-behavior="smooth"` contract (framework-contract surface, fresh-eyes family 2 — the router-scroll modality)**: the root layout's `<html>` does not carry `data-scroll-behavior="smooth"`, so the App Router's programmatic scrolls run UNSUPPRESSED under the session-13 universal `* { scroll-behavior: smooth }` pin. Evidence (three independent layers): (a) **the dev console warning** — "Detected `scroll-behavior: smooth` on the `<html>` element. To disable smooth scrolling during route transitions, add `data-scroll-behavior="smooth"` to your <html> element." — fires on the FIRST client-side navigation (invisible to every previous console sweep because those used per-route `page.goto()` full page loads; a client-side transition — the login-form submit — is what surfaces it); (b) **the Next.js 16.3.6 source** — `node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js` checks `html.dataset.scrollBehavior === 'smooth'` and only then wraps the router's scrolls in a temporary `scroll-behavior: auto` (the caller: `client/components/layout-router.js`, lines 195/269 — the App Router's scroll reset + restore paths); without the attribute it warns (dev) and runs the scroll unsuppressed; (c) **the glide itself is documented in the session-16 spec** — "The reset itself animates under the universal smooth rule — wait out the glide (~600ms for 2000px)" — the nav reset-to-top on every in-app navigation glides instead of snapping (the popstate window is already fixed by ScrollRestoreNormalizer; the FORWARD nav reset never was). The fix is Next.js's own documented contract for exactly this configuration (https://nextjs.org/docs/messages/missing-data-scroll-behavior): add the attribute → the router's scroll operations become instant while every user-facing smooth scroll (anchor clicks, the Radix Select viewport, scroll-into-view) keeps the reference parity pin untouched. | MEDIUM (a framework contract the repo violates + a ~600ms nav-reset glide on every in-app navigation; dev-console hygiene) | **FIX: add `data-scroll-behavior="smooth"` to the root layout's `<html>` + e2e pins (the attribute contract, the instant-reset behavior, the clean console) + update the session-16 spec comment** |
| 3 | **Three stray `{ }` dead-code JSX artifacts (code-quality surface)**: `src/components/CourseCard.tsx:49`, `src/components/CourseCard.tsx:99` and `src/components/dashboard/MyCourses.tsx:90` each carry a bare `{ }` JSX expression — leftovers from the session-28 loading-attribute removal (the placeholder where the removed props' comment block moved). Zero rendering impact (they compile to nothing), but they are exactly the dead-code class the repo's quality standards reject, and they sit in the two most-shared components. | LOW (code quality; no behavior change) | **FIX: remove the three lines (verified no rendering impact by the full e2e suite staying green)** |
| 4 | **Every standing surface re-verified at the documented session-29 state**: the full baseline gate (lint, typecheck, 53/53 unit, build, **278/278 e2e**); **heights ×9 routes ×2 viewports byte-exact 18/18** (`/` 7949/15150, `/Courses` 2521/6115, `/Pricing` 2369/4373, `/About` 2209/4161, `/Contact` 1573/2631, `/BecomeInstructor` 2477/4785, `/AIAssistant` 1573/2204, `/Dashboard` 1573/2271, `/login` 1080/762); **normalized innerText 18/18 identical**; **tag-of-shared-class drift 0** (the documented SVG-subtree-skip methodology — inline-SVG children like `polyline` differ by design between the live's hand-inlined icons and lucide-react's, and belong to no audit surface); the **mobile-menu battery** (the user-directed Tailwind v4 watch): trigger classes BYTE-IDENTICAL (`md:hidden p-2 rounded-lg text-white/80`), trigger geometry 40×40 @ (319,12) identical, open panel NAV 375×469 IDENTICAL, per-link geometry BYTE-IDENTICAL (y 81/129/177/225/273/321/369/417, heights 44×7+36), route-change close on both sites (the clone-only ARIA/scroll-lock/Escape hardening as documented). **No Tailwind v4 display, breakpoint or space-y bug.** | — | Verified |
| 5 | **The cold-dev-server mobile-panel tap flake (probe-context note)**: during the FIRST three dev-server boots of this session's audit, three isolated occurrences of a panel-link tap/click not navigating (menu stayed open, pathname unchanged) — unreproducible across 11 consecutive subsequent repetitions of the identical flow (touch + tap, touch + click, non-touch + click, dual-browser contention variants), GREEN in the full e2e suite (production standalone), and verified working manually against the production standalone server booted with the exact Playwright env. The failing runs all coincided with the dev server's cold on-demand compile under concurrent live-site probing (CPU saturation delaying hydration past the interaction). Recorded as a probe-context artifact — no code action (no reproduction, no production impact). | INFO (probe-context artifact) | **No action** |

### Audit-surface note (the session-30 additions — TWO new probe families)

- **the request-payload integrity surface** (finding 1) — the dimension the
  verb-matrix (session 26) and form-constraint (session 28) sweeps share a
  border with but neither covers: the SEMANTIC validity of an AUTHENTICATED
  API payload — does every id in the body belong to the entity graph the
  caller is allowed to touch? The ownership checks stop at the enrollment;
  the lesson-membership relation was never probed. This is the layer that
  would catch ANY cross-entity reference drift (a foreign-key-shaped id from
  another user/course/enrollment silently accepted by an upsert);
- **the router-scroll modality surface** (finding 2) — the dimension the
  session-16 navigation-transition work bounded: the App Router's own scroll
  operations (reset on nav, restore on popstate) run inside the framework's
  `disableSmoothScrollDuringRouteTransition` wrapper ONLY when the site
  declares `data-scroll-behavior="smooth"` — the declaration IS the contract
  (dev warning + glide when absent). The blind spot: the smooth pin is a
  stylesheet rule (audited by CSSOM sweeps) and the attribute is an HTML
  attribute (audited by DOM sweeps) — the contract lives in the FRAMEWORK's
  reading of BOTH, which no prior probe crossed.

Family 1 was found by extending the session-26 verb-matrix style to
authenticated payloads; family 2 by extending the console sweep from
page-load probes to CLIENT-SIDE transitions (the login-form submit — the
one in-app navigation every previous sweep started after).

---

## B. Remediation (TDD)

This session carries **two real source fixes** (findings 1 + 2) plus one
dead-code cleanup (finding 3).

### Phase 1 — the progress-route lesson-membership fix (finding 1)

- [1a] **RED**: new e2e spec block `session-30 integrity: the
  enrollment-progress lesson-membership surface` — sign in through the real
  `/login` form; enroll in `seed-1` via `page.request.post("/api/enrollments",
  …)`; read `seed-2`'s first lesson id from the isolated e2e database (the
  spec-side Prisma read with the deterministic `file:<repo>/db/e2e.db`
  datasourceUrl — the same file global-setup seeds); POST
  `/api/enrollments/progress` with the foreign lesson id → expect **400**
  + the house `{ error }` shape; then verify the negative space: the
  enrollment carries ZERO completed lessons (GET `/api/enrollments` →
  `completedLessonIds` empty + `progress` 0), and the happy path still
  works (mark a REAL seed-1 lesson → 200 + progress 1). Runs RED on the
  baseline (the current route returns 200 + `completedLessons: 1`).
- [1b] **FIX**: in `src/app/api/enrollments/progress/route.ts`, after the
  enrollment ownership check, validate the lesson belongs to the
  enrollment's course — the enrollment already `include`s
  `course: { include: { lessons: true } }` (the progress denominator), so
  the guard is one `some()` over already-fetched rows: return
  `NextResponse.json({ error: "Lesson not found in this course" }, {
  status: 400 })` when no lesson matches. The nonexistent-id path keeps its
  current 400 (the FK throw → the catch's "Invalid request"). [1a] goes
  GREEN.
- [1c] **GUARD**: extend the spec with the cross-ENROLLMENT case (an
  enrollment-foreign lesson of the SAME course shape is impossible — the
  membership check covers it by construction; assert instead that a
  NONEXISTENT lesson id also 400s, pinning both rejection paths).

### Phase 2 — the router-scroll contract fix (finding 2)

- [2a] **RED**: new e2e specs in the session-30 block — (i) the ATTRIBUTE
  contract: the root `<html>` carries `data-scroll-behavior="smooth"`
  (assert on `/` and `/Courses` — every route renders the same root
  layout); (ii) the BEHAVIOR contract: from `/` scrolled to 2000, a nav
  click to `/Courses` lands at scrollY ≤ 5 within ~150ms of the URL change
  (the current baseline glides — an immediate read sits ~1500+; the fix
  snaps; the 150ms window separates the two states by an order of
  magnitude); (iii) the CONSOLE contract: a client-side navigation (the
  login-form submit → `/`) emits ZERO `scroll-behavior` warnings. (i) and
  (ii) run RED on the baseline; (iii) is RED on the dev-tier probe only —
  the e2e standalone emits the same warning in production mode? No — the
  warning is `NODE_ENV === "development"`-gated (the Next.js source),
  so (iii) is pinned as a dev-tier unit-side assertion instead: a source
  guard test asserting the attribute ships in `src/app/layout.tsx` (the
  compiled layout is not readable from the unit layer; the e2e attribute
  spec (i) is the behavioral pin, the unit guard pins the source).
- [2b] **FIX**: add `data-scroll-behavior="smooth"` to the root layout's
  `<html>` element (`src/app/layout.tsx`) — one attribute, the Next.js
  documented contract. The session-13 universal smooth pin (user-facing
  parity) is untouched; ScrollRestoreNormalizer stays (defense in depth
  for the popstate window — Next's own suppression now also covers it;
  removing it would need its own validation and buys nothing).
- [2c] **UPDATE**: the session-16 spec's comment block (the "The reset
  itself animates under the universal smooth rule — wait out the glide"
  note) gains the session-30 companion note (the reset now snaps; the
  2000ms wait stays as a generous settle). The spec's assertions are
  unchanged (scrollY ≤ 5 after the wait — true before and after).

### Phase 3 — the dead-code cleanup (finding 3)

- [3a] **FIX**: remove the three `{ }` JSX artifacts (`CourseCard.tsx:49`,
  `CourseCard.tsx:99`, `MyCourses.tsx:90`). No test changes — the full e2e
  suite (every shared-component surface spec) IS the guard; verified by
  the gate.

### Phase C — docs alignment

- [C1] `AGENTS.md`: gotcha 59 (the request-payload integrity surface —
  the lesson-membership rule; the router-scroll modality surface — the
  `data-scroll-behavior` contract + why the attribute is deliberate on a
  site whose stylesheet pins smooth scrolling) + the commands-table count
  bump (53 → 53 unit, 278 → 281 e2e).
- [C2] `CLAUDE.md`: the test pyramid counts + the session-30 spec family.
- [C3] `README.md`: the badge count + the session-30 paragraph.
- [C4] `Project_Architecture_Document.md`: the [S30] revision row.
- [C5] `nexuslearn-template_SKILL.md`: `project_state` v3.18.0.
- [C6] `worklog.md`: the session-30 record. `.env.example` re-verified
  byte-identical (no environment surface changes this session).

### The gate

lint → typecheck → **53 unit** (+ the source guard if added — see 2a;
target 54 with the layout-attribute guard) → build → **281 e2e** (278 + 3
session-30: the integrity pair + the scroll-attribute/behavior pair) —
zero regressions; the session-14 CSS-leak spec re-runs LAST after every
doc write.

---

## C. Pre-execution validation (done BEFORE writing any code)

- **The fix site (finding 1)**: `src/app/api/enrollments/progress/route.ts`
  already loads `enrollment.course.lessons` (the include is the progress
  denominator — the guard needs NO new query); the route's catch already
  maps FK throws to 400 (nonexistent ids keep working); no other caller of
  `/api/enrollments/progress` exists in `src/` (the MyCourses
  `markLesson` is the only client, and it only passes lesson ids drawn
  from the enrollment's own checklist — the fix cannot break the UI flow;
  verified by reading `MyCourses.tsx:71-85` + the e2e enrollment specs).
- **The e2e spec needs (finding 1)**: a foreign lesson id — the seed's
  lesson ids are Prisma cuids (not predictable), so the spec reads
  `db/e2e.db` directly through a spec-side PrismaClient with the absolute
  `file:` URL (the deterministic e2e database the global-setup seeds; the
  spec runs in the Playwright Node runtime where `@prisma/client` is
  importable; SQLite tolerates the concurrent read while the server holds
  the file).
- **The fix site (finding 2)**: `src/app/layout.tsx` renders the root
  `<html>` (one element, one attribute); the Next.js consumer is
  `layout-router.js` (verified in node_modules — the wrapper reads
  `html.dataset.scrollBehavior`); the attribute affects ONLY the router's
  own scroll operations (`scrollTo`/`scrollTop` writes in the post-commit
  effect), never user-initiated scrolls; `ScrollRestoreNormalizer.tsx` and
  the `html[data-scroll-restore]` rule stay untouched (the popstate
  window now double-covered — harmless).
- **The spec targets (finding 2)**: the `<html>` element is reachable via
  `page.locator("html")`; the attribute assertion is a `toHaveAttribute`;
  the behavior assertion reads `window.scrollY` ~150ms after the
  `waitForURL` flip (the baseline glide measured ~1500+ at that point on
  the 2000px scroll — order-of-magnitude separation from the ≤5 target).
- **No existing expectation breaks**: the session-16 reset spec waits
  2000ms and asserts ≤ 5 (true before AND after — the glide finishes well
  within the wait); the popstate specs assert the ScrollRestoreNormalizer
  behavior (untouched); the console-sweep specs assert per-route loads
  (the warning only fires on client-side transitions — and is dev-only
  anyway); grep of the e2e suite finds no assertion on the `<html>`
  attribute list (the manifest-scope spec pins `manifest.json`, not the
  html dataset).
- **The vitest config**: a new `tests/layout-attribute.test.ts` (the
  source guard for the `data-scroll-behavior` attribute) is picked up by
  the existing `tests/**/*.test.ts` include with no config change;
  `skills/` stays excluded.
