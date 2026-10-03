# NexusLearn Remediation Plan — Session 42

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the production standalone on :3100; the evidence scripts under
`/home/z/my-project/scripts/s42-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-41 tree, commit
`0a4cc0c` + the owner's session_89.md doc commit `e5b9316`): lint ✓ ·
typecheck ✓ · 279/279 unit ✓ · build ✓ · **360/360 e2e ✓** (7.5m, zero
flakes) — 639 total, matching the documented session-41 end state exactly.
The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env`, byte-identical to `.env.example`; `db/custom.db` + `db/e2e.db` at
the repo root). The standing parity surfaces ALL re-verified: heights ×9
routes ×2 viewports **byte-exact 18/18**, innerText identical, the **mobile
battery fully identical — NO Tailwind v4 bug** (trigger byte-identical,
panel 375×405 @ y=64, 9 members at identical geometry), console sweep
**13/13 clean**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The og:image CONTENT tier (fresh-eyes family A — a REAL content-level parity drift on the byte tier behind a head tag s41 pinned but never fetched)**: the LIVE's og:image + twitter:image URLs (all 14 route shapes — the render URL with `?width=1200&height=630&resize=contain`) actually serve a **630×630 PNG, 452,632 bytes, deterministic across fetches** (md5 `cf0578925e4f10aeb5dd61fb1257de57`) — supabase's contain-fit render of the raw 1024×1024 logo (the fit of a square into 1200×630 is 630×630, canvas cropped to the fitted size). The CLONE's og:image URL serves `/logo.png` = the **raw 1024×1024 logo (1,123,244 bytes)** — byte-identical to the live's RAW object tier but NOT the render the live's og:image actually delivers. The two URL tiers on the live are DIFFERENT ASSETS: the raw object (1.1MB, served for `rel=icon`, `apple-touch-icon`, the manifest icons — the clone's `/logo.png` mirrors this tier byte-exactly) vs the render (452KB, served for og:image/twitter:image — the clone points at the RAW tier). A link-preview crawler fetching the clone's og:image gets the 1024×1024 raw logo where the live's gets the 630×630 render — different dimensions, different bytes, same artwork. | **HIGH** (content parity) | fix below |
| 2 | **The error-boundary surface (fresh-eyes family B — the last unpinned framework-default UI in the app dir)**: the clone ships NO `error.tsx` — a persistent client render error (probed on the production build via a `Number.prototype.toLocaleString` sabotage landing inside `CourseCard`'s count render, `CourseCard.tsx:89`) shows **Next 16's built-in default boundary**: "This page couldn't load / Reload to try again, or go back / [Reload] [Back]" — version-dependent framework chrome, unpinned (the Next 16 default already replaced the old "Application error: a client-side exception has occurred" string — silent drift risk on every upgrade). The LIVE's forced-crash UX (probed via the armed `document.createElement` sabotage on its SPA): a **BLANK WHITE SCREEN** — empty body, no boundary, no recovery (the platform ships no visible crash UX). The clone's framework default is already a deliberate-better over the live's blank screen, but an EXPLICIT on-brand `error.tsx` (the not-found.tsx design language) makes the contract stable + pinnable. | MEDIUM (fix + pins) | fix below |
| 3 | **The network-resilience tier (family B companions — verified, unpinned)**: (a) the surgical RSC abort (only `text/x-component` requests aborted): Next 16's router logs "Failed to fetch RSC payload … Falling back to browser navigation" and the target page RENDERS via the fallback document request — the clone's in-app navigation survives a dead RSC channel; (b) the AI-chat network failure: the LIVE = the perpetual "Thinking…" bubble (stuck, no alert — probed); the CLONE = the explicit "Network error — please try again." assistant message (`AIAssistantChat.tsx:132`, implemented, unpinned) — the deliberate-better; (c) the full-network-abort blank is the BROWSER's failed-navigation page (`document.body.children` = 0 — not app surface; the live's document loads fail identically). | LOW (pin) | spec below |
| 4 | **The scroll-restoration + bfcache + service-worker surface (fresh-eyes family C — a REAL behavioral drift + two matching contracts, all unpinned)**: (a) **scroll restoration on back**: scrolled to 2000 → navigate → back — the LIVE lands at **scrollY 0** (its async client-rendered SPA grows content AFTER the browser's restore moment, clamping to 0), the CLONE lands at **~2020** (the SSR content exists at restore time; verified on BOTH the dev and production builds) — the clone's restoration is the deliberate-better (the s16 architecture family's root cause, opposite sign); (b) **no service worker on either site** (`navigator.serviceWorker.controller` null — the PWA tier is manifest-only on both); (c) **bfcache never serves in the probe context** (`pageshow.persisted` false on BOTH sites, both launch tiers — Playwright's Chromium context; the back/forward navigations are full document loads with `type: "back_forward"` nav entries on both) — documented, not fixable at the app layer. | LOW (pin + document) | spec below |
| 5 | **The methodology + variance notes (documented, no fix)**: (a) **react-dom captures `document.createElement` at module load** — a page-level sabotage of the global can never reach the render path (only the router's meta/link management calls the live global; the dev-mode "crash" from the persistent sabotage was the ROUTER's metadata application failing, not a render error) — future crash probes must target a prototype method looked up at CALL time (`toLocaleString`); (b) **React 19 recovers one-shot render errors via retry** — the one-shot sabotage logged 5 errors then the disarmed retry SUCCEEDED (the page fully rendered); the boundary only fires on PERSISTENT errors — the e2e must keep the sabotage armed until the boundary renders; (c) the **dev-only metadata body-placement artifact extends to /login** (the DOM census misses the og family; the raw HTML carries it — gotcha 70d's rule: never audit head placement on the dev server); (d) the nav-duration variance (live 27ms vs clone 101ms on back/forward — the SPA-vs-SSR document-load family, s16). | LOW (document) | Phase 5 |

### Audit-surface note (the session-42 additions — FOUR new probe families)

- **the og:image render-byte census** (finding 1) — every head-referenced
  image URL on both sites (og:image, twitter:image, icon, apple-touch-icon,
  manifest icons) FETCHED and measured (content-type, byte length, PNG IHDR
  dimensions), the raw tier hash-compared (the clone's `/logo.png` is
  byte-identical to the live's raw object), the render tier fetched twice for
  determinism.
- **the crash/error-boundary census** (finding 2) — the forced-crash UX on
  both sites: the live's SPA (armed `document.createElement` sabotage →
  blank white screen), the clone's production build (persistent
  `toLocaleString` sabotage → Next 16's default boundary), plus the
  React-19 retry-semantics discovery (the one-shot recovery).
- **the navigation-failure matrix** (finding 3) — the surgical RSC abort
  (with console capture), the full abort (with `document.body.children`
  diagnostics), the AI-chat API abort — both sites.
- **the history/lifecycle census** (finding 4) — back/forward navigation
  entries + `pageshow.persisted` + scroll positions on both sites, two
  launch tiers (Playwright's default `--disable-back-forward-cache` and the
  flag-dropped tier), the service-worker registration state.

### The plan-time design validation (done BEFORE this plan was finalized)

- **The render asset is deterministic + committed verbatim**: two fetches of
  the live's render URL return identical bytes (md5
  `cf0578925e4f10aeb5dd61fb1257de57`, 452,632 bytes, PNG IHDR 630×630) — the
  byte-exact-mirror treatment the raw logo already got (the committed
  `public/logo.png` IS the live's raw object, hash-verified). `public/og-image.png`
  = the fetched render bytes. The static tier serves it with the standard
  public/ contract (ETag + Last-Modified + 304/206 — the same tier
  `/logo.png` already pins).
- **The metadata swap is one seam**: `routeMetadata()`'s four image-payload
  spots (`openGraph.images` ×2 shapes, `twitter.images` ×2 shapes) change
  `url: "/logo.png"` → `url: "/og-image.png"`; the `icons` key (icon +
  apple-touch-icon) and the manifest keep `/logo.png` (the raw tier — the
  live's icon-family URLs serve the raw object). The root layout's
  `generateMetadata` flows through `routeMetadata` (the 404 family picks the
  swap up automatically). `pageMetadata()` needs NO change (it passes
  `authShell` through; the URL is internal to `routeMetadata`).
- **The affected existing pins are exactly five** (grepped): the s6 e2e line
  (~884, `og:image` content contains `/logo.png`) and the four unit
  expectations in `tests/metadata.test.ts` (lines ~60/64 the app shape,
  ~81/86 the authShell shape). The icon/manifest/img pins (e2e ~573/590/617,
  unit `layout-source`/`page-metadata-source`) keep `/logo.png` — the raw
  tier is untouched.
- **`error.tsx` renders no count formatting** (no `toLocaleString` anywhere
  in its tree) — it renders under the persistent sabotage; its `reset`
  re-renders the errored segment; after the sabotage restores, the retry
  renders the target route (probed end-to-end on :3100 — the default
  boundary's Reload is the framework's equivalent of reset; our Try again
  plays the same role with the on-brand chrome).
- **The e2e error-boundary trigger is deterministic** (probed twice on
  production): arm the persistent `toLocaleString` sabotage + click
  `/Courses` → the boundary replaces the tree within ~1s; restore + reset →
  the catalog renders. The `/Courses` catalog's client boundary
  (`CourseCatalog` → `CourseCard.students.toLocaleString(locale)`) is the
  injection point — server-rendered routes never re-render it post-hydration
  on the landing page (the landing counts are server components; the
  sabotage arms after `networkidle`).
- **The scroll-restore pin tolerances**: the restore lands at 2020 (20px
  below the 2000 target — the reveal system's transform settling; CLS 0 by
  design) on both dev and production; the pin asserts `scrollY >= 1500`
  (tolerant to reveal timing, strict vs the live's 0).
- **The no-SW + bfcache facts are context-wide** (`navigator.serviceWorker`
  in every Chromium context; `pageshow.persisted` captured via an
  `addInitScript` listener that survives the document swap) — pinned on the
  production server, documented for the probe-context caveat.
- **The error chunk does not ship on clean loads** (Next loads error-boundary
  chunks on demand) — the JS-budget spec ("every route ships less JS than the
  live") re-runs at GUARD as the proof.
- **The surgical-abort spec aborts ONLY `text/x-component` requests** — the
  fallback document request passes through (probed: the page renders);
  aborting everything would hit the browser's own error page (finding 5d).

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the og-image render asset + the metadata swap (finding 1)

**Design**: `public/og-image.png` = the live's actual render bytes (630×630
PNG, 452,632 bytes — the byte-exact mirror; the raw-logo precedent).
`src/lib/metadata.ts` — the four image-payload URLs swap
`"/logo.png"` → `"/og-image.png"`:

- app shape: `openGraph.images: [{ url: "/og-image.png" }]`,
  `twitter.images: ["/og-image.png"]`
- authShell shape: `openGraph.images: [{ url: "/og-image.png", width: 1200,
  height: 630, alt: "Base44 link preview" }]`, `twitter.images:
  [{ url: "/og-image.png", alt: "Base44 link preview" }]`
- the `icons` key + the manifest keep `/logo.png` (the raw tier).

**RED unit** (`tests/metadata.test.ts` — update the four expectations + one
new assertion): both shapes carry `/og-image.png` in the image payloads; the
authShell dims/alt unchanged; the app shape stays URL-only; the icons key
(when present) keeps `/logo.png`.

**RED e2e**: the s6 line ~884 containment updates to `/og-image.png`; NEW
specs — `GET /og-image.png` → 200 + `image/png` + the IHDR parses 630×630 +
452,632 bytes (the committed mirror); the auth-shell family spec (~5790)
asserts the og:image content contains `/og-image.png` (the apple-touch-icon
href keeps `/logo.png`); the app-route stripped spec re-asserts the URL-only
family at the new URL.

### Phase 2 — the explicit error boundary (finding 2)

**Design**: `src/app/error.tsx` — "use client", the not-found.tsx design
language (light `slate-50`, centered `max-w-md`, the hairline divider): an
h1 "Something went wrong", a description line, a "Try again" button wired to
`reset()`, a "Back to Home" `<Link href="/">`. No count formatting anywhere
in its tree. Documented deliberate-better vs the live's blank white screen
(the s10 real-404 precedent tier); the Next 16 default ("This page couldn't
load") is the replaced framework chrome.

**RED unit** (`tests/error-boundary-source.test.ts` — the source-pin
pattern): the file exists at `src/app/error.tsx`, carries `"use client"`, a
default export, the `{ error, reset }` prop shape, the `reset` wiring on the
Try again button, the `Link` home target, the "Something went wrong" heading,
and NO `toLocaleString`/`Number(` formatting (the boundary renders under the
sabotage).

**RED e2e**: the persistent-sabotage spec — sign in → `/` → arm the
persistent `toLocaleString` sabotage + click the `/Courses` nav → the
boundary's "Something went wrong" renders (NOT the Next default's "This page
couldn't load", NOT a blank screen) → restore `toLocaleString` → click "Try
again" → the catalog renders (`h1` "Explore Our Courses", 9 courses).

### Phase 3 — the network-resilience + chat-error pins (finding 3)

**RED e2e** (the new session-42 block, before the s33 burst spec which stays
LAST): (a) the surgical RSC abort — route-abort `text/x-component` requests
only → click the `/Courses` nav → the catalog still renders (the
fallback-to-browser-navigation contract); (b) the AI-chat network error —
route-abort `**/api/ai/chat**` → send a message → the "Network error —
please try again." assistant message renders in the messages region (the
live's perpetual-Thinking documented variance).

### Phase 4 — the scroll-restore + no-SW pins (finding 4)

**RED e2e**: (a) the scroll-restoration spec — sign in → `/` →
`scrollTo(0, 2000)` → `goto /Courses` → `goBack` → `scrollY >= 1500` (the
clone's SSR-facilitated restoration; the live's 0 documented as the
architecture family); (b) the no-SW spec — on `/`, `/Courses`, `/login`:
`navigator.serviceWorker.controller === null` (the matching manifest-only
PWA tier).

### Phase 5 — GUARD + docs (findings 4-5)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 279 → ~289 unit, 360 → ~367 e2e).
- The standing parity surfaces re-verified AFTER the changes: heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery re-run +
  the console sweep (the metadata swap touches every route's `<head>` — the
  parity re-run is the proof nothing visible moved).
- Docs: AGENTS.md (gotcha 71 — the og-image render tier + the error-boundary
  surface + the crash-probe methodology + the retry semantics; the
  commands-table counts), CLAUDE.md (the pyramid counts + the seams),
  README (badge + the session-42 paragraph), PAD ([S42] row), SKILL v3.30.0,
  `.env`/`.env.example` (NO new knobs), the session logs (session_90.md
  transcript + session_91.md final log, the house convention) + the worklog
  entry. The proof matrix (`docs/screenshots/api-session-s42.txt`): the
  og-image byte matrix (the raw tier hash-identical, the render tier dims/
  bytes, the determinism fetch), the crash matrix (the live's blank screen vs
  the boundary), the nav-failure matrix, the scroll/bfcache/SW census, the
  env contract. The screenshot matrix recaptured per the house convention
  (incl. the error-boundary capture).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-41 tree re-verified — 639).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the og-image render-byte census — the
   630×630 render vs the raw tier CONFIRMED, determinism verified), family B
   (the crash census — the live's blank screen + the Next 16 default + the
   React-19 retry semantics CONFIRMED), family B-companions (the RSC
   fallback + the chat network error CONFIRMED), family C (the scroll
   restoration 2020-vs-0 + the no-SW + the bfcache context CONFIRMED).
4. [ ] RED: the unit batteries (the metadata expectations + the error-source
   pins) + the e2e block → verified failing.
5. [ ] GREEN: `public/og-image.png` + the four-URL swap in `routeMetadata()`
   + `src/app/error.tsx`.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run.
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The metadata swap touches EVERY route's `<head>`** (the shared image
  payload) — the GUARD phase re-runs the ENTIRE standing battery; the
  rendered-page surfaces cannot move (metas render nothing in `<main>`).
- **The only og:image URL pins are the s6 e2e line + the four unit
  expectations** (grepped `logo.png` across the spec files — the icon,
  manifest-icon, and img-src pins at e2e ~573/590/617 are the RAW tier and
  stay). No other spec matches the og:image content.
- **The 452,632-byte asset** joins `public/` (the raw logo is already
  1,123,244 bytes; the repo already carries ~100 screenshots) — the static
  tier serves it with the standard contract; the gzip-tier specs are
  untouched (they pin the TIER on `/logo.png` + `/manifest.json` subjects).
- **The error-boundary e2e's sabotage must stay armed until the boundary
  renders** (the React-19 retry semantics — a one-shot recovers); the
  restore-then-reset flow is the recovery proof. The spec signs in FIRST
  (the sabotage arms after `networkidle` on the landing — no count formatting
  fires between arming and the nav click; the landing's count surfaces are
  server-rendered pre-hydration).
- **The scroll spec's signIn → goto flow** follows the standing battery's
  navigation pattern; the 1500 threshold is 720px below the observed 2020
  (reveal-settling tolerance) and 1500 above the live's 0.
- **The no-SW spec asserts the controller only** — `getRegistrations()`
  resolves async and adds flake surface for a fact (null controller) that
  the controller check already pins on every visit.
