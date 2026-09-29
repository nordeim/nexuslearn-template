# NexusLearn Remediation Plan — Session 17

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(the demo user; Playwright parity probes + agent-browser sessions with synced viewports at
1920×1080 + 375×667, the dev server on :3000). The audit re-verified every standing surface
from sessions 1–16 and added THREE fresh-eyes surfaces suggested by the session-16
transcript (`docs/session_29.md`): the **deep-link / query-parameter surface**, the
**form-state persistence sweep** and the **print-to-PDF comparison**.

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`, the session-14 `@source not` set — the compiled
CSS stays app-source-only).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
198/198 e2e ✓ — the shipped session-16 tree is fully green. All standing visual
surfaces re-verified GREEN at the byte-exact state: desktop heights 11/11, mobile
heights 11/11, class diffs (documented variances only), the space-y sweep (clean ×10),
text diffs (IDENTICAL), the FULL mobile-menu battery on both sites (404px panel, 8
links, 4px pre-CTA gap, route-close, the documented Escape/scroll-lock hardening,
/Home hero + scrolled states — **no Tailwind v4 display or breakpoint bug**), the
computed shadow sweep (46 diff lines, every one in the three documented form
families), the session-13 focus-ring pin (the slate-400 4px slot byte-identical) and
the session-15 reveal inventory (COUNT-MATCH on all 10 routes).

**Session-17 focus**: sessions 1–16 closed every static, content, state,
computed-style, cascade, font, preflight, reveal-entry and navigation-transition
surface. This session's fresh-eyes surfaces examined the URL layer — what happens
when a user arrives (or types) a URL with **query parameters, duplicated keys,
case-variant paths and hash fragments** — plus form-state persistence across
navigation and the print output.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **Duplicate `?id=` keys crash the clone's CourseDetail** — Next.js App Router delivers a repeated search param as `string[]`, but the page types it as `string` (`const { id } = await searchParams`) and passes it straight to `prisma.course.findUnique({ where: { id } })` — the array makes Prisma throw, and the production error boundary renders "This page couldn't load" (empty title). The live's `URLSearchParams.get` semantics take the FIRST value: `?id=<real>&id=x` renders the course; `?id=x&id=<real>` renders the in-page "Course not found" state. Measured on the clone: BOTH orders render the server-error page. `generateMetadata` has the same defect (the array would interpolate into the canonical/og:url). | **High** |
| 2 | **The clone's landing category hrefs use HYPHEN slugs where the live uses UNDERSCORES** for two of the seven categories: the live's landing cards link to `/Courses?category=personal_development` and `/Courses?category=ai_innovation`; the clone's link to `personal-development` / `ai-innovation` (probed from both landings' href lists — byte-diff on exactly those two entries; the other five match). Consequence: the hyphen forms are VALID filters on the clone (1 card each) but UNKNOWN on the live (0 cards) — a deep-link divergence in both the href surface and the catalog's `CATEGORY_SLUGS` map. | **High** |
| 3 | **Unknown `?category=` slug semantics differ.** The live maps the slug through its case-sensitive slug→display-name lookup and applies the result to the filter state; an unmapped slug leaves the filter in a no-match state: the category select's trigger renders EMPTY (Radix placeholder state, empty placeholder), 0 course cards, "No courses found" in the `text-center py-20` empty state. The clone's defensive fallback (`CATEGORY_SLUGS[x] ? … : "all"`) shows "All Categories" + 9 cards instead. Verified matching first: `?category=business` → "Business" + 1 card on both; `?category=` (empty value) and bare `?category` → "All Categories" + 9 cards on both (empty = absent). Case variants (`?category=Business`) are UNKNOWN on the live (case-sensitive map). | **Medium** |
| 4 | **Route-casing family.** The live's Base44 router matches every content route CASE-INSENSITIVELY: `/courses`, `/COURSES`, `/cOurSes`, `/home`, `/HOME`, `/pricing`, `/about`, `/contact`, `/dashboard`, `/becomeinstructor`, `/aiassistant` all render the real page (URL preserved), with `document.title` derived from the RAW path segment ("COURSES \| NexusLearn", "C Our Ses \| NexusLearn" — a title-case helper splitting at case boundaries). `/login` is EXACT-match only (`/Login`, `/LOGIN` → the in-app 404). The live's nav active-state is case-insensitive too ("Courses" highlighted on `/courses`). The clone (Next.js case-sensitive routing) 404s every case variant. **Decision**: replicate the FUNCTIONAL behavior (case-variant paths render the page) via a middleware REWRITE (URL preserved, exactly like the live) for the nine content routes, EXCLUDING `/login` (exact-match, like the live) — while keeping the canonical per-route `document.title` + canonical/og:url (a deliberate-better decision: the live's raw-path titles like "C Our Ses \| NexusLearn" and its raw-path 404 titles are artifact-grade output, in the same documented family as the stale-title decision of session 16). | **Medium** |
| 5 | **Form-state persistence: VERIFIED AT PARITY (no action).** The catalog search/filter state and the login form's typed values reset identically on navigate-away + back on both sites (the "python" search yields the same 3 cards on both; after back: empty search, "All Categories", 9 cards; the login form returns empty). | **Low** (methodology) |
| 6 | **Print-to-PDF: VERIFIED AT PARITY (no action).** `page.pdf()` page counts match exactly on the probed routes in both the fresh (unscrolled) and fully-scrolled states — `/` 11/11 pages, `/Courses` 4/4, `/Pricing` 3/3 — with near-identical unrevealed-element counts at print time (28 vs 29 on `/` fresh; 2 vs 0 scrolled — the reveal system's IO does not fire during print on either site, so below-fold pre-hidden content is absent from the PDF on both). Byte-size deltas are font-embedding internals, not a parity surface. | **Low** (methodology) |

### Verified matching (no action)

**Deep-link matrix**: `/CourseDetail?id=<real>` renders the course on both (per-site ids —
the live uses ObjectIds, the clone `seed-N`; the session-14 per-site-id probe lesson
applied); `?id=bogus`, `?id=`, and no-param all render the in-page "Course not found"
state on both; `?ID=` (param casing) is absent on both (not-found state); extra unknown
params (`&foo=bar`, `&x=1`) are ignored on both; hash fragments (`#instructor`,
`#hero`) stay in the URL with no anchor scroll on both; `/Courses/` (trailing slash)
serves the catalog on both; `?level=` / `?sort=` / `?search=` are ignored by the catalog
on both (only `?category=` is read); `/AIAssistant?q=…`/`?chat=…` and
`/Dashboard?tab=…` params are ignored on both; the no-results DOM ("No courses found",
`P.text-xl.text-gray-400.mb-2` inside `text-center.py-20`) is byte-identical on both.

### Accepted variances (documented, no action)

- The live's raw-path `document.title` on case-variant routes and its raw-path 404
  titles ("Aicourses | NexusLearn") — artifact-grade output; the clone keeps canonical
  titles (deliberate-better, same family as the session-16 stale-title decision).
- The live's `?id=` ObjectId format vs the clone's `seed-N` ids — the seeded-catalog
  design decision (the catalog display order + all rendered content are pinned; the id
  FORMAT is the clone's own, documented since session 7).
- Everything previously documented (oklab color forms, infinity-radius forms,
  empty-slot shadow forms, the gradient class form, the panel mechanism, the ARIA/
  scroll-lock/Escape hardening, the reveal system's WAAPI-vs-framer implementation,
  mount-time latency, the CSR/SSR structural differences).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-17 parity` describe blocks:
  - **Block 1 — duplicate-id first-value-wins (finding 1)**: `/CourseDetail?id=seed-1&id=x`
    renders the Web Development course h1 (RED now: server-error page);
    `/CourseDetail?id=x&id=seed-1` renders the in-page "Course not found" state (RED
    now: server-error page); the canonical link of the first URL uses only `seed-1`.
  - **Block 2 — the underscore slugs (finding 2)**: the landing's Personal Development
    category card links to `/Courses?category=personal_development` and the AI &
    Innovation card to `/Courses?category=ai_innovation` (RED now: hyphen forms);
    deep-linking `/Courses?category=personal_development` pre-selects "Personal
    Development" with 1 card, and `?category=ai_innovation` pre-selects "AI &
    Innovation" with 1 card (RED now: unknown → the finding-3 fallback state… which
    Block 3 flips to the live semantics — the two blocks go green together).
  - **Block 3 — the unknown-slug raw semantics (finding 3)**: `/Courses?category=bogus`
    renders 0 cards + "No courses found" + the category trigger EMPTY (RED now:
    "All Categories" + 9 cards); `?category=` (empty value) and bare `?category`
    render "All Categories" + 9 cards (GREEN by design — already matching);
    `?category=Business` (case-variant) → 0 cards + empty trigger (RED now: 9 cards).
  - **Block 4 — the route-casing rewrites (finding 4)**: `/courses` and `/COURSES`
    render the catalog (h1 "Explore Our Courses", 9 cards) with the URL preserved and
    the nav's Courses link active (RED now: 404); `/pricing` renders Pricing;
    `/coursedetail?id=seed-1` renders the course; `/Login` and `/LOGIN` still render
    the 404 page (GREEN by design — the live 404s them); `/nonexistent-page-xyz`
    still 404s (GREEN by design — the regression guard).

### Phase 2 — GREEN (implementation)

- [2a] **`src/app/CourseDetail/page.tsx`**: normalize the id param in BOTH
  `generateMetadata` and the page component — `const raw = (await
  searchParams).id; const id = Array.isArray(raw) ? raw[0] : raw;` (first value wins,
  `URLSearchParams.get` semantics; the type widens to `string | string[]` to match
  what Next.js actually delivers). No other route reads search params server-side.
- [2b] **`src/app/page.tsx`**: the two CATEGORIES slugs — `personal-development` →
  `personal_development`, `ai-innovation` → `ai_innovation` (the href surface).
- [2c] **`src/components/CourseCatalog.tsx`**: the `CATEGORY_SLUGS` keys change to
  match (the two underscore forms); the initial-state semantics change from the
  defensive fallback to the live's raw mapping — `initialCategory ?
  (CATEGORY_SLUGS[initialCategory] ?? "") : "all"` (empty param = absent = "all";
  unknown slug = the no-match state); the category `SelectValue` placeholder changes
  from "All Categories" to "" (the placeholder state IS the unknown-slug state — the
  live renders an empty trigger exactly like this; the "all" item renders "All
  Categories" itself, so the placeholder is otherwise invisible).
- [2d] **`src/middleware.ts`** (new): a case-insensitive REWRITE for the nine content
  routes (`/Home`, `/Courses`, `/CourseDetail`, `/AIAssistant`, `/Pricing`, `/About`,
  `/Contact`, `/BecomeInstructor`, `/Dashboard`) — `NextResponse.rewrite` with the
  canonical pathname, the search string preserved, applied ONLY when the raw path
  differs from the canonical form. `/login` is deliberately NOT in the list (the
  live 404s its case variants — exact-match). No redirect (the live preserves the
  typed URL).
- [2e] **`src/components/Navbar.tsx`**: `isActive` compares case-insensitively
  (`pathname.toLowerCase()` vs `href.toLowerCase()`; the `/Home` exact-match set
  becomes `["/", "/home"]` on the lowercased path) — the live highlights Courses on
  `/courses`.
- [2f] **Docs**: README (badge + the session-17 rows), AGENTS.md (gotchas 44–45: the
  duplicate-search-param array trap + the case-insensitive-router family), CLAUDE.md
  (pyramid + middleware), PAD ([S17] + §7.1), `nexuslearn-template_SKILL.md` (v3.5.0 —
  the deep-link surface), this plan (results), `docs/session_30.md`, the repo worklog.

### Phase 3 — VERIFY (gates + live re-audit)

- [3a] Full gate suite: lint → typecheck → 31/31 unit → build → e2e (198 + the new
  session-17 specs, zero regressions).
- [3b] Live-vs-clone re-verification on the dev server: the deep-link matrix re-run
  (all four findings at parity), the standing surfaces (heights ×11 ×2 — the
  middleware must move no layout; class diffs; the mobile battery; the shadow sweep;
  the focus pin; the reveal inventory) + the form-state and print-PDF probes re-run.
- [3c] **The leak spec re-runs LAST** after every doc write (the session-15 process
  rule).
- [3d] Screenshots: the standard set under `docs/screenshots/` + the NEW deep-link
  captures (the underscore-slug catalog pre-filter + the case-variant route render).
- [3e] `.env.example` re-verified (the session changes no environment surface).
- [3f] Commit to main + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py`).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The middleware rewrite breaks a standing spec (404 specs, canonical/OG specs) | The rewrite fires ONLY on the nine content routes' case variants — canonical paths, /login variants, /nonexistent paths and every API/asset path pass through untouched; the full e2e suite is the regression gate. |
| The middleware affects the production standalone build differently | Next 16 standalone compiles middleware into the server; the e2e suite runs against the standalone build on :3100 — the casing specs execute there. |
| The unknown-slug empty state confuses future audits as a "broken filter" | The spec comments record the live's measured behavior (empty trigger + 0 cards + "No courses found"); AGENTS.md documents the semantics. |
| The SelectValue placeholder change alters the default "All Categories" rendering | The placeholder is only rendered when the value matches NO item; the "all" SelectItem itself renders "All Categories" — the default state is item-driven, unchanged (spec-pinned). |
| Array-typed searchParams appear on other routes later | The normalization pattern + the AGENTS.md gotcha document the Next.js `string \| string[]` contract; only CourseDetail reads server-side search params today. |
| The case-insensitive isActive over-matches (e.g. /Courses active on /coursedetail) | The prefix rule keeps its current semantics, only lowercased — /CourseDetail already keeps "Courses" active on both sites (the reference's own prefix behavior, session 5). |

---

## D. Phase 3 results (executed — recorded after GREEN)

- **RED verified**: 13/16 specs failed against the pre-fix production build
  for exactly the pinned reasons — the three duplicate-id specs (the
  server-error boundary on both orders + the array-interpolated canonical),
  the four underscore-slug specs (hyphen hrefs + the two deep-link
  pre-selections), the two unknown-slug raw-semantics specs (the
  "All Categories" + 9-cards fallback), and the four route-casing specs
  (404s). The three green-by-design specs passed (the empty-value "all"
  default, the /login case-variant 404s, the unknown-route 404 guard).
- **GREEN-phase corrections**: (a) the middleware was first implemented as
  `src/middleware.ts`, which builds but WARNS on Next 16.3 ("The
  'middleware' file convention is deprecated. Please use 'proxy'
  instead") — migrated to the `src/proxy.ts` convention (the exported
  function renamed `proxy`; the `config.matcher` unchanged), zero warnings.
  (b) The mobile-nav battery re-run initially compared the LIVE against
  itself (the script's BASE is the second positional arg, not an env var —
  the session-16 lesson about probe-harness assumptions re-learned); the
  corrected clone run confirmed the standing battery state.
- **Gates**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **214/214 e2e ✓**
  (198 → 214: +16 session-17 specs, zero regressions — every session-4
  through session-16 spec green through the proxy/Catalog/Navbar/
  CourseDetail changes).
- **Visual re-verification**: every height still byte-exact (desktop 11/11,
  mobile 11/11 — the proxy moved no layout); the deep-link matrix re-run:
  `?category=bogus` MATCH, `?category=Business` MATCH, `/courses` MATCH,
  per-site-id CourseDetail renders MATCH; the remaining case-variant DIFFs
  are TITLE-ONLY (the live's raw-path titles — the documented
  deliberate-better decision; h1/cards/404-state all match); class diffs
  (documented variances only), text diffs (IDENTICAL), the mobile battery,
  the shadow sweep, the focus pin and the reveal inventory (COUNT-MATCH
  ×10) unchanged; the form-state and print-PDF probes re-verified at
  parity.
- **Screenshots**: 28 captures — the standard 24-set (12 desktop routes
  through the incremental reveal sweep + the 5 login views + 6 mobile +
  both open-menu states) + the FOUR new deep-link captures
  (courses-underscore-slug-prefiltered, courses-unknown-slug-noresults,
  courses-lowercase-url-preserved, course-detail-duplicate-id-first-wins).
- `.env.example` re-verified (DATABASE_URL/AUTH_SECRET/NEXT_PUBLIC_SITE_URL
  cover all code references; the session changed no environment surface).
  The leak spec re-ran LAST, after every doc write.
