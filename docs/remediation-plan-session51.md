# NexusLearn Remediation Plan — Session 51

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s51-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-50 tree, commit
`9a18f9d` + the owner's session-log doc commit `ddb8dc3`): lint ✓
· typecheck ✓ · 328/328 unit ✓ · build ✓ · **406/406 e2e ✓** (the documented
split: `--grep-invert "session-(4[4-9]|50)"` 378 + `--grep
"session-(4[4-9]|50)"` 28) — **734 total**, matching the documented
session-50 end state exactly. The environment contract re-verified
(`.env` == `.env.example` byte-identical, `DATABASE_URL="file:../db/custom.db"`,
the `db/` folder at the repo root with custom.db + e2e.db). The standing
parity surfaces ALL re-verified green **after the demo-state reset** (the s50
battery demo-state rule): heights ×9 routes ×2 viewports **byte-exact 18/18**,
innerText **identical 5/5** (/, /Courses, /CourseDetail, /Dashboard, /login —
0 diffs on 214/96/789/15/9 lines), **the mobile battery fully identical —
NO Tailwind v4 bug** (trigger byte-identical: BUTTON
`md:hidden p-2 rounded-lg text-white/80` 40×40 @(319,12); panel 375×405
@(0,64); all 9 members at identical geometry), console sweep **0 errors on
both sites**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE WEBTRANSPORT / WEBCODECS CENSUS (fresh-eyes family A — the session_115 direction (a))**: the transport/codec tier is PRESENT with IDENTICAL shape on BOTH sites in the shared headless context — `WebTransport` + `WebTransportError` (both functions; `WebTransportCongestionControl` the only absent entry, on both) + the codec constructor family (`VideoEncoder` / `VideoDecoder` / `AudioEncoder` / `AudioDecoder` / `ImageDecoder` / `EncodedVideoChunk` / `EncodedAudioChunk`, all functions) — but the app surface is ZERO on BOTH sides: ZERO instrumented WebTransport constructions, ZERO codec configure/decode calls, ZERO transport/codec-labeled UI, ZERO transport/codec CSSOM rules, ZERO watched-event registrations (`qoschange`). | INFO (the zero-surface census — pin) | **PIN (unit source + e2e census)** |
| 2 | **THE COMPUTE PRESSURE / PRIORITY HINTS CENSUS (fresh-eyes family B — the session_115 direction (b)))**: `PressureObserver` + `PressureRecord` are PRESENT with identical shape on BOTH sites but ZERO instrumented constructor/observe calls and ZERO `pressurechange` registrations on either — parity-clean at the API tier. **THE ATTRIBUTE-TIER FINDING (the session's family-B discovery)**: the Priority Hints `fetchPriority` attribute tier was never censused (the s28 family pinned the IMG tier only — `loading`/`decoding`/`fetchpriority` on imgs; the s29 family counted preload links + `as=` types but not the priority attribute). Probed raw-HTML + rendered-DOM on all routes of both sites: **the clone's SSR HTML ships exactly ONE `<link rel="preload" as="script" fetchPriority="low" nonce=…>` per route** — Next 16's own bootstrap-chunk preload emission (the s29 "exactly ONE preload:script — the Next.js bootstrap chunk — first-party" family's attribute-level extension) — while **the live ships ZERO preload links on its app routes** (its head carries only icon/manifest/stylesheet/canonical; its auth routes carry 37 platform `modulepreload`s, the documented Base44 login-kit family, bundle-version-dependent). The APP-authored fetchpriority posture is ZERO on both sites (the s28 img contract, already e2e-pinned). The framework link is the documented deliberate-better SSR family (removing it would fight Next 16's runtime and regress the documented faster-FCP/LCP posture). | LOW (the documented-variance tier — containment pin + documentation) | **PIN the containment form + DOCUMENT the framework-link variance** |
| 3 | **THE VIEW TRANSITIONS / DOCUMENT PICTURE-IN-PICTURE CENSUS (fresh-eyes family C — the session_115 direction (c)) + THE AUTH-ROUTE VIEW-TRANSITION CSS TIER (the session's genuine discovery)**: the API tier is parity-clean — `document.startViewTransition` + `ViewTransition` + `window.documentPictureInPicture` (with `requestWindow`) are PRESENT with IDENTICAL shape on BOTH sites, with ZERO instrumented `startViewTransition`/`requestWindow` calls, ZERO transition/PiP-labeled UI, ZERO listeners. **THE GENUINE DISCOVERY**: the live's AUTH-route platform bundle (`static/index-DiZiYQBd.css`, 10,293 rules — the platform auth-shell sheet the s41/s47 families documented) carries **16 `::view-transition-*` rules** — the Base44 hub/product-switch navigation machinery (`html.vt-hub-enter` / `html.vt-hub-exit` / `html.vt-product-switch` class gates + the `root` / `home-sidebar` / `*` pseudo groups) — while the live's APP routes (the user's SPA sheet `assets/index-BWSk-xk1.css`, 1,022 rules) and the clone's every route ship ZERO. **ALL INERT**: the `html` element carries NO `vt-*` class on any route (probed on /login, /reset-password, / — the rules are the platform's cross-app navigation kit, never activated on this app's pages) and ZERO `@view-transition` at-rules exist anywhere on either site. The s47 auth-route platform-sheet family (the Google-Identity-Services button chrome + the auth-shell motion utilities — identified + documented, never replicated, never pinned toward): the vt tier is its third member, and like its siblings it is platform chrome, not app design. | INFO (the documented platform-chrome tier — the s47 family) | **PIN the clone's zero stance + DOCUMENT the auth-route platform vt tier** |

### Audit-surface note (the session-51 additions — THREE new probe families + one attribute-tier extension)

- **the WebTransport / WebCodecs census** (finding 1) — the API-surface
  reads (the WebTransport/WebTransportError constructors + the full codec
  constructor family), the instrumented ctor/configure/decode counters, the
  transport/codec-labeled UI sweep (parenthesized), the `qoschange` listener
  census, the transport/codec CSSOM census.
- **the Compute Pressure / Priority Hints census** (finding 2) — the
  PressureObserver/PressureRecord presence reads, the instrumented
  ctor/observe counters, the `pressurechange` listener census, **the
  fetchPriority attribute tier** (raw-HTML + rendered-DOM: the
  `[fetchpriority]` element census + the per-route head preload/link-rel
  census — the s29 preload family extended to the attribute dimension).
- **the View Transitions / Document PiP census** (finding 3) — the
  `startViewTransition` / `requestWindow` instrumented counters, the
  presence reads (`ViewTransition` + `documentPictureInPicture`), the
  transition/PiP-labeled UI sweep, the `::view-transition` /
  `picture-in-picture` CSSOM census, the `@view-transition` at-rule census,
  **the auth-route platform-sheet vt-rule attribution** (the owning-sheet
  census + the `html.vt-*` class-gate inertness proof).

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean at the app tier — NO source change
  ships this session** (the s44–s50 precedent: the pins are the
  deliverable). Every spec is green by construction against the probed
  current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census: `WebTransport`, `WebCodecs`, `VideoEncoder`, `VideoDecoder`,
  `AudioEncoder`, `AudioDecoder`, `ImageDecoder`, `PressureObserver`,
  `PressureRecord`, `computePressure`, `fetchPriority` (the React prop
  camelCase form — the CourseCard.tsx comment's bare lowercase
  `fetchpriority` mention is not the prop form and is already guarded by
  the s28 `fetchpriority=` prop-pattern test), `startViewTransition`,
  `documentPictureInPicture`, `requestWindow`, `ViewTransition`,
  `view-transition`, `vt-hub`, `vt-product` — all zero in
  src/**/*.{ts,tsx,css}).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46–s50 precedent — all three families are chrome
  surfaces; the signed-in census lives in the probe JSON + the proof
  matrix).
- **The e2e context guarantees**: WebTransport + the codec family +
  PressureObserver + PressureRecord + startViewTransition + ViewTransition
  + documentPictureInPicture are all PRESENT in the e2e Chromium (the
  presence mirror — a Playwright bump that drops one re-baselines the
  presence read, not the zero-call contract). NDEF-family absence has no
  analogue here: every s51 API is a headless-Chromium resident.
- **The framework-emission family is NOT pinned as a zero-fetchpriority
  assertion** — the clone's Next 16 runtime legitimately emits its one
  CSP-nonce'd bootstrap preload link (finding 2); pinning "zero
  fetchpriority elements" would fail on the framework's own emission and
  break on every Next bump. The durable pin is the CONTAINMENT form
  (every `[fetchpriority]` element is a `<link rel="preload" as="script">`
  into `/_next/` — any app-authored fetchpriority on an img/div/link
  breaks the containment and fails the spec) + the source zero-stance
  (the s47 containment precedent: the forced-colors rules assert
  `outline-hidden` containment, never the framework helper's exact shape).
- **The auth-route platform vt tier is documented, never replicated** —
  the s47 Google-Identity-Services precedent: the platform's 16 inert
  `::view-transition-*` rules live in the auth-shell bundle the clone does
  not ship; replicating inert platform chrome would add dead CSS for zero
  rendered parity (the rules can never match: the `vt-*` classes are never
  applied). The proof matrix carries the census + the inertness proof.
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s51 family names (transport/codec/pressure/vt API names)
  — none of the existing source pins (which sweep `src/` only) match those
  literals; the new unit source pins also sweep `src/` only, so the spec
  comments are safe. The docs may quote the `::view-transition` selector
  family freely — the `@source not` set excludes every doc surface
  (re-verified: skills, docs, tests, test-results, the five root docs,
  both SKILL files, worklog.md), and the leak spec still re-runs LAST per
  the house rule.
- **The expected counts**: 331 unit (+3: the WebTransport/WebCodecs, the
  Compute Pressure/Priority Hints, and the View Transitions/Document PiP
  zero-stance source pins in tests/platform-surface-source.test.ts) + 409
  e2e (+3: the transport/codec census single, the pressure/priority census
  single, the view-transition/PiP census single) = **740 total**.
- **The vitest + playwright config contract**: both suites already exist
  and are green (328/406 at baseline) — this session's pins ride the
  existing configs (the "add vitest and playwright by modifying the
  respective config files" instruction is satisfied by the verified-green
  configs + the session's additions through them; no config change is
  required by any finding — a config change without a driving failure
  would violate the no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 3)

**unit** (extend `tests/platform-surface-source.test.ts`, the s47–s50
pattern — one new `describe("session-51 zero-stance pins")` block, its
constants inserted before the s50 block's):

- **the WebTransport / WebCodecs zero-stance pin** — `src/` contains ZERO
  `WebTransport`, `WebCodecs`, `VideoEncoder`, `VideoDecoder`, and
  `ImageDecoder` references.
- **the Compute Pressure / Priority Hints zero-stance pin** — `src/`
  contains ZERO `PressureObserver`, `PressureRecord`, `computePressure`,
  and `fetchPriority` (the React prop camelCase form) references.
- **the View Transitions / Document Picture-in-Picture zero-stance pin** —
  `src/` contains ZERO `startViewTransition`, `documentPictureInPicture`,
  `requestWindow`, and `ViewTransition` references.

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47–s50 honest-RED
precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 3)

**e2e** (the session-51 block, inserted between the s50 NFC/SMS block and
the s33 burst spec — the position contract preserved):

- **the WebTransport / WebCodecs census spec** — the APIs are present in
  the e2e context (the presence mirror); the instrumented
  WebTransport-construction + codec-configure/decode counters stay ZERO
  across the public routes; ZERO transport/codec-labeled UI elements.
- **the Compute Pressure / Priority Hints census spec** —
  PressureObserver + PressureRecord are present in the e2e context; the
  instrumented ctor/observe counters stay ZERO across the public routes;
  ZERO pressure-labeled UI; **the fetchPriority containment** — every
  `[fetchpriority]` element on every public route is a
  `<link rel="preload" as="script">` pointing into `/_next/` (the
  framework's own bootstrap emission; any app-authored fetchpriority
  breaks the containment).
- **the View Transitions / Document PiP census spec** — the APIs are
  present in the e2e context (startViewTransition + ViewTransition +
  documentPictureInPicture); the instrumented counters stay ZERO across
  the public routes; ZERO transition/PiP-labeled UI; ZERO
  `::view-transition` / `:active-view-transition` / `picture-in-picture`
  CSSOM rules on any route (the clone's zero stance — the live's 16 inert
  auth-route platform rules are the documented platform-chrome family,
  carried in the proof matrix).

### Phase 3 — GUARD + docs + the proof matrix + screenshots

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 331 unit, 409 e2e — 740 total; the split strategy
  extends: `--grep-invert "session-(4[4-9]|5[01])"` 378 + `--grep
  "session-(4[4-9]|5[01])"` 31; the s51 block joins the s44–s50 tail that
  never touches the throttled verify route, so the s33 burst spec stays
  last).
- The standing parity surfaces re-verified (the house rule): heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery + the
  console sweep — run in the LIVE-MATCHED demo state (the s50 battery
  demo-state rule: the demo enrollments reset before the battery, the
  canonical state re-restored only for the screenshot phase).
- Docs: AGENTS.md (the commands-table counts → 331/409; gotcha 80 — the
  auth-route view-transition CSS tier + the fetchPriority framework-link
  family + the inertness methodology), CLAUDE.md (the pyramid + the e2e
  tail + the unit tail), README (badge 740 + the session-51 paragraph),
  the PAD ([S51] row), SKILL v3.39.0, the session logs (session_117.md
  transcript-style + session_118.md final log, the house convention) +
  the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s51.txt`): the per-family census table
  (API presence + call counters + UI/DOM/CSSOM sweeps), the
  fetchPriority attribute-tier census (raw-HTML vs rendered-DOM + the
  live's auth-route modulepreload family), the auth-route vt-rule
  attribution + the inertness proof, the env contract + the gate summary.
  The screenshot matrix captured per the house convention (the DEV-SERVER
  captures the owner requests every session — `next dev` on :3000 with
  custom.db + the canonical demo state re-restored AFTER the battery,
  every context carrying the session cookie). `.env` / `.env.example`: NO
  new knobs (the session touches no configuration — re-verified
  byte-identical + matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-50 tree re-verified — 734).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, byte-identical, clean — after the demo-state reset).
3. [x] Fresh-eyes probes: family A (the WebTransport/WebCodecs census — zero
   surface both sites), family B (the Compute Pressure/Priority Hints
   census — API parity-clean + the fetchPriority attribute-tier finding),
   family C (the View Transitions/Document PiP census — API parity-clean +
   the auth-route platform vt-rule discovery + the inertness proof).
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
  contracts, the s47–s50 notes' mirror image).
- **The containment pin rides the framework's emission shape** — Next 16
  currently emits exactly ONE script preload per route with
  `fetchPriority="low"`; the containment form (every `[fetchpriority]`
  element is a `/_next/` script-preload link) survives a Next bump that
  changes the count or the priority value, failing only when an
  APP-authored element carries the attribute (the drift the pin exists
  to catch).
- **The auth-route platform vt rules are INERT by class-gate** — the pin
  asserts the CLONE's zero stance, never the live's platform chrome (the
  s47 Google-Identity-Services precedent: replicating the live's inert
  platform sheet would add dead CSS with zero rendered parity).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s51 family names — none of the existing source pins
  match them (grep-verified; the existing pins sweep `src/` only).
- **The e2e split ordering constraint holds** — the s51 block joins the
  s44–s50 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
