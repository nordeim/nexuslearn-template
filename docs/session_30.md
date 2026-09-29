# Session 17 — Parity pass: the deep-link / query-parameter surface + form-state persistence + print-to-PDF

Continuing from session 16 (`cab2449` + the pulled `docs/session_29.md`
transcript, remote at `6812919`). Sessions 1–16 closed static, shell,
content, sub-section, interactive-state, head-metadata, OG-identity,
class-verbatim, display-order, section-design, seed-idempotency,
space-y-engine, navbar-chrome, route-state-chrome, copy + glyph,
component-state, computed-shadow, focus-ring, scroll, card-structure,
rendered-font, preflight, engine-cascade, reveal-entry and
navigation-transition parity — every height measurement byte-exact, the
reveal inventory matching on all 9 routes, back/forward restoration
snapping instantly. This session re-swept every standing surface and added
THREE fresh-eyes audit surfaces (all suggested by the session-16
transcript): the **deep-link / query-parameter surface**, the
**form-state persistence sweep** and the **print-to-PDF comparison**.

## Audit (Playwright parity probes + agent-browser, live vs clone, 1920×1080 + 375×667 + the dev server)

4 findings → `docs/remediation-plan-session17.md`. Highlights:

1. **Duplicate `?id=` keys crashed the clone's CourseDetail (High).**
   Next.js App Router delivers a repeated search param as `string[]`; the
   naive `const { id } = await searchParams` passed the array to
   `prisma.course.findUnique` and rendered the production error boundary
   ("This page couldn't load", empty title) — BOTH `?id=<real>&id=x` and
   `?id=x&id=<real>` orders. The reference's `URLSearchParams.get`
   semantics take the FIRST value (the real-id-first order renders the
   course; the unknown-first order renders the in-page not-found state). A
   hard 500-class failure invisible to every class/DOM diff — only the URL
   surface sees it.
2. **The landing's category hrefs used HYPHEN slugs where the reference
   uses UNDERSCORES (High).** The reference's Personal Development /
   AI & Innovation cards deep-link to `?category=personal_development` /
   `?category=ai_innovation`; the clone linked the hyphen forms (probed
   from both landings' href lists — byte-diff on exactly those two). On
   the reference the hyphen forms are UNKNOWN filters (0 cards).
3. **Unknown `?category=` slug semantics (Medium).** The reference maps
   the slug through its case-sensitive slug→name lookup; an unmapped slug
   leaves the filter in a NO-MATCH state (empty select trigger — the Radix
   placeholder state with an empty placeholder — 0 cards, "No courses
   found"). The clone's defensive fallback showed "All Categories" +
   9 cards. An absent or EMPTY value (`?category=`, bare `?category`) is
   "all" on both (verified matching).
4. **Route-casing family (Medium).** The reference's Base44 router matches
   every content route CASE-INSENSITIVELY (`/courses`, `/COURSES`,
   `/cOurSes`, `/home`, `/pricing` … all render, URL preserved, titles
   derived from the RAW path — "COURSES | NexusLearn", "C Our Ses |
   NexusLearn", artifact-grade); `/login` is EXACT-match (its variants
   404 — a platform-level route); the reference's nav active-state is
   case-insensitive. The clone (Next.js case-sensitive) 404'd every
   variant.

**Verified at parity (no action)**: the form-state persistence sweep (the
catalog search + the login form's typed values reset identically on
navigate-away + back on both sites; the "python" search yields the same 3
cards) and the print-to-PDF comparison (page counts match on `/` 11/11,
`/Courses` 4/4, `/Pricing` 3/3 in both fresh and fully-revealed states;
the reveal system's IntersectionObserver does not fire during print on
either site). Also verified matching: hash fragments (no anchor scroll on
either), `?ID=` param casing, extra unknown params, trailing slashes,
`?level=`/`?sort=`/`?search=` ignored by the catalog (only `?category=` is
read), `/AIAssistant` + `/Dashboard` params ignored, the no-results DOM
byte-identical, and per-site-id CourseDetail renders (the initial seed-id
DIFFs were the session-14 probe-artifact lesson re-applied — the live uses
ObjectIds).

**Standing surfaces re-verified green at the byte-exact state**: desktop +
mobile heights ×11 routes, class diffs (documented variances only), the
space-y sweep (clean ×10), text diffs IDENTICAL, the FULL mobile-menu
battery on both sites (404px panel, 8 links, 4px pre-CTA gap, route-close,
the documented Escape/scroll-lock hardening — **no Tailwind v4 display or
breakpoint bug**), the computed shadow sweep (all 46 diff lines in the
three documented form families), the session-13 focus-ring pin (the
slate-400 slot byte-identical) and the session-15 reveal inventory
(COUNT-MATCH on all 10 routes).

## Remediation (TDD)

16 new e2e specs (the session-17 deep-link blocks) written RED first — 13
verified failing against the pre-fix production build for exactly the
pinned reasons (the duplicate-id crash ×3, the hyphen hrefs + deep-link
pre-selections ×4, the unknown-slug fallback ×2, the case-variant 404s ×4);
3 green-by-design (the empty-value "all" default, the /login case-variant
404s, the unknown-route 404 guard) → GREEN:

- **`src/app/CourseDetail/page.tsx`**: the `firstId()` normalization
  (`Array.isArray → [0]`) in BOTH the page and `generateMetadata`, with the
  searchParams type widened to `string | string[]`.
- **`src/app/page.tsx`**: the two `CATEGORIES` slugs →
  `personal_development` / `ai_innovation`.
- **`src/components/CourseCatalog.tsx`**: the matching `CATEGORY_SLUGS`
  keys + the raw-mapping initial state (`CATEGORY_SLUGS[x] ?? ""`) + the
  category `SelectValue` placeholder `""`.
- **`src/proxy.ts`** (new): the Next 16 `proxy` convention (the first
  implementation shipped as `src/middleware.ts`, which builds but WARNs on
  16.3 — migrated) — a case-insensitive REWRITE over the nine content
  routes (URL preserved, never a redirect; `/login` deliberately excluded;
  unknown paths pass through to the 404).
- **`src/components/Navbar.tsx`**: case-insensitive `isActive`.

## Gates (final)

lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **214/214 e2e ✓** (198 →
214, zero regressions). Visual re-verification: every height still
byte-exact (desktop 11/11, mobile 11/11 — the proxy moved no layout); the
deep-link matrix re-run all-MATCH (the remaining case-variant DIFFs are
TITLE-ONLY — the documented deliberate-better decision); the class/text/
space-y/mobile/shadow/focus/reveal surfaces unchanged.

## Ship

- 28 screenshots in `docs/screenshots/` (the standard 24-set + the FOUR
  new deep-link captures: the underscore-slug pre-filtered catalog, the
  unknown-slug no-results state, the lowercase-URL-preserved render, the
  duplicate-id first-value-wins course page).
- Docs aligned: README (badge 245 + the session-17 description), AGENTS
  (gotchas 44–45 — the duplicate-search-param array trap + the
  case-insensitive-router family + the underscore slugs + the
  unknown-slug semantics; the components list gains `src/proxy.ts`),
  CLAUDE (pyramid 31+214), PAD ([S17] + §7.1),
  `nexuslearn-template_SKILL.md` v3.5.0 (§4.4g the deep-link surface +
  Appendix A surface 18 + the 17-session description),
  `docs/remediation-plan-session17.md` (with the GREEN-phase
  corrections), this session log (`docs/session_30.md`), the repo worklog.
  `.env.example` re-verified (the session changed no environment surface).
  The leak spec re-ran LAST, after every doc write (the session-15 process
  rule).
