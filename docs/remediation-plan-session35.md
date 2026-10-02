# NexusLearn Remediation Plan — Session 35

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the production standalone on :3400 for the TTFB probe; the
evidence files under `/home/z/my-project/scripts/s35-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-34 tree, commit
`7b07642`): lint ✓ · typecheck ✓ · 113/113 unit ✓ · build ✓ · **303/303 e2e ✓**
(5.7m). The environment contract re-verified (`DATABASE_URL="file:../db/custom.db"`
in `.env` — byte-identical to `.env.example`, `db/custom.db` at the repo root
after the standard re-seed; the db-url pollution guard correctly ignored the
sandbox's stale absolute shell export). The standing parity surfaces ALL
re-verified at the documented state: heights ×9 routes ×2 viewports
**byte-exact 18/18**, normalized innerText 18/18 identical, tag-of-shared-class
drift 0, the **mobile battery fully identical** (trigger
`md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12), open
NAV 375×469, link geometry y 81/129/177/225/273/321/369/417 — **NO Tailwind v4
bug**), console sweep 10/11 clean (the 11th is the by-design 404 route; the
login client-side transition also clean).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The verification-code persistence surface (fresh-eyes family 1 — the session-68 suggested direction (b), the first half of the DEPLOYMENT §13 SMTP drill)**: the signup route generates a 6-digit code, logs it via `console.info`, and **DISCARDS it** — the User row carries no `verificationCode`/`codeExpiresAt` columns at all (probe [2]: COLUMN ABSENT), and `POST /api/auth/verify` accepts **ANY complete 6-digit code** (probe [3]: the wrong code `000000` returned 200, minted the session cookie, and flipped `emailVerified: true`). The integrity gap: anyone can sign up with an email they do not own and "verify" it with a wrong code — the verified badge is decorative. The DEPLOYMENT.md §13 drill documents the swap: persist the code + expiry, compare for real (gated), keep the guards. | HIGH | fix planned |
| 2 | **The logout-everywhere lever surface (fresh-eyes family 2 — the session-68 suggested direction (a))**: the session-34 epoch lever (bump `User.sessionVersion`) exists ONLY as raw SQL in DEPLOYMENT.md §12 — no API route, no UX. An account owner who suspects a leaked cookie has no first-party way to revoke their own sessions. A pure-UI implementation would break the byte-exact /Dashboard parity contract (the live has no such surface — a beyond-reference UI addition); an **authed API route** adds the capability with ZERO visual footprint (the deliberate-better family: same reasoning as the functional enrollment). | MEDIUM | fix planned |
| 3 | **The per-route TTFB budget surface (fresh-eyes family 3 — the session-68 suggested direction (c))**: measured per-route TTFB on the production standalone (:3400, raw HTTP, 3 rounds): `/` 24ms · `/Home` 31ms · `/Courses` 24ms · `/Pricing` 14ms · `/About` 8ms · `/Contact` 15ms · `/BecomeInstructor` 13ms · `/AIAssistant` 7ms · `/Dashboard` 12ms · `/login` 12ms · `/CourseDetail` 12ms (medians). Every route fast — but nothing PINS it: an N+1 regression or a missing index would silently ship (the same reasoning that converted the s33 bundle baseline into the s34 budget spec). | MEDIUM (guard) | spec planned |
| 4 | **Documentation staleness (found during the doc-review phase)**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 will shift with the new specs (113 unit + 303 e2e → new totals); `.env.example` must document the new `AUTH_DELIVERY` gate; DEPLOYMENT.md §12 gains the API lever; §13's drill is now half-shipped (the persistence + comparison seam exists in code). | LOW | docs phase |

### Audit-surface note (the session-35 additions — THREE new probe families)

- **the verification-code persistence surface** (finding 1) — the STORAGE
  dimension of the signup-verification contract: whether the generated code
  survives the request (it did not), whether an expiry bounds it (it did
  not), and whether the verify route compares the submitted code against
  anything (it did not — the any-code contract). Probed via the spec-side
  PrismaClient (the s34 pattern) against the dev database.
- **the logout-everywhere lever surface** (finding 2) — the
  self-service-revocation dimension of the session-34 epoch contract: what an
  account OWNER can trigger without DB access (nothing, pre-fix). The API
  route inventory (`src/app/api/auth/`) is the probe surface.
- **the per-route TTFB budget surface** (finding 3) — the server-latency
  dimension of the per-route performance contract (the s33 bundle-baseline →
  s34 budget-spec precedent, now applied to TTFB): raw-HTTP time-to-first-byte
  per route on the production standalone, 3 rounds, medians.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the verification-code persistence (finding 1)

**Design**: `User.verificationCode String?` (an **HMAC-SHA256 hex hash** of
the code, keyed by the session secret — NOT the raw code: the house
security-hygiene style; a DB leak must not expose live codes) +
`User.codeExpiresAt DateTime?` (a 10-minute TTL). A new pure seam
`src/lib/verification.ts` (no Next imports — unit-testable like `session.ts`):
`generateVerificationCode()` (crypto-random 6 digits), `hashCodeForStorage(code,
secret)`, `codeExpiryFromNow(now?)`, `isCodeExpired(expiresAt, now?)`,
`codeMatches(stored, submitted, secret)` (timing-safe compare), and
`codeComparisonEnabled(env)` — the **`AUTH_DELIVERY=smtp` gate** (the drill's
step 5: the simulated path stays the dev/test default so the e2e any-code
specs stay green; an operator wiring real SMTP sets the flag and the real
comparison activates with zero code changes).

- **signup route** (both the create AND the unverified-resend branches):
  persist the hash + the expiry alongside the existing `console.info` log
  (the log stays — it IS the simulated delivery channel; the operator wiring
  SMTP swaps it for the transport per the drill).
- **verify route**: when `codeComparisonEnabled(process.env)`: reject
  wrong/expired/missing codes with the house `{ error: "Invalid verification
  code" }` 400; on success clear BOTH fields (the drill's step 3) and keep the
  `emailVerified: true` write. When simulated (the default): keep the
  documented any-code contract, but still CLEAR the fields on success (the
  persistence housekeeping).
- **Schema impact**: additive, nullable — the seed (verified users, no codes)
  needs no change; `db:push` only.

**RED unit** (`tests/verification-code.test.ts`):
1. `generateVerificationCode()` returns a 6-digit numeric string (100 draws).
2. `hashCodeForStorage` is deterministic + distinct per code + distinct per secret.
3. `codeMatches` accepts the right code, rejects a wrong code.
4. `codeExpiryFromNow` lands ~10 minutes out; `isCodeExpired` flips at the boundary.
5. `codeComparisonEnabled`: unset → false; `AUTH_DELIVERY=smtp` → true; any other value → false.
6. Source pin: the signup route persists the hash + expiry in BOTH branches.
7. Source pin: the verify route compares + clears (the gated block + the unconditional clear).
8. Source pin: `prisma/schema.prisma` declares both columns.

**RED e2e** (the session-35 block):
1. After a real signup, the spec-side DB shows `verificationCode` SET (non-null) + `codeExpiresAt` ~10 minutes out (the persistence pin).
2. After the any-code verify (the simulated default), both fields are CLEARED (null) + `emailVerified: true` (the housekeeping pin).
3. The existing any-code signup/verify spec stays green UNCHANGED (the simulated contract — the gate's default).

### Phase 2 — the revoke-sessions route (finding 2)

**Design**: `POST /api/auth/revoke-sessions` — an AUTHED route (the
session-31 deliberate-unthrottled family). `getSession()` → 401 when absent;
otherwise ONE indexed `update({ data: { sessionVersion: { increment: 1 } } })`
bumps the epoch (killing EVERY outstanding token for the caller, per the s34
contract) and the response clears the cookie with the s32
attribute-symmetric deletion form (`{ ...sessionCookieOptions, maxAge: 0 }`).
Returns `{ ok: true }`. Zero visual footprint — the byte-exact parity contract
is untouched (the UI affordance is deliberately DEFERRED: any Dashboard/login
surface addition would break the pinned heights; documented for a future
beyond-reference decision).

**RED e2e**: sign in as the demo user → capture the cookie → POST
revoke-sessions → 200 + the cookie no longer authenticates (`/api/auth/me` →
`user: null`) → a FRESH login succeeds (the control — the account survives,
only the sessions die).

**RED unit**: source pin — the route bumps `sessionVersion` + clears the
cookie symmetrically + 401s without a session.

### Phase 3 — the per-route TTFB budget spec (finding 3)

**RED e2e**: per route (the 10-route standing set + `/CourseDetail`), median
of 3 raw-HTTP TTFB reads on the e2e standalone (:3100) must stay **< 500 ms**
(the measured 7–31ms medians leave 16–70× headroom — effectively unflakeable
while still catching the pathological regressions the budget exists for: an
N+1 query storm, a missing index, a synchronous external call in a render
path). Raw Node `http` (the s27 pattern — the playwright request fixture
cannot isolate TTFB from full-body time).

### Phase 4 — docs alignment (finding 4)

AGENTS.md (gotcha 64 — the verification-code persistence + the AUTH_DELIVERY
gate + the revoke-sessions route + the TTFB budget; the commands-table counts;
Where-things-live), CLAUDE.md (the pyramid counts + the session-35 families),
README (badge + the session-35 paragraph + the env-var table row for
`AUTH_DELIVERY`), PAD ([S35] revision row + §6 the verification/revocation
story + §7 counts), SKILL.md (version bump + project_state), DEPLOYMENT.md
(§12 the API lever alongside the SQL; §13 the drill's shipped first half),
`.env.example` (the `AUTH_DELIVERY` gate, commented at the simulated default),
the session logs + the worklog entry.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-34 tree re-verified).
2. [x] Standing parity audit green (heights/innerText/mobile/console).
3. [x] Fresh-eyes probes: family 1 (code persistence) CONFIRMED, family 2
   (revoke lever) CONFIRMED (no route exists), family 3 (TTFB) MEASURED.
4. [ ] RED: the unit battery + the e2e block → verified failing.
5. [ ] GREEN: the schema columns (`db:push`), `src/lib/verification.ts`, the
   signup/verify route wiring, the revoke-sessions route.
6. [ ] GUARD: full gate re-run (lint → typecheck → test → build → test:e2e)
   + the standing parity surfaces re-verified AFTER the changes (the
   standard re-seed first) + the mobile battery re-run (the auth-route
   changes must perturb nothing visual).
7. [ ] Screenshots (the s35 capture matrix on the remediated dev server).

### Risk notes (validated against the codebase pre-execution)

- **The e2e any-code contract**: the playwright `webServer.env` sets
  `DATABASE_URL`/`AUTH_SECRET`/`NODE_ENV`/`PORT` only — `AUTH_DELIVERY` is
  unset → the simulated default holds → the existing signup/verify specs stay
  green with zero edits (verified: `playwright.config.ts`).
- **The schema push is additive** (nullable columns) — no seed change, no
  migration of existing rows (the seeded demo user carries `null` codes,
  irrelevant: `emailVerified: true` skips the flow).
- **The verify-route guard stack survives**: the throttle-first + 413 +
  field-cap order is untouched (the comparison inserts AFTER the user lookup;
  the s33 source pin `tests/api-guard-source.test.ts` asserts the SEVEN-route
  public-POST set — the new revoke-sessions route is AUTHED, not public, so
  the pin is unaffected; re-verified by reading the pin).
- **The timing surface**: the verify route gains an HMAC (microseconds) —
  the s33 scrypt-timing floor spec is unaffected (the floor is the login
  route's scrypt compare, untouched).
- **The TTFB spec's placement**: it runs against the e2e standalone while
  `workers: 1` serializes the suite — no cross-spec load; medians (not
  single-shot) absorb the one-off GC/compile noise.
