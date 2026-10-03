# NexusLearn Remediation Plan — Session 47

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s47-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-46 tree, commit
`cd3ddcf` + the owner's session_104.md doc commit `f338561`): lint ✓ ·
typecheck ✓ · 315/315 unit ✓ · build ✓ · **393/393 e2e ✓** (10.6m, zero
flakes) — **708 total**, matching the documented session-46 end state
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
| 1 | **THE NEW CSS MEDIA TIERS — prefers-contrast + prefers-reduced-transparency (fresh-eyes family A — the session_104 suggested direction (a))**: the s43 census covered prefers-color-scheme + forced-colors; the two NEWER media features were never probed. **PARITY-CLEAN at every tier**: (a) the CSSOM census — ZERO rules of either family on BOTH sites' app routes (9 routes × both sites, layer-aware walk); (b) the RENDER tier — emulating `prefers-contrast: more`, then `prefers-reduced-transparency: reduce`, then BOTH, changes NOTHING on either site (heights + sampled computed styles byte-identical at every tier on /, /Courses, /Pricing, /login; the matchMedia reads flip — the emulation proof); (c) the auth routes — the live's platform sheets carry **2 `@media (prefers-contrast: more)` rules that are the GOOGLE IDENTITY SERVICES button chrome** (the injected `googleidentityservice_button_styles` sheet — s43 documented their count; this session identified their OWNER) + **8 prefers-reduced-motion rules** (the auth-shell bundle's motion-safe/motion-reduce view-transition/toast utilities — never counted before), ALL INERT (the render tier is byte-identical under contrast:more AND reduced-motion:reduce — the platform-chrome documentation family, like the s43 43-keyframes + the s46 message listener). The clone ships none of these (no GIS chrome — its Google button is the reference markup's own; no motion-conditional utilities). | MEDIUM (pin) | Phase 1 |
| 2 | **THE CENSUS-METHODOLOGY DISCOVERY — the s43 media-census walker never recursed into `@layer` blocks (an under-count at the RULE tier)**: the s43 probe skipped every non-media rule WITHOUT walking its children, so it only saw UNLAYERED rules — and Tailwind v4 emits ALL utilities inside `@layer` (the s43-visible zinc wrapper was unlayered, which is why it alone showed up). The layer-aware walk (this session) finds the clone ships **1 `@media (forced-colors: active)` rule per route — Tailwind v4's own `.outline-hidden` accessibility helper** (`outline: rgba(0,0,0,0) solid 2px` — a transparent outline), present since commit 1 (`src/components/ui/select.tsx`'s shadcn class carries `outline-hidden`; Tailwind v3 has no such utility, so the live ships 0). It renders NOTHING and changes no geometry — the s43 RENDER conclusion (forced-colors = the UA forced palette, unchanged layout) re-verified CORRECT this session (landing height 7683 unchanged under forced-colors, body forced to black-on-white). The s43 census NUMBERS were the under-count; the s43 contract was right. | MEDIUM (pin + document) | Phase 1 |
| 3 | **THE WEB-SHARE CENSUS (fresh-eyes family B — the session_104 direction (b))**: the ZERO-share surface holds on BOTH sites — `navigator.share` + `navigator.canShare` are ABSENT in the shared probe context (typeof undefined on both — desktop headless Chromium), ZERO instrumented calls (share/canShare overridden before load, 9 routes × both sites), ZERO share-labeled UI elements (button/a/[role=button]/[aria-label] text + class sweep), NO `share_target` in either manifest (the clone 200 / the live 302 — the documented s24 platform-redirect family), no `onshare` handler on window or navigator. Neither site ships ANY Web-Share surface. | MEDIUM (pin) | Phase 2 |
| 4 | **THE IDLE-TIER CENSUS (fresh-eyes family C — the session_104 direction (c))**: the ZERO-idle surface holds on BOTH sites — the APIs EXIST in the shared context (`requestIdleCallback`/`cancelIdleCallback` functions, `IdleDetector` present with start/requestPermission, `navigator.scheduling` object — identical on both) but ZERO registrations fire anywhere: instrumented `requestIdleCallback` override + a 3s settle window, 9 routes × both sites, rIC=0 cIC=0 everywhere. Neither site schedules idle work. | MEDIUM (pin) | Phase 2 |

### Audit-surface note (the session-47 additions — THREE new probe families)

- **the new media-tier census** (finding 1) — the CSSOM prefers-* census with
  a LAYER-AWARE walker (recursing into @layer/@media/@supports — the s43
  correction), the CDP `Emulation.setEmulatedMedia` features render-tier
  diff (contrast:more / reduced-transparency:reduce / both), and the
  auth-route platform-sheet rule extraction (the GIS + motion-safe
  identification).
- **the web-share census** (finding 3) — the API-surface reads
  (typeof/canShare probes), the instrumented call counters, the share-UI
  element sweep, the manifest share_target tier.
- **the idle census** (finding 4) — the instrumented rIC/cIC registration
  counters (init-script override), the IdleDetector shape probe (NO
  permission request — never prompt), the 3s settle window.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean — NO source change ships this
  session** (the s44/s46 precedent: the pins are the deliverable). Every
  spec is green by construction against the probed current behavior.
- **Playwright 1.63 supports both new tiers natively** —
  `page.emulateMedia({ contrast: "more" })` and
  `page.emulateMedia({ reducedTransparency: "reduce" })` verified working in
  the e2e Chromium (verified this session; the matchMedia reads flip) — no
  CDP session needed in the specs.
- **The e2e specs run signed-out on the public routes** (the s46 precedent —
  the probed surfaces are auth-invariant chrome; the signed-in census lives
  in the probe JSON + the proof matrix).
- **The CSSOM census spec asserts the no-app-adaptation contract, not the
  framework's internals**: zero prefers-contrast/reduced-transparency/
  reduced-motion/color-scheme rules + every forced-colors rule targets
  `.outline-hidden` (the framework helper — asserting it stays
  framework-only, so a future app-level forced-colors adaptation fails the
  pin while a Tailwind bump that changes the helper's shape only re-baselines
  the outline-hidden containment).
- **The source pins sweep `src/` only** (the s44 lifecycle pattern) — the
  spec/test comments are safe (no other pin sweeps tests/); the new unit
  file's literals (`navigator.share`, `requestIdleCallback`, the
  `prefers-*` spellings) do not appear in src/ (grep-verified this session).
- **The docs may quote the live's utility classes** (`motion-safe:animate-pulse`
  etc.) — SAFE: `globals.css` carries `@source not "../../docs"` + every
  root markdown file (the s15 leak fix; re-verified this session).
- **The expected counts**: 319 unit (+4: the platform-surface source pins)
  + 397 e2e (+4: the media-tier render pair, the CSSOM census, the
  web-share single, the idle single). Total 716.

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the media-tier pins (findings 1 + 2)

**unit** (the new `tests/platform-surface-source.test.ts`, the s44
lifecycle pattern):

- **the no-adaptation source pin** — `src/` contains ZERO
  `prefers-contrast`, `prefers-reduced-transparency`,
  `prefers-reduced-motion`, and `prefers-color-scheme` strings (the four
  media families; the first two are this session's, the last two extend the
  s41/s43 no-adaptation contracts from globals.css-only to the whole source
  tree).

**e2e** (the session-47 block, part 1):

- **the render-tier spec** — on `/` and `/login`: baseline capture →
  `emulateMedia({ contrast: "more" })` → `emulateMedia({
  reducedTransparency: "reduce" })` → both — the document height + the
  sampled computed styles (navbar/h1/card/body) identical at every tier,
  and the matchMedia reads flip under each emulation (the emulation proof).
- **the CSSOM census spec** — on `/` and `/login` (the layer-aware walk):
  ZERO prefers-contrast / prefers-reduced-transparency /
  prefers-reduced-motion / prefers-color-scheme rules; EVERY forced-colors
  rule's text targets `outline-hidden` (the framework helper — the
  containment contract).

### Phase 2 — the web-share + idle pins (findings 3 + 4)

**unit** (the same source-pin file):

- **the web-share zero-stance pin** — `src/` contains ZERO `navigator.share`,
  `navigator.canShare`, and `share_target` references.
- **the idle zero-stance pin** — `src/` contains ZERO `requestIdleCallback`,
  `cancelIdleCallback`, and `IdleDetector` references.

**e2e** (the session-47 block, part 2):

- **the web-share census spec** — `typeof navigator.share` and
  `typeof navigator.canShare` are `"undefined"` in the e2e context; ZERO
  share-labeled UI elements across the public routes; `/manifest.json`
  carries no `share_target`.
- **the idle census spec** — the instrumented `requestIdleCallback` override
  (addInitScript) counts ZERO registrations across the public routes.

### Phase 3 — GUARD + docs

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 319 unit, 397 e2e — 716 total).
- The standing parity surfaces re-verified (no source change ships, but the
  gate re-runs per the house rule): heights/innerText ×9 routes ×2 viewports
  byte-exact + the mobile battery + the console sweep.
- Docs: AGENTS.md (gotcha 76 — the layer-aware census methodology + the
  outline-hidden framework rule + the new media tiers' no-adaptation
  contract + the GIS/motion-safe platform-sheet identification; the
  commands-table counts), CLAUDE.md, README (badge 716 + the session-47
  paragraph), PAD ([S47] row), SKILL v3.35.0, the session logs
  (session_105.md transcript-style + session_106.md final log, the house
  convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s47.txt`): the media-tier table (the
  CSSOM census + the render diff), the web-share census, the idle census,
  the env contract + the gate summary. The screenshot matrix re-captured
  per the house convention. `.env`/`.env.example`: NO new knobs (the
  session touches no configuration).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-46 tree re-verified — 708).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the new media tiers — parity-clean + the
   census-methodology discovery + the GIS/motion-safe identification),
   family B (the web-share census — zero surface both sites), family C (the
   idle census — zero surface both sites).
4. [ ] The pin specs authored (green by construction — the probed parity,
   frozen) + the RED-verification pass (each new spec runs against the
   current tree before the GUARD).
5. [ ] GUARD: the full gate re-run + the standing parity surfaces.
6. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The `.outline-hidden` containment assertion is framework-internal** — a
  Tailwind bump could change the helper's shape; the pin asserts every
  forced-colors rule targets outline-hidden (containment), NOT its exact
  cssText (no brittleness beyond a Tailwind re-baseline, like every
  geometry pin).
- **The `navigator.share` undefined assertion is CONTEXT-bound** (the e2e
  headless Chromium — verified this session); a future Playwright bump that
  exposes the API in headless would re-baseline the spec (the API-USE
  census — the instrumented counters + the source pin — is the durable
  contract).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments must
  not quote literals the existing source pins match (the
  lifecycle-family event names, the formatting-method names) — the pins
  match the source files verbatim, and the spec comments quote only the
  s47 families (safe).
- **The docs quoting the live's utility classes is safe** (the `@source not`
    directives — verified above).
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
