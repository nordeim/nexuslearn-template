# NexusLearn Remediation Plan — Session 8

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; desktop 1920×1080 + mobile 375×667 height sweeps, per-route
unique class-set diffs, CourseDetail like-for-like walks with the live course ids, WYL-row
counts per course, Dashboard innerHTML extraction, About-section text comparison for the
4 longDescription courses, mobile-menu interaction battery; agent-browser sessions
`live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` patterns, playwright `testDir`).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 32/32 unit ✓ · build ✓ ·
107/107 e2e ✓ (session-7 state, commit `fb42732`, confirmed green on the pulled clone).

**Session-8 focus**: sessions 1–7 closed static, shell, content, sub-section,
interactive-state, head-metadata, OG-identity, class-verbatim, display-order and
section-design parity. This audit re-swept every surface with fresh eyes (desktop +
mobile) — again with particular attention to the **mobile navigation menu** (the
standing Tailwind v4 watchpoint, re-verified GREEN on both sites, full battery) — and
found this session's findings concentrated in **database seed idempotency** (stale
`longDescription` rows surfaced as phantom "About This Course" sections), the
**CourseDetail "What You'll Learn" card** (a duplicated level row), and **Dashboard
class-level drifts** (icon classes, an extra hook class, empty-state button bases).

---

## A. Findings inventory (live vs clone)

### Data integrity / seed

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Stale `longDescription` rows — the seed is not truly idempotent.** `prisma/seed.ts` upserts each course with `update: { ...c }`. Prisma's `update` only touches fields PRESENT in the payload — `longDescription` is absent (undefined) for 5 of the 9 courses, so a re-seed over an existing DB NEVER CLEARS an old value. Consequence in BOTH `db/custom.db` and `db/e2e.db`: seed-3 (Cloud Computing with AWS) carries ML's old text, seed-4 (Business Strategy & Leadership) carries WebDev's old text, seed-5 (Emotional Intelligence & Mindfulness) carries UI/UX's old text — leftover from the session-7 reorder, when the ids were renumbered to follow the new display order. Verified by direct DB query: exactly seed-3/4/5 carry longDescription while `prisma/seed-data.ts` (correct) defines it only for WebDev/ML/UI/UX/DigitalMarketing. `longDescription` is the schema's ONLY optional Course field, so it is the only stale-capable field. | **Critical** |
| 2 | **Phantom "About This Course" sections on the clone.** Direct visual consequence of #1: the clone renders the expandable About block (+ its `space-y-12` left-column rhythm) on Cloud/Business/EQ where live renders none. Desktop body-height drift: Cloud +203px, Business +203px, EQ +177px (154/…-px section + 48px space-y-12 gap). Live: `about=true` ONLY on WebDev/ML/UI/UX/DigitalMarketing; clone: `about=true` additionally on seed-3/4/5 with the WRONG (stale) texts. | **High** |

### /CourseDetail — "What You'll Learn" card

| # | Finding | Severity |
|---|---------|----------|
| 3 | **Duplicated level row.** The clone renders `{level} Level` TWICE in the sidebar card: (a) as the final check-icon row inside the tags list (`src/lib/course-tags.ts` `whatYouLearnTopics()` appends `` `${level} Level` `` — the session-3 design), and (b) as the session-6 reference divider row (`div.mt-6.pt-6.border-t` > Award icon + `{level} Level`). The live app renders the check list as **tags only** (row counts measured on all 9 courses: live = tag count; clone = tag count + 1) with the level appearing ONCE in the divider. Card height +34px on every course; every course affected. (The live app evidently dropped the in-list level row some time after session 3 — today's DOM is the parity target.) | **High** |

### /Dashboard

| # | Finding | Severity |
|---|---------|----------|
| 4 | **Stats grid carries an extra `dashboard-stats` class.** Live: `div.grid.grid-cols-2.lg:grid-cols-4.gap-4.md:gap-6` (bare). The clone prepends a `dashboard-stats` hook class (not used by any spec or code — a leftover). | Low |
| 5 | **Stat-card icons are hand-inlined SVGs.** Live renders lucide-react icons: `svg.lucide.lucide-{book-open|circle-play|award|trending-up}.h-5.w-5` with `width="24" height="24"` attributes. The clone ships hand-written `<svg class="h-5 w-5" aria-hidden="true">` copies (no `lucide` classes, no width/height attrs). Same glyphs/paths — class-level drift only. Order both: blue book-open (Enrolled), purple circle-play (In Progress), green award (Completed), amber trending-up (Avg. Progress). | Medium |
| 6 | **Empty-state buttons missing the shadcn base.** Live's "Browse More" outline button: `…disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm h-9 px-4 py-2 rounded-xl border-gray-300 …` and the gradient CTA: `…[&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl px-8 py-3 hover:scale-105 transition-all duration-300`. The clone's `MyCourses.tsx` pair omits the base trio + `hover:bg-primary/90` (the session-7 button-base sweep covered the landing/Pricing/AI/Contact but missed the Dashboard empty state). | Medium |

### Verified matching (no action)

**Mobile navigation menu — FULL battery on BOTH sites at 375×667 (the standing Tailwind v4
watchpoint — NO display bug):** trigger + panel symmetric `md:hidden`, closed panel fully
collapsed (grid-rows-0fr, opacity-0, 0px, display:grid — the CSS grid-rows 0fr→1fr
technique); opens on click (aria-expanded true, panel 413px, icon swaps to
`lucide lucide-x h-6 w-6`); **8 links with byte-identical panel link classes** (incl.
Home's active `bg-purple-50` state); desktop row `display:none` at 375px; route-change
close (aria false, panel 0px, overflow restored); Escape close; body scroll lock while
open (clone hardening; live has none — documented); the 6 mobile-nav e2e guards pass.
Head metadata per route (title / og:title / og:url / canonical mirror — CourseDetail's
carries `?id=`); catalog display order byte-identical (9 h3 sequences equal); About This
Course text byte-identical on the 4 reference courses (WebDev/ML/UI/UX/DigitalMarketing);
class-set diffs IDENTICAL on /AIAssistant, /About, /BecomeInstructor, /Pricing, /login;
/Courses + / differ only in the documented gradient class form (computed identical);
/Contact only in the documented subject-trigger class ORDER; desktop heights byte-exact
on /Pricing, /Contact, /BecomeInstructor, /AIAssistant, /Dashboard, /login, 404, /Home;
mobile heights within the documented font bands; interactive flows (login state machine,
newsletter, contact, enroll/progress, AI chat) pinned by the 107 green e2e specs.

### Accepted variances (documented, no action)

Font-metric wrap bands (live resolves system "Inter" with no @font-face): / −30px,
/Courses −49px, /About −29px desktop; mobile / −299px, /Courses −121px, /Pricing −46px,
/About −45px, /Contact −22px, /BI −58px, /Dashboard −22px, /login −44px, /AIAssistant
−50px; CourseDetail mobile accumulated lesson-row wraps; live's scroll-reveal wrappers +
classless per-card wrapper divs; the hero gradient class form (clone's sRGB arbitrary
form — computed identical); clone's a11y hardening (ARIA wiring, scroll lock, alt text,
aria-hidden on icons); real enrollment vs live's dead Enroll button; working Python
course image; clone's dev-only Next.js dev-tools overlay; lucide path-count variants
(identical glyphs); the /Contact subject trigger class ORDER (same utilities).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` new `session-8 parity` describe block:
  - **About-section presence matrix**: "About This Course" heading visible on
    seed-1/6/7/9 and `toHaveCount(0)` on seed-2/**3/4/5**/8 (the seed-3/4/5 assertions
    are the RED pins for the stale-row bug).
  - **WYL tags-only list**: on the Cloud course (seed-3) the check-list rows count 5 and
    NO row inside `div.space-y-3` contains the text "Level"; on the WebDev course
    (seed-1) the rows count 6 (six tags) with none containing "Level"; the divider row
    (`div.mt-6.pt-6.border-t`) carries the Award icon + "Intermediate Level" (Cloud) —
    pins finding 3.
  - **Dashboard stats grid**: the grid's class attribute is EXACTLY
    `grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6` (no `dashboard-stats` hook).
  - **Dashboard stat icons**: the four stat-card svgs carry the lucide classes
    (`lucide-book-open`, `lucide-circle-play`, `lucide-award`, `lucide-trending-up`
    with `h-5 w-5`) and `width="24"` attributes.
  - **Dashboard empty-state buttons**: the "Browse More" button carries
    `disabled:opacity-50` + `[&_svg]:size-4` + `[&_svg]:shrink-0`; the gradient CTA
    carries the same trio + `hover:bg-primary/90`.
- [1b] `tests/seed-data.test.ts`: guard pin — exactly 4 courses define
  `longDescription` (WebDev, ML, UI/UX, DigitalMarketing by title). Currently green —
  a regression guard for the seed-data contract (the DB-layer bug is pinned by [1a]).
- [1c] Spec maintenance: the session-2-era topic list at line ~242 drops
  `"Beginner Level"` from the WYL topic expectations (that text is pinned by the
  session-6 divider-row specs; keeping it in the tag-list loop would ambiguously
  re-pin the removed behavior).
- [1d] Verify RED: run the new e2e specs against the current build — expect the
  seed-3/4/5 About assertions, the WYL row assertions, and the three Dashboard
  assertions to FAIL; the divider-row + seed-1/6/7/9 About assertions pass.

### Phase 2 — GREEN: seed idempotency fix (findings 1, 2)

- [2a] `prisma/seed.ts`: the course upsert's `update` payload explicitly restates the
  optional field — `update: { ...c, longDescription: c.longDescription ?? null }` —
  so a re-seed over an existing database CLEARS removed longDescriptions instead of
  leaving stale rows (Prisma `update` ignores undefined keys). Comment the trap.
- [2b] Re-seed the dev DB (`DATABASE_URL="file:../db/custom.db" bun prisma/seed.ts`
  with the shell export neutralized) and verify with a direct query: seed-3/4/5 →
  `longDescription: null`.
- [2c] `db/e2e.db` self-heals on the next `test:e2e` run (global-setup re-runs the
  fixed seed; the update branch now nulls the stale rows).

### Phase 3 — GREEN: What You'll Learn tags-only (finding 3)

- [3a] `src/lib/course-tags.ts`: remove `whatYouLearnTopics()` (the tags+level helper)
  — the reference check list is tags-only; `parseTags()` stays.
- [3b] `src/app/CourseDetail/page.tsx`: `const topics = parseTags(course.tags)`.
- [3c] `tests/course-tags.test.ts`: drop the `whatYouLearnTopics` block (parseTags
  coverage stays); docs updated in Phase 6 (the AGENTS/CLAUDE/PAD/SKILL "tags + level"
  descriptions are corrected to "tags only + the Award-icon divider row").

### Phase 4 — GREEN: Dashboard parity (findings 4, 5, 6)

- [4a] `src/app/Dashboard/page.tsx`: drop the `dashboard-stats` hook class; replace the
  four hand-inlined svgs with lucide-react `BookOpen` / `CirclePlay` / `Award` /
  `TrendingUp` (`className="h-5 w-5"`, `aria-hidden="true"` kept as a11y hardening —
  lucide adds the `lucide lucide-X` classes + width/height attrs automatically).
- [4b] `src/components/dashboard/MyCourses.tsx`: both empty-state buttons re-pinned on
  the live class strings (verbatim, incl. the base trio + `hover:bg-primary/90` on the
  gradient CTA).

### Phase 5 — Verification

- [5a] Full gate: `lint → typecheck → test → build → test:e2e` (the suite re-seeds
  e2e.db with the fixed seed → the RED specs flip GREEN).
- [5b] agent-browser re-verification vs live: the About-section presence matrix on all
  9 courses; desktop heights for Cloud/Business/EQ back inside the font bands
  (±25/±1); WYL row counts on all 9 courses = live counts; Dashboard class-set diff
  clean; mobile menu regression battery re-run; a general class-set re-diff on
  /CourseDetail + /Dashboard.

### Phase 6 — Screenshots & docs

- [6a] Fresh dev-server screenshots → `docs/screenshots/` (landing, courses,
  course-detail incl. a no-About course + the WYL card, dashboard, pricing, AI, login,
  about, contact, becomeinstructor + mobile landing/menu-open/courses).
- [6b] Docs: README (test counts, feature wording), AGENTS.md (gotchas: the seed
  partial-update trap; the WYL tags-only + divider semantics; dashboard lucide icons),
  CLAUDE.md (pyramid + parity behaviors), PAD ([S8] revision), 
  `nexuslearn-template_SKILL.md` version bump, `.env.example` re-verify, this plan,
  `docs/session_12.md` session log, `worklog.md`.

### Phase 7 — Ship

- [7a] Final full gate; single commit on `main`; SSH-wrapper push; key shredded.

---

## C. Extracted reference data (verbatim live strings)

**About-section presence (live, all 9 courses)**: `true` ONLY on Complete Web
Development Bootcamp 2026, Machine Learning & AI Masterclass, UI/UX Design Professional
Certificate, Digital Marketing Strategy A-Z — `false` on Data Science, Cloud, Business,
EQ, Advanced Python.

**WYL check-list rows (live)**: exactly the parsed tags — WebDev 6 (HTML, CSS,
JavaScript, React, Node.js, MongoDB), DataScience 5, Cloud 5 (AWS, Cloud, DevOps,
Serverless, Microservices), Business 4, EQ 4, ML 5, UI/UX 5, Python 5, DigitalMarketing
5 — NO level row inside the list; the level renders ONCE in the divider
(`div.mt-6.pt-6.border-t.border-gray-100` > `div.flex.items-center.gap-2` > Award
`h-5 w-5 text-amber-500` + `span.text-sm.font-medium.text-gray-700` "`{level} Level`").

**Dashboard stats grid (live)**: `div.grid.grid-cols-2.lg:grid-cols-4.gap-4.md:gap-6`
(bare — no hook class).

**Dashboard stat icon (live, verbatim)**: `svg.lucide.lucide-book-open.h-5.w-5`
(`width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`) inside
`div.w-10.h-10.rounded-xl.bg-{blue|purple|green|amber}-100.text-{blue|purple|green|
amber}-600.flex.items-center.justify-center.mb-3`; icon set in order: book-open,
circle-play, award, trending-up.

**Dashboard empty-state buttons (live, verbatim)**:
- Outline ("Browse More", `lucide-chevron-right ml-1 h-4 w-4`):
  `inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium
  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
  [&_svg]:size-4 [&_svg]:shrink-0 border bg-background shadow-sm h-9 px-4 py-2
  rounded-xl border-gray-300 text-gray-700 hover:border-purple-500
  hover:text-purple-700 hover:bg-purple-50 transition-all duration-300`
- Gradient CTA ("Browse Courses"): `inline-flex items-center justify-center gap-2
  whitespace-nowrap text-sm font-medium focus-visible:outline-none
  focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
  disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
  shadow hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600
  text-white rounded-xl px-8 py-3 hover:scale-105 transition-all duration-300`

**Stale rows to clear (pre-fix state)**: seed-3 "Dive deep into the world of ar…" (ML's
old text), seed-4 "This comprehensive bootcamp ta…" (WebDev's old text), seed-5 "Become
a professional UI/UX de…" (UI/UX's old text) → all must be `null` after the fixed
re-seed.
