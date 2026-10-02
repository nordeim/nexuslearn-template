# NexusLearn Remediation Plan — Session 38

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the evidence scripts under `/home/z/my-project/scripts/s38-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-37 tree, commits
`dcc821e`/`4bba1a1`/`f18b94a`): lint ✓ · typecheck ✓ · 171/171 unit ✓ ·
build ✓ · **322/322 e2e ✓** (6.6m, zero flakes) — 493 total, matching the
documented session-37 end state exactly. The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env` — byte-identical to
`.env.example`, `db/custom.db` + `db/e2e.db` at the repo root after the
standard re-seed; the db-url resolver correctly IGNORES the stale absolute
shell export — the session-19 enforced contract, observed live in the boot
log). The standing parity surfaces ALL re-verified at the documented state:
heights ×9 routes ×2 viewports **byte-exact 18/18** (main-scoped innerText —
the closed mobile panel's `grid-rows-[0fr]` text stays outside `<main>`,
gotcha 28; the live's CourseDetail probed via ITS OWN course id — the id
namespaces differ by design), the **mobile battery fully identical** (trigger
`md:hidden p-2 rounded-lg text-white/80` byte-identical, panel 375×405 @ y=64
IDENTICAL, per-link geometry byte-identical y 81/129/177/225/273/321/369/417,
scrolled nav identical — **NO Tailwind v4 bug**; the single diff is the
documented clone ARIA hardening `aria-expanded`/`aria-controls`), console sweep
**12/12 clean** (incl. both /reset-password states).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The 404-metadata surface (fresh-eyes family 1 — a REAL functional parity drift)**: the LIVE derives the 404 view's ENTIRE metadata family from the RAW REQUEST PATH — server-rendered in its HTML head (probed via raw curl, not the hydrated DOM): **(a)** the document title = lodash-`startCase`-style transformation of the LAST non-empty path segment + `" | NexusLearn"` (probed: `/definitely-not-a-real-route` → "Definitely Not A Real Route \| NexusLearn"; `/RESET-PASSWORD` → "RESET PASSWORD \| NexusLearn"; `/cOurSes` → "C Our Ses \| NexusLearn" — words split at hyphens, underscores AND lower→upper camel boundaries, each word's FIRST letter uppercased with the REST PRESERVED; `/UPPER_CASE_word` → "UPPER CASE Word"; `/with123numbers` → "With123numbers"; `/a.b.c` → "A.b.c"; `/Courses/deeper/missing` → "Missing" — the LAST non-empty segment); **(b)** the canonical link = the raw path with the TRAILING SLASH STRIPPED and the QUERY STRING INCLUDED (`/no-such-page?x=1` → canonical `…/no-such-page?x=1`); **(c)** og:title + twitter:title mirror the full derived title; og:url + twitter:url mirror the canonical (query included). The CLONE ships the plain root family on every 404: title "NexusLearn", canonical the site ROOT, og:title "NexusLearn", og:url the site root — a 5-dimension drift (title, canonical, og:title, og:url, twitter:url) invisible to every body-level parity surface (the 404 BODY text is already byte-identical — this lives entirely in the head). | **HIGH** (functional parity) | fix below |
| 2 | **The AI-chat LLM await has NO timeout (fresh-eyes family 2 — the session-37 mailer-timeout sibling, an independent hardening discovery)**: `POST /api/ai/chat` awaits `zai.chat.completions.create(...)` — the SDK's raw `fetch` (verified in `node_modules/z-ai-web-dev-sdk/dist/index.js`: no `signal` parameter, none accepted in the `create(body)` type) with NO bound. A hung/slow LLM endpoint (network partition, black-holed gateway) pins the route indefinitely: requests pile up past the rate-limit bucket, and the client's "Thinking..." bubble spins forever. The s37 fix bounded the MAILER's fetch (10s AbortController); the AI route is the same class — the app's only other external await. | MEDIUM (hardening) | fix below |
| 3 | **The interaction-latency (INP-proxy) budget surface (fresh-eyes family 3 — the session_77-suggested direction (b))**: the INTERACTION dimension of the per-route performance contract remains unpinned (the s33 bundle → s34 JS → s35 TTFB → s36 FCP/LCP → s37 TBT family). Measured: the clone's mobile-menu OPEN interaction lands at **6–9ms** (click → panel state flip, 5 runs). A budget spec pinned at the Core-Web-Vitals INP "good" threshold (< 200ms — 20x+ headroom) catches the pathological regressions the family exists for (a hydration-blocked trigger, a transition-janked panel). | LOW (pin/record) | spec below |
| 4 | **The deferred direction (a) resolved — no action**: the logout-everywhere UI (`/Settings`) probed AGAINST the live's signed-in chrome: the live ships NO settings/logout/user surface anywhere (navbar = "My Dashboard" only; Dashboard links = Browse More / Browse Courses only). The beyond-reference decision stands (documented — the API exists, the UI stays deferred). | — (resolved) | none |
| 5 | **Documentation staleness (found during the doc-review phase)**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 shift with the new specs (171 unit + 322 e2e → new totals); AGENTS.md gains the gotcha (the 404-title derivation — the raw-path family's 404 member); the SKILL bumps to v3.26.0. | MEDIUM (doc hygiene) | Phase 6 |

### Audit-surface note (the session-38 additions — THREE new probe families)

- **the 404-metadata surface** (finding 1) — the HEAD dimension of the
  not-found contract: the title derivation algorithm (startCase on the last
  non-empty segment, camel-splitting, preserved case), the canonical's
  trailing-slash strip + query inclusion, the og/twitter mirrors. Probed via
  raw HTML head extraction (curl — the SSR tier, not the hydrated DOM) across
  12 path shapes.
- **the external-await availability surface** (finding 2) — the same audit
  that found the mailer's missing AbortController (s37), swept across EVERY
  `await` in `src/app/api/` + `src/lib/`: the AI route's SDK completion call
  is the only remaining unbounded external await (all DB awaits are local
  SQLite; the mailer is bounded since s37).
- **the interaction-latency budget surface** (finding 3) — the INP lab proxy:
  the click → state-flip latency of the highest-regression-risk chrome (the
  mobile menu), measured via a requestAnimationFrame poll on both sites.

### Spike validation (the design risk retired BEFORE the plan)

The family-1 fix has one architectural uncertainty: `notFound()` discards the
PAGE's `generateMetadata` (spiked: a catch-all page with metadata + `notFound()`
renders the plain title — verified on the dev server). The validated design:
**the proxy injects the raw path + search as request headers; the root layout's
`generateMetadata` derives the 404 family from them.** Real routes are
unaffected — every page restates its FULL payload via `routeMetadata()`
(gotcha 18: a child's openGraph/twitter REPLACE the root's wholesale), so the
derived values surface ONLY on the not-found render (the one render with no
page metadata). Spiked end-to-end on the dev server: the header-driven title
renders on the 404 (status stays 404), and /, /Courses, /login,
/reset-password, /CourseDetail keep their exact titles. The layout also keeps
the static-object semantics for the non-404 fields (description, icons,
manifest, apple-web-app) — only title/canonical/og/twitter become derived.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the 404-metadata seam (finding 1, the pure layer)

**Design**: `src/lib/not-found-metadata.ts` (the pure seam — no Next.js
imports, unit-testable):

- `startCaseSegment(raw)` → the reference title-caser: insert a boundary at
  every lower/digit→upper transition (camel humps), split on `[-_]+`,
  first-letter-uppercase + rest-preserved per word (probed: "RESET-PASSWORD"
  → "RESET PASSWORD", "cOurSes" → "C Our Ses", "UPPER_CASE_word" → "UPPER CASE
  Word", "with123numbers" → "With123numbers", "a.b.c" → "A.b.c",
  "mixedCASE-words" → "Mixed CASE Words").
- `notFoundTitle(rawPath)` → the last non-empty segment (split on `/`),
  `decodeURIComponent`d, startCased, + `" | NexusLearn"`; the empty-path
  fallback = `"NexusLearn"` (the plain root title — unreachable in practice,
  the fail-safe default).
- `notFoundCanonical(rawPath, rawSearch)` → the path with the trailing
  slash stripped + `rawSearch ? "?" + rawSearch : ""`; empty → `"/"`. The
  percent-DECODED canonical the live emits for `/​%20space%20word` is
  artifact-grade (a literal space in a URL — invalid; the Next metadata API
  re-encodes by construction): the clone keeps the ENCODED form (the
  deliberate-better family, documented with the s17 case-variant decision).

**RED unit** (`tests/not-found-metadata.test.ts`): the startCase battery
(every probed shape, the camel splits, the preserved case, the digit and dot
non-splits, the empty/dash-only segments), the title derivation (last
non-empty segment incl. `/trailing/` → "Trailing", `/Courses/deeper/` →
"Deeper", the `| NexusLearn` suffix, the decode), the canonical (the
trailing-slash strip, the query inclusion, the empty fallback).

### Phase 2 — the proxy header injection + the layout derivation (finding 1, the wiring)

**Design** (validated against the codebase — one flaw CAUGHT AND FIXED at
plan time):

- `src/proxy.ts`: on EVERY pass-through request (after the existing
  case-rewrite + verb-guard + CSP logic) set two REQUEST headers via
  `NextResponse.next({ request: { headers } })`: `x-nexus-raw-path`
  (the raw pathname) + `x-nexus-raw-search` (the raw search string). The
  headers are REQUEST-scoped (never response-exposed — no new external
  surface; the CSP/security-header contract untouched).
- `src/lib/metadata.ts` — **the no-title pages must STOP depending on the
  layout default** (the plan-time catch): `routeMetadata`'s no-title form
  currently spreads NO title (the page inherits the layout default) — once
  the layout default becomes the DERIVED 404 title, `/login` would render
  "Login | NexusLearn" (the live ships plain "NexusLearn" — probed). The
  helper's no-title branch now sets `title: { absolute: SITE_NAME }`
  (byte-identical output for every existing caller).
- `src/app/page.tsx` — the landing has NO metadata export (inherits the
  layout default): add `export const metadata = routeMetadata({ canonical:
  "/" })` (with the helper fix, the output stays byte-identical: plain
  "NexusLearn" + the root canonical — the live's / head, probed).
- `src/app/Home/page.tsx` — the re-export (`export { default } from
  "../page"`) transfers the COMPONENT but NOT the metadata export: /Home
  needs its own `export const metadata = routeMetadata({ canonical: "/" })`
  (the live's /Home: plain "NexusLearn" + the ROOT canonical — probed; the
  footer-link route keeps its exact current head).
- `src/app/layout.tsx`: `export const metadata` → `export async function
  generateMetadata()` — reads the two headers via `headers()` and derives:
  `title.default = notFoundTitle(rawPath)` (defaults render AS-IS — the
  template only applies to page titles, so the default carries the FULL
  "… | NexusLearn" form), `alternates.canonical = notFoundCanonical(...)`,
  `openGraph.title/twitter.title = notFoundTitle(...)`,
  `openGraph.url/twitter.url = the canonical`. The non-404 fields (description,
  icons, manifest, appleWebApp, metadataBase, the title template) stay
  byte-identical. Every real page restates its full payload — unaffected
  (spiked; the four no-title renders are made explicit above).

**RED unit** (`tests/layout-source.test.ts` additions — the source-pin
family): the layout imports the seam + reads `x-nexus-raw-path`; the proxy
sets both headers; the routeMetadata no-title branch sets the ABSOLUTE title
(the /login guard); the landing + /Home carry the explicit metadata exports.

### Phase 3 — the AI-chat timeout seam (finding 2)

**Design**: `src/lib/ai-chat.ts` — the pure seam:

- `withTimeout<T>(promise, ms, label)` → `Promise.race` with a typed
  `AiChatTimeoutError`; the losing promise keeps running (the SDK accepts no
  signal — documented; the socket dies at the OS level) but the ROUTE
  returns within the bound. `AI_CHAT_TIMEOUT_MS = 60_000` (the LLM-legitimate
  window — thinking disabled, ≤12 turns, ≤4000 chars/turn; the mailer's 10s
  fits a simple email POST, an LLM completion does not) + an options override
  for the tests.
- `callAiCompletion(messages)` → wraps `ZAI.create()` + the completion call
  under the bound (the config read is local fs — bounded; the completion is
  the network await).

**Route change** (`src/app/api/ai/chat/route.ts`): the `ZAI.create()` +
`completions.create` block delegates to `callAiCompletion(recent)`; a
`AiChatTimeoutError` maps to the EXISTING 502 + the same friendly message
(the catch is already the degrade path — the timeout just joins the family).
The guards (throttle, 413, turn cap) untouched — pinned.

**RED unit** (`tests/ai-chat-timeout.test.ts`): the timeout fires (a
never-resolving promise + a 5ms override → the typed error), a fast
resolution passes through untouched, the 60s default constant, the route
source-pin (the route delegates to the seam — no direct SDK await left in
the route body).

### Phase 4 — the e2e block (findings 1–3, the integration pins)

Inserted BEFORE the s33 burst spec (stays LAST — the house rule):

1. **The 404 title battery** (the derived-title contract): 5 shapes — a
   plain miss (`/definitely-not-a-real-route` → "Definitely Not A Real
   Route | NexusLearn"), a case-variant miss (`/RESET-PASSWORD` → "RESET
   PASSWORD | NexusLearn"), a nested miss (`/Courses/deeper/missing` →
   "Missing | NexusLearn"), a trailing-slash miss (`/no-such-page-xyz/` →
   "No Such Page Xyz | NexusLearn" — startCase of "no-such-page-xyz"), a
   camel miss (`/cOurSes` → "C Our Ses | NexusLearn").
2. **The 404 canonical + og battery**: the canonical/og:url/twitter:url
   carry the full path (+ the query when present: `/no-such-page-xyz?x=1`
   → all three include `?x=1`); og:title mirrors the derived title.
3. **The 404 status + body unchanged**: status 404 (the s24 pin re-run),
   the view's h1 "404" + the quoted-path copy (the s10 pin re-run) — the
   metadata change must not touch the view.
4. **The real-route titles unaffected**: the standing title pins (/,
   /Courses, /login, /reset-password, /CourseDetail) re-asserted in the
   same block (the layout change is global — the guard).
5. **The INP-proxy budget**: the mobile-menu OPEN interaction (click →
   the panel's class/state flip via a rAF poll) lands < 200ms on the
   e2e standalone (measured 6–9ms on dev — the standalone adds the
   hydration-complete guarantee; 20x+ headroom).

### Phase 5 — the GUARD phase

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 171 → ~195 unit, 322 → ~332 e2e).
- The standing parity surfaces re-verified AFTER the changes (the standard
  re-seed first): heights/innerText ×9 routes ×2 viewports byte-exact + the
  mobile battery re-run + the console sweep (the layout is a global file —
  the highest-blast-radius change of the session; the parity re-run is the
  proof it changed nothing visible on real routes).
- The CSS-leak spec re-runs LAST (the gotcha-41 rule).

### Phase 6 — docs alignment (finding 5)

AGENTS.md (gotcha 67 — the 404-title derivation + the proxy-header pattern +
the AI timeout; the commands-table counts; Where-things-live), CLAUDE.md
(the API surface line + the pyramid counts), README (badge + the
session-38 paragraph), PAD ([S38] revision row + §6/§7 updates), SKILL v3.26.0
+ project_state, `.env`/`.env.example` (NO new knobs — the timeout is a
constant, not a knob: the mailer precedent kept its 10s in-code), the
session logs + the worklog entry.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-37 tree re-verified — 493).
2. [x] Standing parity audit green (heights/innerText/mobile/console).
3. [x] Fresh-eyes probes: family 1 (the 404-metadata drift — a REAL
   functional parity drift) CONFIRMED, family 2 (the AI-chat unbounded await)
   CONFIRMED, family 3 (the INP proxy) MEASURED (6–9ms).
4. [ ] RED: the unit batteries (the not-found-metadata seam + the layout/
   proxy source pins + the ai-chat timeout seam) + the e2e block → verified
   failing.
5. [ ] GREEN: `src/lib/not-found-metadata.ts`; the proxy header injection;
   the layout `generateMetadata`; `src/lib/ai-chat.ts`; the route delegation.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run (the layout is global — the proof it changed
   nothing on real routes).
7. [ ] The proof matrix (`docs/screenshots/api-session-s38.txt`: the 404
   title/canonical matrix across the probed shapes, the real-route title
   guard, the AI seam timeout proof, the INP measurement) + screenshots (the
   capture matrix + the 404 view at both viewports).

### Risk notes (validated against the codebase pre-execution)

- **The layout change is the highest-blast-radius edit of the session** —
  it is why the plan converts the static `metadata` to `generateMetadata`
  with the derived fields ONLY observable on the not-found render (every
  page restates its full payload — gotcha 18), and why the GUARD phase
  re-runs the ENTIRE standing parity battery + the title pins on every real
  route. The spike already verified the real-route titles on the dev
  server.
- **The `headers()` dynamic API in the root layout**: the layout is already
  `force-dynamic` (the s24 CSP-nonce companion) — no rendering-mode change,
  no caching change; the TTFB budget (s35) re-verified in the GUARD phase.
- **The proxy header injection**: REQUEST-scoped headers never reach the
  client (no new external surface); the existing CSP/verb/rewrite logic is
  untouched (the insertion point is the existing pass-through branch). The
  e2e s24/s26 status + header pins re-run in the suite.
- **The title-template interplay**: `title.default` renders AS-IS (the
  template applies only to page titles) — the seam returns the FULL
  "… | NexusLearn" string; the real pages' template path is untouched
  (verified in the spike: /Courses still renders "Courses | NexusLearn").
- **The 404 view itself is untouched** (the s10/s24 pins re-run): only the
  head changes. The body text/classes/height are outside this fix's blast
  radius (the `not-found.tsx` file is not modified).
- **The AI timeout's losing promise**: the SDK accepts no `signal` (verified
  in its dist source) — the race leaves the fetch running until the OS
  reaps it; the ROUTE returns within the bound (no request pile-up — the
  failure mode the fix exists for). The rate limiter (s31) still bounds the
  request rate; the timeout bounds the per-request duration.
- **The INP spec's flake surface**: measured 6–9ms against a 200ms ceiling
  (20x+ headroom — effectively unflakeable while catching the pathological
  regressions); runs inside `workers: 1`.
