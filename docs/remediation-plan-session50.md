# NexusLearn Remediation Plan — Session 50

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s50-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-49 tree, commit
`7d51dbf` + the owner's session-log doc commit `c1bf88a`): lint ✓
· typecheck ✓ · 325/325 unit ✓ · build ✓ · **403/403 e2e ✓** (the documented
split: `--grep-invert "session-4[4-9]"` 378 + `--grep "session-4[4-9]"` 25
— the inverted sweep includes the mobile-nav specs) — **728 total**, matching
the documented session-49 end state exactly. The environment contract
re-verified (`.env` == `.env.example` byte-identical,
`DATABASE_URL="file:../db/custom.db"`, the `db/` folder at the repo root with
custom.db + e2e.db). The standing parity surfaces ALL re-verified green
**after the demo-state reset** (finding 5): heights ×9 routes ×2 viewports
**byte-exact 18/18**, innerText **identical 5/5** (/, /Courses, /CourseDetail,
/Dashboard, /login — 0 diffs on 214/96/789/15/9 lines), **the mobile battery
fully identical — NO Tailwind v4 bug** (trigger byte-identical: BUTTON
`md:hidden p-2 rounded-lg text-white/80` 40×40 @(319,12); panel 375×405
@(0,64); all 9 members at identical geometry), console sweep **0 errors on
both sites**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE WEBXR / IMMERSIVE-VR CENSUS (fresh-eyes family A — the session_112 direction (a))**: the last unprobed major device surface is PRESENT with IDENTICAL shape on BOTH sites in the shared headless context — `navigator.xr` with `isSessionSupported` + `requestSession` (both functions), `XRSession` + `XRSystem` constructors present, `XRDevice` absent (both sites — the legacy alias) — but the app surface is ZERO on BOTH sides: ZERO instrumented `isSessionSupported`/`requestSession` calls (overridden before load, 9 routes × both sites), ZERO vr/headset/immersive-labeled UI elements, ZERO XR-family CSSOM rules, ZERO sessionstart/sessionend registrations. Neither site ships any XR surface. | MEDIUM (pin) | Phase 1 |
| 2 | **THE FILE SYSTEM ACCESS CENSUS (fresh-eyes family B — the session_112 direction (b))**: the full picker tier is PRESENT with IDENTICAL shape on BOTH sites — `window.showOpenFilePicker` + `showSaveFilePicker` + `showDirectoryPicker` (all functions) + the `FileSystemHandle` / `FileSystemFileHandle` / `FileSystemDirectoryHandle` / `FileSystemWritableFileStream` constructors — but the app surface is ZERO on BOTH sides: ZERO instrumented picker calls, ZERO `input[type=file]` elements (the DOM census: 0/36 images' sibling control tier — 0 file inputs on every route, both sites), ZERO upload/import/export-labeled UI, ZERO picker-family CSSOM rules. | MEDIUM (pin) | Phase 1 |
| 3 | **THE WEB NFC / WEB SMS CENSUS (fresh-eyes family C — the session_112 direction (c))**: `window.NDEFReader` + `window.NDEFMessage` are ABSENT in the shared headless context on BOTH sites (the s47 `navigator.share` / s49 `navigator.bluetooth` ABSENT case's mirror — headless Chromium without the experimental flag; the spec documents the absence, never asserts presence), and the Web OTP consumption tier is ZERO on both sites' public routes (the DOM census: ZERO `autocomplete="one-time-code"` inputs on all 9 routes, both sites). The one source hit — `LoginForm.tsx:547`'s `autoComplete={i === 0 ? "one-time-code" : "off"}` — is the DOCUMENTED session-26 intentional hardening (the unhardened-reference family: the live ships bare inputs; the clone's verify-view hardening is pinned by the session-26 e2e "password-manager contract" spec at nexuslearn.spec.ts:3487 — re-verified green this session). The NFC-side zero-stance: zero NDEFReader constructions, zero scan/write calls, zero nfc-labeled UI. | MEDIUM (pin) | Phase 2 |
| 4 | **THE REACT 19.3 / NEXT 16 DRAG-DELEGATION FAMILY (the genuine fresh-eyes discovery)**: the drag-family listener census counted live 38 vs clone 56 registrations per drag event (dragenter/dragover/drop, accumulated across the 9 routes) — the target-level attribution census qualifies the delta FULLY as framework-internal surface. The SHARED tiers are IDENTICAL (body=4, span=8, other=8 per event — the platform/browser's own drag machinery). The LIVE registers `div#root=18` (2 per route — its platform React's root-container delegation tier). The CLONE registers `div#__next-route-announcer__=18` (2 per route — Next.js's a11y route announcer, the s49-discovered element) + `document=18` (2 per route — React 19.3's document-level drag registration tier). ALL HANDLERS ARE `[native code]` BOUND FUNCTIONS — exactly ONE distinct handler fingerprint per site (framework signature; app code would stringify with source text) — zero app-level drag handlers on either site (also pinned zero in src/: dragenter/dragover/onDrop/onDragOver/dataTransfer all zero). The DRAG-EVENT analogue of the s49 error-listener family. Deliberately NOT pinned as a zero-listener assertion (the framework's own registrations are legitimate; the durable contracts are the zero APP-level registrations + the src/ zero-stance). | MEDIUM (document) | Phase 1 |
| 5 | **THE BATTERY DEMO-STATE RULE (the standing-state qualification)**: the first battery run this session showed CourseDetail height DIFF (34246 vs 34290) + 778 innerText diffs + a 33-line clone Dashboard vs the 15-line live — NOT a regression: the s49 screenshot phase had LEFT the canonical demo state (3 enrollments: seed-1 + seed-3 + seed-5@1%) in `db/custom.db`, while the LIVE's demo user carries ZERO enrollments today (verified: "Welcome back, sepnetflix2023" + "0" + "No courses yet" — the live has shown the zero state since at least s48; the tracked dashboard screenshot's 3-enrollment state is the owner's historical reference the screenshot phase RECONSTRUCTS, not the live's current state). Resetting the clone's demo enrollments to the live-matched zero state re-verified the standing battery FULLY GREEN (18/18 + 5/5 byte-identical). THE RULE: the standing battery runs in the LIVE-MATCHED account state — reset the demo enrollments before the battery when the screenshot phase has restored the canonical state (the s49 capture-cookie lesson's state-level mirror). | LOW (document) | Phase 3 |

### Audit-surface note (the session-50 additions — THREE new probe families + one attribution census)

- **the WebXR census** (finding 1) — the API-surface reads (navigator.xr
  per-method typeof + the XRSession/XRSystem/XRDevice constructor tier), the
  instrumented isSessionSupported/requestSession counters, the
  vr/immersive/headset-labeled UI sweep (parenthesized), the
  sessionstart/sessionend listener census.
- **the File System Access census** (finding 2) — the API-surface reads (the
  three picker functions + the four FileSystem constructors), the
  instrumented picker counters, the file-input DOM census, the
  upload/import/export-labeled UI sweep, the dragenter/dragover/drop
  listener census (which surfaced finding 4).
- **the Web NFC / Web SMS census** (finding 3) — the NDEFReader/NDEFMessage
  presence reads, the instrumented ctor/scan/write counters, the
  one-time-code autocomplete input DOM census, the nfc-labeled UI sweep.
- **the drag-listener attribution census** (finding 4) — the target-level
  breakdown (div#root / document / route-announcer / body / span / other),
  the handler-fingerprint proof (all `[native code]`, one distinct
  fingerprint per site), the framework attribution.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean — NO source change ships this
  session** (the s44–s49 precedent: the pins are the deliverable).
  Every spec is green by construction against the probed current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census: `navigator.xr`, `isSessionSupported`, `requestSession`,
  `XRSession`, `XRWebGLLayer`, `showOpenFilePicker`, `showSaveFilePicker`,
  `showDirectoryPicker`, `FileSystemHandle`,
  `FileSystemWritableFileStream`, `getDirectoryHandle`, `queryPermission`,
  `requestPermission`, `NDEFReader`, `NDEFMessage`, `dragenter`,
  `dragover`, `onDrop`, `onDragOver`, `dataTransfer` — all zero in
  src/**/*.{ts,tsx,css}; the `one-time-code` hit is the s26-pinned
  hardening, deliberately NOT a family-C pin string).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46–s49 precedent — all three families are
  chrome surfaces; the signed-in census lives in the probe JSON + the
  proof matrix).
- **The e2e context guarantees**: `navigator.xr` + XRSession + XRSystem are
  PRESENT in the e2e Chromium (the presence mirror — a Playwright bump that
  drops them re-baselines the presence read, not the zero-call contract);
  the three pickers + the FileSystem constructors are present; NDEFReader
  + NDEFMessage are ABSENT (the headless flag — the durable pin for family
  C is the zero-CALL/ctor counters + the source zero-stance, with the
  NDEF presence documented as context-bound, the s47/s49 note's mirror).
- **The framework-listener family is NOT pinned as a zero-listener
  assertion** — the clone's Next/React runtime legitimately registers its
  drag-delegation set (finding 4); the durable pin is the ZERO APP-CALL
  contract + the source zero-stance (dragenter/dragover/onDrop/onDragOver/
  dataTransfer all zero in src/).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments quote
  only the s50 family names (xr/picker/NDEF API names) — none of the
  existing source pins (which sweep `src/` only) match those literals; the
  new unit source pins also sweep `src/` only, so the spec comments are
  safe.
- **The docs may quote the family names freely** — no Tailwind utility
  classes are quoted by this session's docs (the families are JS APIs), so
  the gotcha-41 CSS-leak risk is minimal; the leak spec still re-runs LAST
  per the house rule.
- **The expected counts**: 328 unit (+3: the WebXR, the File System Access,
  and the Web NFC/SMS zero-stance source pins in
  tests/platform-surface-source.test.ts) + 406 e2e (+3: the WebXR census
  single, the picker census single, the NFC/SMS census single) = **734
  total**.
- **The vitest + playwright config contract**: both suites already exist
  and are green (325/403 at baseline) — this session's pins ride the
  existing configs (the "add vitest and playwright by modifying the
  respective config files" instruction is satisfied by the verified-green
  configs + the session's additions through them; no config change is
  required by any finding — a config change without a driving failure
  would violate the no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 3)

**unit** (extend `tests/platform-surface-source.test.ts`, the s47–s49
pattern — one new `describe("session-50 zero-stance pins")` block, its
constants inserted before the s49 block's):

- **the WebXR zero-stance pin** — `src/` contains ZERO `navigator.xr`,
  `isSessionSupported`, `requestSession`, and `XRSession` references.
- **the File System Access zero-stance pin** — `src/` contains ZERO
  `showOpenFilePicker`, `showSaveFilePicker`, `showDirectoryPicker`, and
  `FileSystemHandle` references.
- **the Web NFC / Web SMS zero-stance pin** — `src/` contains ZERO
  `NDEFReader`, `NDEFMessage`, and `dataTransfer` references (the drag
  consumption seam; the `one-time-code` autocomplete hardening is the
  s26-pinned intentional divergence, not a family-C API reference).

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47–s49 honest-RED
precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 3)

**e2e** (the session-50 block, inserted between the s49 connectivity block
and the s33 burst spec — the position contract preserved):

- **the WebXR census spec** — `navigator.xr` + XRSession + XRSystem are
  present in the e2e context (the presence mirror); the instrumented
  `isSessionSupported`/`requestSession` counters stay ZERO across the
  public routes; ZERO vr/immersive/headset-labeled UI elements.
- **the File System Access census spec** — the three pickers are present
  in the e2e context; the instrumented picker counters stay ZERO across
  the public routes; ZERO `input[type=file]` elements; ZERO
  upload/import/export-labeled UI elements.
- **the Web NFC / Web SMS census spec** — NDEFReader documented ABSENT
  (the headless flag, like s49's bluetooth); the NDEF ctor/scan counters
  stay ZERO; ZERO `autocomplete="one-time-code"` inputs on the public
  routes (the Web OTP consumption tier); ZERO nfc-labeled UI elements.

### Phase 3 — GUARD + docs + the proof matrix + screenshots

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 328 unit, 406 e2e — 734 total; the split strategy
  holds: the s50 block joins the s44–s49 tail that never touches the
  throttled verify route).
- The standing parity surfaces re-verified (the house rule): heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery + the
  console sweep — run in the LIVE-MATCHED demo state (finding 5's rule:
  the demo enrollments reset before the battery).
- Docs: AGENTS.md (the commands-table counts → 328/406; gotcha 79 — the
  React 19.3 drag-delegation family + the battery demo-state rule),
  CLAUDE.md (the pyramid + the e2e tail + the unit tail), README (badge
  734 + the session-50 paragraph), the PAD ([S50] row), SKILL v3.38.0,
  the session logs (session_114.md transcript-style + session_115.md
  final log, the house convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s50.txt`): the per-family census table
  (API presence + call counters + UI/DOM sweep), the drag-listener
  attribution census, the env contract + the gate summary. The screenshot
  matrix captured per the house convention (the DEV-SERVER captures the
  owner requests every session — `next dev` on :3000 with custom.db + the
  canonical demo state re-restored AFTER the battery). `.env` /
  `.env.example`: NO new knobs (the session touches no configuration —
  re-verified byte-identical + matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-49 tree re-verified — 728).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, byte-identical, clean — after the demo-state reset).
3. [x] Fresh-eyes probes: family A (the WebXR census — zero surface both
   sites), family B (the File System Access census — zero surface both
   sites), family C (the Web NFC/SMS census — zero surface both sites) +
   the drag-listener attribution census (finding 4).
4. [ ] The pin specs authored (green by construction — the probed parity,
   frozen) + the RED-verification pass (each new spec runs against the
   current tree before the GUARD).
5. [ ] GUARD: the full gate re-run + the standing parity surfaces.
6. [ ] The proof matrix + screenshots (the dev-server captures) + docs +
   commit + push (the SSH wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The API-presence assertions are CONTEXT-bound** (the e2e Chromium —
  verified this session; a future Playwright bump that changes the
  headless surface re-baselines the presence reads — the instrumented
  zero-CALL counters + the source zero-stance pins are the durable
  contracts, the s47–s49 notes' mirror image).
- **NDEFReader + NDEFMessage are ABSENT in the headless context** — the
  family C e2e spec documents the absence (the s49 bluetooth mirror) and
  does NOT assert presence.
- **The framework-listener family is deliberately NOT a zero-assertion** —
  Next/React's own document-tier + route-announcer drag registrations are
  legitimate framework surface (finding 4); pinning "zero drag listeners"
  would fail on the framework's own listeners and break on every Next
  bump. The durable contract: the zero APP-level registrations + the
  src/ zero-stance (the drag-string sweep rides family C's pin).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s50 family names — none of the existing source pins
  match them (grep-verified; the existing pins sweep `src/` only).
- **The e2e split ordering constraint holds** — the s50 block joins the
  s44–s49 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
