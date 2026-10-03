# NexusLearn Remediation Plan — Session 45

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 / the rotation matrix 375×667 ⇄ 667×375 ⇄ 700×1000 ⇄
1000×700, both sites signed in as the demo user for the auth tiers; the
production standalone on :3100 with `db/e2e.db`; a second standalone on :3101
with `db/custom.db` for the dashboard-print data-artifact proof; the evidence
scripts under `/home/z/my-project/scripts/s45-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-44 tree, commit
`b9ba804` + the owner's session_98.md doc commit `6d68357`): lint ✓ ·
typecheck ✓ · 311/311 unit ✓ · build ✓ · **380/380 e2e ✓** (9.1m, zero
flakes) — **691 total**, matching the documented session-44 end state
exactly. The environment contract re-verified (`.env` == `.env.example`
byte-identical, `DATABASE_URL="file:../db/custom.db"`, `db/custom.db` +
`db/e2e.db` at the repo root). The standing parity surfaces ALL re-verified:
heights ×9 routes ×2 viewports **byte-exact 18/18**, innerText identical, the
**mobile battery fully identical — NO Tailwind v4 bug** (trigger
byte-identical, panel 389×405 @ y=64, 9 members at identical geometry),
console sweep **13/13 clean**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE MD-CROSSING SCROLL-LOCK LEAK (fresh-eyes family A — the session_97 suggested direction (a), the mid-session viewport-orientation-rotation tier)**: the mobile menu's body scroll lock is gated ONLY on the React open-state — `document.body.style.overflow = open ? "hidden" : ""` — while the PANEL's visibility is pure CSS (`md:hidden`). When the viewport crosses the md breakpoint with the menu open (a device rotating portrait→landscape past 768px, a foldable expanding, a window dragged across 768, DevTools responsive mode), the panel + trigger CSS-hide, the desktop row appears — but the React open-state survives (which is CORRECT parity: the live's menu state survives the rotation too, re-appearing open at 714×405 on the round trip on BOTH sites) — leaving `body overflow: hidden` on a page whose menu is INVISIBLE: **the page is unscrollable until the user rotates back below md and closes the menu**. PROBED at 700×1000 → 1000×700: the clone's `window.scrollTo(0, 500)` clamped at the pre-cross scroll (1500) while the live scrolled freely to 2887 (the live ships NO scroll lock at all — its platform family; the clone's lock is the s9 class-G hardening). THE FIX: gate the lock on `window.matchMedia("(min-width: 768px)")` — the lock applies only below md and releases on the crossing (the state — and the round-trip parity — is untouched: rotating back re-opens the panel AND re-applies the lock). This adds the codebase's FIRST `matchMedia` call (grep-verified zero in `src/` today). | HIGH (fix) | Phase 1 |
| 2 | **THE ORIENTATION-ROTATION PARITY CONTRACTS (family A, the non-leak surfaces — all MATCHING, never spec'd)**: the panel geometry at every rotation tier (portrait-open 389×405 @ y=64; landscape 681×405 — under the probe's `isMobile` emulation; 700w 714×405; crossed ≥md 0×0 CSS-hidden; round-trip re-open 714×405 IDENTICAL to the pre-cross geometry), the trigger geometry (40px wide, x=333 portrait / x=617 landscape), the docHeight reflow (15227 at 700×1000 / 10960 at 1000×700 — byte-identical both sites), the menu-STATE survival across the md round trip on BOTH sites, `orientationchange` + `resize` both firing on the crossing. The s43 landscape tier pinned the STATIC 667×375 geometry; the ROTATION dynamics were never spec'd. | MEDIUM (pin) | Phase 2 |
| 3 | **THE PAGINATED PRINT-TO-PDF CENSUS + THE REVEAL-IN-PRINT CONTRACT (fresh-eyes family B — the session_97 direction (b); the s29 print census covered the print STYLESHEET, the paginated OUTPUT was never probed)**: `page.pdf()` (A4, the print-dialog default model) across the 9 routes — page counts **MATCH 9/9** (landing 11, courses 4, coursedetail 32, pricing 3, about 3, contact 2, becomeinstructor 4, aiassistant 2, dashboard 2). THE HEADLINE — the reveal-in-print contract: BOTH sites print the landing page with below-fold reveal content effectively INVISIBLE pre-scroll (the reveal systems' opacity-0 state: the glyph runs are emitted alpha-0, the below-fold IMAGES are not even embedded — clone 1 literal-string text stream / 19 total vs live 0/18; bytes 705k vs 540k) and FULLY after a complete scroll (11 pages both, 7 literal-string streams both, +759k/+774k image embedding). **The pagination is reveal-INVARIANT (11 pages pre AND post — opacity-0 elements reserve their space; only the ink differs)**: "Ctrl+P without scrolling prints an empty-ish page" is the REFERENCE's own behavior — parity, not drift (the s41 reveal-parity contract extended to the print tier). `printBackground: true` (the user-toggled model): 11 pages both. The /Dashboard initial 3-vs-2 page DIFF was the **e2e-db enrollment artifact** (the :3100 standalone's demo user carries 3 e2e-suite enrollments vs the live's 0 — PROVEN by the :3101 custom.db re-probe: 2 pages = the live's 2, docHeight 1573 both). The PDF BYTES are asset-variance (Unsplash variants + font subsetting — the s44 gotcha-73e lesson applied to print): the page COUNT is the comparable. The fixed-Navbar print family is engine-identical by construction (same engine, same CSS — not probed further). | MEDIUM (pin + document) | Phase 3 |
| 4 | **THE SESSION-LAPSE FLIP DIVIDE (fresh-eyes families C+D — the session_97 direction (c), the long-session auth-expiry UX + the cross-tab shared-session family)**: the CLONE's lapse tiers all land on the same silent contract — a stale-iat cookie (8 days > the s32 7-day window), a future-iat cookie (beyond the 60s skew), and no cookie at all each yield `{user: null}` from `/api/auth/me` + the signed-out public dashboard (h1 "Welcome back" — no name; stats [0,0,0,0%]; 0 cards) with NO error and NO redirect (the reference's public-dashboard design). **THE STRUCTURAL DIVIDE**: at the lapse boundary the clone flips to the signed-out truth at the FIRST navigation (every RSC fetch re-verifies — probed in-place: the mid-visit stale-cookie swap + one soft-nav round trip flipped "Welcome back, sepnetflix2023" → "Welcome back"; the cross-tab logout probe: tab A ends the session, tab B's NEXT navigation renders signed-out), while the LIVE holds the stale signed-in view through arbitrary soft-navs until a full RELOAD (its SPA in-memory auth state — the s16 stale-state family extended to AUTH; probed: tokens removed → no-reload still signed-in → soft-nav round trip STILL signed-in → reload finally signed-out). The lapse VIEW itself matches (h1 + stats + cards identical). The cross-tab statics match (the shared session; the un-navigated view stays static on both — no polling; the raw `storage` event fires on both, no app listener either site — the s44 census). The clone's immediate flip is the deliberate-better (server truth); the live's stale-until-reload is the platform family. | LOW (pin the clone contract + document the divide) | Phase 4 |
| 5 | **The variance/documentation families**: (a) the scroll-position-on-rotation DIFF — the clone preserves the scroll (1500→1500; the SSR content exists at the browser's clamp moment) while the live jumps (1500→1851; its async SPA re-layout after the resize — the s16 family, opposite sign, the deliberate-better); (b) the panelDisplay grid-vs-block notation at the re-open tier (the clone's grid-rows animation technique vs the live's height technique — the s9/s22 records; the GEOMETRY is the contract, matched); (c) the PDF-bytes non-comparability (finding 3); (d) the hex-encoded text-ops methodology note — Chromium PDFs emit glyph runs as hex strings `<...> Tj`, so literal-string extraction reads NOTHING (the probe's first-pass textPages counts undercounted; the page COUNT from the page tree is the reliable parse); (e) the e2e-db data artifact (finding 3's dashboard lesson: probe data-dependent surfaces against the SAME db the standing battery uses). | LOW (document) | Phase 5 |

### Audit-surface note (the session-45 additions — FOUR new probe families)

- **the orientation-rotation census** (finding 1-2) — the portrait⇄landscape
  rotation matrix incl. the md crossing (700×1000 ⇄ 1000×700), the menu-state
  survival, the per-tier panel/trigger geometry, the docHeight reflow, the
  orientationchange/resize firing census, the scroll-position behavior.
- **the paginated print census** (finding 3) — `page.pdf()` per route (the
  page-count parse from the PDF page tree), the pre-scroll vs post-scroll
  reveal contract (the DOM opacity census + the embedded-content byte delta),
  the printBackground model, the per-page text-stream extraction (literal +
  hex-aware), the e2e-db data-artifact isolation via the custom.db re-probe.
- **the auth-expiry census** (finding 4) — the minted stale-iat/future-iat
  cookie tiers (the :3100 standalone's own AUTH_SECRET), the no-cookie tier,
  the mid-visit in-place swap + the soft-nav flip, the live's
  no-reload/soft-nav/reload ladder.
- **the cross-tab census** (finding 4) — the two-tab shared session, the
  remote end (the clone's API logout vs the live's token removal), the
  current-view statics, the soft-nav flip timing, the raw storage event.

### The plan-time design validation (done BEFORE this plan was finalized)

- **The fix seam is the scroll-lock effect alone** (`src/components/Navbar.tsx`
  lines 79-85): the open-state (`openFor`) is NOT touched — the menu-state
  survival across the md round trip is the probed PARITY contract (both sites
  re-open the panel at 714×405) and must be preserved; only the LOCK's
  condition changes (`open` → `open && !mq.matches`).
- **`matchMedia` is new to the codebase** (grep-verified: zero matches in
  `src/` today) — the unit source pin asserts the FIRST occurrence; the
  string `"(min-width: 768px)"` matches the panel's own `md:hidden`
  breakpoint (Tailwind v4's `md` = 768px).
- **The e2e insertion point**: the session-45 block inserts after the
  session-44 escalation block (line ~6590) and before the s33 burst spec
  (line 6687) which stays LAST (the alphabetical file order runs
  mobile-navigation.spec.ts first; the CSS-leak re-run is GET-only).
- **The rotation specs' viewport changes use `setViewportSize`** — the SAME
  mechanism the probe used (it fires the real resize + orientationchange +
  the MQ re-evaluation; the A2 probe showed the CSS re-evaluation landing).
- **The print spec runs against the e2e webServer's standalone** (:3100,
  e2e.db): the LANDING route is data-invariant (the marketing content), so
  the e2e-db artifact (finding 3) does not touch it; the dashboard print is
  NOT spec'd (the artifact makes it db-dependent — the documentation covers
  it).
- **The session-lapse specs need no token forging**: the cookie-CLEAR flavor
  (the browser-dropped-cookie tier, D2b) exercises the same observable as the
  stale-iat tier (both land on `getSession() → null` → the signed-out render;
  the s32 unit pins already freeze the iat-bound rejection itself).
- **The expected counts**: 311 → 315 unit (+4: the navbar source pins), 380
  → 386 e2e (+6: the rotation trio + the print pair + the session-lapse
  pair). Total 701.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the md-crossing scroll-lock fix (finding 1)

**RED unit** (`tests/navbar-source.test.ts` — the lifecycle-source source-sweep
precedent):

- (a) the Navbar registers a `matchMedia("(min-width: 768px)")` query in the
  scroll-lock effect (the md breakpoint the panel's own `md:hidden` uses).
- (b) the overflow assignment is CONDITIONAL on the query not matching (the
  `open && !mq.matches` shape — the lock releases at ≥md).
- (c) the query's `change` listener re-applies the lock (the crossing itself
  releases/re-applies without an `open` change).
- (d) the cleanup restores `overflow = ""` and removes the listener.

**RED e2e** (the session-45 block, part 1):

- (a) **the leak spec** — open the menu at 700×1000 → `setViewportSize`
  1000×700 → assert `document.body.style.overflow === ""` (the lock
  released) AND `window.scrollTo(0, 500)` moves the scroll (the page
  scrolls — the leak's user-facing symptom). FAILS on the baseline
  (overflow stays `"hidden"`, the scroll clamps).
- (b) **the portrait-lock GUARD** — open the menu at 375×667 → assert
  `overflow === "hidden"` (the class-G hardening intact below md). Green by
  construction (protects the fix from over-releasing).
- (c) **the state-survival spec** — from the crossed state, rotate back to
  700×1000 → the panel re-appears OPEN (aria-expanded `"true"`, the panel's
  offsetHeight 405) AND the lock re-applies (`overflow === "hidden"`). The
  state assertions are green by construction on the baseline (the probed
  parity); the lock re-application is the fix's contract.

**GREEN**: the Navbar scroll-lock effect — the `matchMedia` gate + the
`change` listener + the conditional overflow. The open-state machinery is
untouched (the parity contract).

### Phase 2 — the orientation-rotation geometry pins (finding 2)

**e2e** (green by construction — the probed parity, frozen):

- **the rotation-geometry spec** — at 375×667 open the menu (panel 389×405 @
  y=64, the standing tier) → rotate to 667×375 (panel 681×405 — the probe's
  `isMobile`-emulation geometry; the trigger 40px at x=617) → the docHeight
  reflow + the trigger/panel geometry pinned per tier. (The s43 spec pinned
  the static 667×375 tier WITHOUT mobile emulation at 667×405 — the s45 spec
  pins the ROTATION dynamics with the emulation the probe used, 681×405.)

### Phase 3 — the print-tier pins (finding 3)

**e2e** (green by construction):

- **the reveal-in-print spec** — goto `/` (signed in) → the pre-scroll DOM
  census (`[data-reveal]` elements with computed opacity 0 — the count > 0)
  → `page.pdf()` → the page count (11) → the full scroll (the reveal
  trigger) → the post census (opacity-0 count === 0) → `page.pdf()` again →
  the SAME page count (11 — the pagination is reveal-invariant) AND the byte
  size GREW (the below-fold images embedded).
- **the print-census spec** — `page.pdf()` on /Courses (4 pages) +
  /Pricing (3 pages) + /AIAssistant (2 pages): the per-route page counts
  frozen (the data-invariant routes; the dashboard is documented, not
  spec'd).

### Phase 4 — the session-lapse pins (finding 4)

**e2e** (green by construction — the clone's current contract, frozen):

- **the lapse-flip spec** — sign in → /Dashboard (h1 "Welcome back,
  sepnetflix2023") → `context.clearCookies()` (the browser-dropped-cookie
  tier) → the CURRENT view unchanged (no polling) → the soft-nav round trip
  (navbar Courses → Dashboard) → h1 "Welcome back" (the flip at the first
  server render — the clone's immediate-truth contract).
- **the cross-tab spec** — two pages in one context: tab A signs in, tab B
  verifies the shared session → tab A ends the session via
  `POST /api/auth/logout` (the API-only logout — no UI ships) → tab B's
  current view unchanged → tab B's soft-nav round trip → the signed-out
  render. (The cross-tab D2b contract.)

### Phase 5 — GUARD + docs (finding 5)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 315 unit, 386 e2e — 701 total).
- The standing parity surfaces re-verified AFTER the change (the Navbar
  effect touches every route): heights/innerText ×9 routes ×2 viewports
  byte-exact + the mobile battery re-run + the console sweep.
- Docs: AGENTS.md (gotcha 74 — the rotation tier + the leak + the matchMedia
  fix; the print tier incl. the reveal-in-print contract + the e2e-db
  artifact + the hex-ops note; the session-lapse divide; the commands-table
  counts), CLAUDE.md, README (badge 701 + the session-45 paragraph), PAD
  ([S45] row), SKILL v3.33.0, the session logs (session_99.md
  transcript-style + session_100.md final log, the house convention) + the
  worklog entry. The proof matrix (`docs/screenshots/api-session-s45.txt`):
  the rotation matrix (the leak BEFORE vs the release AFTER + the
  state-survival + the geometry table), the print census (the 9/9 page
  counts + the reveal contract + the artifact isolation), the session-lapse
  ladder (the clone's flip vs the live's stale-until-reload), the cross-tab
  matrix, the env contract + the gate summary. The screenshot matrix
  recaptured per the house convention + the NEW rotation-state captures.
  `.env`/`.env.example`: NO new knobs (the session touches no configuration).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-44 tree re-verified — 691).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the rotation tier — the LEAK found + the
   parity contracts), family B (the print census — 9/9 page counts + the
   reveal-in-print contract + the e2e-db artifact isolated), family C (the
   auth-expiry UX — the flip divide), family D (the cross-tab family — the
   soft-nav divide confirmed).
4. [ ] RED: the navbar source pins (verified failing — no matchMedia in the
   source today) + the leak e2e spec (verified failing on the baseline) +
   the pin specs (green by construction, the pin-sets precedent).
5. [ ] GREEN: the Navbar scroll-lock matchMedia gate (the only source
   change).
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run (the Navbar change touches every route).
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The fix must NOT touch the open-state machinery** — the menu-state
  survival across the md round trip is the probed PARITY contract (both
  sites re-open the panel at 714×405); only the lock's condition changes.
- **The `change` listener needs the legacy-free form** — Chromium supports
  `mq.addEventListener("change", …)` (the `addListener` legacy form is
  unnecessary); the cleanup removes it (the unmount path, the s22 listener
  discipline).
- **The leak spec's scroll assertion** must run AFTER the MQ change event
  lands (a short settle follows the `setViewportSize`; the probe used
  1200ms — the spec follows).
- **The print specs depend on the pinned Chromium** (the Playwright
  bundled browser — the page counts are engine-version-stable within the
  lockfile; a Playwright upgrade re-baselines them, like every other
  geometry pin).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments must
  not quote the forbidden literals the existing source pins match (the
  lifecycle-family event names the s44 pins sweep; the formatting-method
  names) — the pins match the source files verbatim.
- **The session-lapse specs run against the e2e webServer** (its
  AUTH_SECRET is pinned in playwright.config.ts — the specs need no secret
  knowledge; the cookie-clear flavor avoids token forging entirely).
