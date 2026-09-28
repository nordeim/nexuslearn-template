# AGENTS.md — NexusLearn

Compact instruction file for AI coding agents working in this repository. Every line answers: *"would an agent likely miss this without help?"*

## What this is

NexusLearn — an e-learning platform (marketing site + course catalog + enrollment + progress-tracking dashboard + AI study assistant), cloned pixel-faithfully from a reference app. **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Prisma/SQLite + shadcn/ui-style components.** Single app, no monorepo.

## Commands (bun is the runtime — `bun.lock` is authoritative)

| Task | Command |
|---|---|
| Install | `bun install` |
| Dev server | `bun run dev` (port 3000) |
| DB schema push | `bun run db:push` |
| DB seed | `bun run db:seed` |
| Unit tests | `bun run test` (Vitest) |
| E2E tests | `bun run test:e2e` (Playwright; **requires `bun run build` first** — boots the standalone server on :3100 with `db/e2e.db`; 122 specs incl. the 6 mobile-nav guards) |
| Lint / typecheck | `bun run lint` / `bun run typecheck` |
| Production build | `bun run build` (standalone output) |

**Required order before pushing:** `lint → typecheck → test → build → test:e2e`. There is no hosted CI; the local gate is the only gate.

## Demo credentials (seeded)

`sepnetflix2023@outlook.com` / `$Abcd1234` — used by both the e2e suite and manual QA.

## Critical gotchas (these WILL bite you)

1. **Tailwind v4 is CSS-first.** There is **no `tailwind.config.js`** — all tokens live in `src/app/globals.css` under `@theme` / `@theme inline` (`docs/Tailwind-V4-Validation-Report.md`). Do not create one.
2. **Theme color vars must be FULL color values** — `--background: hsl(0 0% 100%)`, never the v3-style bare triplet `0 0% 100%`. Bare triplets silently resolve to *transparent* under `@theme inline`. This exact bug was found and fixed during the build.
3. **The v3-era palette is pinned in `@theme`** (gray/slate/cyan/purple/pink/...). Do not remove — Tailwind v4's default oklch palette drifts 1–3 sRGB units per channel from the reference app's colors and breaks the computed-style parity tests.
4. **Prisma SQLite paths are resolved by `prisma/db-url.ts`** — the Prisma CLI resolves `file:` URLs against `prisma/schema.prisma`, the runtime against process CWD (and the standalone server `chdir()`s into `.next/standalone/`, which contains its own traced copy of `prisma/schema.prisma`). Never construct a PrismaClient without `datasourceUrl: resolveDatabaseUrl()` (see `src/lib/db.ts` and `prisma/seed.ts`). `DATABASE_URL="file:../db/custom.db"` resolves to `<repo>/db/custom.db` for CLI, dev, seed, standalone and e2e alike.
5. **`datasources: { db: { url } }` is ignored by Prisma 6** — use `datasourceUrl` instead.
6. **Route casing is intentional**: `/Courses`, `/AIAssistant`, `/CourseDetail?id=…`, `/BecomeInstructor`, `/Pricing`, `/About`, `/Contact`, `/Dashboard`, `/login` — they mirror the original app 1:1. `/` is the landing page; `/Home` renders the landing directly (the reference footer links there — no redirect).
7. **Every non-landing page uses the reference shell**: root `min-h-dvh` > `main.pt-20` > `div.min-h-screen.bg-gray-50` wrapping the dark hero + content. Without `main.pt-20` the hero slides under the fixed navbar (the h1 renders at y=64 behind the 81px bar) — pinned by the session-4 e2e shell specs.
8. **The mobile menu is the highest-regression-risk chrome** (Tailwind v4 display-mismatch bugs). Rules: trigger + panel use symmetric `md:hidden`; desktop row `hidden md:flex`; page roots use `min-h-dvh`; body scroll lock while open; real `<button>` with `aria-expanded`/`aria-controls`. `tests/e2e/mobile-navigation.spec.ts` pins all of this — run it after any nav change.
9. **Auth is first-party**: HMAC-SHA256 signed cookie (`nexus_session`) + scrypt password hashing, in `src/lib/session.ts` (pure, testable) and `src/lib/auth.ts` (Next `cookies()` adapter). **Reference parity behaviors**: signing in returns to `/` (not `/Dashboard`), and `/Dashboard` renders for signed-out visitors (generic "Welcome back", zeroed stats, empty state — no server redirect). There is no auth provider dependency.
10. **`z-ai-web-dev-sdk` is server-only** — it must never be imported into client components. The AI chat goes through `POST /api/ai/chat`.
11. **Images are remote Unsplash URLs** — allowlisted in `next.config.ts` `remotePatterns`. Cards intentionally use plain `<img>` (matching the reference markup), so `@next/next/no-img-element` is disabled in `eslint.config.mjs`. The reference's Python-course image URL is corrupt (0×0 load); the clone ships a working Python image on purpose.
12. **`Course.longDescription` is nullable on purpose** — the reference app populates the expandable "About This Course" section for only 4 of the 9 courses; absent means the section (and the left column's `space-y-12`) is not rendered.
13. **The login card is a 5-view state machine** (signin → reset → reset-sent → signup → verify) inside ONE card — class strings copied verbatim from the reference. Email delivery is SIMULATED: signup logs a 6-digit code server-side and `/api/auth/verify` accepts any complete 6-digit code (no SMTP in the template; wire real email before production). `User.emailVerified` defaults true so seeded accounts skip verification.
14. **Head metadata is reference-pinned** — ONE root description (the "SkillSphere…" sentence) everywhere, OG/Twitter cards, per-route canonicals, `/logo.png` favicon + `manifest.json`. Do not add per-page `description` overrides; `NEXT_PUBLIC_SITE_URL` feeds `metadataBase` at build time.
15. **Course-card eyebrows use the display map** (`src/lib/course-eyebrow.ts`): "Personal Development" renders as "Personal Dev" on cards while the filter + landing grid keep the full name — reference behavior.
16. **CourseDetail never 404s** — unknown/missing `?id=` renders the in-page "Course not found" state inside the gray shell (reference behavior), not `notFound()`.
17. **The newsletter form is a client island** (`NewsletterForm.tsx`) — never a native `action=` POST (that navigates the browser to the raw JSON). Same for contact: fetch + in-place success state.
18. **OG identity mirrors the document head** (session 6): `og:title` + `twitter:title` = the per-route document title and `og:url` = the per-route canonical (CourseDetail's includes `?id=`). Every route sets metadata through `routeMetadata()` (`src/lib/metadata.ts`) — a child route's `openGraph`/`twitter` objects REPLACE the root's wholesale, so the helper restates the full payload (description, images, siteName). `/` and `/login` keep the plain "NexusLearn" title (reference behavior).
19. **The CourseDetail sidebar ends with the level row** — `mt-6 pt-6 border-t` divider > Award icon (`text-amber-500`) + "`{level} Level`" — present on every course (reference behavior, session 6).
20. **The seed array IS the display order** (session 7): `prisma/seed-data.ts` lists the courses in the reference app's "Newest" order (WebDev, DataScience, Cloud, Business, EmotionalIQ, ML, UI/UX, AdvancedPython, DigitalMarketing); the ids `seed-1…9` + `sortOrder` follow the array index, so the catalog's id-based "newest" sort and the landing featured grid (the featured subsequence) both reproduce the reference order. Do not re-sort the array.
21. **Category icons render near-black on purpose** (session 7): the reference ships `bg-gradient-to-r from-X-500 to-X-600 bg-clip-text` on the category svgs — the gradient is visually DEAD (background-clip:text on an SVG clips the gradient away; the strokes render in the inherited near-black). The clone copies those classes verbatim; the only visible color comes from the `bg-X-500/10` tint wrappers. Do not replace them with `text-X-600` colors.
22. **The level badge is a plain DIV with emerald Beginner** (session 7): live renders `inline-flex items-center rounded-md px-2.5 py-0.5 … hover:bg-primary/80 absolute top-3 left-3 bg-emerald-100 text-emerald-700 border-0 font-medium text-xs` (Beginner=emerald, Intermediate=amber, Advanced=red) — not the shadcn Badge span, and the class order is pinned.
23. **`SelectTrigger` ships the v3-era shadcn string** (session 7): `flex h-9 items-center justify-between whitespace-nowrap border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background … [&>span]:line-clamp-1` + `h-4 w-4` chevron — the reference app predates the new-york v4 trigger (`data-[slot=select-value]`, `shadow-xs`, `ring-[3px]`). Call-sites add `w-[150px|160px|180px] rounded-xl border-gray-200` (Courses) / `w-full border-input mt-2 rounded-xl` (Contact).
24. **The seed must CLEAR optional fields, not just set them** (session 8): Prisma's `update` only touches keys present in the payload — `prisma/seed.ts` restates `longDescription: c.longDescription ?? null` so a re-seed over an existing DB nulls removed values. Without it, the session-7 reorder left the pre-reorder texts on seed-3/4/5 (phantom "About This Course" sections the live app does not render). Pinned by the session-8 About-presence e2e matrix.
25. **The "What You'll Learn" check list is tags ONLY** (session 8): the live list renders exactly the parsed tags — no `{level} Level` row inside `div.space-y-3` (the old `whatYouLearnTopics()` helper was removed). The level renders ONCE, in the Award-icon divider row (`div.mt-6.pt-6.border-t`). Pinned by the session-8 e2e specs.
26. **Dashboard stat icons are lucide components** (session 8): `BookOpen`/`CirclePlay`/`Award`/`TrendingUp` (`className="h-5 w-5"`) — the reference ships the `lucide lucide-X` classes + `width="24" height="24"` attributes; do not replace them with hand-inlined svgs. The stats grid is the BARE reference grid (no hook classes), and both MyCourses empty-state buttons carry the shadcn base trio.

## Where things live

- `src/app/` — routes (one dir per route, original casing), `api/` for route handlers
- `src/components/ui/` — shadcn-style primitives (button uses `rounded-xl` variants matching the reference)
- `src/components/` — Navbar (2 visual states + mobile dropdown), Footer, CourseCard, CourseCatalog, ContactForm, LoginForm (5-view state machine), NewsletterForm, AIAssistantChat, `course-detail/` (EnrollButton, AboutCourse), `dashboard/`
- `src/lib/` — `db.ts` (Prisma singleton), `session.ts` + `auth.ts`, `course-tags.ts` (tags parsing for the What You'll Learn list), `course-eyebrow.ts` (card eyebrow display map), `metadata.ts` (`routeMetadata()` — per-route OG identity), `utils.ts` (`cn`)
- `prisma/` — `schema.prisma`, `seed.ts`, `seed-data.ts` (pure reference catalog — pinned by tests incl. imagery + lesson counts), `db-url.ts`
- `docs/screenshots/` — QA captures of the running app
- `skills/` — reference skill library (excluded from tsconfig/eslint; not app code)

## Conventions

- Style: Tailwind utility classes copied verbatim from the reference app; design tokens documented in the PAD §5 (Design System Reference) and `src/app/globals.css`.
- Components: function declarations (not arrow exports), `data-slot` attributes on primitives, `cn()` for class merging, CVA for button/badge variants.
- No raw SQL; all data access through Prisma. All route handlers validate input and return `{ error }` JSON with proper status codes.
- Computed-style parity with the reference app is a regression gate — if you change shared components (buttons, cards, nav), re-verify colors/radii/typography match the values recorded in `docs/screenshots/` and the PAD.
