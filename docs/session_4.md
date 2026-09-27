# Session 4 — Parity pass: page shells, About This Course, imagery, 404

Continuing from session 3 (`3cdb677`). This session's audit found that sessions 1–3
had verified page CONTENT thoroughly but left a systematic SHELL-level drift: the
live app wraps every non-landing page in `main.pt-20` + a `min-h-screen bg-gray-50`
div, while the clone rendered heroes directly under a bare main — leaving the
/Courses and /Dashboard h1 at y=64, hidden behind the 81px fixed navbar.

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667)

13 findings → `docs/remediation-plan-session4.md`:

1. **Page shells (7 pages)** — Courses, CourseDetail, Dashboard, About, Contact,
   BecomeInstructor, AIAssistant all lacked `main.pt-20` + the gray wrapper.
   Worst symptom: h1 behind the navbar on /Courses + /Dashboard (y=64 vs live 144).
2. **CourseDetail "About This Course"** — live has an expandable section (h2 +
   `line-clamp-6` description + Read More/Show Less toggle) on 4 courses.
3. **Seed imagery** — 3 course covers + 6 instructor avatars differed from live.
4. **Hero rhythms** — About/Contact/BecomeInstructor used `py-20`/`py-24` heroes
   (live: `pt-16 pb-XX px-4`); BI blur decorations were wrapped + mirrored.
5. **Contact container** — live: `max-w-6xl … -mt-6 pb-24` overlap (clone: py-24
   section + max-w-5xl).
6. **AI assistant shell** — max-w-4xl → max-w-3xl, Bot → Sparkles hero icon,
   fixed-height messages → `flex-1` in a `min-h-[60vh] flex` card, input →
   auto-growing textarea, bubble padding px-4 → px-5, avatars get `mt-1`.
7. **Nav "Home" href** → `/Home`.
8. **Footer hrefs** — Learning Paths/Help Center/FAQ/Privacy/Terms → real routes.
9. **404** — live is a light slate-50 design with the dynamic path in the message;
   the clone had invented a dark cosmic gradient page.
10–12. Accepted variances (login h1 font wrap, landing h1 ±25px, oklab white,
   live's corrupt Python image URL, mobile panel always-in-DOM).
13. **Lesson-count drift** (found during verification) — live re-captured:
    Python 178, ML 245, WebDev 380, Business 156 (1,904 total).

Mobile menu re-verified on BOTH sites: opens, ARIA, scroll lock, route-change
close; live has no ARIA/lock — clone's hardening kept; 6 e2e guards green.

## Remediation (TDD)

- **RED first**: 3 new seed-data unit tests + 14 new/updated e2e specs — verified
  failing against the pre-fix build (14/15 red; the AWS no-About spec passes
  trivially before the section exists).
- **GREEN**: page-shell restructures on all 7 routes; `AboutCourse` client
  component (nullable `Course.longDescription` added to the schema + seed);
  imagery + lesson-count corrections (re-seeded); hero rhythm + decor fixes;
  Contact overlap container; AI chat rework; Navbar/Footer hrefs; 404 rebuild
  (client component with `usePathname()` for the dynamic message).
- One follow-up fix during verification: live's AI hero icon wrapper carries
  `mb-4` (missed in the first truncated extraction) — added, h1 y 200 → 216 = live.
- **SEO files** (found while verifying `.env.example`): the live app serves
  `robots.txt` (allow-all + sitemap link) and a 9-route `sitemap.xml`; the clone's
  static `public/robots.txt` was a stale scaffold (extra `Disallow: /api/`, no
  sitemap link) and conflicted with the new app-router route — removed in favor of
  `src/app/robots.ts` + `src/app/sitemap.ts` (env-driven origin), making the
  documented `NEXT_PUBLIC_SITE_URL` real.

## Gates (final)

lint ✓ · typecheck ✓ · 21/21 unit ✓ · build ✓ · **50/50 e2e ✓** (34 → 50).

Visual re-verification vs live (desktop + mobile): main classes, gray wrappers
and h1 y-positions now match on all 7 reworked routes (144=144, 208/209, 216=216);
body heights: Dashboard/Contact/AIAssistant/Pricing/login byte-exact (1573/1573,
2369/2369, 1080/1080), CourseDetail 22611 vs 22610 (1px), landing ±31px and
Courses ±27px (image-load + title-wrap font variance, classes identical).

## Ship

- 17 fresh screenshots in `docs/screenshots/` (12 desktop incl. the new 404,
  4 mobile, mobile-menu-open).
- Docs aligned: README (69 tests), AGENTS (shell gotcha + longDescription note),
  CLAUDE (42 journey specs), PAD ([S4] revision + §4 schema + §7 distribution),
  SKILL.md v2.2.0. `.env.example` re-verified (covers all code references).
- Single commit on `main`, pushed via the SSH wrapper.
