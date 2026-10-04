# NexusLearn Remediation Plan — Session 53

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667 for the standing battery, 1280×800 for the fresh-eyes
families, both sites signed in as the demo user where required; the production
standalone on :3000 with `db/custom.db` + an explicit `AUTH_SECRET` per the
standing-battery boot convention; the evidence scripts under
`/home/z/my-project/scripts/s53-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-52 tree, commit
`0310e01` + the owner's session-log doc commit `a753609`): lint ✓
· typecheck ✓ · 334/334 unit ✓ · build ✓ · **412/412 e2e ✓** (the documented
split: `--grep-invert "session-(4[4-9]|5[0-2])"` 378 + `--grep
"session-(4[4-9]|5[0-2])"` 34) — **746 total**, matching the documented
session-52 end state exactly. The environment contract re-verified
(`.env` == `.env.example` byte-identical, `DATABASE_URL="file:../db/custom.db"`,
the `db/` folder at the repo root with custom.db + e2e.db). The standing
parity surfaces ALL re-verified green **after the demo-state reset** (the s50
battery demo-state rule — the s52 screenshot phase had left 3 enrollments in
custom.db; reset to the live-matched zero state before the battery): heights
×9 routes ×2 viewports **byte-exact 18/18**, innerText **identical 5/5** (/,
/Courses, /CourseDetail, /Dashboard, /login — 0 diffs on 214/96/789/15/9
lines), **the mobile battery fully identical — NO Tailwind v4 bug** (trigger
byte-identical: BUTTON `md:hidden p-2 rounded-lg text-white/80` 40×40
@(319,12); panel 375×405 @(0,64); all 9 members at identical geometry),
console sweep **0 errors on both sites**.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **THE WEB MIDI + BADGE-API CENSUS (fresh-eyes family A — the session_122 direction (a))**: the API tier is PRESENT with IDENTICAL shape on BOTH sites — `navigator.requestMIDIAccess` (function) + `window.MIDIAccess` (function) + `window.MIDIMessageEvent` (function) + `navigator.setAppBadge` (function) + `navigator.clearAppBadge` (function) — while the USAGE tier is ZERO on BOTH: ZERO instrumented `requestMIDIAccess` / `setAppBadge` / `clearAppBadge` calls across all 9 app routes on either site, ZERO midi/badge-labeled UI (the parenthesized label sweep — the s48 precedence-trap lesson), and ZERO MIDI-statechange listener registrations (the watched-event census). The live's console carries zero MIDI permission prompts (the headless context gates the hardware tier; nothing requests it). | INFO (the zero-surface census — pin) | **PIN (unit source + e2e census)** |
| 2 | **THE NAVIGATION-API CENSUS (fresh-eyes family B — the session_122 direction (b), the SPA-vs-SSR router family's newest member)**: the API tier is PRESENT with IDENTICAL shape on BOTH sites — `window.Navigation` / `window.NavigateEvent` / `window.NavigationHistoryEntry` (functions) + `window.navigation` (object) — while the LISTENER tier is ZERO on BOTH: ZERO `navigate` / `navigatesuccess` / `navigateerror` / `currententrychange` registrations across all 9 app routes AND both auth routes on either site (the live's SPA router and the clone's Next.js App Router BOTH leave the Navigation API untouched — the classic `popstate` is the only history event either registers, 2 listeners on both sites, fully framework-internal). The ENTRIES census: `navigation.entries()` grows identically under sequential route visits (2→3→4→…→10 across the 9-route walk, identical on both sites), `canGoBack`/`canGoForward`/`activation`/`transition` identical at rest (null), `currentEntry.url` matches the walked route — the entry KEYS are per-session UUIDs (noise, never comparable). | INFO (the zero-listener census — pin) | **PIN (unit source + e2e census)** |
| 3 | **THE LOCAL-FONT-ACCESS + EYEDROPPER + CONTACT-PICKER CENSUS (fresh-eyes family C — the session_122 direction (c), the UI-tier picker family)**: `window.queryLocalFonts` (function) + `window.FontData` (function) + `window.EyeDropper` (function) are PRESENT with IDENTICAL shape on BOTH sites while `navigator.contacts` / `window.ContactsManager` are headless-ABSENT on BOTH (the gotcha-78 mirror — NEVER asserted); the USAGE tier is ZERO on BOTH: ZERO instrumented `queryLocalFonts` / `EyeDropper.prototype.open` / `contacts.select` calls, ZERO `<input type="color">` elements (the eyedropper-adjacent DOM tier), ZERO font-named select/input controls, ZERO fonts/eyedropper/contacts-labeled UI. | INFO (the zero-surface census — pin) | **PIN (unit source + e2e census)** |
| 4 | **THE MOBILE-PANEL MOUNT-MODALITY TIER (the session's genuine discovery — gotcha 82; extends the s22 one-line note into the systematic census)**: the LIVE's mobile-menu PANEL CONTENT is **mount-on-open** — its CLOSED nav DOM carries ONLY the desktop row + the CSS-gated trigger (9 nav `a` links + 2 buttons at fresh-375 closed, 9 + 2 at desktop; ZERO panel members in the rendered tree until the trigger is clicked), verified at ALL THREE paths: fresh-375-closed (0 members), desktop (the panel is not in the DOM at all — `button[aria-controls]` does not exist; the md:hidden trigger alone stays always-mounted), and the desktop→mobile resize (still 0 members — the panel does NOT mount on resize). Clicking the trigger MOUNTS the panel with the byte-identical 9 members at identical geometry (y81/129/…/417 — the standing battery's numbers, reproduced at the resize path too). The CLONE's panel is **ALWAYS-MOUNTED** (the documented design — gotcha 8's symmetric `md:hidden` approach): the closed nav at 375 carries 17 `a` links (logo + 8 desktop row + 8 panel) + 3 buttons, with the panel members laid out at real geometry inside the collapsed `grid-template-rows: 0fr` track (outer container: `display: grid`, offsetHeight 0, opacity 0; inner: `min-h-0 overflow-hidden`), and the container `display: none` at desktop. EVERY OBSERVABLE SURFACE IS PARITY-CLEAN: the open-panel geometry byte-identical (the standing mobile battery), heights 18/18, innerText 5/5, the resize path IDENTICAL (both sites show the CSS-gated trigger after the desktop→mobile resize; click → the live mounts / the clone opens — the same 9 members at the same geometry), and the clone's always-mounted approach is the deliberate zero-mount-flash / zero-hydration-risk design (the s22 invisible-focus guard already pins its keyboard safety). The one inert DOM census difference: the clone's closed nav carries 17 links vs the live's 9, and at desktop the clone's Contact-link census counts 3 (nav row + footer + the display:none panel member) vs the live's 2 — the third is inert (display:none, 0×0 rect, tabIndex -1 when closed, absent from the a11y tree). NO source change (the s44–s52 precedent: the always-mounted design is the documented deliberate approach; the live's mount-on-open is its platform's implementation shape, inert to every observable surface). | INFO (the documented inert mount-modality tier — pin the clone's own design) | **PIN (e2e mount-modality census) + DOCUMENT (gotcha 82)** |

### Audit-surface note (the session-53 additions — THREE new probe families + the discovery tier)

- **the Web MIDI / Badge-API census** (finding 1) — the requestMIDIAccess /
  setAppBadge / clearAppBadge presence reads, the instrumented call
  counters, the midi/badge UI-label sweep, the MIDI-statechange watched-event
  census.
- **the Navigation-API census** (finding 2) — the Navigation /
  NavigateEvent / NavigationHistoryEntry / navigation presence reads, the
  navigate-family listener census (the addEventListener override, watched
  across app AND auth routes), the per-route entries/currentEntry/transition
  census, the popstate mirror (documented, never pinned).
- **the Local-Font-Access / EyeDropper / Contact-Picker census** (finding
  3) — the queryLocalFonts / FontData / EyeDropper / contacts presence
  reads, the instrumented counters, the color-input / font-control DOM
  census, the picker UI-label sweep.
- **the mount-modality attribution tier** (finding 4) — the class-based
  trigger census (the battery's selector convention: `nav
  [class*="md:hidden"]` — the live's trigger carries NO aria attributes, the
  s24 unhardened-reference family, so aria-based selectors miss it), the
  closed-nav DOM census at fresh-375 AND desktop, the desktop→mobile resize
  census, the click-after-resize mount verification, the closed-panel
  container metrics (offsetHeight 0 / opacity 0 / grid-template-rows 0px),
  and the desktop Contact-link visible census (2 on both sites).

### The plan-time design validation (done BEFORE this plan was finalized)

- **All three families are parity-clean at the app tier and the
  mount-modality tier is inert — NO source change ships this session** (the
  s44–s52 precedent: the pins are the deliverable). Every spec is green by
  construction against the probed current behavior.
- **The pinned strings are grep-verified absent from `src/`** (the source
  census, 19 strings all zero): `requestMIDIAccess`, `MIDIMessageEvent`,
  `setAppBadge`, `clearAppBadge`, `navigation.addEventListener`,
  `window.navigation`, `NavigateEvent`, `NavigationHistoryEntry`,
  `currententrychange`, `navigatesuccess`, `navigateerror`, `canGoBack`,
  `canGoForward`, `queryLocalFonts`, `FontData`, `EyeDropper`,
  `navigator.contacts`, `ContactsManager`, `contacts.select` — all zero in
  src/**/*.{ts,tsx,css}. `popstate` is deliberately NOT a pin string (the
  classic-router event both frameworks register internally — 2 on both sites
  today, the React-19.3-drag-family precedent: framework-internal listener
  counts are documented, never pinned). `MIDIAccess` bare is covered by
  `requestMIDIAccess` (the substring); `contacts` bare is NOT pinned (the
  `/Contact` route family makes it collision-prone — the precise compounds
  `navigator.contacts` / `ContactsManager` / `contacts.select` carry it).
- **The e2e specs run on the public routes signed-out where the surface is
  auth-invariant** (the s46–s52 precedent — all three families are chrome
  surfaces; the signed-in census lives in the probe JSON + the proof
  matrix).
- **The e2e context guarantees**: `navigator.requestMIDIAccess`,
  `navigator.setAppBadge`, `navigator.clearAppBadge`, `window.Navigation`,
  `window.navigation`, `window.NavigateEvent`,
  `window.NavigationHistoryEntry`, `window.queryLocalFonts`,
  `window.FontData`, and `window.EyeDropper` are all PRESENT in the e2e
  Chromium (the presence mirror — a Playwright bump that changes the
  headless surface re-baselines the presence reads, not the zero-CALL
  contracts). `navigator.contacts` / `ContactsManager` absence has the
  gotcha-78 mirror treatment: NEVER asserted in the specs.
- **The mount-modality census pins the CLONE'S OWN DESIGN, never the
  live's DOM shape** (the s51 fetchPriority containment's design mirror):
  the spec asserts the always-mounted closed panel (17 nav links at 375,
  9 panel members at real geometry, container offsetHeight 0 + opacity 0),
  the desktop `display: none` gating, and the desktop visible Contact-link
  census of 2 (nav row + footer — matching the live's count; the third
  clone link is the inert display:none panel member). A future refactor
  that switches the panel to conditional mounting (or drops the CSS
  gating) fails the spec and must pass through the documentation gate.
- **The doc-comment hazard** (the s42 lesson): the new specs' comments
  quote only the s53 family names (midi/badge, navigation-api,
  local-fonts/eyedropper/contacts, mount-modality) — none of the existing
  source pins (which sweep `src/` only) match those literals; the new unit
  source pins also sweep `src/` only, so the spec comments are safe. The
  docs may quote the family names freely — the `@source not` set excludes
  every doc surface (re-verified: skills, docs, tests, test-results, the
  five root docs, both SKILL files, worklog.md), and the leak spec still
  re-runs LAST per the house rule.
- **The expected counts**: 337 unit (+3: the Web MIDI/Badge, the
  Navigation-API, and the Local-Font/EyeDropper/Contacts zero-stance source
  pins in tests/platform-surface-source.test.ts) + 416 e2e (+4: the
  MIDI/Badge census single, the Navigation-API census single, the
  Local-Font/EyeDropper/Contacts census single, and the mount-modality
  census — all four in the session-53 block in nexuslearn.spec.ts, riding
  the tail split) = **753 total**.
- **The vitest + playwright config contract**: both suites already exist
  and are green (334/412 at baseline) — this session's pins ride the
  existing configs (the "add vitest and playwright by modifying the
  respective config files" instruction is satisfied by the verified-green
  configs + the session's additions through them; no config change is
  required by any finding — a config change without a driving failure
  would violate the no-speculative-scaffolding rule).

---

## B. The fix plan (TDD — pin-specs green by construction; no source changes)

### Phase 1 — the unit source pins (findings 1 + 2 + 3)

**unit** (extend `tests/platform-surface-source.test.ts`, the s47–s52
pattern — one new `describe("session-53: the platform-surface source census")`
block, its constants inserted before the s52 block's):

- **the Web MIDI / Badge-API zero-stance pin** — `src/` contains ZERO
  `requestMIDIAccess`, `MIDIMessageEvent`, `setAppBadge`, and
  `clearAppBadge` references (MIDIAccess bare is covered by the
  requestMIDIAccess substring).
- **the Navigation-API zero-stance pin** — `src/` contains ZERO
  `navigation.addEventListener`, `window.navigation`, `NavigateEvent`,
  `NavigationHistoryEntry`, `currententrychange`, `navigatesuccess`, and
  `navigateerror` references (popstate deliberately unpinned — the
  framework-internal classic-router event).
- **the Local-Font-Access / EyeDropper / Contact-Picker zero-stance pin** —
  `src/` contains ZERO `queryLocalFonts`, `FontData`, `EyeDropper`,
  `navigator.contacts`, `ContactsManager`, and `contacts.select`
  references.

RED-verification: a temp offender file under `src/` quoting each pinned
literal fails the sweep, then is deleted (the s47–s52 honest-RED
precedent).

### Phase 2 — the e2e census pins (findings 1 + 2 + 3 + 4)

**e2e** (the session-53 block, inserted between the s52 WebGPU/Web-Locks
block and the s33 burst spec — the position contract preserved):

- **the Web MIDI / Badge-API census spec** — `navigator.requestMIDIAccess`
  + `navigator.setAppBadge` + `navigator.clearAppBadge` present
  (the presence mirror); the instrumented call counters stay ZERO across
  the public routes; ZERO midi/badge-labeled UI.
- **the Navigation-API census spec** — `window.navigation` object present +
  the `Navigation` / `NavigateEvent` / `NavigationHistoryEntry`
  constructors function-typed (the presence mirror); ZERO navigate-family
  listener registrations on the public routes (the init-script listener
  override); the entries shape mirror (entries() is an array,
  currentEntry.index is a number — never the count, which is
  session-state).
- **the Local-Font / EyeDropper / Contacts census spec** —
  `window.queryLocalFonts` + `window.FontData` + `window.EyeDropper`
  present (the presence mirror; contacts NEVER asserted — the gotcha-78
  mirror); the instrumented counters stay ZERO; ZERO `<input type="color">`
  elements; ZERO fonts/eyedropper/contacts-labeled UI.
- **the mobile-panel mount-modality census spec** (finding 4, the gotcha-82
  guard) — at 375 closed: the nav carries 17 `a` links with 9 panel members
  at real geometry (y>70, width>0) while the panel container is collapsed
  (offsetHeight 0, opacity 0); at desktop (setViewportSize 1280×800): the
  trigger and the panel container are both `display: none`; the desktop
  visible Contact-link census is exactly 2 (nav row + footer — the live's
  count; the clone's third Contact link is the inert display:none panel
  member).

### Phase 3 — GUARD + docs + the proof matrix + screenshots

- Full gate re-run: lint → typecheck → test → build → test:e2e (the
  expected counts: 337 unit, 416 e2e — 753 total; the split strategy
  extends: `--grep-invert "session-(4[4-9]|5[0-3])"` 378 + `--grep
  "session-(4[4-9]|5[0-3])"` 38; the s53 block joins the s44–s52 tail that
  never touches the throttled verify route, so the s33 burst spec stays
  last).
- The standing parity surfaces re-verified (the house rule): heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery + the
  console sweep — run in the LIVE-MATCHED demo state (the s50 battery
  demo-state rule: the demo enrollments reset before the battery, the
  canonical state re-restored only for the screenshot phase).
- Docs: AGENTS.md (the commands-table counts → 337/416; gotcha 82 — the
  mount-modality tier + the three census families), CLAUDE.md (the pyramid +
  the e2e tail + the unit tail), README (badge 753 + the session-53
  paragraph), the PAD ([S53] row), SKILL v3.41.0, the session logs
  (session_123.md transcript-style + session_124.md final log, the house
  convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s53.txt`): the per-family census table
  (API presence + call counters + UI/DOM sweeps), the mount-modality
  attribution (the live's mount-on-open vs the clone's always-mounted, all
  three paths + the closed-panel metrics + the resize verification + the
  Contact-link census), the env contract + the gate summary. The screenshot
  matrix captured per the house convention (the DEV-SERVER captures the
  owner requests every session — `next dev` on :3000 with custom.db + the
  canonical demo state re-restored AFTER the battery via the REAL API,
  every context carrying the session cookie). `.env` /
  `.env.example`: NO new knobs (the session touches no configuration —
  re-verified byte-identical + matching the codebase).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-52 tree re-verified — 746).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, byte-identical, clean — after the demo-state reset).
3. [x] Fresh-eyes probes: family A (the Web MIDI / Badge census — present +
   zero surface both sites), family B (the Navigation-API census — present +
   zero listeners on app AND auth routes + the identical entries growth),
   family C (the Local-Font / EyeDropper / Contacts census — present/absent
   mirror + zero surface), family D (the mount-modality attribution —
   mount-on-open vs always-mounted, all three paths verified).
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
  contracts, the s47–s52 notes' mirror image).
- **The navigation-entries census is SESSION-state-bound** (the entries
  length is a function of the walk, the keys are per-session UUIDs) — the
  spec pins the SHAPE (array + numeric index), never the count or keys.
- **The mount-modality census pins the clone's own always-mounted design**
  — the live's mount-on-open shape is documented (gotcha 82), never
  replicated (a conditional mount would add hydration risk to the
  highest-regression-risk chrome for zero observable gain; the s22
  invisible-focus guard + the standing mobile battery already pin the
  observable behavior).
- **The e2e split ordering constraint holds** — the s53 block joins the
  s44–s52 tail (no throttled-route contact), so the s33 burst spec stays
  last.
- **No source file changes** — the GUARD's parity re-run is the formality
  gate (the house rule), not a regression check on a diff.
