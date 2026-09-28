---
name: nexuslearn-template
description: "NexusLearn — e-learning platform (Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS v4 CSS-first + Prisma 6/SQLite + first-party cookie auth). Complete engineering reference distilled from a 10-session build: pixel-parity clone methodology (computed-style gates + VLM band comparisons), the four Tailwind v4 migration traps (bare-HSL transparent theme, oklch palette drift, in-oklab gradients, and the space-y/space-x selector rewrite — v4's :where() zero-specificity engine lets a child's mt-3 win where v3 overrode it), the hardened mobile navigation pattern, multi-surface SQLite path resolution (CLI vs runtime vs standalone chdir trap), the reference page-shell pattern (main.pt-20 + gray wrapper under the fixed navbar), the reference-behavior parity decisions (sign-in to /, public dashboard, /Home landing WITH its hero-state navbar, 2-col AI section, dark popular pricing card, FAQ stack, expandable About This Course, light-slate 404, in-page CourseDetail not-found, simulated-delivery signup + verify), the head-metadata parity layer (root description, OG/Twitter cards, canonicals, logo favicon, manifest, per-route OG identity via a routeMetadata() helper), the CourseDetail sidebar level row + tags-only What-You'll-Learn list, the idempotent seed (Prisma update skips undefined keys — restate optional fields as null), the pricing -mt-8 overlap, the h-9+py-6 input collapse pattern, the chrome-subtree audit pattern (the Navbar lives outside <main> — a main*-scoped class diff never catches its drift), the route-STATE audit pattern (/Home renders the landing CONTENT but its navbar state escaped every audit that only checked content + height), the synced-viewport audit rule (set BOTH browser sessions' viewports in the same command — a live@1920 vs clone@375 comparison produces false 4-digit px drifts), and the full test pyramid (31 Vitest unit + 133 Playwright e2e incl. 12 mobile-nav guards)."
version: 2.8.0
last_updated: "2026-09-29"
project_state: "164 tests green (31 unit + 133 e2e); lint/typecheck/build clean; parity verified vs live reference (session-10 pass: the /Home hero-state navbar — the live app renders /Home (the reference footer target) with the FULL landing treatment: transparent navbar + white logo + text-white/80 mobile trigger at scroll 0 flipping to the white-nav after scroll, byte-identical to /; the clone's overHero detection covered only / and now covers both routes; plus the 404 wrapper hardening pin — the main landmark + min-h-dvh page root are deliberate documented variances vs the live's landmark-less div.min-h-screen, now pinned by a spec; sessions 1-9 previously closed shells, content, head, OG identity, login state machine, class-verbatim, display-order, section-design, seed-idempotency, space-y-engine and navbar-chrome parity)"
---

# NexusLearn — Complete Engineering Skill

> Single Next.js application (no monorepo) that clones a production e-learning
> reference app to pixel and behavioral parity: marketing site, course catalog,
> enrollment with per-lesson progress, learner dashboard, AI study assistant.
> Runtime is **bun**; database is SQLite via Prisma; auth is first-party
> (HMAC cookie + scrypt) — no external providers.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client/Server Boundary Patterns](#6-clientserver-boundary-patterns)
7. [Data Model & Seed Parity](#7-data-model--seed-parity)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [TypeScript Interface Reference](#20-typescript-interface-reference)
21. [Appendix A — The Parity Workflow](#appendix-a--the-parity-workflow)
22. [Appendix B — Quick Reference Card](#appendix-b--quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**What it is:** a faithful clone of `nexuslearn-template.base44.app` — an
e-learning product loop: browse → sign in → enroll → track progress → ask the
AI assistant. Everything runs from ONE Next.js app with a zero-config SQLite
database and first-party cookie sessions.

**The three pillars:**

1. **Parity is a requirement, not a nicety.** Shared chrome (buttons, cards,
   nav, footer) uses class strings copied verbatim from the reference DOM; the
   v3-era color palette is pinned so computed styles match byte-for-byte;
   behavioral quirks of the reference (sign-in returns to `/`, dashboard
   renders for signed-out visitors, `/Home` renders the landing) are
   replicated deliberately and pinned by e2e specs.
2. **Improvements are allowed where the reference is broken.** The reference's
   enroll button and "Continue with Google" are dead template buttons; this
   clone implements REAL enrollment + progress + AI chat. The reference has no
   ARIA and no scroll lock on its mobile menu; the clone adds both. Document
   every such decision (PAD §10) so future agents don't "fix" them backwards.
3. **The local gate is the only gate.** No hosted CI — the required sequence
   is `lint → typecheck → test → build → test:e2e`, all green before push.

**Project layout:** single app, routes mirror the reference casing
(`/Courses`, `/AIAssistant`, `/CourseDetail?id=…`, `/BecomeInstructor`,
`/Dashboard`, `/login`), `skills/` folder ships as reference material and is
excluded from tsconfig/eslint/vitest/playwright.

---

## 2. Tech Stack & Environment

| Layer | Technology | Locked version | Why |
|---|---|---|---|
| Framework | Next.js (App Router, `output: "standalone"`) | 16.3.6 | Server components + route handlers |
| UI runtime | React (function components only, no forwardRef) | 19.3 | Reference stack |
| Language | TypeScript strict (noImplicitAny off) | 5.9 | Reference stack |
| Styling | Tailwind CSS **CSS-first** (no config JS) | 4.3.3 | Reference stack parity |
| Components | shadcn/ui-style + Radix primitives + CVA | latest | Reference markup uses shadcn buttons |
| ORM | Prisma (SQLite provider) | 6.19 | Zero-config local dev |
| Auth | first-party `node:crypto` (HMAC-SHA256 + scrypt) | — | No provider lock-in |
| AI | z-ai-web-dev-sdk (server-only) | 0.0.18 | Study assistant |
| Unit tests | Vitest (node env) | 5.0 | Pure seam testing |
| E2E | Playwright (Chromium) | 1.63 | Production-fidelity flows |
| Runtime/PM | **bun** (`bun.lock` authoritative) | 1.3.x | Fast installs; `npm` works with package-lock.json |

**Environment variables** (`.env.example` is canonical):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:../db/custom.db` — schema-relative (resolves against `prisma/`); absolute path in production |
| `AUTH_SECRET` | production | HMAC session secret (`openssl rand -hex 32`); insecure dev fallback warns |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin for metadata/robots |

**Test inventory (verified green):** 31 unit tests across 5 files
(`auth.test.ts` 5, `course-tags.test.ts` 3, `course-eyebrow.test.ts` 3,
`seed-data.test.ts` 15 — incl. the reference imagery/avatar map,
lesson-count pins, display-order pins, the longDescription presence matrix
and the metadata helper) + 133 e2e specs across 2 files
(`mobile-navigation.spec.ts` 12, `nexuslearn.spec.ts` 121 — incl. the 9
session-3 parity specs, the 16 session-4 specs (page shells, About-Course,
AI chat shell, 404, robots/sitemap), the 18 session-5 specs (head
metadata incl. manifest, the login 5-view state machine (reset, reset-sent,
signup, 6-digit verify, duplicate-email + password-mismatch errors), the
in-place newsletter success state, the CourseDetail not-found state, the EQ
eyebrow short label, Home-active-on-/ nav state and the BI/Pricing/About
class parity pins), the session-6/7 blocks, the 15 session-8 specs (the
About-presence matrix across all 9 courses — the seed-idempotency guard,
the tags-only WYL list + single divider level row, and the Dashboard class
parity: bare stats grid, lucide stat icons, empty-state button bases), the
6 session-9 specs (the Tailwind v4 space-y engine trap — the mobile
panel CTA's 4px reference gap + the 405px open panel + the panel button
base; the bare trigger string on both nav states; the desktop My Dashboard
button base trio; the logo span byte order) and the 5 session-10 specs
(the /Home hero-state navbar on desktop + mobile incl. the scroll flip and
the /Home panel geometry; the 404 wrapper's deliberate main.min-h-dvh
hardening pin).

---

## 3. Bootstrapping & Configuration

```bash
bun install
bun run db:push     # create db/custom.db from prisma/schema.prisma
bun run db:seed     # 9-course reference catalog + 1,904 lessons + demo user
bun run dev         # http://localhost:3000
```

**Scripts that matter** (package.json):

| Script | What it does |
|---|---|
| `dev` | `next dev -p 3000` (tees to dev.log) |
| `build` | `next build` + copies `static/` and `public/` into `.next/standalone/` |
| `start` | `NODE_ENV=production bun .next/standalone/server.js` |
| `test` / `test:e2e` | Vitest / Playwright (e2e REQUIRES `build` first — boots :3100 with `db/e2e.db`) |
| `db:push` / `db:seed` | Prisma schema push + idempotent seed |

**Configuration files and their invariants:**

- `next.config.ts` — `output: "standalone"`, `reactStrictMode: true`,
  `images.remotePatterns` allowlists `images.unsplash.com` +
  `qtrypzzcjebvfcihiynt.supabase.co`.
- `tsconfig.json` — strict, `@/*` → `./src/*`, **excludes `skills`**.
- `eslint.config.mjs` — flat config, extends next core-web-vitals + TS;
  `no-img-element` deliberately off (reference parity uses `<img>`); ignores
  include `skills`.
- `vitest.config.ts` — node env, `include: ["src/**/*.test.ts", "tests/**/*.test.ts"]`
  (never matches `tests/e2e/*.spec.ts`), `@` alias.
- `playwright.config.ts` — 1 worker (shared seeded SQLite), `globalSetup`
  pushes+seeds+resets `db/e2e.db`, `webServer` boots the standalone build on
  :3100 with explicit `DATABASE_URL=file:../db/e2e.db` +
  `AUTH_SECRET=playwright-e2e-session-secret`.
- `postcss.config.mjs` — `@tailwindcss/postcss` only.

---

## 4. The Design System (Code-First)

Everything lives in `src/app/globals.css`. **There is no `tailwind.config.js`
and there must never be one** (Tailwind v4 is CSS-first).

### 4.1 Token architecture

```
@theme inline  — maps --color-* to the :root vars (shadcn bridge)
:root           — shadcn HSL base, MUST be hsl()-wrapped full values
@theme          — pinned v3-era utility palette + brand tokens
```

### 4.2 The two non-negotiable palette rules

1. **`hsl()` wrapping:** `--background: hsl(0 0% 100%)` — never the v3-style
   bare triplet `0 0% 100%`. Under `@theme inline` a bare triplet computes to
   **transparent**. This bug produced an all-transparent theme and was found
   via `getComputedStyle(document.body).backgroundColor`.
2. **Pinned v3 hexes:** `--color-gray-900: #111827` etc. for gray/slate/
   cyan/purple/pink/…. Tailwind v4's default oklch palette drifts 1–3 sRGB
   units per channel from the v3 hexes the reference renders, breaking
   computed-style parity AND changing rendered `rgb()` strings.

### 4.3 Brand tokens (measured from the reference `:root`)

| Token | Value | Usage |
|---|---|---|
| `--color-brand-cyan` | `#18ccfc` | gradient start |
| `--color-brand-purple` | `#6344f5` | gradient end |
| `--color-brand-pink` | `#ae48ff` | gradient text end |
| `--color-cosmic-950` | `#0a0a1a` | dark section gradient edge |
| `--color-cosmic-900` | `#0d0d2b` | dark section gradient middle |

### 4.4 Gradients — the `in oklab` trap

Tailwind v4's `bg-gradient-to-br` emits `linear-gradient(to bottom right in
oklab, …)`; the reference (v3) emits plain sRGB interpolation. For dark hero
sections this is visually negligible but breaks computed-style equality. The
parity solution is the arbitrary-value class:

```tsx
<div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]">
```

This renders `linear-gradient(to right bottom, rgb(10,10,26), rgb(13,13,43),
rgb(10,10,26))` — byte-identical to the reference. Content pages keep the
utility form (`bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]`)
where the hero is not parity-gated.

### 4.5 The cosmic section recipe

Dark sections (landing hero, Courses/CourseDetail/Dashboard/About/Contact/
BecomeInstructor heroes, AI section, CTA) share:

- cosmic gradient background (see 4.4)
- landing hero: radial purple glow
  `bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]`
  + corner blurs (`bg-purple-600/10` / `bg-cyan-500/8`, `rounded-full blur-3xl`)
- AI section (session-3 parity): quarter-position blurs — `top-0 left-1/4
  w-96 h-96 bg-purple-600/10` + `bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10`
- newsletter CTA (session-3 parity): one centered 600px blur — `top-1/2 left-1/2
  -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10`
- white headline, `text-gray-400` body, cyan→purple CTA buttons

---

## 5. Component Architecture & Patterns

### 5.1 Layer model (the golden import rule)

```
app routes (server)  →  components (server)  →  leaf client components
        ↘ lib (db/session) ↗
```

- Server components fetch via Prisma directly and pass plain serializable
  props across the `"use client"` boundary.
- Client components are leaf interactive widgets only (catalog filters, chat,
  forms, navbar, progress cards) — they never import `db` or `session`.
- `z-ai-web-dev-sdk` is imported ONLY inside `src/app/api/ai/chat/route.ts`.

### 5.2 Component inventory

| Component | Type | Purpose |
|---|---|---|
| `Navbar` | client | 2 visual states (transparent over hero / white-blurred) + hardened mobile dropdown |
| `Footer` | server | 4-col grid, boxed socials (Twitter/LinkedIn/YouTube/Instagram), tagline bottom bar |
| `CourseCard` | server | verbatim reference card markup |
| `CourseCatalog` | client | dark hero search + floating filter card + grid |
| `LoginForm` | client | 5-view state machine: signin → reset → reset-sent → signup → verify (6-digit code inputs); slate Sign-in button + shadcn alerts, classes verbatim from the reference |
| `NewsletterForm` / `ContactForm` | client | fetch POST + in-place success states (never native form POST) |
| `AIAssistantChat` | client | chat UI + dependency-free markdown renderer |
| `dashboard/MyCourses` | client | progress cards, capped checklist, mark-done |
| `course-detail/EnrollButton` | client | enroll → API → Continue Learning |
| `ui/*` | mixed | shadcn-style primitives (button/badge/card/input/label/select/textarea/skeleton) with `data-slot` attrs + CVA |

### 5.3 The Navbar contract (highest-regression chrome)

- **Symmetric breakpoints:** desktop row `hidden md:flex`; trigger AND panel
  `md:hidden`. Never mix `sm`/`lg` into this pair (Display-Mismatch bug).
- Page roots use `min-h-dvh` (not `min-h-screen`) to avoid mobile URL-bar warp.
- Body scroll lock while the menu is open; released on route change.
- Real `<button>` trigger with `aria-expanded` + `aria-controls` + `aria-label`.
- Panel animates with CSS grid-rows `0fr→1fr` — no ref measurement, no height
  math, no setState-in-effect (React 19 + eslint clean).
- Open state derives from pathname (`openFor === pathname`) so navigation
  closes the menu without an effect; Escape closes via keydown listener.
- Closed panel must not leak a `border-t` artifact (border only while open).
- The reference has NONE of these hardenings (no ARIA, no lock, unmounts the
  panel). The clone's version is deliberately better — do not "simplify" it.

### 5.4 Server/client metadata split

Client pages can't export metadata. Pattern (AIAssistant): thin server
`page.tsx` exporting `metadata` + rendering the client component
(`AIAssistantChat`). Login page uses the layout default (`title` omitted →
"NexusLearn", matching the reference's untitled login tab).

---

## 6. Client/Server Boundary Patterns

### 6.1 Session handling

`src/lib/session.ts` (pure, vitest-tested): HMAC-SHA256 token sign/verify +
scrypt hash/verify — zero Next imports so tests run in node env.
`src/lib/auth.ts`: `getSession()` via `cookies()` + `SESSION_COOKIE` +
`sessionCookieOptions`.

### 6.2 Reference parity behaviors (deliberate — pinned by e2e)

| Behavior | Reference | Clone |
|---|---|---|
| After sign-in | returns to `/` | `router.push("/")` in LoginForm |
| `/Dashboard` signed out | renders "Welcome back" (no name), zeroed stats, empty state | session optional in the server component; no redirect |
| `/Home` | renders the landing (footer logo target) | re-exports the landing page (`export const dynamic = "force-dynamic"; export { default } from "../page";`) |
| Login tab title | "NexusLearn" (no prefix) | metadata `title` omitted → layout default |
| Enroll / Google buttons | Enroll is REAL (core feature); Google stays presentational (the reference's IS wired to real Google OAuth via the base44 platform — not transferable without the operator's own OAuth client) |
| Signup + verification | in-card signup → 6-digit code → signed in | REAL (signup/verify routes; delivery simulated — code logged server-side, any 6 digits verify; `User.emailVerified`, seeded users skip) |
| Forgot password | reset view → "Check your email" state | REAL (forgot-password route always ok — no user enumeration; no reset link without SMTP, documented) |
| CourseDetail bad id | in-page "Course not found" + Browse Courses (never the 404) | rendered inside the gray shell for missing/unknown ids |
| Newsletter submit | fetch + in-place green success row | client island (never native action= POST — that navigates to raw JSON) |

### 6.3 Progress flow (the one computed aggregate)

`POST /api/enrollments/progress` upserts a LessonProgress row, recomputes
`progress = completedCount / totalLessons * 100`, updates `completedAt`, and
returns `completedLessonIds` (the actual IDs, not a count) so the dashboard
checklist reflects out-of-order completion. The client updates its Set from
that array and calls `router.refresh()` so server stat cards update live.

---

## 7. Data Model & Seed Parity

### 7.1 Models (`prisma/schema.prisma`)

- `User` (email unique, scrypt passwordHash)
- `Course` — display aggregates (`rating`, `students`, `hours`,
  `lessonsCount`) exactly as the reference reports them, plus **`tags`**:
  comma-separated What-You'll-Learn topics (SQLite has no scalar lists).
- `Lesson` (courseId, title, sortOrder) — seeded as `lessonsCount` rows per
  course titled `Lesson N: Module Content` (the reference's auto-generated
  curriculum: 220 for AWS, 380 for the bootcamp, 1,904 total — re-captured
  in session 4 after live drift). `Course.longDescription` (nullable) feeds
  the expandable "About This Course" block on 4 of the 9 courses.
- `Enrollment` — unique `[userId, courseId]` (idempotent upsert), derived
  `progress` 0–100, `completedAt`.
- `LessonProgress` — unique `[enrollmentId, lessonId]`, `completed`,
  `completedAt`.
- `ContactMessage`, `Subscriber` (email unique).

### 7.2 Seed architecture (pure + test-pinned)

`prisma/seed-data.ts` exports `COURSES` (the 9-course reference catalog with
tags) and `buildLessons(lessonsCount)` — pure, no side effects, imported by
both `prisma/seed.ts` and `tests/seed-data.test.ts`. The seed is idempotent
(upsert courses, replace lesson sets, upsert demo user
`sepnetflix2023@outlook.com` / `$Abcd1234`) — and it CLEARS optional fields:
the upsert's `update` payload restates `longDescription: c.longDescription ??
null` because Prisma skips undefined keys (session 8's stale-row bug: the
session-7 reorder left the pre-reorder texts on seed-3/4/5, rendering
phantom About sections the live app does not have).

### 7.3 Tag parsing (`src/lib/course-tags.ts`)

```ts
parseTags(tags)                  // "AWS, Cloud" → ["AWS", "Cloud"] (null-safe)
```

The reference's What-You'll-Learn card shows the course tags ONLY — the
level renders once, in the separate Award-icon divider row (`mt-6 pt-6
border-t`). `parseTags` is unit-tested. (Session 8 removed the old
`whatYouLearnTopics()` tags+level helper — the live check list carries no
level row.)

### 7.4 SQLite path resolution (the hard-won seam)

Relative `file:` URLs resolve differently per Prisma surface: **CLI** →
against `prisma/schema.prisma`; **runtime** → against process CWD; the
**standalone server** `chdir()`s into `.next/standalone/` which contains its
own traced `prisma/schema.prisma` (a FALSE anchor — "nearest anchor" is
wrong). `prisma/db-url.ts` walks ancestors from CWD, collects every anchor,
and prefers the **furthest anchor whose resolved DB file exists** (fallback:
furthest anchor). Every PrismaClient goes through
`datasourceUrl: resolveDatabaseUrl()` (`src/lib/db.ts`, `prisma/seed.ts`).
Prisma 6 **ignores** the older `datasources: { db: { url } }` option.

**The shell-export trap:** a `DATABASE_URL` already exported in the shell
wins over the repo `.env` (standard precedence). A stale absolute export
silently retargets `db:push`/`db:seed`/`dev` to another file — the failure
mode is "Error code 14: Unable to open the database file" or data landing in
the wrong place. Detect with `printenv DATABASE_URL`; fix by unsetting it or
pinning per command: `DATABASE_URL="file:../db/custom.db" bun run db:seed`.

---

## 8. Accessibility Implementation

- Mobile menu: full ARIA wiring (see §5.3) — beyond the reference.
- Icon-only buttons carry `aria-label` (footer socials, chat send, hamburger).
- Decorative SVGs/emoji icons carry `aria-hidden="true"`.
- Forms use real `<label htmlFor>` (login, contact).
- Focus-visible rings retained on all interactive primitives (shadcn base).
- `min-h-dvh` page roots for mobile viewport correctness.
- Images have alt text (course/instructor images use meaningful titles).
- Known gap (documented, open): no `prefers-reduced-motion` handling yet.

---

## 9. Anti-Patterns & Common Bugs

| # | Anti-pattern | Symptom | Fix |
|---|---|---|---|
| 1 | Bare HSL triplet in `:root` under `@theme inline` | whole theme renders transparent | wrap: `hsl(0 0% 100%)` |
| 2 | Removing the pinned v3 palette | colors drift 1–3 units vs reference; parity assertions fail | keep `@theme` hex pins |
| 3 | Creating `tailwind.config.js` | v4 ignores/duplicates tokens; confusion | CSS-first only |
| 4 | PrismaClient without `resolveDatabaseUrl()` | wrong/missing DB file per surface (dev vs CLI vs standalone) | always `datasourceUrl: resolveDatabaseUrl()` |
| 5 | `datasources: { db: { url } }` | silently ignored by Prisma 6 | use `datasourceUrl` |
| 6 | Mixed `sm`/`md`/`lg` in the mobile nav pair | menu and trigger out of sync at some widths | symmetric `md:hidden` / `hidden md:flex` |
| 7 | Accessing refs during render for panel height | React 19 violation, lint error | CSS grid-rows 0fr→1fr animation |
| 8 | setState synchronously in effect body | `react-hooks/set-state-in-effect` lint error | wrap initial sync in `requestAnimationFrame` |
| 9 | Stale standalone bundle for e2e | tests fail on removed/changed code paths | always `bun run build` before `test:e2e` |
| 10 | Persisted enrollments in the e2e DB | "Enroll Now" became "Continue Learning", specs break | global-setup resets enrollments every run |
| 11 | Importing `z-ai-web-dev-sdk` in a client component | bundle/secret leak | server-only in `api/ai/chat/route.ts` |
| 12 | Reading `course.tags` before regenerating Prisma client + restarting dev server | `undefined.split` crash | `bunx prisma generate`, restart dev, and parseTags is null-safe |
| 13 | Re-exporting `dynamic` config from another page (`export { dynamic } from "../page"`) | Next build error: route segment config must be statically parseable | define `export const dynamic` locally |
| 14 | Client page exporting metadata | title silently missing | thin server page + client component |
| 15 | Deriving completed lessons by count (`slice(0, n)`) | wrong rows checked when lessons completed out of order | return + store `completedLessonIds` |
| 16 | Trusting VLM full-page comparisons | below-fold sections "missing" hallucinations | band-crop sections + verify every claim against the DOM |

---

## 10. Debugging Guide

| Symptom | Root cause | Procedure |
|---|---|---|
| Everything transparent / no theme colors | bare HSL triplets | inspect `getComputedStyle(document.body).backgroundColor`; fix globals.css |
| "Unable to open the database file" (Error 14) | wrong path per surface OR stale shell export | `printenv DATABASE_URL`; verify `db/custom.db` at repo root; re-run push/seed with pinned env |
| Dev data missing after schema change | dev server has old Prisma client in memory | `bunx prisma generate` + restart dev server |
| e2e login fails on standalone | stale build | `bun run build` then `test:e2e` |
| Login works but sessions don't verify | `AUTH_SECRET` changed between restarts | keep stable; e2e pins it in playwright.config |
| Mobile menu won't open | display-mismatch classes | run `tests/e2e/mobile-navigation.spec.ts`; check symmetric md pair |
| 1px line under transparent nav when menu closed | closed-panel border artifact | border only in the open state |
| Page 500s on `/CourseDetail` after seed | tags column missing from the DB (push ran against wrong file) | re-push with pinned DATABASE_URL, re-seed |
| Colors slightly off vs reference | oklch drift or `in oklab` gradient | pinned palette; arbitrary-value gradient class |
| VLM reports missing sections | full-page downscale hallucination | crop bands; verify in DOM |

---

## 11. Pre-Ship Checklist

```bash
bun run lint         # eslint clean
bun run typecheck    # tsc --noEmit clean
bun run test         # 32/32 unit
bun run build        # standalone compiles
bun run test:e2e     # 68/68 incl. 6 mobile-nav
```

- [ ] Mobile menu manually eyeballed at 375×667 (screenshot vs `docs/screenshots/`)
- [ ] No new `tailwind.config.js`
- [ ] No SDK/secret imports in client components
- [ ] `.env` contains no real secrets; `.env.example` matches the code
- [ ] Parity spot-check if shared chrome changed (colors/radii vs reference)
- [ ] New behaviors pinned by e2e specs (not just manually verified)
- [ ] Push via SSH wrapper (`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`); keys stay outside the repo; `main` only

---

## 12. Lessons Learnt & How to Avoid Them

1. **Extraction beats eyeballing.** Every class string in this codebase came
   from DOM/computed-style extraction of the reference, never from memory.
   When in doubt, re-extract (`agent-browser eval` + `getComputedStyle`).
2. **The reference IS the spec — including its quirks.** Sign-in to `/`,
   public dashboard, dead Google button: replicate deliberately, pin with
   specs, document in PAD §10 so nobody "fixes" parity backwards.
3. **Tailwind v4 migration has exactly three visual traps** (bare HSL →
   transparent; oklch drift; `in oklab` gradients). All three were found via
   computed-style comparison, not visual inspection.
4. **VLM comparisons must be band-cropped.** Full-page screenshots get
   downscaled past reliability; sections below the fold "disappear".
   Always cross-check VLM claims against the DOM.
5. **Env precedence bites in sandboxes.** A stale exported `DATABASE_URL`
   silently redirected schema pushes away from the repo DB. `printenv`
   before any DB command; pin per command when in doubt.
6. **Route segment config must be locally defined.** Next.js statically
   parses `dynamic`/`revalidate` — re-exports break the build.
7. **Return IDs, not counts, for completion state.** Count-based slicing
   breaks under out-of-order completion; `completedLessonIds` is the truth.
8. **Prisma client generation is process-cached.** After schema changes,
   regenerate AND restart the dev server, or fields read as `undefined`.
9. **Bound the DOM for generated content.** 375-lesson curricula render fine
   as data, but checklists need a preview cap + expander.
10. **Session-1 debugging artifacts pollute session-2 environments.** Files
    created outside the repo (`../db/`, shell exports) outlive their purpose;
    audit the sandbox between sessions.

---

## 13. Pitfalls to Avoid

- Do NOT remove the pinned palette, the `hsl()` wrapping, or the arbitrary
  cosmic gradient classes.
- Do NOT add `tailwind.config.js`, `forwardRef`, or class components.
- Do NOT construct PrismaClient anywhere without the resolver.
- Do NOT change route casing (`/Courses` etc.) — parity + tests depend on it.
- Do NOT redirect `/Dashboard` to `/login` or sign-in to `/Dashboard` —
  both are pinned reference behaviors now.
- Do NOT "fix" the mobile menu to match the reference's unhardened version.
- Do NOT run e2e without a fresh `bun run build`.
- Do NOT commit `db/*.db`, `.env` with secrets, or SSH keys (gitignore
  already rejects `*.key`, `ssh-key.txt`).
- Do NOT trust full-page VLM verdicts (see lesson 4).

---

## 14. Best Practices

- Extract, then build: pull exact class strings and computed styles from the
  reference before writing markup.
- Keep pure seams pure: crypto, tag parsing, and seed data have zero Next
  imports so vitest covers them in node env.
- Pin every deliberate behavior with a spec (parity behaviors, mobile nav,
  curriculum shape, footer content).
- One DB everywhere: the resolver + explicit e2e env make CLI/dev/seed/
  standalone/e2e all hit `<repo>/db/*.db`.
- Document decisions in the PAD (ADRs, §10 known issues) — the docs are the
  diff between "looks right" and "is right".
- Run the gate in order; the build output feeds e2e.
- Keep client components as leaves; server components own data + metadata.
- Write the failing test first for pure logic (tags, seed shape), and
  update e2e expectations BEFORE reworking pages (TDD at the UI layer).

---

## 15. Coding Patterns

### 15.1 The parity hero (dark section)

```tsx
<div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]">
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]" />
  </div>
  <div className="relative z-10">{/* content */}</div>
</div>
```

### 15.2 Floating filter card over a hero

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 -mt-6">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-wrap items-center gap-4">
      {/* selects + Clear Filters (ml-auto) + count (ml-auto when idle) */}
    </div>
    <div className="mt-10 pb-24">{/* grid */}</div>
  </div>
</div>
```

### 15.3 Measurement-free height animation (mobile panel)

```tsx
<div className={cn(
  "md:hidden bg-white grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
  open ? "grid-rows-[1fr] opacity-100 border-t border-gray-100" : "grid-rows-[0fr] opacity-0 border-t-0"
)}>
  <div className="min-h-0 overflow-hidden">{/* links */}</div>
</div>
```

### 15.4 Reference curriculum rendering

```tsx
{course.lessons.map((lesson, i) => (
  <div key={lesson.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{i + 1}</div>
    <span className="text-gray-700 font-medium">{lesson.title}</span>
    <CirclePlay className="h-5 w-5 text-gray-400 ml-auto" aria-hidden="true" />
  </div>
))}
```

### 15.5 What-You'll-Learn topics

```tsx
const topics = parseTags(course.tags);
// ["AWS","Cloud","DevOps","Serverless","Microservices"]
// The level renders ONCE — in the Award-icon divider row (session 8).
```

---

## 16. Coding Anti-Patterns

```tsx
// ❌ bare triplet (transparent under @theme inline)
--background: 0 0% 100%;
// ✅
--background: hsl(0 0% 100%);

// ❌ ignored by Prisma 6
new PrismaClient({ datasources: { db: { url } } });
// ✅
new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

// ❌ ref measurement for panel height
const ref = useRef<HTMLDivElement>(null);
useEffect(() => { ref.current.style.height = open ? `${ref.current.scrollHeight}px` : "0"; });
// ✅ CSS grid-rows 0fr→1fr (see 15.3)

// ❌ count-derived completion
setCompleted(new Set(lessons.slice(0, data.completedLessons).map(l => l.id)));
// ✅ id-derived completion
setCompleted(new Set(data.completedLessonIds));

// ❌ re-exported route config
export { default, dynamic } from "../page";
// ✅
export const dynamic = "force-dynamic";
export { default } from "../page";
```

---

## 17. Responsive Breakpoint Reference

| Breakpoint | Tailwind | Used for |
|---|---|---|
| 640px | `sm` | hero h1 step (`text-4xl sm:text-5xl`), CTA row stacking, contact form 2-col |
| 768px | `md` | **the** nav breakpoint (symmetric pair), `md:grid-cols-2`/`3`/`4` grids, `md:text-xl` hero copy, About badge visibility (`hidden md:block`) |
| 1024px | `lg` | 3-col layouts (CourseDetail `lg:grid-cols-3`, footer `lg:grid-cols-4`), sticky sidebars (`sticky top-24`) |

Mobile testing viewport: **375×667** (what the e2e mobile suite pins).

---

## 18. Z-Index Layer Map

| Layer | z | Where |
|---|---|---|
| Page content | auto | everything |
| Sticky filter/stats | `z-30` | Courses filter card (historically), overlapping cards |
| Fixed Navbar | `z-50` | all pages |
| Radix portals (selects, dialogs) | `z-50+` | shadcn primitives |
| Hero illustration | none (absolute, BELOW `z-10` content) | landing flowing-lines SVG |

Rule: hero decorative layers are `absolute inset-0` WITHOUT z-index; content
sits in `relative z-10`; the fixed nav owns `z-50`.

---

## 19. Color Reference (Complete)

### 19.1 Brand + cosmic (from the reference `:root`)

| Token | Hex |
|---|---|
| brand cyan | `#18CCFC` |
| brand purple | `#6344F5` |
| brand pink | `#AE48FF` |
| cosmic-950 | `#0a0a1a` |
| cosmic-900 | `#0d0d2b` |

### 19.2 Pinned v3 utility palette (globals.css `@theme`)

gray-50 `#f9fafb` · gray-100 `#f3f4f6` · gray-200 `#e5e7eb` · gray-300 `#d1d5db`
· gray-400 `#9ca3af` · gray-500 `#6b7280` · gray-600 `#4b5563` · gray-700
`#374151` · gray-800 `#1f2937` · gray-900 `#111827`; slate-50 `#f8fafc` …
slate-900 `#0f172a`; cyan-400 `#22d3ee` · cyan-500 `#06b6d4`; purple-50
`#faf5ff` … purple-600 `#9333ea`; pink-500 `#ec4899`; green-500 `#22c55e`;
amber-400 `#fbbf24`; yellow-400 `#eab308`; red-600 `#dc2626`; indigo-600
`#4f46e5`; orange-500 `#f97316` · orange-600 `#ea580c`; blue-500 `#3b82f6`
· blue-600 `#2563eb`.

### 19.3 shadcn HSL base (selected)

`--background hsl(0 0% 100%)` · `--foreground hsl(240 10% 3.9%)` ·
`--primary hsl(240 5.9% 10%)` · `--muted-foreground hsl(240 3.8% 46.1%)` ·
`--border hsl(240 5.9% 90%)` · `--radius .5rem` (buttons override to
`rounded-xl` = 12px; cards `rounded-2xl` = 16px).

---

## 20. TypeScript Interface Reference

```ts
// src/lib/session.ts
interface SessionPayload { userId: string; email: string; name: string; iat: number; }
function createSessionToken(payload: SessionPayload): string;
function verifySessionToken(token: string): SessionPayload | null;
function hashPassword(password: string): string;   // "salt:hash" scrypt
function verifyPassword(password: string, stored: string): boolean;

// src/lib/course-tags.ts
function parseTags(tags: string | null | undefined): string[];

// prisma/db-url.ts
function resolveDatabaseUrl(url?: string): string | undefined;

// src/components/CourseCard.tsx
interface CourseCardData {
  id: string; title: string; description: string; category: string;
  level: string; rating: number; students: number; hours: number;
  instructorName: string; image: string; price: number; originalPrice: number;
}

// src/components/dashboard/MyCourses.tsx
interface EnrollmentView {
  id: string; progress: number; completedLessonIds: string[];
  course: { id: string; title: string; image: string; instructorName: string; hours: number; lessonsCount: number };
  lessons: { id: string; title: string }[];
}

// prisma/seed-data.ts
interface SeedCourse { /* 17 fields incl. tags: string */ }
function buildLessons(lessonsCount: number): { title: string; sortOrder: number }[];

// API shapes
POST /api/auth/login  → { user: { id, email, name } } + Set-Cookie nexus_session
POST /api/enrollments/progress → { enrollment, completedLessons, totalLessons, completedLessonIds }
POST /api/ai/chat      → { reply } | { error } (502 degrade)
GET  /api/health       → { ok: true, service: "nexuslearn" }
```

---

## Appendix A — The Parity Workflow

The repeatable loop used to reach (and re-verify) parity:

1. **Recon both sides** — two browser sessions (`live` + `clone`), same
   viewport; `eval` extracts DOM structure, class strings, computed styles.
   **Set BOTH sessions' viewports in the same command** — a live@1920 vs
   clone@375 comparison silently produces false 4-digit px height drifts
   (the session-10 lesson: the initial CourseDetail sweep reported
   +1300…+3300px that vanished once the viewports were synced).
2. **Trust the DOM, not the VLM** — VLM verdicts on full-page screenshots
   hallucinate below the fold; use them only on cropped bands, then confirm
   every claim via `querySelector` + `getComputedStyle`.
3. **Rework page → verify structure** — check tag names, class lists,
   computed backgrounds against the extraction.
4. **Pin with specs** — every fixed gap gets an e2e assertion (footer
   tagline, curriculum shape, redirect targets, titles). Route-STATE chrome
   (navbar visual states, per-route) needs its own comparisons — a route
   that renders the right CONTENT at the right HEIGHT can still ship the
   wrong CHROME state (the session-10 /Home case: content + height band
   were green for 9 sessions while the navbar rendered the white-nav state
   over the dark hero).
5. **Gate** — lint → typecheck → unit → build → e2e; then re-screenshot
   `docs/screenshots/`.

Key extractions worth keeping (from the live reference): the hero
flowing-lines SVG (8 paths, 4 userSpaceOnUse gradients `#18CCFC → #6344F5 →
#AE48FF`, opacity-60, 858×434, absolutely centered); the 220-lesson
"Lesson N: Module Content" curricula; the What-You'll-Learn tag lists per
course (seed-data.ts); the footer social order (Twitter, LinkedIn, YouTube,
Instagram) and "Built for the future of education." tagline.

## Appendix B — Quick Reference Card

| Need | File |
|---|---|
| Theme tokens / palette | `src/app/globals.css` |
| SQLite resolver | `prisma/db-url.ts` (+ `src/lib/db.ts`, `prisma/seed.ts`) |
| Reference catalog | `prisma/seed-data.ts` (test-pinned) |
| Mobile nav guard | `tests/e2e/mobile-navigation.spec.ts` |
| Parity + journey specs | `tests/e2e/nexuslearn.spec.ts` |
| Session crypto | `src/lib/session.ts` / `src/lib/auth.ts` |
| Tag topics | `src/lib/course-tags.ts` |
| E2E env pinning | `playwright.config.ts` + `tests/e2e/global-setup.ts` |
| Deploy contract | `docs/DEPLOYMENT.md` |
| Architecture/ADRs | `Project_Architecture_Document.md` |
| Agent gotchas | `AGENTS.md` |
| QA captures | `docs/screenshots/` |
| Push workflow | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` |
