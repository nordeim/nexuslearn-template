# Session 6 — Parity pass: OG identity, sidebar level row, pricing overlap, input/grid class parity

Continuing from session 5 (`0996edd` + the pulled `docs/session_7.md`
transcript). Sessions 1–5 closed static, shell, content, sub-section,
interactive-state and head-metadata parity; this session re-swept every
surface with fresh eyes — with particular attention to the **mobile
navigation menu** (the standing Tailwind v4 watchpoint) and the signed-in
**Dashboard** — and closed what the earlier passes could not see: the
per-route **OG identity**, the CourseDetail sidebar **level row**, the
/Pricing **overlap wrapper**, and a set of verbatim **class-string drifts**
(input, grids, bubble, button, badge).

## Audit (agent-browser, live vs clone, 1920×1080 + 375×667)

13 findings → `docs/remediation-plan-session6.md`. Highlights:

1. **Per-route OG identity** — live mirrors the document title into
   `og:title` + `twitter:title` on every route ("Courses | NexusLearn",
   "Course Detail | NexusLearn", plain "NexusLearn" on `/` + `/login`) and
   the canonical into `og:url` (CourseDetail's includes the `?id=` query).
   The clone shipped static root values everywhere.
2. **CourseDetail sidebar level row** — live ends the "What You'll Learn"
   card with a `mt-6 pt-6 border-t` divider holding the lucide `Award`
   icon (`text-amber-500`) + "`{level} Level`" on every course. The clone
   stopped after the tag checklist (453 vs 452 flex rows — the audit's
   off-by-one tracer).
3. **/Pricing overlap** — live wraps the cards section in `div.-mt-8` >
   `section.py-24.px-4.bg-gray-50` (pulled 32px over the hero bottom);
   the clone's bare section left the page 32px taller. Desktop now
   byte-exact 2369 = 2369.
4. **/Courses hero search input** — live ships `h-9` + `py-6` on a
   `type="text"` input (border-box collapses the content box → 50px; same
   mechanism as the session-5 newsletter finding); the clone lacked `h-9`
   and used `type="search"` (74px). Fixed → 50px = 50px.
5. **Landing structure + grids** — live wraps the hero + 8 sections in a
   classless div inside `main` and pins the hero with `min-h-[100vh]`;
   grid bases drifted (featured + testimonials missing `grid-cols-1`,
   learning paths switch at `lg:` on live, not `md:`).
6. **AI assistant** — welcome bubble `py-16` (clone had `py-12`), chat
   card without `overflow-hidden`. Desktop now byte-exact 1573 = 1573.
7. **Class-string drifts** — Enroll Now button (full shadcn base:
   `[&_svg]` trio, `hover:bg-primary/90`, `disabled:opacity-50`), card
   level badge (`hover:bg-primary/80 border-0`), catalog fragment (hero +
   content as the gray wrapper's direct children).

**Re-verified green (no action):** signed-in + signed-out Dashboard
(desktop byte-exact 1573; text-identical mobile), mobile menu on BOTH
sites at 375×667 (opens, 9 links, ARIA, scroll lock, route-change close,
desktop row `display:none` — **no Tailwind v4 display bug on either
site**), signup → verify → signed-in walk, enroll → lesson progress →
stat recompute (1/95 → 1%), newsletter + contact success states, AI chat
(real responses), footer, 404, `/Home`, lesson counts (1,904 — **no
drift**), all 9 course cards' data/imagery/prices/levels.

**Accepted variances (documented):** font-metric wraps (card titles,
AI hero subtitle, login h1, footer, landing accumulation — live resolves
system "Inter" with no @font-face while the clone self-hosts next/font
Inter), live's scroll-reveal animation wrappers, the hero's deliberate
sRGB arbitrary-value gradient form (computed identical), clone's a11y
hardening + real enrollment + working Python image, lucide path variants.

## Remediation (TDD)

- **RED first**: 17 new e2e specs + 5 unit tests (`tests/metadata.test.ts`)
  — verified failing against the pre-fix build (15/17 e2e RED; 2
  regression guards already green; unit RED on the missing module).
- **GREEN**:
  - `src/lib/metadata.ts` (new) — `routeMetadata({ title?, canonical })`
    helper: resolves the document title, mirrors it into og:title +
    twitter:title, points og:url at the canonical, and restates the full
    OG/Twitter payload (a child route's `openGraph`/`twitter` objects
    REPLACE the root's wholesale in Next.js). Root layout keeps the `/`
    defaults; every route (incl. CourseDetail's `generateMetadata` with
    the `?id=` query and the title-less `/login`) swaps the helper in.
  - `CourseDetail/page.tsx` — the reference level row (Award icon +
    "{level} Level") closing the sticky sidebar card.
  - `Pricing/page.tsx` — the `div.-mt-8` overlap wrapper +
    `bg-gray-50` inner section.
  - `CourseCatalog.tsx` — reference input classes (`h-9 w-full …
    file:text-foreground … pl-12 py-6 …`, type=text) + root fragment.
  - `page.tsx` (landing) — hero `min-h-[100vh]`, classless main wrapper,
    grid bases (featured `grid-cols-1`, paths `lg:grid-cols-3`,
    testimonials `grid-cols-1`).
  - `AIAssistantChat.tsx` — `py-16` welcome bubble, no `overflow-hidden`.
  - `EnrollButton.tsx` / `CourseCard.tsx` — verbatim reference class
    strings.
- Spec hardening during the run: the Courses structure spec raced the
  Suspense fallback (count=1 mid-hydration) — now waits for the catalog
  grid; a CSS-selector form that cannot match bracket-containing class
  tokens was replaced with count + class assertions.

## Gates (final)

lint ✓ · typecheck ✓ · 29/29 unit ✓ · build ✓ · **85/85 e2e ✓** (68 → 85).

Visual re-verification vs live: OG identity matches per route; level row
renders on every course (453 = 453 flex rows); Pricing desktop
**byte-exact 2369** (was 2401); Courses input **50px = 50px**; AIAssistant
desktop **byte-exact 1573**; CourseDetail 1px (documented band); landing
±41px desktop (accepted font band); mobile heights within the documented
accumulated font-wrap bands with all structural offsets removed; mobile
menu regression green (open/ARIA/lock/route-close, no Tailwind v4 display
bug on either site).

## Ship

- 15 fresh dev-server screenshots in `docs/screenshots/` (landing,
  courses, course-detail incl. the level row, pricing incl. the overlap,
  dashboard, AI assistant, login, about, contact, becomeinstructor,
  course-not-found + mobile landing/menu-open/courses/dashboard/login).
- Docs aligned: README (badge 114, testing + feature rows), AGENTS (2 new
  gotchas: OG identity via routeMetadata, sidebar level row), CLAUDE
  (pyramid 29+85, parity behaviors), PAD ([S6] revision),
  nexuslearn-template_SKILL.md v2.4.0. `.env.example` re-verified (no new
  variables — DATABASE_URL / AUTH_SECRET / NEXT_PUBLIC_SITE_URL cover all
  code references).
