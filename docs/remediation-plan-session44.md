# NexusLearn Remediation Plan — Session 44

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright probes, synced viewports
1920×1080 / 375×667, both sites signed in as the demo user for the
auth/storage tiers; the production standalone on :3100; the evidence scripts
under `/home/z/my-project/scripts/s44-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified this session: tsconfig `exclude`, eslint `ignores`, vitest
`include` = `*.test.ts` in `src/**` + `tests/**` only, playwright
`testDir: ./tests/e2e`).

**Baseline before remediation** (the shipped session-43 tree, commit
`b2966b0` + the owner's session_95.md doc commit `2745d48`): lint ✓ ·
typecheck ✓ · 307/307 unit ✓ · build ✓ · **378/378 e2e ✓** (8.9m, zero
flakes) — **685 total**, matching the documented session-43 end state
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
| 1 | **THE ERROR-BOUNDARY ESCALATION TIER (fresh-eyes family A — the session_94 suggested direction (a), the third crash class)**: the s43 pass shipped both user boundaries (`src/app/error.tsx` for the page segment + `src/app/global-error.tsx` for the root tier), but the ESCALATION class — the page-segment boundary's OWN render failing while it mounts — was never probed: it needs a SECOND, INDEPENDENT sabotage seam (the s42 count-format sabotage forces the first crash; a separate poison must fail error.tsx's own render). The seam (probed on the production standalone): error.tsx's render body makes exactly ONE call looked up at call time — `console.error("route render error", error)` — so a console.error wrapper keyed on the EXACT first-arg string (unique in the codebase, grep-verified) throws only for error.tsx's call: React's internal logging (different arg shapes) and global-error's `console.error("root render error", …)` pass through untouched. ONE poison, self-disarming after its first throw (the reset remount must render clean). **PROBED RESULT — the escalation works exactly as the s43 two-tier wiring predicts**: error.tsx's render failure unwinds to the next enclosing boundary — the ROOT tier the USER's global-error owns. Verified: `navCount 0` + `footerCount 0` (the Navbar + Footer GONE — the root layout replaced, the distinguishing evidence vs error.tsx which keeps the root chrome), h1 "500" + h2 "Something went wrong", the preserved document shape (`lang="en"` + `data-scroll-behavior="smooth"` + the `font-sans antialiased` body classes), Try again + Back to Home the plain `href="/"` anchor, and the FULL reset() recovery — after disarming both poisons, Try again re-renders the complete page (`navCount 1`, h1 "Explore Our Courses", url `/Courses`). The control (fresh context) renders clean. The LIVE's equivalent tier: NO boundary at ANY order — the escalation concept does not exist there (the s42/s43 blank/frozen family; no new probe needed beyond the pinned records). | HIGH (pin) | spec below |
| 2 | **THE PAGE-LIFECYCLE CENSUS (fresh-eyes family B — the session_94 suggested direction (b), never probed by any session)**: the listener census (the s43 registration-instrumentation pattern — `EventTarget.prototype.addEventListener` wrapped pre-load, the lifecycle-family set recorded) found: the LIVE's platform registers **pagehide + offline ×2 + visibilitychange ×2 + online ×1** (the Base44 runtime's lifecycle listeners — the platform family, like its 43 platform keyframes + 2 prefers-contrast rules); the CLONE ships **ZERO app-level lifecycle listeners** (grep-verified: `src/` carries only `scroll`, `keydown`, `popstate` — the s43 history family; Next's own `pagehide`/`pageshow` wiring lives in node_modules, not app source). The synthetic `visibilitychange` dispatch: NO reaction on either site (the live's platform listeners never mutate the app DOM — its own telemetry). `document.wasDiscarded` false + `visibilityState "visible"` + `prerendering` false — identical both sites. The CDP freeze/resume tier: `Page.setWebLifecycleState("frozen"/"active")` ACCEPTS on both sites but does NOT pause JS in this headless context (a 3s timer scheduled pre-freeze fired at its natural +3000.3ms; no `freeze`/`resume` events dispatched) — a probe-context note, identical on both sites (not a site difference). | LOW (pin + document) | spec below |
| 3 | **THE WEB-STORAGE / COOKIE / ITP CENSUS (fresh-eyes family C — the session_94 suggested direction (c)) — a REAL structural discovery**: the LIVE's post-login auth is **localStorage-token based with ZERO cookies at any point**: its session rides `token` + `base44_access_token` JWTs stored in localStorage (script-WRITABLE storage, ~90-day `exp` measured from the decoded payload), plus 5 platform keys (`base44_from_url`, `i18nextLng`, `base44_app_id`, `base44_functions_version`, `base44_analytics_session_id`); sessionStorage carries the mixpanel tab id; indexedDB holds 73,728 B (the mixpanel SDK — the only storage usage on either site). The CLONE: the HttpOnly `nexus_session` cookie (secure, Lax, path `/`, **604,796s ≈ the s32 7-day maxAge**), `document.cookie` EMPTY (HttpOnly — script-invisible), ZERO localStorage/sessionStorage, ZERO indexedDB (the s22 pins). **The ITP analysis (the direction's question answered)**: the live's script-writable tokens are subject to Safari's 7-day cap on script-writable storage (purged after 7 days of no user interaction — the SAME effective window as the clone's 7-day maxAge, arrived at from the OPPOSITE direction); the clone's HttpOnly cookie is ITP-EXEMPT (it dies only by its own maxAge). The XSS posture: the live's tokens are readable by any script (the localStorage family); the clone's are script-invisible. Both: `cookieEnabled` true, quota ~1 GiB per profile (1073741824 vs 1073815552 — Chromium granularity), `navigator.storage.persist()` untouched, `persisted()` false on both. | LOW (document — the platform-auth family; the clone's posture already pinned s22/s32) | Phase 5 |
| 4 | **THE OFFLINE TIER (fresh-eyes family D — never probed by any session; the s42 network-resilience family probed a DEAD RSC channel with the network UP)**: the soft-nav click OFFLINE (landing → Courses via the navbar): the LIVE **soft-navigates successfully** — its in-bundle SPA renders the full /Courses content offline (URL changed, content rendered, the STALE TITLE `"NexusLearn"` — the s16 never-updates-title-on-soft-nav family visible again); the CLONE's RSC channel dies → the s42 browser-navigation fallback fires (`Failed to fetch RSC payload … Falling back to browser navigation`) → the offline wall (the browser's error page: empty body, no h1). The **API tier offline** (the newsletter form, probed with NATIVE typing — the first-pass synthetic dispatch registered on the clone but not the live's controlled input; the s18 freeze methodology): the CLONE's fetch fails INSTANTLY into its catch → the idle restore (button back to `"Subscribe"`, form intact — the pending `"..."` is visible only while a request is actually in flight, caught mid-flight by the route-delay probe); the LIVE = the **PERPETUAL `"..."`** (buttonAfterSettled still `"..."` at +6.2s — the platform's no-catch family, the s18/s42 stuck-pending record confirmed on the offline tier). `navigator.onLine` flips false on both; the `offline` event fires (the live's platform listens; the clone has no listener — no app-visible reaction either way). The soft-nav-offline divide is the s16/s24 **SPA-vs-SSR architecture family** — replicating it would require shipping the route tree client-side (beyond-reference; the documentation gate). | LOW (document) | Phase 5 |

### Audit-surface note (the session-44 additions — FOUR new probe families)

- **the escalation census** (finding 1) — the two-seam methodology (the s42
  persistent count-format sabotage + the keyed one-shot console.error
  poison), the Navbar-gone proof (the root layout replaced — the
  distinguishing evidence vs a page-segment error.tsx render), the preserved
  document shape, the full reset recovery, the fresh-context control.
- **the lifecycle listener census** (finding 2) — the registration
  instrumentation across the lifecycle-family event set, the wasDiscarded /
  visibilityState / prerendering state, the CDP freeze/resume attempt with
  timer-drift measurement, the synthetic visibilitychange dispatch.
- **the storage/cookie/ITP census** (finding 3) — the post-login cookie
  inventory via context.cookies() (names, windows, attributes), the
  document.cookie client-visible tier, the localStorage/sessionStorage key
  census, navigator.storage.estimate() + persisted().
- **the offline tier** (finding 4) — the soft-nav click offline, the API
  tier with native typing + the mid-flight freeze (the route-delay
  methodology), navigator.onLine + the offline event.

### The plan-time design validation (done BEFORE this plan was finalized)

- **The escalation seam is deterministic and unique** (grep-verified): the
  string `"route render error"` exists in exactly ONE place in the codebase
  (`src/app/error.tsx:40` — the boundary's single render-time call); the
  poison's key cannot collide with React's internal logging (Error objects /
  React-prefixed strings) or global-error's `"root render error"`. The probe
  ran clean on the production standalone — the escalation landed in the
  user's global-error with the full reset recovery (the A2 evidence).
- **The e2e environment matches the probe environment**: the e2e suite boots
  the same standalone server on :3100 with db/e2e.db — the probe's evidence
  transfers directly; the specs re-run the same two-seam sabotage
  deterministically (the s42/s43 precedent: prototype methods looked up at
  call time, one-shot disarm flags, restore-before-reset ordering).
- **The lifecycle source pin is grep-clean**: ZERO lifecycle-family
  `addEventListener` calls in `src/` (verified: only `scroll`, `keydown`,
  `popstate` — the s43 history family); the pin follows the
  `tests/svg-props.test.ts` source-sweep precedent (the s22 zero-storage
  pin family — a guard so future client code adding a lifecycle listener
  gets flagged instead of drifting silently).
- **The e2e insertion point**: the session-44 block inserts between the s43
  stability spec and the s33 burst spec (which stays LAST — the alphabetical
  file order runs mobile-navigation.spec.ts first; the CSS-leak re-run is
  GET-only).
- **The expected counts**: 307 → ~311 unit (+4: the lifecycle source pins),
  378 → 380 e2e (+2: the escalation pair).

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the escalation e2e pair (finding 1)

**RED e2e** (the session-44 block, inserted before the s33 burst spec):

- (a) **the escalation render spec** — `addInitScript` the two-seam sabotage
  (the persistent `Number.prototype.toLocaleString` count-format poison +
  the keyed one-shot `console.error` poison) → goto `/Courses` → the
  escalation settles in ~4s → assert: h1 "500" + h2 "Something went wrong"
  (the boundary design language), `document.documentElement.lang === "en"`
  + `data-scroll-behavior === "smooth"` (the preserved document shape),
  `document.querySelectorAll("nav").length === 0` + `footer` count 0 (the
  Navbar/Footer GONE — the ROOT tier replaced: the distinguishing evidence
  vs error.tsx, which keeps the root chrome), the Back-to-Home plain anchor
  (`a[href="/"]`, no next/link), and NOT the framework default's copy.
- (b) **the reset recovery spec** — under the same two-seam sabotage, after
  the escalation settles: disarm both poisons (the count-format flag + the
  console poison has self-disarmed after its one throw) → click Try again →
  the FULL page re-renders: the Navbar restored (`nav` count 1), the real
  content (h1 "Explore Our Courses"), the URL `/Courses` — the root-tier
  reset recovers the document completely (the probe's A2 evidence).

**GREEN**: no source change — the boundaries already implement the contract
(the s42/s43 fixes); the specs pin it. If a spec fails RED and cannot go
green, that is a REAL escalation defect — the boundary wiring would need
work (none expected: the probe passed end-to-end).

### Phase 2 — the lifecycle source pins (finding 2)

**RED unit** (`tests/lifecycle-source.test.ts` — the svg-props source-sweep
precedent): sweep every `src/**/*.{ts,tsx}` source for lifecycle-family
`addEventListener` registrations — `visibilitychange`, `freeze`, `resume`,
`pagehide`, `pageshow`, `beforeunload`, `last-prerendering`, `online`,
`offline` — assert ZERO matches (the clone ships no app-level lifecycle
listeners; the live's platform listeners are the platform family). Companion
pins: `document.wasDiscarded` / `prerendering` reads also absent (the same
census); the spec documents the s44 census (the live's platform set vs the
clone's zero-app-listener posture + the CDP probe-context note).

**GREEN**: no source change (grep-verified zero matches — the pin is green
by construction, the s43 Phase-3 pin precedent).

### Phase 3 — GUARD + docs (findings 3-4)

- Full gate re-run: lint → typecheck → test → build → test:e2e (the expected
  counts: 311 unit, 380 e2e — 691 total).
- The standing parity surfaces re-verified AFTER the changes: heights/
  innerText ×9 routes ×2 viewports byte-exact + the mobile battery re-run +
  the console sweep (no source change ships — the GUARD proves the specs
  moved nothing).
- Docs: AGENTS.md (gotcha 73 — the escalation tier + the two-seam
  methodology; the lifecycle census; the storage/ITP census; the offline
  tier; the commands-table counts), CLAUDE.md, README (badge 691 + the
  session-44 paragraph), PAD ([S44] row), SKILL v3.32.0, the session logs
  (session_96.md transcript-style + session_97.md final log, the house
  convention) + the worklog entry. The proof matrix
  (`docs/screenshots/api-session-s44.txt`): the escalation matrix (the
  boundary render + the Navbar-gone proof + the reset recovery + the
  control), the lifecycle census (the live's platform set vs the clone's
  zero + the freeze/resume probe-context note), the storage/ITP census (the
  live's localStorage-token auth + the ITP analysis vs the clone's HttpOnly
  exemption), the offline matrix (the soft-nav divide + the newsletter
  pending states), the env contract + the gate summary. The screenshot
  matrix recaptured per the house convention. `.env`/`.env.example`: NO new
  knobs (the session touches no configuration).

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-43 tree re-verified — 685).
2. [x] Standing parity audit green (heights/innerText/mobile/console — 18/18,
   identical, 13/13).
3. [x] Fresh-eyes probes: family A (the escalation — CONFIRMED: the user's
   global-error owns the escalation, the full reset recovery, the control
   clean), family B (the lifecycle census — the live's platform set vs the
   clone's zero-app-listener posture; freeze/resume the probe-context note),
   family C (the storage/ITP census — the live's localStorage-token auth
   vs the clone's HttpOnly 7-day cookie), family D (the offline tier — the
   soft-nav divide + the newsletter pending states).
4. [ ] RED: the e2e escalation pair (verified failing — the assertions
   cannot pass without the boundary contract) + the unit lifecycle source
   pins (green by construction, the pin-sets precedent).
5. [ ] GREEN: no source change expected — the specs pin the probed contract.
6. [ ] GUARD: the full gate re-run + the standing parity surfaces + the
   mobile battery re-run.
7. [ ] The proof matrix + screenshots + docs + commit + push (the SSH
   wrapper, main only).

### Risk notes (validated against the codebase pre-execution)

- **The escalation spec's settle window** (~4s) follows the s42/s43
  precedent (the boundary renders within ~1s of the second crash; the wait
  covers the hydration commit + the two-crash sequence).
- **The console poison is one-shot by design**: it must fire on error.tsx's
  call (the ONLY keyed call site) and never re-arm — the reset remount's
  console.error passes through (the probe's A2 evidence: the recovery
  rendered clean).
- **The reset at the ROOT tier restores the document completely** (the
  probe: navCount 1 + the real content + the URL) — the spec asserts the
  Navbar's return as the strongest signal (the chrome is the root layout's
  own).
- **The lifecycle source pin sweeps `src/` only** (Next's framework
  pagehide/pageshow wiring lives in node_modules — the s22 pin governs app
  code; the framework's own listeners are nobody's to pin).
- **The doc-comment hazard** (the s42 lesson): the new specs' comments must
  not quote the forbidden literals the existing source pins match (the
  formatting-method names, the framework default copy, the history-event
  registration call) — the pins match the source files verbatim.
