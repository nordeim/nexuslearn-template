# NexusLearn Remediation Plan — Session 33

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; two additional production-standalone probe instances on
:3200 (with the e2e secret) and :3300 (deliberately secretless) booted with
the exact Playwright webServer env; raw fetch for the API-level probes; the
evidence files under `/home/z/my-project/scripts/s33-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-32 tree, commits
`bb05da8` + `e0e5af9`): lint ✓ · typecheck ✓ · 92/92 unit ✓ · build ✓ ·
**296/296 e2e ✓** (5.4m). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` + `db/e2e.db`
at the repo root; `.env.example` byte-identical; vitest + playwright configs
verified against the codebase). The standing parity surfaces ALL re-verified
at the documented state: heights ×9 routes ×2 viewports **byte-exact 18/18**
(after the standard re-seed), normalized innerText 18/18 identical,
tag-of-shared-class drift 0, the **mobile battery fully identical** (trigger
`md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12),
open NAV 375×469, link geometry y 81/129/177/225/273/321/369/417 — **NO
Tailwind v4 bug**), console sweep 9/10 clean (the 10th is the by-design 404
route).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The verify-route guard surface (fresh-eyes family 1 — the seventh-public-POST-route probe)**: `POST /api/auth/verify` — the signup-verification route that **MINTS the session cookie** (it signs the user in on verify) — escaped the session-31 guard net entirely: NO rate limiter, NO body-size pre-check, NO field cap. Verified at the API level on the production standalone: a >1MB JSON body is **parsed** (400 `Invalid verification code`, not the guarded 413); a 100KB email (no spaces, one `@`) passes the regex and **reaches the DB lookup un-capped**; a 14× rapid burst returns **14× 200 — every request verifies the account AND sets a session cookie** (zero 429s), while the same burst against `/api/auth/login` on the same server trips the throttle (the control — the machinery exists). The session-31 source pin (`tests/api-guard-source.test.ts`) asserts the guarded set is EXACTLY six routes — the pin itself codified the blind spot. The live reference's signup/verify is platform-walled (session-31's platform-wall rule), so this is not a parity gap — it is an internal-consistency gap in the clone's own guard contract. | HIGH (guard-net completeness) | **FIX — wire all three guards + re-pin to seven** |
| 2 | **The login-timing enumeration surface (fresh-eyes family 2 — the timing side-channel probe)**: the login 401 path leaks **user existence through response timing**. When the email does not exist, the route short-circuits (`!user \|\|` → no scrypt) in **~6ms median**; when the user exists but the password is wrong, `verifyPassword` burns scryptSync (~30ms measured standalone) for a **~35ms median** — a **29ms drift, 12/12 sample pairs cleanly separated by ~5×**. A remote attacker enumerates valid emails by timing login responses (the reference's own login is platform-walled, so no parity dimension — this is the clone's own first-party auth hygiene, the same family as the no-enumeration design already shipped in `/api/auth/forgot-password`). | MEDIUM (user enumeration via timing oracle) | **FIX — the timing-equalizer dummy scrypt + PIN** |
| 3 | **The production AUTH_SECRET posture (fresh-eyes family 3 — the forgeable-fallback probe)**: `getSecret()` in `src/lib/session.ts` falls back to the constant `"nexuslearn-dev-only-insecure-secret"` — **which ships in the public repo source** — whenever `AUTH_SECRET` is unset or shorter than 16 chars, and in production (`NODE_ENV=production`) the only signal is a `console.warn` that is trivially missed in deployment logs. Verified end-to-end on a deliberately secretless production standalone (:3300): a token **forged with nothing but the public repo constant is ACCEPTED by `GET /api/auth/me`** (200 + the seeded demo user returned — complete authentication forgery), while the identical forged token is correctly rejected by the control server that has a real secret (:3200). The `.env.example` says "REQUIRED in production" — but the code only *documents* the requirement, it does not *enforce* it (the session-32 lesson: a browser-side promise is not an enforcement; here: a log line is not an enforcement). | HIGH (authenticity bypass on misconfigured deploys) | **FIX — fail-fast `resolveSessionSecret()` + typed rethrow** |
| 4 | **The bundle-size/dependency-count surface (fresh-eyes family 4 — record-only)**: the live reference delivers **727 KB of JS on every route** (one SPA app bundle, measured via response bodies on `/`, `/Courses`, `/Dashboard`, `/AIAssistant`); the clone's standalone client chunk pool is **22 files / 766 KB total**, but routes load only their needed subset (Next.js RSC code-splitting), so per-route delivery is strictly lower than the live's monolith. Recorded as the baseline for any future budget pass — no action this session (no drift, no bug). | — (recorded baseline) | **RECORDED** |
| 5 | **Documentation staleness (found during the doc-review phase — 12 items)**: CLAUDE.md's e2e bullet still says "291 specs total" (session-31 era; the commands block says 296); PAD §7.1 Test Distribution is stale at the session-28 state (44+272, missing the session-29–32 rows); PAD's [S31]/[S32] rows sit at the file tail after the Glossary instead of the revision block (and "Last Updated: 2026-09-27" predates them); SKILL.md's frontmatter `description` carries session-28 counts ("41 unit + 266 e2e"); SKILL.md §11 Pre-Ship Checklist carries early-session counts ("32/32 unit", "68/68 e2e"); SKILL.md §2 still says "npm works with package-lock.json" (removed in session 32); `next/font` references survive in README + PAD (4 spots) despite the session-14 font-bundle removal; PAD §3.2's tests listing is ancient (6/28 specs, only auth.test.ts); the mobile-nav "10 guards" vs "12 specs" terminology is inconsistent across docs; PAD's glossary says "26 computed-style assertions" vs §7.1's 32; DEPLOYMENT.md's section numbering differs from the worklog's reference. | LOW (docs) | **FIX — align during the docs phase** |

### Audit-surface note (the session-33 additions — FOUR new probe families)

- **the seventh-public-POST-route surface** (finding 1) — the
  completeness dimension of the guard contract: enumerate EVERY route that
  both accepts public POSTs AND mints/changes auth state, not just the six
  the pin happened to list. The probe matrix: body-size pre-check, field-cap
  coverage, burst throttle, and the mint-side effect (Set-Cookie on every
  burst request).
- **the timing-enumeration surface** (finding 2) — the side-channel
  dimension of the auth contract: what the 401 path LEAKS through latency
  (user-exists vs user-doesn't). The probe: interleaved medians on a fresh
  server (the throttle bucket must be EMPTY — a poisoned bucket short
  -circuits to the 1-2ms 429 path and silently voids the measurement).
- **the forgeable-fallback surface** (finding 3) — the enforcement
  dimension of the secret contract: what a misconfigured production
  deployment actually ACCEPTS. The probe: boot a second standalone WITHOUT
  the secret, forge a token with the public repo constant, and ask
  `/api/auth/me` — plus the control (a secret-bearing twin) to prove the
  forgery is secret-dependent, not accidental.
- **the bundle-size surface** (finding 4) — the footprint dimension:
  delivered JS per route (live) vs the client chunk pool (clone). Recorded,
  not actioned.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the verify-route guards (finding 1)

**Design**: `RATE_LIMITS` gains `verify: 10` (signup's sibling — the UI
sends exactly one verify per signup; the whole existing e2e suite sends
exactly ONE `/api/auth/verify` POST (the session-5 UI flow) → 10× headroom,
matching the session-31 threshold discipline). The route wires the
session-31 pattern verbatim: **limiter first** (the cheap rejection), then
the 413 body-size pre-check, then parse + the email field cap (the `code`
field is already bounded exactly by its `^\d{6}$` regex — no new
FIELD_LIMITS entry needed).

- **RED unit**: `tests/api-guard-source.test.ts` — the ROUTES map gains
  `POST /api/auth/verify`; the exact-set assertion becomes the **seven**
  public POST routes (`ai/chat`, `auth/forgot-password`, `auth/login`,
  `auth/signup`, `auth/verify`, `contact`, `newsletter`); the count 6 → 7.
- **RED e2e** (the session-33 block, appended after session-32's): a
  >1MB verify body → **413** (today: 400 parsed); a 100KB email → **400
  `Email is too long`** (today: reaches the DB lookup); the 11× verify
  burst → **at least one 429** (today: all 200) — positioned **LAST** in
  the block (the bucket-isolation rule: the burst poisons the verify
  bucket; nothing after it touches verify).
- **GREEN**: `src/lib/rate-limit.ts` (+`verify: 10`) +
  `src/app/api/auth/verify/route.ts` (limiter → 413 pre-check → parse →
  email cap, mirroring forgot-password's shape).
- **GUARD**: the source pin + the e2e pins.

### Phase 2 — the login timing equalizer (finding 2)

**Design**: `src/lib/session.ts` exports
`TIMING_EQUALIZER_PASSWORD` (a fixed constant) and
`timingEqualizerHash()` (lazily computed ONCE, cached — the scrypt hash of
the constant; ~30ms on first miss, zero thereafter). The login route
changes `!user || !verifyPassword(...)` to always burn the compare:
`const passwordOk = verifyPassword(password, user?.passwordHash ??
timingEqualizerHash());` — both paths now pay the same scrypt cost; the
response timing flattens (no DB row on the miss path, but the ~30ms crypto
dominates and equalizes).

- **RED unit** (`tests/login-timing-source.test.ts`, new): the equalizer
  hash shape (`^[0-9a-f]{32}:[0-9a-f]{128}$` — a real scrypt salt:hash);
  `verifyPassword(TIMING_EQUALIZER_PASSWORD, timingEqualizerHash())` is
  true; cached (repeat calls identical); the login-route source pin (must
  reference `timingEqualizerHash()` on the not-found path via
  `user?.passwordHash ?? timingEqualizerHash()`).
- **RED e2e**: the no-user 401 burns password-compare time — median of 7
  requests ≥ **12ms** (today: ~6ms median; post-fix: ~30ms — the floor is
  set between them, robust on both sides; scrypt's default params are
  memory-hard (16 MiB), so the floor holds on faster hardware).
- **GREEN**: implement the exports + the login-route change.
- **GUARD**: the unit source pin + the e2e floor.

### Phase 3 — the production AUTH_SECRET enforcement (finding 3)

**Design**: `src/lib/session.ts` exports a PURE
`resolveSessionSecret(env: { NODE_ENV?: string; AUTH_SECRET?: string }):
string` — returns the secret when present and ≥ 16 chars; **throws
`SessionSecretError`** (a typed Error subclass) when `NODE_ENV ===
"production"` and the secret is unset/short; returns the documented dev
fallback constant otherwise (dev/test keep the zero-config story —
`next dev` and vitest are unaffected). `getSecret()` delegates to it. The
typed error exists because the login + verify routes wrap their bodies in
`catch → 400 "Invalid request"` — a plain throw would be **muted into a
generic 400**; the two minting routes rethrow `SessionSecretError` so the
misconfigured deployment fails LOUD (500 + the actionable message in logs).
No other route mints; `getSession()` callers (RSC pages, me, enrollments,
progress) have no catch-all — the throw propagates naturally. The
anonymous path is unaffected (`verifySessionToken` returns null BEFORE
`getSecret()` when no cookie is present — public pages keep rendering;
only cookie-bearing/auth-using requests fail fast, exactly where a smoke
test looks).

- **RED unit** (`tests/secret-enforcement.test.ts`, new):
  production+unset → throws `/AUTH_SECRET/`; production+short → throws;
  production+valid (32 chars) → returns it; non-production+unset → the dev
  fallback constant; the error class is exported and `instanceof Error`.
- **GREEN**: implement `SessionSecretError` + `resolveSessionSecret` +
  the `getSecret` delegation; the typed rethrow in login + verify routes'
  catch blocks.
- **GUARD**: the unit battery. `.env` + `.env.example` comment updated
  IDENTICALLY (the enforced-contract wording) — no new env var, byte
  -identity preserved.
- **Risk accepted by design**: a local `bun run start` with an empty
  `AUTH_SECRET` now fails auth requests loudly (the documented REQUIRED
  becomes enforced — the README/DEPLOYMENT quickstart wording updated to
  match). `next build` never evaluates the check (no module-load throw —
  builds stay secret-free); `next dev` and vitest keep the fallback.

### Phase 4 — documentation alignment (finding 5 + the session record)

- `AGENTS.md`: gotcha 62 (the three session-33 fixes + the
  poisoned-bucket timing-probe lesson), the commands-table counts, the
  Where-things-live lib line (`session.ts` gains the equalizer +
  `resolveSessionSecret`).
- `CLAUDE.md`: fix the stale "291 specs total" e2e bullet (the full
  current pyramid + the session-32/33 pin families).
- `README.md`: badge + testing block counts + the session-33 paragraph +
  the stale "Inter (next/font)" Design-System line.
- PAD: **move [S31]/[S32] into the revision block** + add [S33]; rebuild
  §7.1's distribution table through session 33; §7.4 counts; purge the
  4 `next/font` references; fix §3.2's tests listing; refresh "Last
  Updated"; normalize the 26-vs-32 computed-style wording.
- SKILL: version bump (→ 3.21.0) + frontmatter `description` counts +
  `project_state` + §2 counts + the npm/package-lock.json line + §11
  pre-ship checklist counts.
- `docs/DEPLOYMENT.md`: the AUTH_SECRET enforcement note + the verify
  throttle entry (+ the section-numbering sanity).
- This plan + `docs/session_64.md` (retrospective) +
  `docs/session_65.md` (transcript) + the worklog entry.
- **Gotcha 41**: the CSS-leak spec re-runs LAST after every doc write.

### Phase 5 — screenshots + env verification

- Re-capture the standard route set (desktop + mobile) under
  `docs/screenshots/`; the session-33 proof artifact
  (`api-session-s33.txt`: the verify-burst all-200 matrix → the 429
  tripping, the 1MB 400→413, the 100KB-email DB-reach → the field-cap
  400, the 29ms timing drift → the flattened medians, the forged-token
  acceptance on the secretless server + the control rejection) as the
  textual evidence trail.
- Re-verify `.env.example` stays byte-identical to `.env` (comment-only
  change, both files together).

### Phase 6 — the gate + ship

`bun run lint && bun run typecheck && bun run test && bun run build && bun
run test:e2e` → commit (main only) → push via `docs/ssh_git_wrapper_v3.py`
→ the post-push session-log commit (`docs/session_66.md`, the final
summary) → push again.

---

## C. Risk assessment

| Risk | Mitigation |
|---|---|
| The verify throttle breaks the existing signup e2e flow | The entire suite sends exactly ONE `/api/auth/verify` POST (the session-5 UI verify, line ~703) — 10× headroom under the 10/min limit. The session-33 burst spec runs LAST (bucket isolation) so its 11 poisoned requests can't affect the earlier UI flow even within the same fixed window. |
| The timing e2e floor flakes on fast/slow machines | The floor (12ms) sits between the measured pre-fix (~6ms) and post-fix (~30ms) medians with ≥ 2× margin on both sides; the assertion uses the median of 7; scrypt's default parameters are memory-hard so the post-fix cost can't realistically fall below the floor. |
| The timing e2e is poisoned by the login throttle (the probe lesson) | The spec sends 7 requests (plus the suite's ~7 other logins — total ~14 < the 30/min login limit); each request that hits the real path (not 429) burns the scrypt; a 429 short-circuit would return in ~2ms and fail the assertion loudly rather than silently passing — detected, not masked. |
| `resolveSessionSecret` breaks `next build` | The check runs at REQUEST time (inside `getSecret`), never at module load — the build (NODE_ENV=production, no secret) never evaluates it; verified: no module-level `getSecret` call exists, and the prerendered routes (robots/sitemap) never touch auth. |
| `resolveSessionSecret` breaks local production demos (`bun run start` with empty AUTH_SECRET) | By design — the enforced contract. The failure is loud, actionable (the message names the fix: `openssl rand -hex 32`), and lands exactly where a smoke test looks (login 500s); the README/DEPLOYMENT wording is updated to state the enforcement. Dev (`next dev`) and tests (vitest, NODE_ENV=test) keep the documented fallback. |
| A plain `getSecret` throw is muted by the route catch-alls into a generic 400 | The `SessionSecretError` typed rethrow in the two minting routes (login + verify) — the only routes that call `createSessionToken` inside a try. All `getSession()` callers have no catch-all (verified: me, enrollments, progress call it outside/before any try; RSC pages propagate naturally; logout never verifies; ai/chat never sessions). |
| The equalizer dummy hash leaks a usable credential | It is the hash of a public constant used ONLY to burn cycles — possession of the hash grants nothing (there is no "login as the equalizer" surface: the hash is never stored as a user's passwordHash and the login route only compares against rows from the DB or this constant). |
| The re-pinned seven-route source pin over-constrains future routes | The pin's exact-set assertion is the documented house pattern (session 31); a future 8th public POST route updates the pin consciously — which is exactly the discipline that caught finding 1 (the pin says "everything public is here", so new public routes MUST touch it). |
| Doc writes leak CSS rules into the compiled CSS (gotcha 41) | The session-14 leak spec re-runs LAST after every doc write (the standing rule). |

**Pre-execution validation**: every file this plan touches was read and
cross-checked this session (`src/lib/session.ts` in full, the login +
verify + forgot-password + me + logout + signup + ai/chat + enrollments +
progress routes, `src/lib/rate-limit.ts` RATE_LIMITS, `src/lib/auth.ts`,
`tests/api-guard-source.test.ts`, the e2e spec's session-5 verify flow +
tail blocks, `playwright.config.ts` webServer env, `.env` + `.env.example`
byte-identity). The e2e verify-POST census (exactly 1) and the login-POST
census (~7) were measured against the proposed thresholds. No existing spec
asserts on any shape being changed: the verify route's error-priority for
oversized/uncapped bodies (413/`Email is too long` ahead of the
user-lookup 400), the login 401 body (unchanged), or the dev-fallback
behavior under non-production NODE_ENV (unchanged).
