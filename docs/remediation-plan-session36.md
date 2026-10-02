# NexusLearn Remediation Plan — Session 36

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the production standalone on :3400 for the web-vitals
probe; the evidence files under `/home/z/my-project/scripts/s36-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-35 tree, commit
`41313b8`): lint ✓ · typecheck ✓ · 126/126 unit ✓ · build ✓ · **307/307 e2e ✓**
(5.9m; one first-run flake in the session-15 reveal pre-hide spec —
timing-sensitive under a loaded box — green on the immediate re-run and in
isolation). The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env` — byte-identical to `.env.example`, `db/custom.db` + `db/e2e.db` at
the repo root after the standard re-seed; the db-url pollution guard correctly
ignored the sandbox's stale absolute shell export). The standing parity
surfaces ALL re-verified at the documented state: heights ×9 routes ×2
viewports **byte-exact 18/18**, normalized innerText 18/18 identical,
tag-of-shared-class drift 0, the **mobile battery fully identical** (trigger
`md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12),
open NAV 375×469, link geometry y 81/129/177/225/273/321/369/417 — **NO
Tailwind v4 bug**), console sweep 10/11 clean (the 11th is the by-design
404 route; the login client-side transition also clean).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The unverified-login surface (fresh-eyes family 1 — a REAL functional parity drift)**: the reference app BLOCKS signing in with an unverified account through its own UI — the live shows `Please verify your email before logging in. Check your email for the verification code.` in the signin card's error area and mints NO session (probed: signup a fresh account on the live → land on the verify view → never enter the code → back to the signin form with the same credentials → the error renders, zero auth cookies). The clone's `POST /api/auth/login` mints a FULL session for the same unverified account (probed end-to-end: `nexus_session` cookie set, lands on `/`) — the entire signup-verification flow is decorative for login purposes. The live's raw API is unprobeable (the documented platform wall: external POSTs get `400 Security verification is required`), so the UI error is the observable contract. | **HIGH** (functional parity) | fix below |
| 2 | **The SMTP transport surface (fresh-eyes family 2 — the session_70-suggested direction (b), the DEPLOYMENT §13 drill's ONLY remaining step)**: no transport module exists — `src/lib/mailer.ts` is absent (the drill's step 1: "Add a transport module (e.g. src/lib/mailer.ts — nodemailer, Resend, SES; keep it server-only like the AI SDK import)"). The signup route delivers the code via `console.info` in BOTH branches regardless of the `AUTH_DELIVERY` gate — an operator who sets `AUTH_DELIVERY=smtp` (activating the session-35 real comparison) locks EVERY new user out: the code is compared for real but never leaves the server log. The delivery seam needs to exist, be gated, and fail LOUD when misconfigured. | MEDIUM (operator-path completeness) | fix below |
| 3 | **The web-vitals budget surface (fresh-eyes family 3 — the session_70-suggested direction (c))**: FCP/LCP remain unpinned — the session-24 measurements were recorded but never converted into a budget spec (the s33 bundle baseline → s34 budget spec → s35 TTFB spec precedent, now extended to paint timings). Measured on the production standalone (:3400, single pass per route): TTFB 15–225ms · FCP 136–468ms (the /login FCP lands at 224ms — it needs a poll; the paint entry can postdate the load event) · LCP 164–1432ms (the `/` LCP includes the remote Unsplash hero imagery). | LOW (pin/record) | spec below |
| 4 | **The logout-everywhere UI surface (the session_70-suggested direction (a) — the standing DEFERRED decision)**: the `POST /api/auth/revoke-sessions` lever exists (session 35) with NO UI affordance. Deliberately deferred AGAIN: any Dashboard/login surface addition breaks the byte-exact height parity, and a dedicated `/Settings` route is a beyond-reference decision (the house parity contract holds until that decision is made explicitly). Documented, not built. | DEFERRED | docs only |
| 5 | **Documentation staleness (found during the doc-review phase)**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 shift with the new specs (126 unit + 307 e2e → new totals); `.env.example` must document the new `RESEND_API_KEY` / `EMAIL_FROM` / `RESEND_BASE_URL` delivery knobs; DEPLOYMENT.md §13's step 1 gets the SHIPPED strikethrough (the step-2/5 pattern). | MEDIUM (doc hygiene) | Phase 4 |

### Audit-surface note (the session-36 additions — THREE new probe families)

- **the unverified-login surface** (finding 1) — the ACCOUNT-STATE dimension
  of the login contract: whether the verified flag gates session minting.
  Probed through each site's OWN UI (the raw API is platform-walled on the
  live — the documented session-31 finding): UI signup → verify-view →
  UI signin with the same unverified credentials → observe the error
  surface + cookie set (live: error + zero cookies; clone: session minted).
- **the SMTP transport surface** (finding 2) — the DELIVERY dimension of
  the signup-verification contract: what carries the code to the user's
  inbox when real delivery is declared (nothing, pre-fix — the log line is
  the only channel). The route inventory + the drill's step list are the
  probe surface.
- **the web-vitals budget surface** (finding 3) — the PAINT dimension of
  the per-route performance contract (TTFB pinned by s35; FCP/LCP measured
  by s24, now converted): `performance.getEntriesByType("paint")` + the
  LCP PerformanceObserver on the production standalone.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the unverified-login gate (finding 1)

**Design**: `POST /api/auth/login` gains the account-state gate AFTER the
password verification (the order matters — checking `emailVerified` BEFORE
the scrypt compare would leak account existence + state to a wrong-password
caller; after it, only a caller who already knows the correct password
learns the state — zero new oracle surface, and the live shows the same
distinct message). Valid credentials + `emailVerified: false` → **403** with
the EXACT reference message (the semantically correct status: the
credentials are valid, the account state forbids the session; 401 stays the
bad-credentials family):

```json
{ "error": "Please verify your email before logging in. Check your email for the verification code." }
```

The `LoginForm.tsx` signin handler already renders `data.error` in the
card's `[role=alert]` area (verified: `handleSignIn` sets
`setError(data.error ?? "Invalid email or password")`) — the reference
error appears in the reference place with ZERO client changes. The seeded
demo user is `emailVerified: true` (the schema default), and every existing
e2e login either uses the demo user or verifies FIRST (the s34-epoch and
s35-revoke specs both run `signup → verify → cookie` before their fresh-login
controls — verified by reading both specs) — no existing spec breaks.

**RED unit** (`tests/unverified-login.test.ts`):
1. Source pin: the login route checks `user.emailVerified` AFTER the
   password-compare 401 gate (the order contract — no new enumeration).
2. Source pin: the exact reference message string + the 403 status.

**RED e2e** (the session-36 block):
1. signup (raw API) → login (raw API) → **403** + the exact message (the drift pin).
2. The UI parity pin: signup through the card → back to signin → submit the
   same credentials → the reference error renders in `[role=alert]` and NO
   navigation happens (stays on `/login`).
3. The control: verify (the any-code simulated default) → login → **200** (the
   verified path unaffected).

### Phase 2 — the mailer transport (finding 2 — the drill's step 1)

**Design**: `src/lib/mailer.ts` — a server-only, ZERO-NEW-DEPENDENCY
transport seam (the session-32 dependency-hygiene precedent; the drill names
"nodemailer, Resend, SES" as options — the Resend HTTP API is a plain
`fetch` POST, so the template ships the transport without growing the
install graph):

- `buildVerificationEmail(code)` → `{ subject, text, html }` (pure — the
  6-digit code embedded in a short plain-text + minimal-HTML body).
- `deliveryMode(env)` → `"simulated" | "resend" | "misconfigured"`:
  `AUTH_DELIVERY` unset/other → **simulated** (the dev/test default — the
  e2e any-code contract is untouched); `AUTH_DELIVERY=smtp` +
  `RESEND_API_KEY` set → **resend**; `AUTH_DELIVERY=smtp` without
  `RESEND_API_KEY` → **misconfigured** (fail LOUD — the session-33
  enforced-secret philosophy: an operator who declares real delivery must
  not silently swallow codes into a log users never read).
- `sendVerificationEmail(env, to, code, fetchImpl = fetch)`:
  - simulated → the EXACT existing log line
    (`[auth] verification code for <email>: <code> (simulated delivery)` —
    the s35 proof's log-grep pattern keeps working).
  - resend → `POST {RESEND_BASE_URL ?? "https://api.resend.com"}/emails`
    with the Bearer key + `{ from: EMAIL_FROM ?? "NexusLearn <onboarding@resend.dev>", to, subject, text, html }`;
    non-2xx or a network error → typed `MailerError`. `RESEND_BASE_URL`
    exists for testability (the end-to-end proof runs a local mock
    endpoint) — the Resend-official knob shape.
  - misconfigured → throws `MailerError`.
- **signup route wiring (BOTH branches)**: the two direct `console.info`
  calls become `await sendVerificationEmail(process.env, email, code)`;
  a `MailerError` returns **502** `{ error: "Email delivery is not configured. Please try again later." }`
  (the AI-route degrade shape) — the account row persists (the code hash +
  expiry already written), so the operator fixing the config + the card's
  Resend button recovers the user with a fresh code (the recovery story).
- **forgot-password stays the stub** (the drill's step 6 — reference
  parity: always-ok + no enumeration; documented as the operator's next
  step: the same transport + a `resetToken` column).

**RED unit** (`tests/mailer.test.ts`):
1. `buildVerificationEmail`: stable subject; the code present in text + html.
2. `deliveryMode` matrix: unset → simulated · `smtp`+key → resend ·
   `smtp` no-key → misconfigured · other values → simulated.
3. simulated send: the exact console.info line (spy), no fetch call.
4. resend send: the POST URL (default + `RESEND_BASE_URL` override), the
   Bearer header, the from/to/subject/body payload, 200 → resolves.
5. resend non-2xx → `MailerError`; fetch rejection → `MailerError`.
6. misconfigured → `MailerError` with the config-hint message.
7. Source pin: the signup route wires `sendVerificationEmail` in BOTH
   branches (create + unverified-resend).

**RED e2e**: the mailer itself is unit-pinned + proof-matrix-proven (the
e2e server runs the simulated default — no new e2e spec; the proof matrix
runs a dedicated `AUTH_DELIVERY=smtp` standalone against a local mock
endpoint and shows the wire POST + the wrong-code 400 + the real-code 200).

### Phase 3 — the web-vitals budget spec (finding 3)

**RED e2e**: per route (the 10-route standing set incl. `/CourseDetail?id=seed-1`),
on the e2e standalone (:3100): **FCP < 2000ms** and **LCP < 5000ms**
(measured 136–468ms FCP / 164–1432ms LCP → 4x+ / 3.5x+ headroom —
effectively unflakeable while catching the pathological regressions the
budget family exists for: a render-blocking asset regression, a giant
inlined payload, an LCP-image serving failure). Collected via the injected
PerformanceObserver (LCP) + a POLLED paint entry (FCP — the /login entry
can postdate the load event, measured at 224ms), median-of-2 passes, the
s34/s35 budget-spec shape.

### Phase 4 — docs alignment (findings 4 + 5)

AGENTS.md (gotcha 65 — the unverified-login gate + the mailer + the
web-vitals budget; the commands-table counts; Where-things-live), CLAUDE.md
(the API surface note + the pyramid counts + the email-delivery line),
README (badge + the session-36 paragraph + the env-var block for
`RESEND_API_KEY`/`EMAIL_FROM`/`RESEND_BASE_URL`), PAD ([S36] revision row +
§6 the login-gate story + §7 counts), SKILL.md (v3.24.0 + project_state),
DEPLOYMENT.md (§13 step 1 SHIPPED + the Resend wiring; §4 the env knobs),
`.env` + `.env.example` (the delivery block, commented at the simulated
default — byte-identical), the session logs + the worklog entry.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-35 tree re-verified).
2. [x] Standing parity audit green (heights/innerText/mobile/console).
3. [x] Fresh-eyes probes: family 1 (unverified-login drift) CONFIRMED,
   family 2 (no transport module) CONFIRMED, family 3 (vitals) MEASURED.
4. [ ] RED: the unit batteries + the e2e block → verified failing.
5. [ ] GREEN: the login-route gate; `src/lib/mailer.ts` + the signup
   wiring; the vitals spec.
6. [ ] GUARD: full gate re-run (lint → typecheck → test → build → test:e2e)
   + the standing parity surfaces re-verified AFTER the changes (the
   standard re-seed first) + the mobile battery re-run (the auth-route
   changes must perturb nothing visual).
7. [ ] The proof matrix (`docs/screenshots/api-session-s36.txt`: the
   unverified-login 403 matrix + the resend-mode wire proof against a
   local mock endpoint) + screenshots (the s36 capture matrix on the
   remediated dev server).

### Risk notes (validated against the codebase pre-execution)

- **The e2e suite's login surface**: every existing login either uses the
  seeded demo user (`emailVerified: true` by the schema default — the seed
  file needs NO change) or verifies FIRST (the s34-epoch spec at
  nexuslearn.spec.ts:4625 and the s35-revoke spec at :4784 both run
  `signup → verify → cookie` before their fresh-login controls — verified
  by reading both). The timing-oracle spec (s33) uses non-existent emails →
  401 unchanged. The oversized-email spec (s31) → 400 before the lookup.
- **The 403-vs-401 split**: the timing equalizer is untouched (both 401
  paths still pay the same scrypt); the 403 fires only after a SUCCESSFUL
  password compare — no new enumeration oracle (a wrong-password caller
  still gets the indistinguishable 401).
- **The mailer's simulated default keeps every existing spec green**: the
  playwright `webServer.env` sets `DATABASE_URL`/`AUTH_SECRET`/`NODE_ENV`/
  `PORT` only (verified: playwright.config.ts) — `AUTH_DELIVERY` stays
  unset → `deliveryMode → simulated` → the exact existing console.info
  line → the s35 log-grep proofs and the any-code e2e specs unchanged.
- **The signup route's persist-then-deliver order**: the code hash + expiry
  write (the session-35 contract) happens BEFORE the delivery attempt; a
  delivery failure (502) leaves a valid unverified row — the Resend button
  (the unverified-resend branch, which rewrites the credentials + code)
  is the documented recovery path.
- **The vitals spec's flake surface**: the LCP on image-heavy routes is
  remote-Unsplash-dependent — the 5000ms ceiling (measured worst 1432ms)
  absorbs the sandbox's documented sub-3s remote-image variance; the FCP
  poll (not a single read) covers the /login late-paint entry; medians (not
  single-shot) absorb one-off GC noise. The spec runs inside `workers: 1`
  — no cross-spec load.
- **The `@source not` set** (globals.css): no new source files under
  content paths — the mailer lives in `src/lib/` (already in the content
  tree? NO — it is a `.ts` module, not a content file; Tailwind's `@source`
  scans for template files, and no classes are added anywhere except the
  mailer's HTML email body which is NOT rendered in the app — the CSS-leak
  spec re-runs LAST per gotcha 41).
