# NexusLearn Remediation Plan — Session 46

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s46-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-45 tree, commit
`f796e29` + the owner's session_101.md doc commit `f9ee04c`): lint ✓ ·
typecheck ✓ · 315/315 unit ✓ · build ✓ · **388/388 e2e ✓** (9.9m, zero
flakes) — **703 total**, matching the documented session-45 end state
exactly. The environment contract re-verified (`.env` == `.env.example`
byte-identical, `DATABASE_URL="file:../db/custom.db"`, `db/custom.db` +
`db/e2e.db` at the repo root). The standing parity surfaces ALL re-verified:
heights ×9 routes ×2 viewports **byte-exact 18/18**, innerText identical, the
**mobile battery fully identical — NO Tailwind v4 bug** (trigger
byte-identical, panel 389×405 @ y=64, 9 members at identical geometry),
console sweep **13/13 clean**.

**Boot-convention note (re-learned this session)**: the standing-battery
standalone on :3000 must boot with an explicit `AUTH_SECRET` — the traced
`.env` ships `AUTH_SECRET=""` and the session-33 enforcement correctly refuses
to sign tokens in production (the login API 500s with `SessionSecretError`).
The e2e webServer already passes its own secret (pinned in
`playwright.config.ts`); the battery boot needs the same explicit value. The
codebase behavior is CORRECT (the enforcement working as designed) — the fix
is the boot command, not the code.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE PRINT-DIALOG HEADER/FOOTER + MARGIN TIER (fresh-eyes family A — the session_100 suggested direction (a), the print tier's second page)**: the s45 census pinned the BARE `page.pdf()` model (`displayHeaderFooter: false`, zero margins). The Chrome print dialog's DEFAULT model — headers/footers ON (date + title + URL + page numbers) + the default margins — was never probed. PROBED both models: the **margin tier re-fragments every route IDENTICALLY on both sites** (landing 11→17 pages, courses 4→10, pricing 3→5, contact 2→3, aiassistant 2→3 at 0.6in top/bottom + 0.4in sides), and the **header/footer stamps ride INSIDE the margin box** — `hfPages == marginPages` on every route with BOTH custom templates (the pageNumber/totalPages footer) AND the Chrome-default templates (date/title/url stamps, no templates passed): `displayHeaderFooter` NEVER changes pagination; only the MARGINS do. The bare model re-verified = the s45 census exactly (11/4/3/2/2). The PDF bytes remain asset-variance (the s45 note — the page COUNT is the comparable). | MEDIUM (pin) | Phase 1 |
| 2 | **THE FILE-DOWNLOAD / CONTENT-DISPOSITION CENSUS (fresh-eyes family B — the session_100 direction (b))**: `Content-Disposition: (none)` on EVERY asset class on BOTH sites — nothing is downloadable anywhere. ZERO `[download]` attributes across all routes on both sites (the anchor-download tier). NO download events fire on asset navigation (Playwright `download` listener) — everything renders INLINE. The clone's raw-path contract: `/logo.png` + `/og-image.png` serve REAL PNGs same-origin (200 `image/png`), `/manifest.json` (200 `application/json; charset=UTF-8`), `/sitemap.xml` (200 `application/xml`), `/robots.txt` (200 `text/plain`), all `Cache-Control: public, max-age=0` (+ `must-revalidate` on the metadata files). The LIVE's raw-path binary posture: `/logo.png` + `/og-image.png` return its **SPA shell (text/html)** — its binary assets are CDN-hosted (the s24 200-for-everything family); its `/favicon.ico` **302-redirects to its supabase logo** (200 `image/png`, the chain now proven hop-by-hop) while the clone 404s — the documented s41 platform-chrome variance (no favicon.ico file ships — the deliberate family), now chain-proven at the redirect level. The text-asset header deltas (charset presence, no cache-control on the live) are the s25 serialization/platform families. | MEDIUM (pin + document) | Phase 2 |
| 3 | **THE MULTI-WINDOW / OPENER CENSUS (fresh-eyes family C — the session_100 direction (c), the last unprobed browser surface)**: the **zero-multi-window surface holds on BOTH sites** — ZERO `target` attributes on every `<a>`/`<area>`/`<form>`/`<button>` across all 9 routes, ZERO `window.open` calls (instrumented override before every load), ZERO `postMessage` usage, ZERO `rel="noopener"/"noreferrer"` attributes, `window.opener` null on both. Neither site ships ANY popup, named-window, or cross-frame messaging surface. The ONE divide: the live registers exactly **1 `message` event listener per route** (the Base44 platform's own listener — its iframe/auth-relay chrome) while the clone registers 0 — the s44 lifecycle census EXTENDED (the platform family); the clone's zero-listener stance is already guarded by the s44 exact-set source pin (adding a `message` listener to src/ fails `tests/lifecycle-source.test.ts`). | LOW (pin + document) | Phase 3 |
| 4 | **The variance/documentation families**: (a) the live's raw-path binary SPA-fallback (finding 2 — its `/logo.png` path serves HTML, not the asset; the head-referenced CDN URL serves the real PNG — the s41/s42 head-asset families); (b) the live's `/favicon.ico` 302→supabase chain (finding 2 — platform chrome, documented variance); (c) the boot-convention note (the AUTH_SECRET battery-boot requirement — this session's operational lesson); (d) the `networkidle` unreliability on the live's tracker-laden routes (the /BecomeInstructor probe stall — use `load` + settle in live-side probes). | LOW (document) | Phase 4 |

### Audit-surface note (the session-46 additions — THREE new probe families)

- **the print-dialog census** (finding 1) — `page.pdf()` at the Chrome-default
  margin tier (with and without `displayHeaderFooter`, custom and default
  templates) across the data-invariant routes; the page-count parse from the
  PDF page tree (the s45 method); the hf==margin equality discovery.
- **the download census** (finding 2) — the response-header contract
  (Content-Type / Content-Disposition / Cache-Control) on the six asset
  classes, the Playwright download-event listener on asset navigation, the
  `[download]` attribute sweep across routes, the /favicon.ico redirect-chain
  map (no redirect following).
- **the multi-window census** (finding 3) — the target-attribute sweep on
  every actionable element, the instrumented `window.open`/`postMessage`
  overrides via `addInitScript`, the `message`-listener registration count,
  the `rel` sweep, the `window.opener` read.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean — NO source change ships this
  session** (the s44 precedent: the pins are the deliverable). Every spec is
  green by construction against the probed current behavior.
- **The print specs extend the s45 print block's pattern** (the `countPdfPages`
  helper is local to that describe block; the s46 block redefines its own —
  same regex, the s45 method) and run headless `page.pdf()` on the
  data-invariant routes only (landing/courses/pricing — no dashboard, the
  s45 e2e-db artifact lesson).
- **The margin-tier page counts are engine-stable within the Playwright
  lockfile** (the s45 risk note: a Playwright upgrade re-baselines them, like
  every geometry pin).
- **The asset-header spec** uses `page.request.get` against the e2e webServer
  (:3100) — the static files serve identically there (the standalone traces
  `public/`); the inline-render assertion navigates and checks the document
  renders (no download event).
- **The zero-target spec** runs the route sweep signed-out on the public
  routes (the chrome is auth-invariant — the navbar/footer link sets are
  identical; the Family C probe verified the signed-in census, the spec
  freezes the public-route contract which shares the same chrome).
- **The expected counts**: 315 unit (unchanged — no source change) + 393 e2e
  (+5: the print-dialog pair + the download pair + the multi-window single).
  Total 708.

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the print-dialog tier pins (finding 1)

**e2e** (the session-46 block, part 1):

- **the margin-tier census spec** — post-scroll (the full-ink model)
  `page.pdf({ format: "A4", margin: { top: "0.6in", bottom: "0.6in", left:
  "0.4in", right: "0.4in" } })` on `/` (17 pages), `/Courses` (10), `/Pricing`
  (5): the Chrome-default-margin pagination frozen (the probed parity).
- **the header/footer-equality spec** — on `/Courses`: the margins-only PDF
  and the `displayHeaderFooter: true` PDF (custom footer template) carry the
  SAME page count (10 = 10 — the stamps ride inside the margin box; only
  margins change pagination).

### Phase 2 — the download-tier pins (finding 2)

**e2e**:

- **the public-asset header contract spec** — `page.request.get` on
  `/logo.png` (200, `image/png`, no Content-Disposition),
  `/manifest.json` (200, `application/json`), `/og-image.png` (200,
  `image/png`), `/sitemap.xml` (200, `application/xml`), `/robots.txt` (200,
  `text/plain`) — every one WITHOUT `content-disposition` (nothing
  downloadable; the inline contract).
- **the no-download + favicon spec** — zero `[download]` attributes on the
  public routes + `/favicon.ico` → 404 (the documented platform-chrome
  variance — no favicon.ico ships; the live 302s to its CDN logo, its
  platform family).

### Phase 3 — the multi-window pins (finding 3)

**e2e**:

- **the zero-target census spec** — across the public routes (`/`, `/Courses`,
  `/Pricing`, `/About`, `/Contact`, `/BecomeInstructor`, `/AIAssistant`,
  `/login`): no `<a>`, `<area>`, `<form>`, or `<button>` carries a `target`
  attribute; no `[rel~="noopener"]`; `window.opener` is null. (The
  source-side zero-listener stance is already pinned by the s44 exact-set.)

### Phase 4 — GUARD + docs (finding 4)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 315 unit, 393 e2e — 708 total).
- The standing parity surfaces re-verified (no source change ships, but the
  gate re-runs per the house rule): heights/innerText ×9 routes ×2 viewports
  byte-exact + the mobile battery + the console sweep.
- Docs: AGENTS.md (gotcha 75 — the print-dialog margin tier + the
  hf-in-margin-box engine note; the download census + the raw-path posture +
  the favicon chain; the multi-window zero census + the message-listener
  platform family; the commands-table counts), CLAUDE.md, README (badge 708 +
  the session-46 paragraph), PAD ([S46] row), SKILL v3.34.0, the session logs
  (session_102.md transcript-style + session_103.md final log, the house
  convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s46.txt`): the print-dialog table (the
  margin/hf/bare models × routes), the download census (the header contract +
  the favicon chain), the multi-window census, the env contract + the gate
  summary. The screenshot matrix re-captured per the house convention.
  `.env`/`.env.example`: NO new knobs (the session touches no configuration).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-45 tree re-verified — 703).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the print-dialog tier — margins
   re-fragment identically; the hf==margin equality), family B (the download
   census — nothing downloadable anywhere; the favicon chain proven), family C
   (the multi-window census — the zero surface on both sites + the live's
   platform message listener).
4. [ ] The pin specs authored (green by construction — the probed parity,
   frozen) + the RED-verification pass (each new spec runs against the
   current tree before the GUARD).
5. [ ] GUARD: the full gate re-run + the standing parity surfaces.
6. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The print page counts are engine-version-stable within the lockfile** (a
  Playwright upgrade re-baselines them — the s45 risk note applies to the
  margin tier too).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments must
  not quote the forbidden literals the existing source pins match (the
  lifecycle-family event names the s44 pins sweep; the formatting-method
  names) — the pins match the source files verbatim.
- **The download spec must not assert the live's header shapes** (the specs
  run against the e2e webServer — the CLONE's contract only; the live's
  shapes live in the proof matrix + the docs).
- **The zero-target spec runs signed-out** (the public routes render the full
  chrome; the signed-in census lives in the probe JSON + the docs — the
  Dashboard's auth-dependent interior is not a target-attribute surface, the
  probe verified).
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
