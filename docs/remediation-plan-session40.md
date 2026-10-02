# NexusLearn Remediation Plan — Session 40

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the evidence scripts under `/home/z/my-project/scripts/s40-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-39 tree, commits
`8bcd322`/`83b4600`): lint ✓ · typecheck ✓ · 245/245 unit ✓ · build ✓ ·
**338/338 e2e ✓** (7.1m, zero flakes) — 583 total, matching the documented
session-39 end state exactly. The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, byte-identical to
`.env.example`; `db/custom.db` + `db/e2e.db` recreated at the repo root by
`db:push` + `db:seed`). The standing parity surfaces ALL re-verified: heights
×9 routes ×2 viewports **byte-exact 18/18**, the **mobile battery fully
identical — NO Tailwind v4 bug** (trigger `md:hidden p-2 rounded-lg
text-white/80` byte-identical, panel 375×405 @ y=64, 9 members at identical
geometry), console sweep **13/13 clean** (incl. both /reset-password states).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The trailing-slash resolution tier (fresh-eyes family A — a REAL functional parity drift, a surface no prior session probed at the resolution level)**: the LIVE resolves single-trailing-slash paths through a THREE-TIER contract, probed shape-by-shape: **(a) content routes RENDER at the typed slashed URL** — `/Courses/`, `/courses/` (case+slash!), `/Pricing/`, `/Dashboard/`, `/Home/`, `/AIAssistant/`, `/About/`, `/Contact/`, `/BecomeInstructor/`, `/CourseDetail/?id=<real>` all render the full page 200 with the URL bar PRESERVED, the clean title (`Courses \| NexusLearn`), and the clean canonical + PROCESSED query (`/courses/?x=1` → canonical `/courses?x=1` — typed case, the documented s17 deliberate-variance family; `/Courses/?utm_source=a&x=1` → `/Courses?x=1`); **(b) exact-match routes + trailing slash → the PLATFORM 404** — `/login/`, `/reset-password/`, `/reset-password/?token=abc` render Base44's platform page ("404 \| Page Not Found \| The page "login/" could not be found in this application. \| Go Home" — NO nav/footer) with the DERIVED head family: title `Login \| NexusLearn` / `Reset Password \| NexusLearn` (the s38 raw-path derivation), canonical `/login` / `/reset-password` / `/reset-password?token=abc` (trailing slash STRIPPED, query processed); **(c) unknown paths + trailing slash → the same platform 404** (`/nope/` → title `Nope \| NexusLearn`, canonical `/nope`). THE CLONE: Next.js's built-in trailing-slash handler 308-redirects EVERY single-slash shape BEFORE the proxy can see it (empirically verified: no proxy log line for `/Courses/` with the flag off) — `/Courses/` → 308 → `/Courses` (the documented s24 deliberate-better pin — KEEP), but `/courses/` → 308 → `/courses` → the s17 rewrite (one hop, renders — near-parity by accident), and `/login/` + `/reset-password/` → 308 → the FOUND page (a "found" render for URLs the live 404s — the drift), `/nope/` → 308 → `/nope` → the 404 view (found-family via redirect). | **HIGH** (functional parity) | fix below |
| 2 | **The framework-normalization family (the uncontrollable shapes — documented, no fix)**: the leading-`//` and multi-trailing-slash shapes are normalized by Next.js BEFORE the proxy (empirically verified with `skipTrailingSlashRedirect: true`: `//Courses` still 308s to `/Courses`, `/Courses///` still 308s to `/Courses/` — neither reaches the proxy; the flag only hands SINGLE-trailing-slash paths to the app). The LIVE renders these as unknown routes (`//Courses` → the in-app 404 view, title `Courses \| NexusLearn`; `//nope` → title `Nope \| NexusLearn`; `///` → the 404 view, plain title — the s39-documented shape); the CLONE normalizes them to the catalog/root (final-state drift: catalog vs 404 view). Uncontrollable at the app layer (pre-proxy framework behavior, no flag covers it) → the deliberate-variance family — the exact mirror of the live's `%zz` infra-400 (each side's infra handles shapes the other's never sees). DOCUMENT (gotcha). | MEDIUM (documented variance) | document |
| 3 | **The s17×s39 cross-product surface (fresh-eyes family B — verified matching, UNPINNED)**: the case-variant + query-processing composition was never probed together. Probed on BOTH sites this session: `/courses?x=1` → the live canonical `/courses?x=1` (typed case), the clone `/Courses?x=1` (canonical case — the documented s17 deliberate-better); `/COURSES?utm_source=a&x=1` → both drop utm + keep `x=1` (titles differ per the documented s16/s17 title decision); `/courseDetail?id=<real>&extra=2` → BOTH canonicals `?extra=2&id=<real>` (the s39 alpha-sort working through the s17 case-rewrite). GREEN by construction — but ZERO specs pin the composite shapes (the s39 specs visit canonical-case URLs only; the s17 specs visit query-less URLs only). Pin them. | LOW (pin) | spec below |
| 4 | **The LCP/FCP/CLS budget family (fresh-eyes family C — the session_82-suggested direction (b), never pinned)**: TTFB (s32), TBT (s37) and INP (s38) are pinned; the LCP/FCP/CLS trio is not. Measured on the production standalone server (:3100, cold-cache first visits): `/` LCP 1396ms / FCP 436ms, `/Courses` LCP 716ms / FCP 212ms, `/CourseDetail?id=seed-1` LCP 708ms / FCP 272ms, `/login` LCP 184ms / FCP 184ms, CLS **0.00000 on every route** (zero layout shifts even after a full scroll-through — the reveal system's transform/opacity animations are CLS-free by design). Pin the Core-Web-Vitals "good" thresholds (LCP < 2500ms, FCP < 1800ms, CLS < 0.1) on the four key routes — the same budget-threshold approach as the s32/s37/s38 pins. | LOW (budget pin) | spec below |
| 5 | **The /api/health/ trailing-slash shape (a Fix-1 side effect worth pinning)**: the LIVE 200s `/api/health/` (trailing-slash tolerated on the API tier too — probed). The CLONE currently 308s it to `/api/health`. With `skipTrailingSlashRedirect: true` the clone's route handler matches `/api/health/` directly → 200 `{"ok":true}` — parity by side effect (the API paths are outside the proxy matcher, so the flag's router tolerance applies there unchanged). Pin it. | LOW (pin) | spec below |
| 6 | **Documentation staleness**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 shift with the new specs (245 unit + 338 e2e → new totals); AGENTS.md gains the gotcha (the trailing-slash resolution tier + the framework-normalization variance family); the SKILL bumps to v3.28.0. | MEDIUM (doc hygiene) | Phase 7 |

### Audit-surface note (the session-40 additions — THREE new probe families)

- **the trailing-slash resolution surface** (finding 1) — the single-slash
  dimension across all three route tiers (content / exact-match / unknown),
  probed on both sites at the status + URL-bar + head-family level (16 live
  shapes incl. the case+slash and query+slash composites).
- **the framework-normalization boundary** (finding 2) — the empirical map of
  which shapes Next.js handles PRE-proxy (leading `//`, multi-slashes) vs
  which reach the app layer under `skipTrailingSlashRedirect` (single
  trailing slashes) — the controllability boundary, verified with the
  temporary-flag experiment.
- **the LCP/FCP/CLS budget surface** (finding 4) — the loading/visual-stability
  vitals on the production standalone server, cold-cache, incl. the
  full-scroll CLS sweep (reveal-triggered shifts would land here).

### The plan-time design validation (done BEFORE this plan was finalized)

- **The s24 pin survives by construction**: the `/Courses/` → 308 + `Location:
  /Courses` pin (tests/e2e/nexuslearn.spec.ts:3336) re-targets the
  proxy-issued 308 — the SAME status + Location value (Next's own 308 emits a
  relative Location; the proxy constructs the same relative form manually).
  The pin's intent ("SEO-correct canonicalization, never the live's
  200-for-everything posture") is PRESERVED, not overturned: exact-case
  content-route slash variants still canonicalize via 308.
- **The s17 contract survives by construction**: case-variant content routes
  render at the typed URL (the rewrite); the case+slash composite
  (`/courses/`) now renders DIRECTLY at the typed URL (one FEWER hop than
  today's 308-then-rewrite chain — closer to the live's zero-hop render).
- **The s26 verb guard keeps precedence**: the guard runs BEFORE the new
  slash-resolution block (POST `/Courses/` → 405 directly, method beats path
  resolution — one hop fewer than today's 308-then-405).
- **The s38/s39 head derivations need NO change**: the 404-rewrite branch
  injects `x-nexus-raw-path` = the RAW slashed path (`/login/`), and the
  layout derivation already strips the trailing slash for the canonical +
  takes the last non-empty segment for the title — the platform-404 head
  family (`Login | NexusLearn` + canonical `/login`) falls out of the EXISTING
  seams. Verified shape-by-shape against the probed live heads.
- **The flag's router tolerance is fully overridden for document paths**: with
  `skipTrailingSlashRedirect: true` Next's router would match `/login/` to the
  /login route (200, the login form — verified empirically); the proxy's
  404-rewrite branch intercepts the shape BEFORE the router sees it, so the
  only router-level tolerance that survives is on `/api/*` paths (outside the
  proxy matcher) — which is exactly the finding-5 parity IMPROVEMENT.
- **`EXACT_MATCH_ROUTES` is case-SENSITIVE** (matching the s17 convention):
  `/login/` and `/reset-password/` (exact lowercase + slash) get the
  404-rewrite; their case variants (`/Login/`, `/Reset-Password/`) fall
  through to the router's natural 404 — whose derived heads
  (`Login | NexusLearn`, `Reset Password | NexusLearn`) match the live's
  platform-404 heads anyway (probed).
- **The root path is not a slash variant**: `/` passes through untouched
  (`rawPath === "/"` guard); `///` never reaches the app (pre-proxy
  normalization — finding 2).

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the pure slash-resolution seam (finding 1, the decision layer)

**Design**: `src/lib/slash-resolution.ts` (pure — no Next.js imports):

- `CONTENT_ROUTES` — the frozen 9-route list (moved from proxy.ts, re-exported
  for the proxy's existing case-rewrite use).
- `EXACT_MATCH_ROUTES` — the frozen exact-match list: `/login`,
  `/reset-password` (case-sensitive — the s17 convention).
- `resolveSlashPath(rawPath, rawSearch)` → the resolution union:
  - `{ action: "pass" }` — no trailing slash (or the root `/`): the existing
    s17 case-rewrite logic handles it.
  - `{ action: "redirect", location }` — an EXACT-case content route with a
    trailing slash → the s24 canonicalization 308 (`location` = the stripped
    canonical + the RAW search, relative form).
  - `{ action: "rewrite", path }` — a CASE-VARIANT content route with a
    trailing slash → the s17 render-at-typed-URL contract (the search is
    preserved by the rewrite itself).
  - `{ action: "not-found" }` — an EXACT-match route with a trailing slash →
    the live's platform-404 tier (the in-app 404 view + the derived head).
  - unknown paths with a trailing slash → `{ action: "pass" }` (the router's
    natural 404 — the head derivations already handle the shape).

**RED unit** (`tests/slash-resolution.test.ts`): the pass battery (`/Courses`,
`/`, no-slash shapes); the redirect battery (`/Courses/` → location
`/Courses`; `/Home/` → `/Home`; `/CourseDetail/` + `?id=x` → location
`/CourseDetail?id=x` — the search rides along); the rewrite battery
(`/courses/` → path `/Courses`; `/COURSES/` → `/Courses`; `/courseDetail/` →
`/CourseDetail`); the not-found battery (`/login/`, `/reset-password/` — and
NOT `/Login/` / `/Reset-Password/` (case variants pass → the natural 404));
the unknown battery (`/nope/` → pass; `/xyz/` → pass); the boundary shapes
(`/` → pass; `//` → pass (never reaches the app — pre-proxy); the
case-insensitive content match never matches an exact-match route).

### Phase 2 — the proxy integration (finding 1, the adapter)

**Design** (`src/proxy.ts` + `next.config.ts`):

- `next.config.ts`: `skipTrailingSlashRedirect: true` (documented: hands the
  single-trailing-slash handling to the proxy; the pre-proxy normalization
  of `//`-shapes is unaffected — the finding-2 variance).
- `src/proxy.ts`: after the verb guard + the request-header injection, the
  new block BEFORE the s17 case-rewrite:
  - `redirect` → `new NextResponse(null, { status: 308, headers: { Location,
    ...the baseline security headers, the CSP } })` (the relative Location
    form — the s24 pin's exact value).
  - `rewrite` → `NextResponse.rewrite` to the canonical path (URL + search
    preserved; the request headers ride along).
  - `not-found` → `NextResponse.rewrite` to the internal unmatched path
    `/__nexus-slash-404__` (the router renders not-found.tsx — a REAL 404
    status per the s24 principle; the raw-path head derivations flow through
    the existing s38 seams).
  - `pass` → the existing s17 logic unchanged.
- `CONTENT_ROUTES` moves to the seam module; the proxy imports it (one
  canonical list — the root-cause fix per the change-management discipline).

**RED unit** (`tests/slash-resolution-source.test.ts` — the source pins):
next.config.ts ships `skipTrailingSlashRedirect: true`; proxy.ts imports
`resolveSlashPath` + `CONTENT_ROUTES` from the seam (no duplicated list); the
verb guard + header injection precede the slash block; the 308 branch
constructs the relative Location; the not-found branch rewrites to the
internal 404 path.

### Phase 3 — the e2e block (findings 1, 3, 4, 5 — the integration pins)

Inserted BEFORE the s33 burst spec (stays LAST — the house rule):

1. **The trailing-slash resolution battery** (finding 1):
   - `/Courses/` → 308 + `Location: /Courses` (the s24 pin re-asserted —
     now proxy-issued; `maxRedirects: 0`).
   - `/courses/` → 200, the catalog renders AT `/courses/` (no redirect —
     `response.request().redirectedFrom()` null + the URL bar + the h1 +
     the canonical `/Courses` + og/twitter mirrors).
   - `/CourseDetail/?id=seed-1&extra=2` → 308 + Location
     `/CourseDetail?extra=2&id=seed-1` — hmm NO: the redirect location
     carries the RAW search (`?id=seed-1&extra=2` — unsorted); the PROCESSED
     canonical appears on the RENDERED page after the hop. Assert both
     layers separately (the Location's raw search + the rendered canonical's
     processed form).
   - `/login/` → 404 + the in-app 404 view + title `Login | NexusLearn` +
     canonical `/login` (the live's platform-404 head family).
   - `/reset-password/?token=abc` → 404 + title
     `Reset Password | NexusLearn` + canonical `/reset-password?token=abc`.
   - `/nope/` → 404 + title `Nope | NexusLearn` + canonical `/nope` (no
     redirect — the URL bar keeps `/nope/`).
   - `POST /Courses/` → 405 + `Allow: GET, HEAD` (the verb guard precedence).
2. **The s17×s39 composite battery** (finding 3): `/courses?x=1` → renders
   the catalog at `/courses` + canonical/og/twitter `?x=1` (the canonical
   case); `/courseDetail?id=seed-1&extra=2` → the course renders (firstId) +
   canonical `?extra=2&id=seed-1` (the sort through the case-rewrite).
3. **The vitals budget battery** (finding 4): the LCP/FCP/CLS observers on
   `/`, `/Courses`, `/CourseDetail?id=seed-1`, `/login` — LCP < 2500ms,
   FCP < 1800ms, CLS < 0.1 (the Core-Web-Vitals "good" thresholds; the
   measured headroom is 1.8x–13x).
4. **The API slash pin** (finding 5): `/api/health/` → 200 +
   `{"ok":true,"service":"nexuslearn"}` (the live-matching tolerance).

### Phase 4 — the GUARD phase

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 245 → ~270 unit, 338 → ~350 e2e).
- The standing parity surfaces re-verified AFTER the changes: heights/innerText
  ×9 routes ×2 viewports byte-exact + the mobile battery re-run + the console
  sweep (the proxy + config changes touch every request — the parity re-run is
  the proof they changed nothing visible on the canonical routes).
- The CSS-leak spec re-runs LAST (the gotcha-41 rule).

### Phase 5 — docs alignment (finding 6) + the proof matrix + screenshots

AGENTS.md (gotcha 69 — the trailing-slash resolution tier + the
framework-normalization variance family; the commands-table counts),
CLAUDE.md (the pyramid counts + the seam description), README (badge + the
session-40 paragraph), PAD ([S40] revision row + the proxy/route-resolution
section), SKILL v3.28.0 + project_state, `.env`/`.env.example` (NO new
knobs), the session logs + the worklog entry. The proof matrix
(`docs/screenshots/api-session-s40.txt`): the slash-resolution matrix (clone
vs live — every probed shape), the composite head matrix, the vitals
measurements, the env contract. The screenshot matrix recaptured per the
house viewport-capture convention (incl. the NEW /courses/ render + the
/login/ 404-view states).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-39 tree re-verified — 583).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the trailing-slash resolution tier — 16+
   live shapes pinned across the three route tiers) CONFIRMED, family B (the
   s17×s39 composite — 6 shapes, green by construction, unpinned) CONFIRMED,
   family C (the LCP/FCP/CLS budgets — measured, CLS 0.00000) MEASURED.
4. [ ] RED: the unit batteries (the slash-resolution seam + the source pins)
   + the e2e block → verified failing.
5. [ ] GREEN: `src/lib/slash-resolution.ts`; the proxy integration;
   `skipTrailingSlashRedirect: true`.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run (the proxy change touches every request — the proof
   it changed nothing visible).
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The proxy change touches EVERY request** — it is the highest-blast-radius
  edit of the session. The new block only fires on single-trailing-slash
  shapes (`rawPath.endsWith("/") && rawPath !== "/"`): every canonical,
  case-variant, unknown, API and asset request takes the SAME path as today
  (the `pass` action is a no-op fall-through to the unchanged s17 logic).
  The GUARD phase re-runs the ENTIRE standing battery + the full e2e suite.
- **The s24 pin compatibility**: the pin asserts status 308 + Location
  `/Courses` — the proxy-issued 308 constructs the identical relative
  Location (verified against Next's own emission form). The pin re-asserts
  in the new e2e block.
- **The redirect's header set**: Next's own pre-proxy 308 carried NO CSP
  (it bypassed the proxy entirely); the proxy-issued 308 attaches the CSP +
  the baseline security headers (the s23 every-response posture — the live's
  platform ships its headers on every response incl. redirects). Additive,
  deliberate-better; no pin asserts the 308's header absence.
- **The not-found rewrite target** (`/__nexus-slash-404__`): an unmatched
  internal path — the router renders not-found.tsx with a REAL 404 status
  (the s24 principle). A user directly typing that path gets the same 404
  view (no collision — it is not a route).
- **The `Location` relative form**: constructed manually
  (`new NextResponse(null, { status: 308, headers: { Location } })`) —
  `NextResponse.redirect()` requires an absolute URL and would emit the
  absolute form (the s24 pin asserts the relative `/Courses`).
- **The API matcher exclusion stays**: the proxy still never runs on
  `/api/*` (the s24 hot-path decision); the flag's router tolerance on API
  slash shapes is the finding-5 parity improvement, pinned as-is.
- **The dev-origin allowlist interplay**: none — the flag changes no dev
  server origin behavior.
