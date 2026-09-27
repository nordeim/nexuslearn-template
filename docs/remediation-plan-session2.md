# NexusLearn Remediation Plan — Session 2

**Source of truth**: live parity audit against `https://nexuslearn-template.base44.app/`
(logged in as the demo user; DOM extraction + computed styles + VLM band-by-band
screenshot comparison; agent-browser sessions `live` + `clone`).

**Rule**: `skills/` folder excluded from checking/testing/compilation (already
excluded in tsconfig + eslint + vitest + playwright configs — verified).

---

## A. Findings inventory (live vs clone)

| # | Area | Finding | Severity |
|---|------|---------|----------|
| 1 | DB layout | Dev `custom.db` lives OUTSIDE the repo (`/home/z/my-project/db/custom.db`) because the sandbox parent `.env` sets an absolute `DATABASE_URL` that bun loads over the repo `.env`. Repo `.env` already says `file:../db/custom.db` (correct, schema-relative → `<repo>/db/custom.db`). | High (explicit user requirement) |
| 2 | package.json | `name` is `activity-map` (scaffold leftover); lockfiles carry it too. | Medium |
| 3 | Repo hygiene | ORBITAL leftovers: `project-management_SKILL.md` (root), `scripts/smoke-test.sh`, `scripts/probes/`, `scripts/par-probe*.sh`, `scripts/install_packages.sh`. | Medium |
| 4 | Doc alignment | `.env`/`.env.example` comments + `docs/DEPLOYMENT.md` reference `src/lib/db-path.ts` / `tests/db-path.test.ts` (do not exist — real seam is `prisma/db-url.ts`). `docs/DEPLOYMENT.md` is entirely about ORBITAL. `vitest.config.ts` header comment describes the old project. | Medium |
| 5 | Landing hero | Clone invented a 3-card mockup illustration (in-flow, `mt-16`); live has an abstract flowing-lines SVG (858×434, `absolute inset-0 flex items-center justify-center`, `opacity-60`, 8 gradient paths). Clone desc missing `md:text-xl`. Content wrapper has extra `pt-16`. Buttons container `mt-8` + missing `items-center` (live: `mt-10`). Stats row outside the text column with `mt-12 pb-16` (live: inside, `mt-16`, no pb). Hero is `section` on clone, `div` on live; v4 `in oklab` gradient vs v3 plain. | High |
| 6 | Footer | Grid `md:grid-cols-4` vs live `md:grid-cols-2 lg:grid-cols-4`; logo box `w-9 h-9`/`text-lg` vs `w-10 h-10`/`text-xl` (+`mb-4` link, href `/Home`); social icons bare vs boxed `w-9 h-9 rounded-xl bg-white/5 ... hover:bg-purple-500/20` with `h-4` icons in `flex gap-3`; column links `hover:text-white` vs `text-sm hover:text-purple-400`; bottom bar has Privacy/Terms/Cookies links vs live tagline `Built for the future of education.` (`text-xs text-gray-600`). | High |
| 7 | Courses page | No dark hero (clone: white header + sticky white filter section). Live: dark cosmic hero (`pt-16 pb-20`) with centered h1 (`text-3xl md:text-5xl text-white`), subtitle, glassy search input (`pl-12 py-6 bg-white/10 border-white/20 text-white ... rounded-xl`); floating white filter card (`max-w-7xl mx-auto px-4 -mt-6` > `bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-wrap items-center gap-*`) with 3 selects; results on `min-h-screen bg-gray-50` with count row ("9 courses" + Clear Filters when filtered). Sort options + empty state copy already match. | High |
| 8 | CourseDetail | No dark hero. Live: dark hero (`pt-8 pb-16 px-4`) with back link + `grid grid-cols-1 lg:grid-cols-3 gap-10`: left `lg:col-span-2` (badge, h1 `text-3xl md:text-4xl text-white`, desc, stats row `gap-6 mt-8 text-gray-300`, instructor `mt-6`), right white price card (`bg-white rounded-2xl shadow-2xl overflow-hidden`: aspect-video image + play overlay; `p-6`: price `flex items-baseline gap-3 mb-6`, Enroll button `w-full ... py-6 text-lg ... hover:scale-[1.02]`, 4 green-check features). Body `max-w-7xl mx-auto px-4 py-16` grid: curriculum (h2 `text-2xl font-bold text-gray-900 mb-6`, `space-y-3`, items `flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200` + number box `w-10 h-10 rounded-xl bg-gray-100` + `span.text-gray-700 font-medium` "Lesson N: Module Content" + `CirclePlay h-5 w-5 text-gray-400 ml-auto`; **220 items**, no durations) + right sticky tags card (`bg-white rounded-2xl border border-gray-100 p-6 sticky top-24`, h3 "What You'll Learn", purple checks, topics = course tags + level). Clone has: light page, invented lesson titles/durations, "What You'll Learn" learning points after curriculum, "61% OFF" badge. | High |
| 9 | Seed data | Lessons invented (titles+durations); live = `lessonsCount` × "Lesson N: Module Content" per course. No `tags` field (needed for What You'll Learn). Tags extracted for all 9 courses (see §C). | High |
| 10 | Dashboard | Clone redirects logged-out users to `/login`; live renders "Welcome back" (no name) + zeroed stats + empty state. | Medium |
| 11 | Login | Clone redirects to `/Dashboard` after login; live → `/`. Separator "OR" vs "or". Order: clone puts "Forgot password?" before "Sign in" (live: Sign in → Forgot → Need an account? Sign up). Clone shows demo-credentials hint (live has none). Title "Login | NexusLearn" vs live "NexusLearn". | Medium |
| 12 | About | Clone invented 6 values + "Join Our Community" CTA; live has exactly 4 values (Mission-Driven, Student-First, Innovation, Global Impact) and no CTA. Story section + stats match. | Medium |
| 13 | Contact | Clone adds "Quick response guaranteed / Average reply time: under 24 hours" card (live has only Email/Phone/Address); clone form has h2 "Send us a message" (live: none); Subject options differ (clone: General/Technical/Billing/Partnership/Other; live: General Inquiry, Technical Support, Become an Instructor, Partnership). | Medium |
| 14 | BecomeInstructor | Title "Teach on NexusLearn | NexusLearn" vs live "Become Instructor | NexusLearn"; extra hero badge; different hero subtitle; only 4 "Why Teach" features (2 with wrong copy) vs live 6 (incl. Analytics Dashboard, Certification Programs); CTA copy + button text differ. How It Works matches. | Medium |
| 15 | AIAssistant | Client component → no page title (live: "AI Assistant | NexusLearn"); hero `py-20` vs live `pt-16 pb-12`; input is custom light input vs live shadcn Input in a rounded container. | Medium |
| 16 | /Home | Clone redirects to `/`; live renders the landing at `/Home` (footer logo links there). | Low |
| 17 | Mobile menu | ✅ VERIFIED WORKING on the clone (ARIA, scroll lock, icon swap, route-change close, symmetric md breakpoints). Live has NO ARIA and NO scroll lock — clone's hardening is a deliberate best-practice improvement to KEEP. | None |
| 18 | Catalog data | ✅ All 9 courses match (titles, categories, levels, ratings, students, hours, instructors, prices). | None |

**Verified intact (no action)**: landing sections 1–8 + footer layout, catalog data,
Pricing, Dashboard logged-in layout, demo login flow, course card markup, hero
badge/h1/buttons content, stats, empty states, sort options, health API.

---

## B. Remediation plan (execution order)

### Phase 0 — Infrastructure & hygiene
- [0a] Move `/home/z/my-project/db/custom.db` → `<repo>/db/custom.db`; delete the
  sandbox parent `/home/z/my-project/.env` (session-1 debugging artifact, outside
  the repo). Verify: env probe resolves `file:../db/custom.db` → `<repo>/db/custom.db`;
  dev server login works with existing data.
- [0b] `package.json` name → `nexuslearn-template` (update bun.lock name via
  `bun install`); `git rm` ORBITAL leftovers (`project-management_SKILL.md`,
  `scripts/smoke-test.sh`, `scripts/probes/`, `scripts/par-probe*.sh`,
  `scripts/install_packages.sh`); fix `.env`/`.env.example` comments →
  `prisma/db-url.ts`; fix `vitest.config.ts` header comment.

### Phase 1 — Schema & seed (TDD: seed shape test first)
- [1] `prisma/schema.prisma`: add `tags String @default("")` (comma-separated;
  SQLite has no scalar lists). Update `prisma/seed.ts`: per-course tags (§C),
  lessons = `lessonsCount` rows titled `Lesson N: Module Content` (matching the
  live's auto-generated curricula). `db:push` + `db:seed`.

### Phase 2 — Shared chrome
- [2] Footer rework to the live spec (§A6).

### Phase 3 — Page reworks (TDD: e2e assertions updated first, then implement)
- [3a] Landing hero (§A5): live SVG lines illustration, structure/classes, div +
  `bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]`.
- [3b] Courses page (§A7): dark hero + glassy search + floating filter card +
  count/Clear row.
- [3c] CourseDetail (§A8): dark hero 2-col + price card + simple curriculum +
  sticky tags card.
- [3d] Dashboard logged-out render + login parity (§A10, §A11).
- [3e] About / Contact / BecomeInstructor / AIAssistant / Home (§A12–16).

### Phase 4 — Tests (TDD)
- [4] Update e2e: login redirect target, dashboard logged-out, footer content,
  courses hero, curriculum items, AIAssistant title; keep 6 mobile-nav specs
  green; unit tests for tags parsing + any new pure seam.

### Phase 5 — Verification
- [5] `lint → typecheck → test → build → test:e2e`; agent-browser visual
  re-compare of reworked pages vs live (desktop + 375px); mobile menu regression.

### Phase 6 — Screenshots & docs
- [6] Fresh dev-server screenshots → `docs/screenshots/`; rewrite
  `docs/DEPLOYMENT.md` for NexusLearn; update AGENTS.md / CLAUDE.md / README.md /
  PAD (login redirect, public dashboard, tags, footer, course-detail structure,
  removed ORBITAL files); `.env.example` re-verified.

### Phase 7 — Skill & ship
- [7] `nexuslearn-template_SKILL.md` via `skills/distill-codebase-skill` +
  `skills/to-distill-project-into-skill`; final full gate; single commit on
  `main`; SSH-wrapper push.

---

## C. Extracted reference data (for the seed)

Course tags (What You'll Learn, last item = level):
- Cloud Computing with AWS: AWS, Cloud, DevOps, Serverless, Microservices, Intermediate Level
- Advanced Python Programming: Python, Design Patterns, APIs, Testing, Performance, Advanced Level
- Machine Learning & AI Masterclass: Python, TensorFlow, Neural Networks, Deep Learning, NLP, Intermediate Level
- Complete Web Development Bootcamp 2026: HTML, CSS, JavaScript, React, Node.js, MongoDB, Beginner Level
- UI/UX Design Professional Certificate: Figma, User Research, Wireframing, Prototyping, Design Systems, Beginner Level
- Digital Marketing Strategy A-Z: SEO, Social Media, Google Ads, Email Marketing, Analytics, Beginner Level
- Data Science with Python & SQL: Python, SQL, Pandas, Matplotlib, Data Visualization, Beginner Level
- Business Strategy & Leadership: Leadership, Strategy, Management, Decision Making, Intermediate Level
- Emotional Intelligence & Mindfulness: Mindfulness, EQ, Stress Management, Meditation, Beginner Level

Live lesson model: every course renders `lessonsCount` items named
`Lesson N: Module Content` (e.g. 220 for AWS course), no durations.

About values (live): Mission-Driven / Student-First / Innovation / Global Impact
(with exact descriptions captured in session notes).

BecomeInstructor "Why Teach With Us" (live, 6): Up to 70% Revenue Share, Global
Audience, Production Support, Analytics Dashboard, Community Support,
Certification Programs.
