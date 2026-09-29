---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# NexusLearn

## Core Identity & Purpose

NexusLearn is a production-grade e-learning platform: a marketing site, a searchable course catalog, course detail pages with enrollment, a progress-tracking learner dashboard, and an AI study assistant. It is a faithful, fully-functional clone of a reference application (`nexuslearn-template.base44.app`), rebuilt on **Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS v4 + Prisma/SQLite** with first-party cookie authentication. Maintained as a single application (no monorepo); `bun` is the package manager and runtime.

## Foundational Principles

### Meticulous Approach (Six-Phase Workflow)

Follow this six-phase workflow for all implementation tasks:

1. **ANALYZE** - Deep, multi-dimensional requirement mining
   - Never make surface-level assumptions
   - Identify explicit requirements, implicit needs, and potential ambiguities
   - Explore multiple solution approaches
   - Perform risk assessment

2. **PLAN** - Structured execution roadmap
   - Create detailed plan with sequential phases
   - Present plan for explicit user confirmation
   - Never proceed without validation

3. **VALIDATE** - Explicit confirmation checkpoint
   - Obtain explicit user approval before implementation
   - Address concerns or modifications

4. **IMPLEMENT** - Modular, tested, documented builds
   - Set up proper environment
   - Implement in logical, testable components
   - Create documentation alongside code

5. **VERIFY** - Rigorous QA against success criteria
   - Execute comprehensive testing (unit → e2e → visual parity)
   - Review for best practices, security, performance
   - Consider edge cases and accessibility

6. **DELIVER** - Complete handoff with knowledge transfer
   - Provide complete solution with instructions
   - Document challenges and solutions
   - Suggest improvements and next steps

### Project-Specific Principles

- **Pixel parity is a requirement, not a nicety.** Shared chrome (buttons, cards, nav, mobile menu) uses class strings copied verbatim from the reference app; the v3-era color palette is pinned in `@theme` so computed styles match byte-for-byte.
- **The mobile menu is sacred.** Any change to `src/components/Navbar.tsx` must keep symmetric `md:` breakpoints, `min-h-dvh` page roots, body scroll lock, ARIA wiring, and must be followed by `tests/e2e/mobile-navigation.spec.ts`.
- **Tailwind v4 is CSS-first.** No `tailwind.config.js` ever exists. Theme tokens live in `src/app/globals.css` (`@theme` / `@theme inline`). Theme color vars must be full color values (`hsl(...)`-wrapped), never bare HSL triplets. The v3-era palette AND the v3 `shadow-sm` value are PINNED in `@theme inline` (ADR-005 + the session-12 shadow-scale pin: v4 shifted `shadow-sm` one notch heavier; `--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)` restores the reference rendering with byte-identical classes).
- **One database file, everywhere.** All Prisma clients go through `datasourceUrl: resolveDatabaseUrl()` (`prisma/db-url.ts`) so the CLI, dev server, seed, standalone build and e2e all hit `<repo>/db/<name>.db`.
- **Server-only SDK.** `z-ai-web-dev-sdk` is imported only inside `src/app/api/ai/chat/route.ts`.

## Implementation Standards

### General Coding Practices
- **Early Returns**: Prefer early returns over deeply nested conditionals
- **Composition over Inheritance**: Favor composition patterns
- **Self-Documenting Code**: Clear naming and structure
- **Test-Driven Development**: Follow Red-Green-Refactor cycle for domain logic (auth crypto, progress math)

### Language & Framework Guidelines
- **React 19**: function components only; no `forwardRef`; `searchParams` in server components is a `Promise` (await it).
- **Next.js 16 App Router**: server components fetch via Prisma directly; client boundaries are leaf interactive widgets (`"use client"`); `output: "standalone"`.
- **TypeScript strict**: no `any` without justification (eslint relaxed, but don't abuse it); path alias `@/*` → `./src/*`.
- **Tailwind v4**: utility classes match the reference markup; custom tokens in `@theme`; `cn()` (clsx + tailwind-merge) for conditional classes; CVA for button/badge variants.
- **Prisma 6**: schema at `prisma/schema.prisma` (SQLite); singleton client in `src/lib/db.ts`; use `datasourceUrl`, never `datasources`.

## Development Workflow

### Environment Setup

```bash
bun install
bun run db:push     # create db/custom.db (schema)
bun run db:seed     # 9-course catalog + demo user
bun run dev         # http://localhost:3000
```

### Build Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start development server (port 3000) |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Serve the standalone production build |
| `bun run test` | Vitest unit tests |
| `bun run test:e2e` | Playwright e2e (needs `bun run build` first; boots :3100) |
| `bun run lint` | ESLint |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run db:push` / `db:seed` / `db:migrate` / `db:reset` | Prisma database workflows |

## Testing Strategy

### Test Pyramid
- **Unit Tests** (Vitest, `tests/*.test.ts`): pure domain seams — session token sign/verify, scrypt password hashing, course tag parsing, course-eyebrow display map, seed-data shape + reference imagery/lesson-count pins + the reference display order (session 7) + the longDescription presence matrix (session 8), and the `routeMetadata()` helper (per-route OG identity)
- **E2E Tests** (Playwright, `tests/e2e/*.spec.ts`): mobile navigation (10 specs — the Tailwind v4 regression guard: the 6 behavioral guards + the session-9 space-y-trap/trigger specs), landing/catalog/course-detail/auth/enrollment/dashboard/content-page/pricing-FAQ flows, the session-4 specs (page shells, About-Course, footer hrefs, 404, SEO), the session-5 specs (head metadata incl. manifest, login 5-view state machine with signup+verify, in-place newsletter success, CourseDetail not-found state, eyebrow/active-nav/FAQ/BI class parity), the session-6 specs (per-route OG identity, sidebar level row, pricing `-mt-8` overlap, `h-9` search input, landing grids/wrapper, AI bubble/card classes, badge + enroll button class parity), the session-7 specs (reference display order for the catalog + featured grid, category icon dead-gradient classes + monitor icon + tint palette, featured flex header with the in-header View All Courses CTA, learning-path borders + per-path icons, testimonials card redesign + order, landing button bases, Courses filter card sliders icon + old-style select triggers, emerald level badge DIV, CourseDetail lessons-stat circle-play, Pricing circle-help FAQ icon + hero base sizes, Contact form controls, About stats structure, BI hero rework, AI composer button, login Google icon wrapper), the session-8 specs (the About-section presence matrix across all 9 courses — the seed-idempotency guard, the tags-only What-You'll-Learn list + single Award-divider level row, Dashboard bare stats grid + lucide stat icons + empty-state button bases), the session-9 specs (the **Tailwind v4 space-y engine trap** — the mobile panel CTA renders the reference 4px gap with the open panel at the reference 405px; the navbar chrome — My Dashboard button bases on desktop + in the panel, the bare trigger string, the logo span byte order), the session-10 specs (the **`/Home` hero-state navbar** — transparent + white logo + `text-white/80` mobile trigger at scroll 0 with the white-nav flip after scroll, byte-identical to `/`; the 404 wrapper's deliberate `main.min-h-dvh` hardening pin), and the session-11 specs (the **copy + glyph fidelity** — the Digital Marketing Pro path card description + the testimonial ASCII quotes; the **login card-interior ownership** — all four non-signin views replace the whole card body with no logo/h1/Google/OR, the reset email input's `text-base` variant, and the chrome restored on the round trip), and the session-12 specs (the **Tailwind v4 shadow-scale shift** — the FIFTH v4 trap: v4 moved `shadow-sm` up to v3's bare-shadow geometry; the `--shadow-sm` token pin in `globals.css` restores the v3 value, pinned by COMPUTED box-shadow assertions on the white navbar, the login Sign in button, the hero secondary CTA and the lesson-row hover, plus GUARD specs proving md/lg/xl/2xl were never shifted), and the session-13 specs (the **login focus-ring cascade pin** — the reference's runtime-injected v3 sheet wins `--tw-ring-color` for `focus:ring-slate-400` on keyboard focus, restored by an UNLAYERED rule in `globals.css`, with GUARD specs proving /Contact + the buttons keep the `--ring` ring; the **signin-view reference nesting** — the OR divider + form are the space-y-3's siblings inside the `div.w-full`, with the 24px gaps pinned; the **universal scroll-behavior** — every element computes smooth like the reference's `*` runtime rule), and the session-14 specs (the **rendered-font parity** — the body computes the reference's declared `Inter, system-ui, -apple-system, sans-serif` stack with NO bundled webfont (the reference loads no @font-face anywhere; the previous next/font Inter bundle was the root cause of all the documented "font-metric height bands" — every height measurement is byte-exact after the fix); the **v4 button-cursor preflight restore** — every button computes `cursor: pointer` like the reference, GUARD-pinned so labels stay default and inputs stay text; the **line-height composition pins** — the hero H1 72px / hero P 28px / CTA H2 48px reference winners restored over v4's `--tw-leading` flip; the **dead popular-card scale** — the reference's scroll-reveal system leaves inline `transform: none` that kills `scale-105` forever, replicated by an unlayered `scale: none` pin with the hover variants GUARD-pinned live; the **skills/docs/tests CSS-leak exclusion** — Tailwind v4's automatic source detection generated 1027 unused rules (51% of the sheet) from the agent documentation folders, closed by `@source not` directives and canary-pinned; and the **space-y follower-gap pins** — the inline-label and `-mb-2` back-button patterns restored to the reference gaps with the mobile /login height pinned at 762) — 171 specs total against the production standalone server
- **Visual parity**: computed-style assertions and screenshot comparisons against the reference app (see PAD §5 and `docs/screenshots/`)

### Test Commands

```bash
bun run test          # unit
bun run build         # prerequisite for e2e
bun run test:e2e      # full e2e on :3100 with isolated db/e2e.db (171 specs)
```

E2E resets enrollment state in global-setup, so runs are idempotent. Specs sign in through the real `/login` form with the seeded demo user and land on `/` (reference behavior).

## Code Quality Standards

### Linting & Formatting
- ESLint 9 flat config (`eslint.config.mjs`) extending `eslint-config-next`; `no-img-element` deliberately off (reference parity uses `<img>`).
- No formatter config — match surrounding style.

## Git & Version Control

### Branching Strategy
- `main` only for this repository; no feature branches.

### Commit Standards
- Run the full gate before pushing: `bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e`.
- Push via the SSH wrapper workflow in `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; keys never live inside the repo (`.gitignore` rejects `*.key`, `ssh-key.txt`).

## Error Handling & Debugging

### Error Handling Approach
- Route handlers validate input, return `{ error }` JSON with correct status codes (400/401/404/502).
- The AI chat route degrades gracefully (502 + friendly client message) when the SDK is unavailable.
- Server components `notFound()` for missing courses.

### Debugging Tools
- `bun run dev` tees to `dev.log`; standalone `server.log`.
- Playwright traces on failure (`test-results/*/trace.zip`, `npx playwright show-trace`).
- Prisma query/error logging is enabled in development.

## Communication & Documentation

### Documentation Standards
- `README.md` — user-facing overview and quick start
- `AGENTS.md` — compact agent gotchas (read it too)
- `Project_Architecture_Document.md` — the definitive engineering reference (ADRs, layer model, data model, security)
- `docs/screenshots/` — visual reference captures

## Project-Specific Standards

### Architecture
- Routes mirror the original app's casing: `/Courses`, `/AIAssistant`, `/Pricing`, `/BecomeInstructor`, `/About`, `/Contact`, `/CourseDetail?id=…`, `/Dashboard`, `/login`; `/` is the landing page, `/Home` renders the landing directly (reference footer target) **with the identical hero-state navbar** (session 10: `overHero` covers both routes — transparent at scroll 0, white-nav after scroll).
- Fixed Navbar has two visual states (transparent over the dark hero; `bg-white/95 backdrop-blur-xl` otherwise) and an animated mobile dropdown. The Home link is active on both `/` and `/Home` (reference behavior). The mobile trigger carries the bare reference classes (no hover/transition utilities — the ARIA wiring is clone-only a11y hardening), and both "My Dashboard" buttons carry the shadcn base trio + `hover:bg-primary/90` (session 9). The mobile panel's Dashboard CTA link ships WITHOUT the reference's `mt-3` — Tailwind v4's `:where()`-wrapped space-y engine would let it win (12px gap, +8px panel) where the reference's v3 engine overrode it (4px gap, 405px panel).
- The login card is a 5-view state machine (signin/reset/reset-sent/signup/verify) that owns the WHOLE card interior (session 11) — the logo/h1/Google/OR chrome renders only on the signin branch of `LoginForm.tsx`; every other view IS the card body (`div.w-full` wrapper, no chrome). Email delivery is simulated (server-side code log; any 6-digit code verifies).
- Head metadata ships ONE root description everywhere + OG/Twitter cards, per-route canonicals, `/logo.png` favicon, `manifest.json` (reference parity). Session 6: og:title/twitter:title/og:url mirror the per-route document title + canonical via `routeMetadata()` (`src/lib/metadata.ts`).
- Reference parity behaviors: sign-in returns to `/`; `/Dashboard` renders for signed-out visitors ("Welcome back", zeroed stats, empty state — no redirect); CourseDetail uses a dark hero with a white price card, an auto-generated curriculum (`lessonsCount` × "Lesson N: Module Content"), a "What You'll Learn" card built from `Course.tags` ONLY (session 8: the check list is tags-only) ending with the Award-icon level row, and a `div.-mt-8` overlap under the /Pricing hero; unknown course ids render the in-page "Course not found" state (never the 404); the expandable "About This Course" section renders on exactly the 4 longDescription courses (WebDev, ML, UI/UX, DigitalMarketing — session 8's presence matrix guards the seed clearing it).

### API Design
- `POST /api/auth/login|logout`, `GET /api/auth/me`
- `POST /api/auth/signup|verify|forgot-password` (signup + 6-digit verification — simulated delivery; forgot-password always ok)
- `GET|POST /api/enrollments`, `POST /api/enrollments/progress` (recomputes enrollment % from completed lessons; returns `completedLessonIds` so the dashboard checklist reflects out-of-order completion)
- `POST /api/ai/chat` (server-only SDK), `POST /api/contact`, `POST /api/newsletter`, `GET /api/health`

### Database / Data Layer
- Models: `User` (incl. `emailVerified` — seeded users skip verification), `Course` (incl. `tags` — comma-separated "What You'll Learn" topics), `Lesson`, `Enrollment` (unique `[userId, courseId]`), `LessonProgress` (unique `[enrollmentId, lessonId]`), `ContactMessage`, `Subscriber`.
- Progress is derived, never stored as a guess: `completed lessons / total lessons * 100`.

### Environment Variables
| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | SQLite `file:../db/custom.db` (schema-relative; pinned by `prisma/db-url.ts`). Use an absolute path in production. |
| `AUTH_SECRET` | production | HMAC session secret (`openssl rand -hex 32`); insecure dev fallback warns. |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin for metadata/sitemap. |
