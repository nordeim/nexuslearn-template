# NexusLearn Remediation Plan — Session 52

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s52-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-51 tree, commit
`2e44e55` + the owner's session-log doc commit `92c0358`): lint ✓
· typecheck ✓ · 331/331 unit ✓ · build ✓ · **409/409 e2e ✓** (the documented
split: `--grep-invert "session-(4[4-9]|5[01])"` 378 + `--grep
"session-(4[4-9]|5[01])"` 31) — **740 total**, matching the documented
session-51 end state exactly. The environment contract re-verified
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
| 1 | **THE SPECULATION RULES / PRERENDER CENSUS (fresh-eyes family A — the session_118 direction (b))**: the FULL declarative prerender tier is a ZERO surface on BOTH sites — ZERO `script[type="speculationrules"]` elements on every probed route (app + auth, both sites), ZERO `rel="expect"` links, ZERO prefetch links beyond the framework's documented preload family, ZERO `Speculation-Rules` / `Supports-Loading-Mode` response headers on any document or subresource (the response-listener sweep across all 9 routes × both sites), ZERO `prerenderingchange` listener registrations, and the runtime evidence tier identical: `document.prerendering` is boolean-present + `false` and `PerformanceNavigationTiming.activationStart` = 0 on every route on both sites (no prerendering ever activated). The API-presence tier is the document boolean itself (context-bound like every presence mirror). | INFO (the zero-surface census — pin) | **PIN (unit source + e2e census)** |
| 2 | **THE CONTAINER QUERIES / SCROLL-DRIVEN ANIMATIONS CSS ENGINE CENSUS (fresh-eyes family B — the session_118 direction (c)) + THE ANIMATION-TIMELINE SHORTHAND-SERIALIZATION DISCOVERY (the session's genuine finding)**: the ENGINE tier is parity-clean — all four `CSS.supports` probes IDENTICAL on both sites (container-type: inline-size TRUE; animation-timeline: scroll() TRUE; animation-timeline: view() TRUE; timeline-scope: --t TRUE — both Chromiums support CQ + SDA) while the USAGE tier is ZERO on BOTH: zero `@container` at-rules, zero `container-type`/`container-name`/`container` shorthand declarations, zero `animation-timeline`/`timeline-scope`/`view-timeline`/`scroll-timeline` declarations, zero `scroll-snap-align`/`scroll-snap-type` (the layer-aware walk over every sheet incl. `@layer` nesting — the s47 correction). **THE GENUINE DISCOVERY — the animation-timeline shorthand-serialization tier**: the LIVE's user SPA sheet (`assets/index-BWSk-xk1.css`, 1,022 rules) exposes **4 `animation-timeline: auto` specified-value longhand reads per route (36 across 9 app routes)** — on `.animate-pulse`, `.animate-spin`, `.data-[state=closed]:animate-accordion-up`, `.data-[state=open]:animate-accordion-down` — because the platform compiler emits the LITERAL 8-component `animation` shorthand (`animation: 2s cubic-bezier(0.4, 0, 0.6, 1) 0s infinite normal none running pulse`), which Chromium's parser resolves into every animation longhand INCLUDING the timeline (auto = the default). The CLONE's Tailwind v4 emission is var()-indirected (`animation: var(--animate-pulse)`), leaving the CSSOM specified-value read of the longhand EMPTY until computed-value substitution — so the clone reads ZERO. The live's AUTH-route platform sheet (`static/index-DiZiYQBd.css` — the gotcha-80 sheet) carries 36+ more incl. the `vt-*` view-transition siblings, the sonner loader bars, and the full Base44 animate kit — the DOCUMENTED auth-shell platform-chrome family. **ALL INERT, PROVEN**: zero elements carrying animate-* / motion-safe / motion-reduce / accordion classes on ANY of the 10 probed routes on EITHER site (animatedEls = 0 × 20 route-visits), zero running animations (getComputedStyle `animation-name: none` everywhere, non-auto timeline count ZERO). The scroll-behavior count decomposition (live 1/route = the runtime-injected inline `* { scroll-behavior: smooth }` vs clone 2/route = the universal pin + the s25-documented `html[data-scroll-restore]` popstate suppressor — the deliberate-better family) is the DOCUMENTED variance, not a new finding. | INFO (the inert sheet-serialization tier — documented; the usage zero-stance pinned) | **PIN the clone's usage zero-stance + the inertness documentation** |
| 3 | **THE WEBGPU / WEB LOCKS CENSUS + THE BLUETOOTH HEADLESS MIRROR (fresh-eyes family C — the session_118 direction (a), the device-tier follow-up)**: `navigator.gpu` (object) + `GPUAdapter` (function) + `GPUDevice` (function) are PRESENT with IDENTICAL shape on BOTH sites; `navigator.locks` (object — the LockManager) PRESENT with identical shape; `navigator.usb` present (the s49 verified tier); `navigator.bluetooth` ABSENT (undefined) on BOTH sites — the gotcha-78 headless mirror RE-VERIFIED (do NOT pin bluetooth presence). The app surface is ZERO on BOTH sides: ZERO instrumented `gpu.requestAdapter` calls, ZERO `getPreferredCanvasFormat` calls, ZERO `navigator.locks.request`/`query` calls, ZERO canvas elements (the GPU render target), ZERO gpu/lock-labeled UI (the parenthesized label sweep — the s48 precedence-trap lesson). | INFO (the zero-surface census — pin) | **PIN (unit source + e2e census)** |

### Audit-surface note (the session-52 additions — THREE new probe families)

- **the Speculation Rules / Prerender census** (finding 1) — the
  speculationrules-script DOM census (count + parsed action/eagerness), the
  `rel=expect`/`rel=prefetch` link census, the `Speculation-Rules` /
  `Supports-Loading-Mode` response-header sweep (the page-level response
  listener), the `prerenderingchange` listener census, the
  `document.prerendering` + `activationStart` runtime-evidence reads.
- **the Container Queries / SDA census** (finding 2) — the four
  `CSS.supports` engine probes, the LAYER-AWARE `@container` at-rule census
  (constructor-aware: CSSContainerRule detection), the declaration census
  (container-type/name/shorthand, animation-timeline, timeline-scope,
  view-timeline, scroll-timeline, scroll-snap-align/type, scroll-behavior —
  every style rule's longhand reads, recursing into every grouping rule),
  the animationTimeline VALUE census, the inertness proof (the animate-class
  element sweep + the computed animation-name census), the scroll-behavior
  attribution (which sheet + which selector owns each rule).
- **the WebGPU / Web Locks census** (finding 3) — the navigator.gpu /
  GPUAdapter / GPUDevice / navigator.locks / navigator.usb presence reads,
  the bluetooth headless-mirror re-verification, the instrumented
  requestAdapter / getPreferredCanvasFormat / locks.request / locks.query
  counters, the canvas census, the gpu/lock-labeled UI sweep.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean at the app tier — NO source change
  ships this session** (the s44–s51 precedent: the pins are the
  deliverable). Every spec is green by construction against the probed
  current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census: `speculationrules`, `speculationRules`, `Speculation-Rules`,
  `prerendering` (covers `prerenderingchange` — the longer string contains
  the shorter; the bare `prerender` form is NOT pinned because the two
  `static-prerendered` CSP-nonce comments in src/proxy.ts + layout.tsx
  legitimately contain it), `container-type`, `container-name`,
  `@container`, `animation-timeline`, `timeline-scope`, `view-timeline`,
  `scroll-timeline`, `scroll-snap`, `animationTimeline`, `timelineScope`,
  `navigator.gpu`, `requestAdapter`, `getPreferredCanvasFormat`,
  `navigator.locks`, `GPUAdapter`, `GPUDevice`, `locks.request` — all zero
  in src/**/*.{ts,tsx,css}. `scroll-behavior` is deliberately NOT a pin
  string: the clone ships the s25-documented deliberate-better universal
  pin + popstate suppressor (14 source hits, all in globals.css — the
  documented family).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46–s51 precedent — all three families are chrome
  surfaces; the signed-in census lives in the probe JSON + the proof
  matrix).
- **The e2e context guarantees**: `document.prerendering` (the boolean
  property), the four `CSS.supports` probes, `navigator.gpu`,
  `navigator.locks`, and `navigator.usb` are all PRESENT in the e2e
  Chromium (the presence mirror — a Playwright bump that changes the
  headless surface re-baselines the presence reads, not the zero-CALL
  contracts). `navigator.bluetooth` absence has the gotcha-78 mirror
  treatment: NEVER asserted in the specs.
- **The animation-timeline serialization finding is documented, never
  pinned as a zero-read** — the live's 4-per-route longhand reads are a
  function of the platform compiler's literal-shorthand emission form (a
  sheet-STRUCTURE variance, inert by proof: zero animate-class elements
  anywhere), and the clone's var()-indirected v4 emission could change its
  own serialization shape on any Tailwind bump. The durable pins are the
  USAGE zero-stance (zero @container rules + zero container-*/timeline-*
  declarations in the CSSOM + zero animate-class elements on the public
  routes) + the source zero-stance (the s47–s51 precedent: pin the app's
  usage, never the platform's emission shape).
- **The scroll-behavior containment rides the DOCUMENTED family** — the e2e
  census asserts every scroll-behavior rule on the public routes is one of
  the two documented selectors (the universal `*` smooth pin or the
  `html[data-scroll-restore]` popstate suppressor) — the s47 containment
  precedent; an app-authored third selector fails the containment.
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s52 family names (speculation/prerender, container/
  timeline/animation-timeline, gpu/locks) — none of the existing source
  pins (which sweep `src/` only) match those literals; the new unit source
  pins also sweep `src/` only, so the spec comments are safe. The docs may
  quote the `@container` / `animation-timeline` families freely — the
  `@source not` set excludes every doc surface (re-verified: skills, docs,
  tests, test-results, the five root docs, both SKILL files, worklog.md),
  and the leak spec still re-runs LAST per the house rule.
- **The expected counts**: 334 unit (+3: the Speculation Rules/Prerender,
  the Container Queries/SDA, and the WebGPU/Web Locks zero-stance source
  pins in tests/platform-surface-source.test.ts) + 412 e2e (+3: the
  speculation/prerender census single, the CQ/SDA census single, the
  WebGPU/Web Locks census single) = **746 total**.
- **The vitest + playwright config contract**: both suites already exist
  and are green (331/409 at baseline) — this session's pins ride the
  existing configs (the "add vitest and playwright by modifying the
  respective config files" instruction is satisfied by the verified-green
  configs + the session's additions through them; no config change is
  required by any finding — a config change without a driving failure
  would violate the no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 3)

**unit** (extend `tests/platform-surface-source.test.ts`, the s47–s51
pattern — one new `describe("session-52: the platform-surface source census")`
block, its constants inserted before the s51 block's):

- **the Speculation Rules / Prerender zero-stance pin** — `src/` contains
  ZERO `speculationrules`, `speculationRules`, `Speculation-Rules`, and
  `prerendering` references (the last covers `prerenderingchange`; the bare
  `prerender` stays unpinned — the two documented CSP-nonce comments).
- **the Container Queries / Scroll-Driven Animations zero-stance pin** —
  `src/` contains ZERO `container-type`, `container-name`, `@container`,
  `animation-timeline`, `animationTimeline`, `timeline-scope`,
  `timelineScope`, `view-timeline`, `scroll-timeline`, and `scroll-snap`
  references.
- **the WebGPU / Web Locks zero-stance pin** — `src/` contains ZERO
  `navigator.gpu`, `requestAdapter`, `getPreferredCanvasFormat`,
  `navigator.locks`, `locks.request`, `GPUAdapter`, and `GPUDevice`
  references.

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47–s51 honest-RED
precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 3)

**e2e** (the session-52 block, inserted between the s51 PiP block and
the s33 burst spec — the position contract preserved):

- **the Speculation Rules / Prerender census spec** — `document.prerendering`
  present-as-boolean + `false` and `activationStart` = 0 on every public
  route (the runtime-evidence mirror); ZERO speculationrules script
  elements; ZERO `rel=expect`/`rel=prefetch` links in the head; ZERO
  `prerenderingchange` registrations (the init-script listener override).
- **the Container Queries / SDA census spec** — the four `CSS.supports`
  engine probes TRUE (the presence mirror); the LAYER-AWARE CSSOM census:
  ZERO `@container` at-rules, ZERO `container-type`/`container-name`
  declarations, ZERO `animation-timeline`/`timeline-scope`/`view-timeline`/
  `scroll-timeline` declarations; ZERO animate-class elements on the public
  routes (the inertness contract — the live ships the same zero-element
  surface); the scroll-behavior CONTAINMENT (every scroll-behavior rule is
  the universal `*` smooth pin or the `html[data-scroll-restore]`
  suppressor — any app-authored third selector fails the spec).
- **the WebGPU / Web Locks census spec** — `navigator.gpu` + `navigator.locks`
  + `navigator.usb` present (the presence mirror; bluetooth NEVER asserted
  — the gotcha-78 mirror); the instrumented `requestAdapter` /
  `locks.request` call counters stay ZERO across the public routes; ZERO
  gpu/lock-labeled UI elements; ZERO canvases.

### Phase 3 — GUARD + docs + the proof matrix + screenshots

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 334 unit, 412 e2e — 746 total; the split strategy
  extends: `--grep-invert "session-(4[4-9]|5[0-2])"` 378 + `--grep
  "session-(4[4-9]|5[0-2])"` 34; the s52 block joins the s44–s51 tail that
  never touches the throttled verify route, so the s33 burst spec stays
  last).
- The standing parity surfaces re-verified (the house rule): heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery + the
  console sweep — run in the LIVE-MATCHED demo state (the s50 battery
  demo-state rule: the demo enrollments reset before the battery, the
  canonical state re-restored only for the screenshot phase).
- Docs: AGENTS.md (the commands-table counts → 334/412; gotcha 81 — the
  animation-timeline shorthand-serialization tier + the speculation-rules
  zero surface + the WebGPU/Web Locks census), CLAUDE.md (the pyramid +
  the e2e tail + the unit tail), README (badge 746 + the session-52
  paragraph), the PAD ([S52] row), SKILL v3.40.0, the session logs
  (session_120.md transcript-style + session_121.md final log, the house
  convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s52.txt`): the per-family census table
  (API presence + call counters + UI/DOM/CSSOM/header sweeps), the
  animation-timeline attribution (the live's 4 user-sheet + 36 auth-sheet
  reads vs the clone's zero — the literal-shorthand vs var()-indirection
  mechanism) + the inertness proof (zero animate-class elements + zero
  running animations × both sites) + the scroll-behavior decomposition
  (the documented 1-vs-2 deliberate-better family), the env contract + the
  gate summary. The screenshot matrix captured per the house convention
  (the DEV-SERVER captures the owner requests every session — `next dev`
  on :3000 with custom.db + the canonical demo state re-restored AFTER the
  battery, every context carrying the session cookie). `.env` /
  `.env.example`: NO new knobs (the session touches no configuration —
  re-verified byte-identical + matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-51 tree re-verified — 740).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, byte-identical, clean — after the demo-state reset).
3. [x] Fresh-eyes probes: family A (the Speculation Rules / Prerender
   census — zero surface both sites), family B (the Container Queries /
   SDA census — engine parity-clean + the animation-timeline
   shorthand-serialization discovery + the inertness proof), family C
   (the WebGPU / Web Locks census — present + zero app surface + the
   bluetooth headless mirror re-verified).
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
  contracts, the s47–s51 notes' mirror image).
- **The CSS.supports engine probes are ENGINE-bound** (true on both sites'
  Chromium today; an engine that drops SDA support re-baselines the probe,
  not the zero-USAGE contract).
- **The animation-timeline serialization finding rides the platform's
  emission form** — the live's literal-shorthand reads vs the clone's
  var()-indirection are both INERT (proven: zero animate-class elements,
  zero running animations); the pin asserts the USAGE zero-stance, never
  the serialization shape (the s51 fetchPriority containment's design
  mirror: survive framework bumps, catch app-authored drift).
- **The scroll-behavior containment pin rides the DOCUMENTED deliberate-
  better family** — the two allowed selectors are the s24/s25-documented
  rules; a legitimate future scroll-feature addition must go through the
  documentation gate (update the containment's allowed set) rather than
  drift silently.
- **The e2e split ordering constraint holds** — the s52 block joins the
  s44–s51 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
