# NexusLearn Remediation Plan — Session 49

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + `AUTH_SECRET` per the standing-battery
boot convention; the evidence scripts under `/home/z/my-project/scripts/s49-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-48 tree, commit
`0c466d0` + the owner's session-log doc commits `9748a63` → `718e050`): lint ✓
· typecheck ✓ · 322/322 unit ✓ · build ✓ · **400/400 e2e ✓** (the documented
split: mobile-navigation 14 + `--grep-invert "session-4[4-8]"` 378 + `--grep
"session-4[4-8]"` 22 — the inverted sweep includes the 14 mobile specs) —
**722 total**, matching the documented session-48 end state exactly. The
environment contract re-verified (`.env` == `.env.example` byte-identical,
`DATABASE_URL="file:../db/custom.db"`, the `db/` folder recreated at the repo
root by `db:push` + `db:seed`). The standing parity surfaces ALL re-verified
(signed in on BOTH sites with the demo user; the live's own CourseDetail id
`699081e752032065b878129d` rediscovered from its /Courses card walk — stable
since s48): heights ×9 routes ×2 viewports **byte-exact 18/18**, innerText
**identical 5/5** (/, /Courses, /CourseDetail, /Dashboard, /login — 0 diffs on
214/96/789/15/9 lines), **the mobile battery fully identical — NO Tailwind v4
bug** (trigger byte-identical: BUTTON `md:hidden p-2 rounded-lg text-white/80`
40×40 @(319,12); panel 375×405 @(0,64); all 9 members at identical geometry
y=81/129/177/225/273/321/369 + the CTA pair at y=417 h36 — the My Dashboard
link + button; the 4px space-y gap renders on both sites), console sweep **0
errors on both sites** (the live's 429s + its cdn.tailwindcss.com warning +
its socket.io WebSocket = its platform families, 6 entries).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE CREDENTIALS / WEBAUTHN CENSUS (fresh-eyes family A — the session_109 direction (a))**: the password-adjacent API surface is fully present on BOTH sites in the shared headless context — `navigator.credentials` (CredentialsContainer with create/get/store/preventSilentAccess all functions) + `PublicKeyCredential` (with isUserVerifyingPlatformAuthenticatorAvailable + isConditionalMediationAvailable) — but the app surface is ZERO on BOTH sides: ZERO instrumented calls (credentials.create/get/store/preventSilentAccess + both PublicKeyCredential static probes, all overridden before load, 9 routes × both sites), ZERO passkey/webauthn/biometric/fingerprint-labeled UI elements (the parenthesized corrected sweep), ZERO app-level registrations of the family's events. The clone ships the same zero-stance the live does. | MEDIUM (pin) | Phase 1 |
| 2 | **THE WEB-SPEECH CENSUS (fresh-eyes family B — the session_109 direction (b))**: the tier is present on BOTH sites in the shared context — `speechSynthesis` (object with getVoices/speak functions) AND `SpeechRecognition` (a function — the e2e Chromium exposes the constructor) — but ZERO app surface on EITHER side: ZERO instrumented speak/cancel/getVoices calls, ZERO SpeechRecognition constructions + starts, ZERO speech/voice/mic-labeled UI, ZERO speech-family CSSOM rules. Neither site ships any voice surface. | MEDIUM (pin) | Phase 1 |
| 3 | **THE BLUETOOTH / SERIAL / USB CENSUS (fresh-eyes family C — the session_109 direction (c))**: `navigator.bluetooth` is ABSENT in the shared headless context on BOTH sites (the s47 navigator.share ABSENT case's mirror — headless Chromium without the experimental flag), while `navigator.serial` (requestPort/getPorts) + `navigator.usb` (requestDevice/getDevices) are present with IDENTICAL shape on both — but the app surface is ZERO on BOTH sides: ZERO instrumented requestDevice/requestPort/getPorts/getDevices calls, ZERO bluetooth/serial/pairing-labeled UI, ZERO connect/disconnect app registrations. The niche-connectivity tier is untouched by both apps. | MEDIUM (pin) | Phase 2 |
| 4 | **THE NEXT.JS RUNTIME ERROR-LISTENER FAMILY (the genuine fresh-eyes discovery)**: the addEventListener census delta (live 56 vs clone 130 "error" registrations across the 9 routes) is FULLY ATTRIBUTED framework-internal surface. The LIVE registers 37 img + 9 div#root + 4 span + 4 DocumentFragment + 2 body (its platform React's own event delegation + its image error handling). The CLONE registers the IDENTICAL img family (37 = 37 — the same image set) + 4 span + 4 DocumentFragment + 2 body, PLUS its Next.js 16 runtime's own: 56 script[has-src] error listeners (one per loaded script tag — the runtime's script-load monitoring), 9 document + 9 window tier listeners (React 19.3's root registration), and 9 div#__next-route-announcer__ listeners (Next.js's built-in a11y route announcer). ALL INERT (zero app-level handlers on either site — the app code never registers an "error" listener; render tier is the standing battery, byte-identical). This is the LISTENER-TIER analogue of the s48 fullscreenchange discovery: the clone's newer Next/React runtime registers a richer framework-internal error-monitoring set than the live's older platform. Deliberately NOT pinned as a zero-listener assertion (framework surface is legitimate — the durable contracts are the zero APP-level registrations + the src/ zero-stance). | MEDIUM (document) | Phase 1 |
| 5 | **THE STANDING-STATE CONFIRMATIONS (no defect — the qualification notes)**: (a) the standing battery's trigger x-coordinate reads 319 (the s48 log's 333) — a VIEWPORT-SCROLLBAR delta in this session's probe context (375px viewport, 15px classic scrollbar), NOT a regression: the LIVE and the CLONE agree byte-for-byte at the same coordinates in the SAME context, which is the parity contract; (b) the panel width reads 375 (the s48 log's 389) — the same context rule (the panel spans the viewport width). Both re-verified in-context identical. | LOW (document) | Phase 3 |

### Audit-surface note (the session-49 additions — THREE new probe families + one attribution census)

- **the credentials/WebAuthn census** (finding 1) — the API-surface reads
  (navigator.credentials per-method typeof + PublicKeyCredential statics),
  the instrumented call counters (create/get/store/preventSilentAccess +
  isUserVerifyingPlatformAuthenticatorAvailable/isConditionalMediationAvailable),
  the passkey/biometric/fingerprint-labeled UI sweep (parenthesized).
- **the Web-Speech census** (finding 2) — the API-surface reads
  (speechSynthesis shape + SpeechRecognition typeof), the instrumented
  speak/cancel/getVoices counters, the SpeechRecognition constructor +
  start instrumentation, the speech/voice/mic-labeled UI sweep.
- **the Bluetooth/Serial/USB census** (finding 3) — the API-surface reads
  (bluetooth presence, serial + usb shape), the instrumented
  requestDevice/requestPort/getPorts/getDevices counters, the
  connectivity-labeled UI sweep.
- **the error-listener attribution census** (finding 4) — the target-level
  breakdown (img/script/document/window/route-announcer/root), the
  img-family equality proof (37 = 37), the framework attribution.

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean — NO source change ships this
  session** (the s44/s46/s47/s48 precedent: the pins are the deliverable).
  Every spec is green by construction against the probed current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census: `navigator.credentials`, `credentials.create`, `credentials.get`,
  `credentials.store`, `preventSilentAccess`, `PublicKeyCredential`,
  `isUserVerifyingPlatformAuthenticatorAvailable`,
  `isConditionalMediationAvailable`, `speechSynthesis`,
  `SpeechRecognition`, `webkitSpeechRecognition`, `getVoices`,
  `navigator.bluetooth`, `requestDevice`, `navigator.serial`,
  `requestPort`, `navigator.usb` — all zero in src/**/*.{ts,tsx,css}).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46/s47/s48 precedent — all three families are
  chrome surfaces; the signed-in census lives in the probe JSON + the
  proof matrix).
- **The e2e context guarantees**: `navigator.credentials` +
  `PublicKeyCredential` are PRESENT in the e2e Chromium; `speechSynthesis`
  + `SpeechRecognition` are present; `navigator.serial` + `navigator.usb`
  are present; `navigator.bluetooth` is ABSENT (the headless flag — the
  durable pin for family C is the zero-CALL counters on serial/usb + the
  source zero-stance, with the bluetooth presence documented as
  context-bound, the s47 navigator.share note's mirror).
- **The framework-listener family is NOT pinned as a zero-listener
  assertion** — the clone's Next.js runtime legitimately registers its
  error-monitoring set (finding 4); the durable pin is the ZERO APP-CALL
  contract + the source zero-stance. A future Next/React bump that
  reshapes the framework's own listener set only re-baselines the census
  (the probe JSON documents the current shape).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s49 family names (credentials/WebAuthn/speech/bluetooth/
  serial/usb API names) — none of the existing source pins (which sweep
  `src/` only) match those literals; the new unit source pins also sweep
  `src/` only, so the spec comments are safe.
- **The docs may quote the family names freely** — no Tailwind utility
  classes are quoted by this session's docs (the families are JS APIs),
  so the gotcha-41 CSS-leak risk is minimal; the leak spec still re-runs
  LAST per the house rule.
- **The expected counts**: 325 unit (+3: the credentials/WebAuthn, the
  Web-Speech, and the Bluetooth/Serial/USB zero-stance source pins in
  tests/platform-surface-source.test.ts) + 403 e2e (+3: the credentials
  census single, the speech census single, the connectivity census single)
  = **728 total**.
- **The vitest + playwright config contract**: both suites already exist
  and are green (322/400 at baseline) — this session's pins ride the
  existing configs (the "add vitest and playwright by modifying the
  respective config files" instruction is satisfied by the verified-green
  configs + the session's additions through them; no config change is
  required by any finding — a config change without a driving failure
  would violate the no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 3)

**unit** (extend `tests/platform-surface-source.test.ts`, the s47/s48
pattern — one new `describe("session-49 zero-stance pins")` block):

- **the credentials/WebAuthn zero-stance pin** — `src/` contains ZERO
  `navigator.credentials`, `PublicKeyCredential`,
  `isUserVerifyingPlatformAuthenticatorAvailable`, and
  `isConditionalMediationAvailable` references.
- **the Web-Speech zero-stance pin** — `src/` contains ZERO
  `speechSynthesis`, `SpeechRecognition`, and `getVoices` references.
- **the Bluetooth/Serial/USB zero-stance pin** — `src/` contains ZERO
  `navigator.bluetooth`, `navigator.serial`, `navigator.usb`, and
  `requestDevice` references.

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47/s48 honest-RED
precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 3)

**e2e** (the session-49 block, inserted before the s33 burst spec — the
position contract preserved):

- **the credentials/WebAuthn census spec** — `navigator.credentials` +
  `PublicKeyCredential` are present in the e2e context (the presence
  mirror — a Playwright bump that drops them re-baselines the presence
  read, not the zero-call contract); the instrumented
  credentials.create/get/store + preventSilentAccess + the
  PublicKeyCredential static probes stay ZERO across the public routes;
  ZERO passkey/biometric/fingerprint-labeled UI elements.
- **the Web-Speech census spec** — `speechSynthesis` is present in the
  e2e context; the instrumented speak/cancel counters stay ZERO across
  the public routes; ZERO SpeechRecognition constructions; ZERO
  speech/voice/speak-labeled UI elements.
- **the Bluetooth/Serial/USB census spec** — `navigator.serial` +
  `navigator.usb` are present in the e2e context (bluetooth documented
  ABSENT — the headless flag); the instrumented requestDevice/
  requestPort/getPorts/getDevices counters stay ZERO; ZERO
  bluetooth/serial/pairing-labeled UI elements.

### Phase 3 — GUARD + docs + the proof matrix + screenshots

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 325 unit, 403 e2e — 728 total; the split strategy
  holds: the s49 block joins the s44–s48 tail that never touches the
  throttled verify route).
- The standing parity surfaces re-verified (the house rule): heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery + the
  console sweep.
- Docs: AGENTS.md (the commands-table counts → 325/403; gotcha 78 — the
  Next.js runtime error-listener family + the context-coordinate
  qualification), CLAUDE.md (the pyramid + the e2e tail + the unit tail),
  README (badge 728 + the session-49 paragraph), the PAD ([S49] row),
  SKILL v3.37.0, the session logs (session_110.md is the s48 recap — this
  session writes session_111.md transcript-style + session_112.md final
  log, the house convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s49.txt`): the per-family census table
  (API presence + call counters + UI sweep), the error-listener
  attribution census, the env contract + the gate summary. The screenshot
  matrix captured per the house convention (the DEV-SERVER captures the
  owner requests every session — `next dev` on :3000 with custom.db +
  the canonical demo state). `.env`/`.env.example`: NO new knobs (the
  session touches no configuration — re-verified byte-identical +
  matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-48 tree re-verified — 722).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, byte-identical, clean).
3. [x] Fresh-eyes probes: family A (the credentials/WebAuthn census — zero
   surface both sites), family B (the Web-Speech census — zero surface both
   sites), family C (the Bluetooth/Serial/USB census — zero surface both
   sites) + the error-listener attribution census (finding 4).
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
  contracts, the s47/s48 notes' mirror image).
- **navigator.bluetooth is ABSENT in the headless context** — the family C
  e2e spec pins the serial/usb presence reads (both present) and does NOT
  assert bluetooth presence (context-bound absence, documented in the
  spec comment + the proof matrix).
- **The framework-listener family is deliberately NOT a zero-assertion** —
  Next.js's own script/document/window/route-announcer registrations are
  legitimate framework surface (finding 4); pinning "zero error
  listeners" would fail on the framework's own listeners and break on
  every Next bump. The durable contract: the zero APP-level
  registrations + the src/ zero-stance.
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s49 family names — none of the existing source pins
  match them (grep-verified; the existing pins sweep `src/` only).
- **The e2e split ordering constraint holds** — the s49 block joins the
  s44–s48 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
