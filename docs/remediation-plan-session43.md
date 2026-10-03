# NexusLearn Remediation Plan — Session 43

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user; the dev server on
:3000; the production standalone on :3100; the evidence scripts under
`/home/z/my-project/scripts/s43-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-42 tree, commit `5f4f1ac`
+ the owner's session_92.md doc commit `54421ed`): lint ✓ · typecheck ✓ ·
290/290 unit ✓ · build ✓ · **369/369 e2e ✓** (8.1m, zero flakes) — 659 total,
matching the documented session-42 end state exactly. The environment contract
re-verified (`DATABASE_URL="file:../db/custom.db"` in `.env`, byte-identical to
`.env.example`; `db/custom.db` + `db/e2e.db` at the repo root). The standing
parity surfaces ALL re-verified: heights ×9 routes ×2 viewports **byte-exact
18/18**, innerText identical, the **mobile battery fully identical — NO
Tailwind v4 bug** (trigger byte-identical, panel 389×405 @ y=64, 9 members at
identical geometry), console sweep **13/13 clean**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The ROOT-CRASH tier — no `global-error.tsx` (fresh-eyes family A — the session_91/92 suggested direction (a), the last unpinned framework-default crash surface)**: the clone ships `src/app/error.tsx` (the s42 page-segment boundary) but NO `global-error.tsx`. A client error in the ROOT segment escapes every error.tsx boundary and lands in **Next 16's built-in root boundary** — probed on the production standalone via a scoped prototype sabotage (`Window.prototype.addEventListener` armed to throw ONLY on `popstate` registrations — the two root-tier registrants are ScrollRestoreNormalizer's effect (the root layout's only client component) and Next's own router; the s42 methodology: a prototype method looked up at CALL time, scoped so only the target call sites throw). The default boundary renders **"This page couldn't load / Reload to try again, or go back / [Reload] [Back]"** — the same version-dependent framework chrome family the s42 pass replaced one tier down — AND it **strips the document**: the replacement `<html>` carries ONLY `id` (no `lang="en"`, no `data-scroll-behavior`), the body loses the `font-sans antialiased` classes (a crash-time a11y + design regression: screen readers lose the document language). The LIVE's equivalent tier (probed): its platform ships NO recovery UI — the armed createElement sabotage leaves its static boot shell frozen, and the same-class history-listener sabotage leaves a blank body. | **HIGH** (fix + pins) | fix below |
| 2 | **The /login zinc block's dark-scheme deactivation (fresh-eyes family B — a REAL color-tier drift found by the color-scheme media-rule census)**: the s18 zinc block in `globals.css` is wrapped in `@media (prefers-color-scheme: light)`; the LIVE's runtime zinc sheet carries NO media wrapper (census: **0** prefers-color-scheme rules on the live vs **1** on the clone — the zinc wrapper). Consequence under a `prefers-color-scheme: dark` visitor (probed on both sites): the LIVE keeps zinc (`--ring 240 10% 3.9%` → the focused Sign-in ring `rgb(9, 9, 11)`, identical to its light tier), the CLONE deactivates the block (neutral `--ring #0a0a0a` → `rgb(10, 10, 10)`) — a REAL drift in the exact 1-3 sRGB-unit family the s18 pin exists to close (the LIGHT tier matches: both `rgb(9, 9, 11)`). The s18 wrapper rationale ("dark mode was never a parity surface") is superseded by the s22 no-adaptation contract: the live adapts NOTHING under dark — including its zinc. | MEDIUM (fix + pin) | fix below |
| 3 | **The color-scheme rendering tiers (fresh-eyes family B companions — verified, unpinned)**: (a) **emulated-dark heights**: ×9 routes at 1920×1080 under `colorScheme: "dark"` — **9/9 byte-exact** live-vs-clone AND identical to the light-tier values (no dark styles exist anywhere; the s22 palette-stability pin extended to the geometry tier); (b) **forced-colors** (`forcedColors: "active"` — the Windows-High-Contrast tier, never probed by any session): the landing height UNCHANGED (7949 — the forced palette moves no layout) and every sampled surface (body/nav/h1/primary CTA) forced IDENTICALLY on both sites (the UA forced palette; neither site ships forced-colors overrides — census 0 rules); (c) **the no-declaration census**: no `<meta name="color-scheme">` on either site, no `color-scheme` property declared, no prefers-color-scheme/forced-colors/inverted/monochrome media rules on the live (the clone's 1 = finding 2's wrapper). | LOW (pin) | spec below |
| 4 | **The intermediate-viewport tiers (fresh-eyes family C — verified, unpinned)**: the standing heights battery covers exactly 1920×1080 + 375×667; every tier BETWEEN was never height-audited. Probed ×9 routes ×5 viewports (md-boundary 768×1024, iPad 834×1194, lg-boundary 1024×768, xl 1280×800, **landscape mobile 667×375**): **45/45 byte-exact** live-vs-clone (heights + innerText) — the v4 rem-based breakpoints render identically to the live's px breakpoints at every intermediate width (the s25 media-rem rule, now verified at the LAYOUT tier). The **landscape mobile menu is IDENTICAL** (trigger 40×40 @ (603,12), panel 667×405 @ y=64 — the md boundary holds below 768 on both engines; the owner-asked mobile-nav comparison on a fresh viewport tier). | LOW (pin) | spec below |
| 5 | **The long-run stability tier (fresh-eyes family D — verified, unpinned)**: 30 search-filter cycles on /Courses + 3 rounds of the 8-route navigation loop, one context per site: **ZERO node drift** (the clone 508→508 across all 30 cycles — the RevealController MutationObserver does not accumulate; the live 458→458), **deterministic nav-round counts** (clone 207/207/207, live 175/175/175), **zero console errors** on both sites. The heap readings are QUANTIZED (`performance.memory` without `--enable-precise-memory-info` — informational only: the live's SPA holds ~2.7MB more JS heap, the architecture fact). | LOW (pin) | spec below |
| 6 | **The variance/documentation family (no fix)**: (a) the live's /login platform sheets carry **2 `@media (prefers-contrast)` rules** (the Base44 login chrome — the documented platform-sheet family, like the 43 platform keyframes); the clone ships none (nothing app-visible renders differently — the app's own contrast is its design); (b) the computed-color NOTATION difference on `bg-white/95` (live `rgba(255,255,255,0.95)` vs clone `oklab(0.999994 …/0.95)` — v4's oklab color-mix notation; renders identical white-at-95%; the s25 notation family at the computed tier); (c) the live's platform edge **429'd a rapid-burst navigation pattern** (7 resource errors at ~1 page load/1.3s sustained; clean at 1.8s pacing — the platform-wall family, a probe-artifact note); (d) `performance.memory` quantization (finding 5). | LOW (document) | Phase 5 |
| 7 | **The dynamic og-image renderer — CONSIDERED AND REJECTED (the session_92 suggested direction (b))**: replacing the committed `public/og-image.png` with a runtime `opengraph-image` renderer breaks THREE pinned contracts: (a) a runtime renderer (satori/ImageResponse) CANNOT reproduce supabase's PNG encoder bytes — the s42 byte-exact asset contract (630×630, 452,632 bytes, md5-pinned, every shape's fetched asset byte-identical on both sites) would regress to "similar-looking, different bytes"; (b) Next's file-convention image AUTO-INJECTS `width`/`height`/`alt` into the head — breaking the s41 URL-only app-route og:image contract (the unpinned-dimensions strip); (c) a generated route loses the static validator tier (ETag/Last-Modified/304/206 — the s27 pins) behind per-request regeneration. The committed mirror is the STRONGER parity contract; the architectural difference (static file vs render endpoint) is invisible to every crawler (the fetched bytes are what count — the gotcha-71a lesson). | DOCUMENTED (rejected) | Phase 5 |

### Audit-surface note (the session-43 additions — FOUR new probe families)

- **the root-crash census** (finding 1) — the scoped `popstate`-registration
  sabotage (the root-tier injection point the s42 crash methodology predicted:
  the root layout's only client component + Next's router both register the
  history listener at the root), the default boundary's document-stripping
  behavior (the `html` attributes inventory), the live's frozen-shell/blank
  equivalents, and the fresh-context recovery control.
- **the color-scheme media census** (findings 2-3) — the per-feature media-rule
  census (`prefers-color-scheme`/`forced-colors`/`prefers-contrast`/
  `inverted-colors`/`monochrome` across every sheet), the color-scheme
  declaration census (meta + computed property), the emulated-dark full height
  battery, and the forced-colors computed-palette comparison.
- **the intermediate-viewport height battery** (finding 4) — ×9 routes ×5
  viewports (both md/lg boundaries EXACTLY, the iPad tier, xl, landscape
  mobile) + the landscape mobile-menu geometry.
- **the long-run stability battery** (finding 5) — 30 filter cycles + 24
  navigations per site with node-count/heap/console instrumentation.

### The plan-time design validation (done BEFORE this plan was finalized)

- **The global-error contract**: Next's `global-error.tsx` replaces the ROOT
  layout when active — it must render its own `<html>` + `<body>` (the probed
  default boundary already does exactly that, with a stripped `<html id=…>`).
  The shipped design mirrors `src/app/error.tsx` verbatim (the slate-50
  centered card, h1 500 + h2 "Something went wrong", Try again → `reset()`)
  wrapped in the root layout's exact document shape (`<html lang="en"
  data-scroll-behavior="smooth">` + `<body className="font-sans antialiased">`)
  — the crash-time a11y contract (the document language survives the crash)
  and the font/design-class contract. **Back to Home is a PLAIN `<a href="/">`**
  (NOT next/link): the crashed root may have broken router state — a full
  document load is the deterministic recovery (the s42 boundary used Link
  because it renders INSIDE the live root; the root tier has no such
  guarantee). The component registers NO history listeners and renders NO
  count formatting (the sabotage-survival guarantees, the s42 pattern).
- **The popstate sabotage is deterministic and scoped** (probed on the
  production standalone): armed via `addInitScript` pre-hydration, the throw
  lands during the hydration commit (an effect-phase error — no React-19
  render-retry for effect throws), the built-in boundary replaces the document
  within ~1s, and a fresh context renders normally (the control). Only the two
  root-tier registrants call `addEventListener("popstate")` — nothing else in
  the app registers the history event (grepped: ScrollRestoreNormalizer is the
  only app registrant; the router is the framework's).
- **The zinc unwrap is one seam**: remove the `@media (prefers-color-scheme:
  light) {` wrapper + its closing brace (globals.css lines 434/455), keep the
  `body:has(main[data-login-theme])` block byte-identical, update the block's
  comment. The s18 light-tier pins stay green by construction (the unwrapped
  block still applies under light); the affected pins are NONE (no spec
  asserts the media wrapper — the s18 e2e pins assert the computed `--ring`
  under the DEFAULT light context; the unit layer has no zinc source pin
  today — one is added). The GUARD: /Courses keeps `#0a0a0a` under every
  scheme (the body:has() scope).
- **The breakpoint-boundary pins are environment-independent**: the catalog
  grid ships `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8`
  (CourseCatalog.tsx:237) — the column-count contract at 768 (2 cols) / 1024
  (3 cols) / 375 (1 col) is font-metric-independent (asserted via the first
  row's card y-coordinates). The nav-visibility boundary (desktop row `hidden
  md:flex` vs trigger `md:hidden`) at 768/767 and the landscape panel geometry
  (667×405 @ y=64) are the same class of deterministic pins the
  mobile-navigation suite already ships. The FULL 45-height table stays in the
  proof matrix (the standing-battery precedent: the heights parity lives in
  the probe evidence, not absolute-constant e2e specs — font metrics make
  absolute page-height pins brittle across Chromium upgrades).
- **The stability pin's node-count contract is deterministic** (probed: 508
  baseline, 508 after every cycle batch — the MutationObserver re-observe is
  clean); 10 cycles keep the spec's runtime ~15s.
- **The emulateMedia color switches are mid-test capable** (Playwright 1.63:
  `colorScheme` + `forcedColors` both supported on `page.emulateMedia`) — the
  dark no-adaptation spec measures the SAME page under two schemes in one
  test (no absolute constants), and the forced-colors spec asserts the forced
  palette + unchanged geometry.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the global-error boundary (finding 1)

**Design**: `src/app/global-error.tsx` — "use client", the error.tsx design
language verbatim (light `slate-50`, centered `max-w-md`, the hairline
divider, h1 "500" + h2 "Something went wrong" + the description line), wrapped
in the root layout's exact document shape: `<html lang="en"
data-scroll-behavior="smooth">` + `<body className="font-sans antialiased">`.
Try again wired to `reset()`; Back to Home as a plain `<a href="/">`. No count
formatting, no history-listener registration, no framework copy.

**RED unit** (`tests/global-error-source.test.ts` — the error-boundary-source
pattern): the file exists; the client directive; the default export; the
`{ error, reset }` prop shape; renders its own `<html` + `<body` (the root-tier
requirement); preserves `lang="en"`; the reset wiring; the plain-anchor home
link (`href="/"` + NOT importing next/link); the "Something went wrong" heading
+ design language (`bg-slate-50`/`min-h-dvh`/`max-w-md`); NO count formatting;
NO history-listener registration; NO framework default copy.

**RED e2e** (the new session-43 block, inserted before the s33 burst spec
which stays LAST): (a) the root-crash spec — `addInitScript` the scoped
history-listener sabotage → goto `/` → the boundary renders (h1 "500" + h2
"Something went wrong" + "Try again" + "Back to Home", NOT the framework
default's copy) → `document.documentElement.lang === "en"` (the crash-time
a11y contract) → restore the prototype method → click Try again → the landing
renders (the hero h1); (b) the Back-to-Home anchor spec — under the same
sabotage, the anchor navigates (a full document load) and the landing renders.

### Phase 2 — the zinc unwrap (finding 2)

**Design**: `globals.css` — remove the `@media (prefers-color-scheme: light)`
wrapper around the `body:has(main[data-login-theme])` zinc block (the block's
contents byte-identical); the comment documents the s43 finding (the live's
runtime zinc sheet carries no media wrapper — zinc applies under every scheme;
the wrapper deactivated the block under dark-scheme visitors, drifting the
ring to neutral where the live keeps zinc).

**RED unit** (`tests/zinc-scheme-source.test.ts`): the zinc block is present
(`body:has(main[data-login-theme])` + `--ring: #09090b`); `globals.css`
carries NO `@media (prefers-color-scheme` wrapper anywhere (the census
contract: the clone ships ZERO color-scheme media rules — the live's 0
mirrored); the neutral `:root` `--ring` (`#0a0a0a`) stays (the GUARD scope).

**RED e2e**: the dark-context zinc spec — on `/login` under
`page.emulateMedia({ colorScheme: "dark" })`: the body `--ring` reads
`#09090b` (zinc — NOT the deactivated `#0a0a0a`) and the focused Sign-in
button's ring slot renders `rgb(9, 9, 11)`; the control in the same spec: the
light tier keeps zinc + `/Courses` under dark keeps the neutral `#0a0a0a` (the
body:has() scope GUARD).

### Phase 3 — the breakpoint-boundary pins (finding 4)

**e2e** (green by construction — the probed contracts): (a) at 768×1024: the
desktop nav row is visible + the mobile trigger hidden + the catalog renders 2
columns; (b) at 767×1024: the mobile trigger visible + the desktop row hidden;
(c) at 1024×768: the catalog renders 3 columns; (d) at 667×375 (landscape):
the trigger visible + the panel opens at the landscape geometry (full-width
panel at y=64, height 405).

### Phase 4 — the color-tier + stability pins (findings 3 + 5)

**e2e**: (a) the dark no-adaptation spec — on `/` and `/Courses`, measure the
document height + the body computed colors under the default scheme, then
`emulateMedia({ colorScheme: "dark" })` and re-measure: identical heights +
identical colors (no dark styles — the s22 contract at the geometry tier);
(b) the forced-colors spec — `emulateMedia({ forcedColors: "active" })` on `/`:
the landing still renders (the hero h1 visible), the body text color computes
the forced `rgb(0, 0, 0)`, and the document height is unchanged; (c) the
stability spec — 10 search cycles on /Courses: the DOM node count returns to
the baseline exactly after the cycles, zero console errors (the
MutationObserver non-accumulation contract).

### Phase 5 — GUARD + docs (findings 6-7)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 290 → ~302 unit, 369 → ~379 e2e).
- The standing parity surfaces re-verified AFTER the changes: heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery re-run +
  the console sweep (the zinc unwrap touches /login's token resolution — the
  battery re-run is the proof nothing visible moved on the default tier).
- Docs: AGENTS.md (gotcha 72 — the root-crash tier + the document-stripping
  default + the scoped history-listener sabotage; the zinc dark-scheme
  deactivation + the color-scheme census; the commands-table counts),
  CLAUDE.md (the pyramid counts + the seams), README (badge + the session-43
  paragraph), PAD ([S43] row), SKILL v3.31.0, `.env`/`.env.example` (NO new
  knobs), the session logs (session_93.md transcript + session_94.md final
  log, the house convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s43.txt`): the root-crash matrix (the clone's
  stripped default vs the shipped boundary vs the live's frozen shell), the
  color-scheme census (the zinc dark-tier values both sites + the dark heights
  9/9 + the forced-colors palette), the intermediate-viewport 45/45 table +
  the landscape menu geometry, the stability trend table, the env contract.
  The screenshot matrix recaptured per the house convention (incl. the
  global-error boundary capture + the zinc dark-tier focus-ring capture).
  Finding 7's rejection rationale recorded in the PAD [S43] row + the AGENTS
  gotcha (so the "dynamic og-image renderer" suggestion does not resurface).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-42 tree re-verified — 659).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the root-crash census — the default
   boundary's copy + document-stripping CONFIRMED, the live's frozen/blank
   equivalents, the control green), family B (the color-scheme census — the
   zinc dark-tier drift CONFIRMED with the ring values; the dark heights 9/9;
   forced-colors identical), family C (the intermediate tiers 45/45 + the
   landscape menu identical), family D (the stability trends — zero drift,
   deterministic counts, zero console errors).
4. [ ] RED: the unit batteries (the global-error source pins + the zinc
   scheme-source pins) + the e2e block → verified failing.
5. [ ] GREEN: `src/app/global-error.tsx` + the zinc unwrap in `globals.css`.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run.
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The global-error e2e's restore-then-reset path** follows the s42
  error-boundary spec's proven mechanics (the same prototype-restore +
  boundary-recovery pattern); the crash itself is effect-phase (no React-19
  render-retry — probed), and the fresh-context control proved the sabotage is
  the only cause. If `reset()` at the root tier re-registers the history
  listener BEFORE the restore lands, the spec restores FIRST (the s42 order).
- **The zinc unwrap cannot leak to other routes** (the `body:has(main[...])`
  scope — the s18 GUARD spec re-runs in the battery); the light-tier pins are
  unaffected (the unwrapped block applies under every scheme).
- **The global-error chunk does not ship on clean loads** (Next loads root
  boundaries on demand — the s42 on-demand-chunk precedent; the JS-budget
  specs re-run at GUARD as the proof).
- **The breakpoint pins assert structural geometry** (column counts, panel
  geometry, visibility) — no absolute page-height constants (the
  font-metric-brittleness rule); the 45-height table lives in the proof
  matrix.
- **The stability spec keeps its cycle count at 10** (~15s) — the 30-cycle
  trend is the probe evidence; the e2e pins the non-accumulation contract.
- **The doc-comment hazard** (the s42 lesson): the global-error source
  comments must NOT contain the literal forbidden strings the pins match
  (the formatting-method names, the framework default copy, the
  history-event registration call) — the pins match the source file verbatim.
