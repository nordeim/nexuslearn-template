# NexusLearn Remediation Plan — Session 41

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the evidence scripts under `/home/z/my-project/scripts/s41-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-40 tree, commit
`c8b0d25` + the owner's session_86.md doc commit `1085cdd`): lint ✓ ·
typecheck ✓ · 267/267 unit ✓ · build ✓ · **352/352 e2e ✓** (7.8m, zero
flakes) — 619 total, matching the documented session-40 end state exactly.
The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env`, byte-identical to `.env.example`; `db/custom.db` + `db/e2e.db` at
the repo root). The standing parity surfaces ALL re-verified: heights ×9
routes ×2 viewports **byte-exact 18/18**, the **mobile battery fully
identical — NO Tailwind v4 bug** (trigger `md:hidden p-2 rounded-lg
text-white/80` byte-identical, panel 375×405 @ y=64, 9 members at identical
geometry), console sweep **13/13 clean**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The auth-route head family (fresh-eyes family A — a REAL functional parity drift on a surface no prior session censused)**: the LIVE's two platform-AUTH routes (`/login`, `/reset-password` — and its `?token=` variant) are served by the platform's auth shell, whose `<head>` carries a family the clone ships on NO route (probed via the full per-route head census, order-agnostic meta/link extraction on the raw SSR HTML of all 14 route shapes): **(a)** the viewport meta gains `viewport-fit=cover` (`width=device-width, initial-scale=1.0, viewport-fit=cover`) — the notch-extends-webview rendering mode; **(b)** `<meta name="theme-color" content="#000000">` — the mobile browser chrome tint; **(c)** `<link rel="apple-touch-icon" href="…logo.png" sizes="180x180">` — the iOS home-screen icon; **(d)** the og:image family gains `og:image:width=1200`, `og:image:height=630`, `og:image:alt="Base44 link preview"` AND `twitter:image:alt="Base44 link preview"`. The CLONE's `/login` + `/reset-password` ship the plain app-shell family (no viewport-fit, no theme-color, no apple-touch-icon, no image dims/alt). Every one of the five is user-visible (mobile chrome color, notch rendering, install-time icon, link-preview cards) — the same parity tier as the session-13 ZINC login theme (platform-injected but mirrored because the route is parity surface). | **HIGH** (functional parity) | fix below |
| 2 | **The app-route og:image family — the INVERSE drift (an unpinned beyond-reference addition)**: the LIVE's app-shell routes (all 9 content routes + the 404s, probed on every one) ship `og:image`/`twitter:image` URL-ONLY — no `og:image:width`, no `og:image:height`, no `og:image:alt`, no `twitter:image:alt`. The CLONE ships `og:image:width=1200` + `og:image:height=630` + `og:image:alt="NexusLearn"` on EVERY route (the payload predates the census — the dimensions were never probed against the live). Exact head parity = strip the dims/alt from the app payload; the auth routes then CARRY them (finding 1) — the two findings share one seam. | MEDIUM (exact-parity hygiene) | fix below |
| 3 | **The reveal-under-reduced-motion no-adaptation contract (fresh-eyes family C — verified matching, UNPINNED)**: the s22 media-emulation pin froze transition DURATIONS under `prefers-reduced-motion: reduce` (the no-adaptation contract) — but the reveal ENTRY engine is separate (the live's framer-motion vs the clone's WAAPI RevealController) and was never probed under reduce. Probed on BOTH sites this session: a below-fold reveal target transitions opacity 0 → 1 over ~300ms under reduce on the live (framer-motion is unconfigured — no `MotionConfig reducedMotion="user"`) AND on the clone (WAAPI does not auto-respect the media query). Matching by construction — pin it so a future "accessibility pass" cannot diverge the clone from the live's contract without the documentation gate. | LOW (pin) | spec below |
| 4 | **The route-transition loading UX (fresh-eyes family B — verified, deliberate-better, UNPINNED)**: under a 400ms/400kbps throttle the LIVE's in-app nav swaps INSTANTLY (its SPA carries every route's components in the initial bundle — the first 150ms sample already shows the new route's h1; the stale-title behavior is the pinned s16 contract) and shows NO spinner/loading indicator; the CLONE keeps the OLD page visible until the new route's RSC payload commits (all pages are force-dynamic for the s24 CSP nonce, and dynamic routes without `loading.tsx` prefetch nothing) — also NO spinner, and the title updates at commit (the pinned s16 deliberate-better). Two contracts to pin: (a) NEITHER site renders a loading shell/spinner during in-app navigation (a `loading.tsx` would ADD a spinner the live never shows — the documented reason none exists); (b) the clone's old-page-persist under slow RSC fetches (the React-transition behavior — the deliberate-better family). | LOW (pin + document) | spec below |
| 5 | **The static-asset slash tolerance (fresh-eyes family D — verified, UNPINNED)**: under `skipTrailingSlashRedirect` (s40) the clone serves REAL static files at single-trailing-slash paths — `/manifest.json/` → 200 application/json (the manifest body byte-identical to the canonical path), `/robots.txt/` → 200 text/plain, `/sitemap.xml/` → 200 application/xml, `/logo.png/` → 200 image/png — and 404s nonexistent assets (`/nonexistent.png` and `/nonexistent.png/` → the real 404 view). The LIVE 200s the SPA shell (text/html) for every one of those shapes (the platform's 200-for-everything posture — the documented s24 deliberate-better family) and 302s `/favicon.ico` to its supabase logo (platform chrome; the clone 404s it — no favicon.ico file, the documented variance family). Pin the clone's shapes so the s40 tier's static-file side effects are a pinned contract, not an accident. | LOW (pin) | spec below |
| 6 | **The notation/dev-artifact family (documented, no fix)**: (a) the viewport serialization — the live ships `initial-scale=1.0`, Next serializes `initialScale: 1` as `initial-scale=1` (the number 1 cannot render as "1.0" through the Viewport export — notation-only, the parsed viewport is identical; the same family as the s25 raw-token notation variance); (b) the raw-HTML `<title>` whitespace padding on the live (`"\n   Courses | NexusLearn\n  "` — the platform's HTML template; the DOM title is identical); (c) the DEV-ONLY 404 metadata placement — on the dev server the not-found render streams the metadata family into `<body>` (18 metas + 2 links parse after the shell flush); the PRODUCTION build places every one in `<head>` (verified on the :3100 standalone server) — a dev-streaming artifact, no user impact, recorded so a future dev-mode head audit does not misread it as drift. | LOW (document) | Phase 5 |

### Audit-surface note (the session-41 additions — FOUR new probe families)

- **the complete per-route head census** (findings 1+2) — every meta/link
  tag on all 14 live route shapes (9 content + /login + /reset-password +
  the token variant + the 404 + the root), extracted ORDER-AGNOSTICALLY
  from the raw SSR HTML (the live emits `content` before `name` — an
  attribute-order regex silently reads nulls; the session's methodological
  catch), diffed against the clone's DOM census per route.
- **the route-transition loading UX** (finding 4) — the visible mid-transition
  state (old page vs loading shell vs spinner; title; URL) sampled at 150ms
  resolution under CDP network throttling, both sites.
- **the reveal-entry engine under reduced-motion** (finding 3) — the opacity
  transition of a below-fold reveal target sampled at 40ms resolution under
  `prefers-reduced-motion: reduce`, both sites.
- **the static-asset edge shapes** (finding 5) — the slash/query/miss matrix
  on the asset tier (/manifest.json, /robots.txt, /sitemap.xml, /logo.png,
  /favicon.ico, a miss), both sites, status + content-type level.

### The plan-time design validation (done BEFORE this plan was finalized)

- **The Viewport type carries every needed knob** (verified against the
  installed Next 16 types): `viewportFit?: "auto" | "cover" | "contain"`,
  `themeColor?: string` — a page-level `export const viewport` on /login +
  /reset-password emits `viewport-fit=cover` inside the viewport meta and
  the standalone `<meta name="theme-color">`. Page viewport exports MERGE
  over the layout's per-key (the closest wins), so the pages restate
  `width` + `initialScale` for safety.
- **The Twitter image descriptor supports `alt`** (`TwitterImageDescriptor`:
  `{ url, alt? }` → emits `<meta name="twitter:image:alt">`), and the icons
  config supports per-entry `sizes` (`apple: [{ url, sizes: "180x180" }]` →
  `<link rel="apple-touch-icon" sizes="180x180">`) — both verified in
  `node_modules/next/dist/lib/metadata/types/`.
- **The gotcha-18 replacement rule is respected by construction**: the auth
  pages' `generateMetadata` already restates the full payload through
  `pageMetadata()`; the authShell option only swaps the images/icons
  sub-payloads inside the SAME restated structure (no partial-inheritance
  risk).
- **The s6 OG-identity pins survive**: the only og:image pin asserts the
  content URL contains `/logo.png` (spec line ~884) — the stripped app
  payload and the auth payload both keep `url: "/logo.png"`. The
  og:title/twitter:title/og:url/twitter:url mirrors are untouched.
- **The s38 404-head pins survive**: the layout's generateMetadata keeps the
  derived title/canonical/twitter:url family; only the images sub-payload
  loses the dims/alt (the live's 404 og:image is URL-only — probed).
- **The s37 /reset-password head pins survive**: the plain "NexusLearn"
  title + the token-carrying canonical/og:url stay (the authShell option
  touches only viewport/theme-color/icons/image-dims).
- **The s22 media-emulation pin survives**: the dark-scheme + reduced-motion
  computed-style reads target `body`/`nav` transition durations — the head
  changes touch no styles.
- **The CSP nonce path is untouched**: viewport/metadata exports render into
  the head statically per-request; no script/CSP interaction.
- **No other live route carries the auth family** (all 12 other shapes
  probed: 9 content routes + /nope + the root + /Home — all app-shell) —
  the fix is scoped to exactly the two auth routes.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the auth-shell head seam (findings 1+2, the decision layer)

**Design**: `src/lib/metadata.ts` — `routeMetadata()` gains an
`authShell?: boolean` option:

- `authShell: false` (the default — every app route + the 404 family):
  `openGraph.images: [{ url: "/logo.png" }]`, `twitter.images: ["/logo.png"]`
  — the LIVE's URL-only app shape (finding 2's strip).
- `authShell: true` (only /login + /reset-password): 
  `openGraph.images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Base44 link preview" }]`,
  `twitter.images: [{ url: "/logo.png", alt: "Base44 link preview" }]` — the
  live's auth-shell shape verbatim (finding 1d; the alt string is the
  platform artifact mirrored byte-exactly — the platform-404-body-text
  precedent).
- The root layout's `generateMetadata` (the 404 + no-title family) takes the
  default (URL-only) shape — the live's 404 is app-shell.

**RED unit** (`tests/metadata.test.ts` — extend the existing battery):
the app payload emits NO og:image:width/height/alt and NO twitter alt (the
stripped shape); the authShell payload emits width 1200 / height 630 / alt
"Base44 link preview" on the OG image AND the twitter image alt; the
canonical/og:url/twitter:url processing is IDENTICAL under both flags (the
s39 contract untouched).

### Phase 2 — the page wiring (findings 1a-c, the adapter)

**Design**: `src/app/login/page.tsx` + `src/app/reset-password/page.tsx`:

- `generateMetadata()` → `pageMetadata({ canonical: "/login" | "/reset-password", authShell: true })`
  (the pageMetadata helper passes the flag through to routeMetadata).
- `export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#000000" }`
  — the live's auth-shell viewport family (the `initial-scale=1` vs the
  live's `1.0` is the documented notation variance — unreachable through
  the Viewport export).
- `pageMetadata()` (`src/lib/page-metadata.ts`) gains the pass-through
  `authShell?: boolean` param.

**RED unit** (`tests/page-metadata-source.test.ts` — the source pins, plus
a new `tests/auth-head-source.test.ts` if cleaner): both auth pages export
`viewportFit: "cover"` + `themeColor: "#000000"`; both call pageMetadata
with `authShell: true`; the other 12 pages' metadata calls do NOT pass the
flag; the layout's generateMetadata carries the URL-only image payload.

### Phase 3 — the e2e block (findings 1-5 — the integration pins)

Inserted BEFORE the s33 burst spec (stays LAST — the house rule), after the
s40 block:

1. **The auth-head battery** (findings 1a-d): on `/login` AND
   `/reset-password` AND `/reset-password?token=abc` (raw-HTML request
   level, the s38 house pattern): the viewport meta contains
   `viewport-fit=cover`; `<meta name="theme-color" content="#000000">` is
   present; the apple-touch-icon link (any href form — the infra-URL is
   variance) with `sizes="180x180"`; og:image:width=1200 +
   og:image:height=630 + og:image:alt="Base44 link preview" +
   twitter:image:alt="Base44 link preview"; the title stays the plain
   "NexusLearn" and the canonical family is unchanged (the s37 pins
   re-asserted alongside).
2. **The app-head stripped battery** (finding 2): on `/`, `/Courses`, and a
   404 shape: NO og:image:width / og:image:height / og:image:alt /
   twitter:image:alt in the raw HTML; og:image content still contains
   `/logo.png` (the s6 pin re-asserted); the viewport meta is the plain
   family with NO viewport-fit and NO theme-color meta anywhere.
3. **The reduced-motion reveal pin** (finding 3): under
   `emulateMedia({ reducedMotion: "reduce" })` on `/`, a below-fold
   `[data-reveal]` target transitions through intermediate opacity values
   (sampled ≥ 2 distinct non-terminal opacities within 700ms of
   scrollIntoView) — the no-adaptation contract extends to the reveal
   engine (the live's framer-motion is unconfigured; the clone's WAAPI
   matches).
4. **The transition-UX pin** (finding 4): intercept + delay the RSC payload
   fetch (800ms) on a nav click; assert (a) NO spinner/loader elements
   appear during the window (the live's no-loading-shell contract), (b) the
   OLD page's h1 is still visible at +400ms (the old-page-persist
   deliberate-better), (c) the NEW h1 renders after the delay resolves.
5. **The asset-slash battery** (finding 5): `/manifest.json/` → 200 +
   application/json + the body byte-identical to `/manifest.json`;
   `/robots.txt/` → 200 text/plain; `/sitemap.xml/` → 200 application/xml;
   `/logo.png/` → 200 image/png; `/nonexistent.png` + `/nonexistent.png/`
   → 404 (the real-404 deliberate-better); `/favicon.ico` → 404 (the
   documented variance vs the live's platform 302).

### Phase 4 — the GUARD phase

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 267 → ~273 unit, 352 → ~360 e2e).
- The standing parity surfaces re-verified AFTER the changes: heights/innerText
  ×9 routes ×2 viewports byte-exact + the mobile battery re-run + the console
  sweep (the head changes touch every route's `<head>` — the parity re-run is
  the proof they changed nothing visible in the rendered pages).
- The CSS-leak spec re-runs LAST (the gotcha-41 rule) — after every doc
  write, re-run before committing.

### Phase 5 — docs alignment (finding 6) + the proof matrix + screenshots

AGENTS.md (gotcha 70 — the auth-route head family + the head-census
methodology incl. the attribute-order catch + the notation/dev-artifact
variance family; the commands-table counts), CLAUDE.md (the pyramid counts
+ the seam description), README (badge + the session-41 paragraph), PAD
([S41] revision row + the metadata section), SKILL v3.29.0 + project_state,
`.env`/`.env.example` (NO new knobs), the session logs (session_87.md
transcript + session_88.md final log, the house convention) + the worklog
entry. The proof matrix (`docs/screenshots/api-session-s41.txt`): the
auth-head matrix (clone vs live — every probed meta/link on the 3 auth
shapes), the stripped app-head matrix, the reduced-motion reveal samples,
the transition-UX phases, the asset-slash matrix, the env contract. The
screenshot matrix recaptured per the house viewport-capture convention
(incl. the /login + /reset-password heads' new mobile-chrome rendering).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-40 tree re-verified — 619).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the per-route head census — 14 live
   shapes, the auth-shell family + the stripped app family CONFIRMED),
   family B (the transition UX — instant-swap vs old-page-persist, no
   spinner either side, CONFIRMED), family C (the reveal under reduce —
   matching no-adaptation, CONFIRMED), family D (the asset-slash matrix —
   the flag's static-tier tolerance, CONFIRMED).
4. [ ] RED: the unit batteries (the metadata seam + the source pins) + the
   e2e block → verified failing.
5. [ ] GREEN: the `authShell` seam; the two auth pages' viewport + metadata
   wiring; the app-payload strip.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run (the head changes touch every route — the proof
   they changed nothing visible).
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The head changes touch EVERY route's `<head>`** (the images payload is
  shared) — the GUARD phase re-runs the ENTIRE standing battery + the full
  e2e suite; the rendered-page surfaces (heights/innerText) cannot move
  (metas render nothing in `<main>`), and the console sweep proves no new
  client warnings.
- **The og:image strip is a visible-in-raw-HTML change on every route**: the
  ONLY existing pin on the image family is the `/logo.png` URL containment
  (s6) — preserved by construction. No other spec matches og:image:width/
  height/alt (grepped) — the strip breaks nothing.
- **The `theme-color` value `#000000` matches the live's manifest
  `theme_color`** (the s25-pinned manifest already declares #000000 — the
  meta and the manifest agree, exactly like the live).
- **The apple-touch-icon `sizes="180x180"`** mirrors the live's auth shell
  verbatim; the href is the clone's `/logo.png` (the infra-URL variance
  family — the same relationship as rel:icon).
- **The alt string "Base44 link preview"** is the platform's generator
  artifact, mirrored byte-exactly per the platform-404-body precedent (the
  observable contract is the string itself).
- **Page-level viewport exports merge per-key** (the closest wins) — the
  pages restate width + initialScale so the merged output is complete
  regardless of merge semantics.
- **The reveal-pin's sampling** (finding 3) asserts ≥ 2 intermediate
  opacities — robust against timing jitter (the transition runs ~300ms; the
  sampler polls at 40ms), and the no-preference mode is already covered by
  the s15 reveal specs.
- **The transition-UX pin's RSC interception** (finding 4) delays the
  `RSC`-content fetch of the target route — the pattern the s18
  transient-state specs already use (`page.route` + a held promise), so the
  house tooling handles it; the 800ms window is well inside the s18
  precedents' delay budgets.
- **The asset-slash pins run against the PRODUCTION server** (the e2e
  house pattern) — the dev server's on-demand compilation does not affect
  static-file responses, but the pins follow the suite's standing
  production-build contract anyway.
