# NexusLearn Remediation Plan — Session 48

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s48-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-47 tree, commit
`bac1a20` + the owner's session-log doc commit `9748a63`): lint ✓ ·
typecheck ✓ · 319/319 unit ✓ · build ✓ · **397/397 e2e ✓** (the documented
three-way split: mobile-navigation 14 + `--grep-invert "session-4[4-7]"` 364 +
`--grep "session-4[4-7]"` 19) — **716 total**, matching the documented
session-47 end state exactly. The environment contract re-verified (`.env` ==
`.env.example` byte-identical, `DATABASE_URL="file:../db/custom.db"`, the
`db/` folder created at the repo root by `db:push` + `db:seed`). The standing
parity surfaces ALL re-verified: heights ×9 routes ×2 viewports **byte-exact
18/18** (the live's own CourseDetail id `699081e752032065b878129d` discovered
from its /Courses card walk — its ids are platform-generated, not the clone's
seed-N), innerText **identical 5/5** (incl. /CourseDetail), the **mobile
battery fully identical — NO Tailwind v4 bug** (trigger byte-identical:
BUTTON `md:hidden p-2 rounded-lg text-white/80` 40×40 @(333,12); panel
389×405 @ y=64; all 9 members at identical geometry y=81/129/177/225/273/321/
369 + CTA 417; the space-y gap renders 4px on BOTH sites — the live carries
it as the CTA's v3-engine margin-top, the clone as the predecessor's
margin-block-end: the documented s9 engine-variance class-form fix, geometry
byte-identical), console sweep **clean on every real route** (the live's own
noise: 429 bursts from probe pacing + its cdn.tailwindcss.com prod warning +
its socket.io WebSocket — all documented platform families).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE CLIPBOARD FAMILY (fresh-eyes family A — the session_106 direction (a))**: `navigator.clipboard` is PRESENT on both sites (the async clipboard API object with writeText/readText/write/read in the shared headless context) but the app surface is ZERO on BOTH sides: ZERO instrumented API calls (all four methods overridden before load, 9 routes × both sites), ZERO `document.execCommand("copy"/"cut"/"paste")` calls (the legacy path, instrumented), ZERO copy/clipboard-labeled UI elements (the corrected label sweep — see finding 4), ZERO app-level copy/cut/paste `addEventListener` registrations (the listener census attributes every registration to the React runtimes — see finding 3). The clone ships the same zero-stance the live does. | MEDIUM (pin) | Phase 1 |
| 2 | **THE FULLSCREEN / PICTURE-IN-PICTURE TIER (fresh-eyes family B — the session_106 direction (b))**: both APIs are ENABLED on both sites (`document.fullscreenEnabled` true, `document.pictureInPictureEnabled` true — the full e2e Chromium surface) but the app surface is ZERO on BOTH sides: ZERO instrumented `Element.prototype.requestFullscreen` / `document.exitFullscreen` / `HTMLVideoElement.prototype.requestPictureInPicture` calls (all overridden before load, 9 routes × both sites), ZERO video elements anywhere (both sites — the 9-route count is 0 everywhere; the "videos=9" first-pass read was nine per-route zeros), ZERO fullscreen/PiP-labeled UI elements, ZERO `:fullscreen` / `:picture-in-picture` CSSOM rules on both sites (the layer-aware selector census, the s47 walker). | MEDIUM (pin) | Phase 1 |
| 3 | **THE REACT-19.3 FRAMEWORK-INTERNAL LISTENER FAMILY (the genuine fresh-eyes discovery)**: the clone's `react-dom-client` (React 19.3, in node_modules/react-dom/cjs/react-dom-client.production.js) carries `fullscreenchange` + `fullscreenerror` in its non-delegated event list — so the clone's React root registration attaches copy/cut/paste (delegated, root-container DIV + document tier) AND fullscreenchange/fullscreenerror listeners at the document tier on EVERY route. The live's older React (the Base44 platform's bundle) registers ONLY the copy/cut/paste family (DIV/BODY/SPAN targets, plus BODY+SPAN on /Courses + /Contact — its own platform-tier registrations) and NO fullscreen family. This is the LISTENER-TIER analogue of the s47 `.outline-hidden` framework-rule discovery: a framework-internal surface the clone's newer React carries that the live's older one does not — ALL INERT (zero app handlers, zero API calls: the instrumented requestFullscreen counter never fires; no render impact; the render tier is the standing battery, byte-identical). | MEDIUM (pin + document) | Phase 1 |
| 4 | **THE PROBE-METHODOLOGY LESSON (the operator-precedence trap)**: the first-pass UI-label sweep shipped `/copy|clipboard/i.test(aria) + " " + innerText` — `test()` binds FIRST, so the filter concatenated a BOOLEAN to the label string, producing a truthy string for EVERY element (38 "copy" buttons on the live, 45 on the clone — "My Dashboard", "Browse Courses"…). The corrected sweep (parenthesized test on the concatenated label) shows the TRUE zero surface on both sites. Recorded as a gotcha: the probe filter must parenthesize the regex test around the FULL label assembly. | LOW (document) | Phase 1 |
| 5 | **THE GAMEPAD / WEBHID CENSUS (fresh-eyes family C — the session_106 direction (c))**: the APIs EXIST in the shared context on both sites (`navigator.getGamepads` is a function, `navigator.hid` present with getDevices/requestDevice — the Chromium WebHID surface; identical shape on both) but ZERO registrations fire anywhere: instrumented `getGamepads` override (zero calls, 9 routes × both sites), ZERO `gamepadconnected`/`gamepaddisconnected` listener registrations (the instrumented addEventListener census), ZERO gamepad/controller/joystick-labeled UI elements. Neither site ships ANY gamepad/WebHID surface. | MEDIUM (pin) | Phase 2 |
| 6 | **THE AGENTS.md STALE COUNT (doc drift)**: the commands-table e2e row (line 18) still reads "**393 specs**" (the session-46 number) while the very next row (line 19) reads "**397 specs total**" — the s47 doc pass updated one row and missed the other. | LOW (doc fix) | Phase 3 |

### Audit-surface note (the session-48 additions — THREE new probe families + one methodology correction)

- **the clipboard census** (finding 1) — the API-surface reads (navigator.clipboard
  presence + per-method typeof), the instrumented call counters (writeText/
  readText/write/read + the legacy execCommand override), the corrected
  copy-labeled UI sweep, the addEventListener copy/cut/paste registration
  census (attributed to the React runtimes, finding 3).
- **the fullscreen/PiP census** (finding 2) — the API-surface reads
  (fullscreenEnabled/pictureInPictureEnabled), the instrumented
  requestFullscreen/exitFullscreen/requestPictureInPicture counters, the
  video-element count (incl. controls/disablePictureInPicture attrs), the
  fullscreen/PiP-labeled UI sweep, the layer-aware `:fullscreen`/
  `:picture-in-picture` CSSOM selector census.
- **the gamepad/WebHID census** (finding 5) — the API-surface reads
  (getGamepads typeof, navigator.hid shape), the instrumented getGamepads
  counter, the gamepad-event registration census, the gamepad-labeled UI
  sweep.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean — NO source change ships this
  session** (the s44/s46/s47 precedent: the pins are the deliverable). Every
  spec is green by construction against the probed current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census: `navigator.clipboard`, `execCommand`, `requestFullscreen`,
  `exitFullscreen`, `fullscreenElement`, `requestPictureInPicture`,
  `pictureInPicture`, `getGamepads`, `gamepadconnected`, `navigator.hid` —
  all zero in src/**/*.{ts,tsx}).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46/s47 precedent — all three families are chrome
  surfaces; the signed-in census lives in the probe JSON + the proof
  matrix).
- **The e2e context guarantees**: `navigator.clipboard` is PRESENT in the
  e2e Chromium (unlike navigator.share — the s47 headless context ABSENT
  case); `fullscreenEnabled` + `pictureInPictureEnabled` are true; the
  instrumented counters are the durable contract (an API-presence assertion
  is context-bound and would re-baseline on a Playwright bump — the s47
  navigator.share note's mirror).
- **The framework-listener family is NOT pinned as a zero-listener
  assertion** — the clone's React 19.3 legitimately registers
  fullscreenchange/fullscreenerror at the document tier (finding 3); the
  durable pin is the ZERO-CALL contract (requestFullscreen never fires) +
  the source zero-stance (src/ never references the APIs). A future React
  bump that reshapes the framework's own listener set only re-baselines the
  listener census (the probe JSON documents the current shape).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments quote
  only the s48 families (clipboard/fullscreen/pip/gamepad/hid API names) —
  none of the existing source pins (which sweep `src/` only) match those
  literals; the new unit source pins also sweep `src/` only, so the spec
  comments are safe.
- **The docs may quote the family names freely** — no Tailwind utility
  classes are quoted by this session's docs (the families are JS APIs), so
  the gotcha-41 CSS-leak risk is minimal; the leak spec still re-runs LAST
  per the house rule.
- **The expected counts**: 322 unit (+3: the clipboard/fullscreen-PiP/
  gamepad-HID zero-stance source pins in tests/platform-surface-source
  .test.ts) + 400 e2e (+3: the clipboard census single, the fullscreen/PiP
  census single, the gamepad/HID census single) = **722 total**.
- **The vitest + playwright config contract**: both suites already exist and
  are green (319/397 at baseline) — this session's pins ride the existing
  configs (the "add vitest and playwright by modifying the respective
  config files" instruction is satisfied by the verified-green configs +
  the session's additions through them; no config change is required by any
  finding — a config change without a driving failure would violate the
  no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 5)

**unit** (extend `tests/platform-surface-source.test.ts`, the s44/s47
pattern — one new `describe("session-48 zero-stance pins")` block):

- **the clipboard zero-stance pin** — `src/` contains ZERO `navigator.clipboard`
  and ZERO `document.execCommand` references (both the async API and the
  legacy path).
- **the fullscreen/PiP zero-stance pin** — `src/` contains ZERO
  `requestFullscreen`, `exitFullscreen`, `fullscreenElement`,
  `requestPictureInPicture`, and `disablePictureInPicture` references.
- **the gamepad/WebHID zero-stance pin** — `src/` contains ZERO `getGamepads`,
  `gamepadconnected`, and `navigator.hid` references.

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47 honest-RED precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 5)

**e2e** (the session-48 block, inserted before the s33 burst spec — position
contract preserved):

- **the clipboard census spec** — instrumented `navigator.clipboard.writeText`/
  `readText` + `document.execCommand` counters (addInitScript) stay ZERO
  across the public routes; `navigator.clipboard` is present in the e2e
  context (the presence mirror — a Playwright bump that drops it re-baselines
  the presence read, not the zero-call contract); ZERO copy-labeled UI
  elements.
- **the fullscreen/PiP census spec** — `document.fullscreenEnabled` and
  `document.pictureInPictureEnabled` are true in the e2e context; the
  instrumented `requestFullscreen`/`requestPictureInPicture` counters stay
  ZERO across the public routes; ZERO video elements; ZERO fullscreen/PiP-
  labeled UI elements; ZERO `:fullscreen`/`:picture-in-picture` CSSOM rules
  (the layer-aware walk).
- **the gamepad/HID census spec** — `typeof navigator.getGamepads ===
  "function"` and `navigator.hid` present (the Chromium surface); the
  instrumented `getGamepads` counter stays ZERO; ZERO gamepad-labeled UI
  elements.

### Phase 3 — GUARD + docs + the AGENTS.md fix (finding 6)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 322 unit, 400 e2e — 722 total; the split strategy holds: the s48
  block joins the s44–s47 tail that never touches the throttled verify route).
- The standing parity surfaces re-verified (the house rule): heights/innerText
  ×9 routes ×2 viewports byte-exact + the mobile battery + the console sweep.
- Docs: AGENTS.md (the commands-table e2e row 393 → **397** correction —
  finding 6; gotcha 77 — the React-19.3 framework-internal listener family +
  the operator-precedence probe lesson; the commands-table counts → 322/400),
  CLAUDE.md (the pyramid + the e2e tail + the unit tail), README (badge 722 +
  the session-48 paragraph), the PAD ([S48] row), SKILL v3.36.0, the session
  logs (session_107.md is the s47 recap — this session writes session_108.md
  transcript-style + session_109.md final log, the house convention) + the
  worklog entry. The proof matrix (`docs/screenshots/api-session-s48.txt`):
  the per-family census table (API presence + call counters + UI sweep +
  CSSOM), the framework-listener family documentation, the env contract +
  the gate summary. The screenshot matrix captured per the house convention
  (incl. the DEV-SERVER captures the owner requested this session — the
  standard matrix re-shot on the dev server in addition to the standalone
  battery captures). `.env`/`.env.example`: NO new knobs (the session touches
  no configuration — re-verified byte-identical + matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-47 tree re-verified — 716).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, clean).
3. [x] Fresh-eyes probes: family A (the clipboard census — zero surface both
   sites), family B (the fullscreen/PiP tier — zero surface both sites +
   the React-19.3 framework-listener discovery), family C (the gamepad/WebHID
   census — zero surface both sites), + the precedence-bug correction.
4. [ ] The pin specs authored (green by construction — the probed parity,
   frozen) + the RED-verification pass (each new spec runs against the
   current tree before the GUARD).
5. [ ] GUARD: the full gate re-run + the standing parity surfaces.
6. [ ] The proof matrix + screenshots (standalone battery + the dev-server
   captures) + docs (incl. the AGENTS.md 393→397 fix) + commit + push (the
   SSH wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The API-presence assertions are CONTEXT-bound** (the e2e Chromium —
  verified this session; a future Playwright bump that changes the headless
  surface re-baselines the presence reads — the instrumented zero-CALL
  counters + the source zero-stance pins are the durable contracts, the s47
  navigator.share note's mirror image).
- **The framework-listener family is deliberately NOT a zero-assertion** —
  React 19.3's own registrations are legitimate framework surface (finding
  3); pinning "zero fullscreenchange listeners" would fail on the framework's
  own listeners and break on every React bump. The durable contract: the
  zero-CALL counters + the src/ zero-stance.
- **The doc-comment hazard** (the s42 lesson): the new specs' comments quote
  only the s48 family names — none of the existing source pins match them
  (grep-verified; the existing pins sweep `src/` only).
- **The e2e split ordering constraint holds** — the s48 block joins the
  s44–s47 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
