# NexusLearn Remediation Plan — Session 34

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the production standalone on :3400 with the e2e-style env for
the bundle probe; the evidence files under `/home/z/my-project/scripts/s34-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-33 tree, commits
`423d18f` + `4dd3c58`): lint ✓ · typecheck ✓ · 106/106 unit ✓ · build ✓ ·
**300/300 e2e ✓** (6.2m). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env` — byte-identical to
`.env.example`, `db/custom.db` + `db/e2e.db` at the repo root after the
standard re-seed). The standing parity surfaces ALL re-verified at the
documented state: heights ×9 routes ×2 viewports **byte-exact 18/18**,
normalized innerText 18/18 identical, tag-of-shared-class drift 0, the
**mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg
text-white/80` byte-identical, 40×40 @ (319,12), open NAV 375×469, link
geometry y 81/129/177/225/273/321/369/417 — **NO Tailwind v4 bug**), console
sweep 9/10 clean (the 10th is the by-design 404 route).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The session-revocation / deleted-user surface (fresh-eyes family 1 — the session-33 suggested direction (a), the per-user epoch)**: `getSession()` verifies the HMAC signature + the session-32 iat bounds but NEVER re-validates the user against the database. A **deleted user's token authenticates for up to 7 days** (the iat window): verified end-to-end on the dev server — signup + verify a throwaway (minting a real cookie), DELETE the user row via the side-channel Prisma client, then re-present the SAME cookie to `/api/auth/me` → **200 + the full user object** (`s34-ghost-out.txt` probe [1f]). The write surface is protected by the schema's FK (`POST /api/enrollments` with the ghost token → 400 via the P2003 catch; zero orphan rows persisted — probe [1g]/[1j]), but every read surface serves ghost data: `/api/auth/me`, `GET /api/enrollments`, the `/Dashboard` RSC and the `/CourseDetail` personalization. The only revocation lever today is rotating the global `AUTH_SECRET` (kills EVERY user's session). The session-32 e2e control spec even PINS the ghost behavior (its "freshly-minted control" mints a token for a nonexistent `s32-stale-probe-user` and asserts 200 — the pin codified the blind spot, the session-33 lesson exactly). | HIGH | fix planned |
| 2 | **The per-route delivered-JS budget surface (fresh-eyes family 2 — the session-33 suggested direction (b), the recorded baseline converted into a spec)**: measured per-route delivered JS on the production standalone (10 routes, response-body sums): `/Courses` 662.3 KB (91% of the live's 727 KB SPA monolith), `/Contact` 657.0 KB, `/AIAssistant` 578.3 KB, `/Dashboard` 573.0 KB, `/CourseDetail` 569.6 KB, `/` 569.0 KB, `/Pricing` + `/About` + `/BecomeInstructor` 566.6 KB, `/login` 536.8 KB (74%). Every route UNDER the live ceiling — but nothing PINS it: an accidental heavy import into a shared chunk (the root layout, a shared component) would silently ship unbounded JS. | MEDIUM (guard) | spec planned |
| 3 | **The SMTP-transport drill (the session-33 suggested direction (c) — the PAD §10 known issue)**: the verify-code + reset flows deliver via `console.info` (simulated). The "wire real SMTP" hint exists but no concrete drill: WHERE the transport seam lives, WHAT to swap, HOW to keep the e2e suite green while doing it (the suite's signup/verify specs RELY on the any-code-verifies contract). | LOW (docs) | drill planned |
| 4 | **Documentation staleness (found during the doc-review phase)**: the counts across AGENTS.md / CLAUDE.md / README / PAD §7 will shift with the new specs (106 unit + 300 e2e → new totals); the PAD §6 security section has no revocation story; DEPLOYMENT.md has no operator revocation lever documented. | LOW | docs phase |

### Audit-surface note (the session-34 additions — THREE new probe families)

- **the session-revocation / deleted-user surface** (finding 1) — the
  DB-revalidation dimension of the session contract: what a token STILL
  grants after the underlying user row is gone. The probe: mint a real
  cookie (signup + verify), delete the user via the side-channel client,
  re-present the cookie to the auth + write surfaces.
- **the epoch-bump surface** (finding 1's fix companion) — the revocation
  WITHOUT deletion dimension: bump the user's `sessionVersion`, re-present
  an outstanding token → must null; re-login → must succeed (the fresh mint
  carries the new epoch). The control proves the mechanism is the epoch,
  not a broken account.
- **the per-route delivered-JS budget surface** (finding 2) — the footprint
  dimension as a per-ROUTE number (not the whole-chunk-pool): load every
  route on the standalone, sum the JS response bodies, compare against the
  live's 727 KB monolith ceiling. The spec pins the ceiling so accidental
  shared-chunk bloat trips a RED.

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — the per-user epoch + the DB re-validation (finding 1)

**Design**: `User.sessionVersion Int @default(0)` (the per-user epoch).
`createSessionToken(user, sessionVersion = 0)` embeds `ver` in the payload;
`verifySessionToken` returns `ver` (absent on pre-34 tokens → 0 — graceful
compat: outstanding tokens stay valid until the first bump). `getSession()`
(the Next adapter in `src/lib/auth.ts` — the pure `session.ts` stays
DB-free for the unit layer) re-validates on every read: ONE indexed
`findUnique` (select `email`, `name`, `sessionVersion`) — null when the user
is gone (the ghost probe), null when `user.sessionVersion !== token.ver`
(the epoch bump), and the session's `email`/`name` refresh from the DB (the
token's copies can go stale). The two minting routes (login + verify) pass
`user.sessionVersion`.

- **Backward compat**: pre-34 tokens carry no `ver` → verify as 0 → matches
  the schema default → still valid. No forced re-login wave.
- **Cost**: one indexed `findUnique` per authed request — the standard price
  of revocable sessions (the reference's JWT-in-localStorage has NO server
  check at all — deliberate-better hardening of the clone's own first-party
  contract, the same family as the session-32 iat bounds).
- **The operator lever**: `UPDATE User SET sessionVersion = sessionVersion + 1`
  kills every outstanding token for that user WITHOUT rotating the global
  AUTH_SECRET; deleting the user kills them too (documented in
  DEPLOYMENT.md).
- **The pin update**: the session-32 e2e control (the nonexistent
  `s32-stale-probe-user` mint) is UPDATED to mint for the REAL seeded demo
  user (looked up via the spec-side PrismaClient) — the control's intent
  ("a validly-signed fresh token authenticates") now carries the revocation
  contract: validly-signed AND the user exists AND the epoch matches.

**RED unit** (`tests/session-revocation.test.ts`):
1. `createSessionToken(user, 3)` embeds `ver: 3` in the decoded payload.
2. `createSessionToken(user)` embeds `ver: 0` (the default epoch).
3. `verifySessionToken` returns `ver: 3` for a ver-3 token.
4. `verifySessionToken` returns `ver: 0` for a pre-34 token (no `ver`
   field — the graceful-compat contract).
5. Source pin: `src/lib/auth.ts` `getSession` re-validates against the DB
   (`findUnique` + the `sessionVersion !== token.ver` null + the existence
   null).
6. Source pin: both minting routes pass the user's current
   `sessionVersion`.
7. Source pin: `prisma/schema.prisma` declares the epoch column
   (`sessionVersion Int @default(0)`).

**RED e2e** (the session-34 block, appended after the session-33 block):
1. The ghost-token spec: signup + verify a throwaway via the request API,
   capture the minted cookie, DELETE the user via the spec-side PrismaClient
   (the session-31 pattern), `/api/auth/me` → `user: null`.
2. The epoch-bump spec: signup + verify a throwaway, bump
   `sessionVersion` to 1 via the spec-side client, `/api/auth/me` →
   `user: null`; then a FRESH LOGIN with the same credentials → 200 + the
   user (the fresh mint carries ver=1 — the control).
3. The updated session-32 control: mint for the real demo user → 200 +
   that userId (was: a nonexistent ghost userId).

### Phase 2 — the per-route bundle-budget spec (finding 2)

**RED e2e**: load every route (the 9-route standing set + `/CourseDetail`
+ `/login` = the 10 measured routes) on the e2e standalone via a browser
context, sum the same-origin JS response bodies per route, assert `< 727 KB`
(the live's SPA monolith — the semantic ceiling: the clone must never
deliver more JS per route than the reference's monolith). The measured max
(`/Courses` 662.3 KB) leaves ~9% headroom — tight enough to catch a heavy
shared-chunk import, loose enough for routine chunk-hash jitter (sizes are
build-deterministic; the ceiling is the semantic anchor, not the current
max).

### Phase 3 — the SMTP-transport drill (finding 3 — docs only)

`docs/DEPLOYMENT.md` gains the operator drill: the seam (`src/app/api/auth/
signup/route.ts` + `verify/route.ts` — the `console.info` code log + the
any-code-verifies contract), the swap (a transport module + real code
comparison + the verify route's `emailVerified` write stays), and the test
impact (the e2e signup/verify specs rely on the simulated contract — guard
with an env flag or re-pin deliberately). The PAD §10 row updated to point
at the drill.

### Phase 4 — docs alignment (finding 4)

AGENTS.md (gotcha 63 + the commands-table counts + Where-things-live),
CLAUDE.md (the test-count lines + the session-34 families), README (badge +
testing lines + the session-34 paragraph), PAD ([S34] revision row + §6 the
revocation story + §7.1/§7.4 counts + §10 row + Last Updated), SKILL.md
(v3.22.0 + project_state + §2/§11), DEPLOYMENT.md (the revocation lever +
the SMTP drill), the session logs + the worklog entry.

---

## C. Execution order

1. [x] Baseline gates green (the shipped session-33 tree re-verified).
2. [x] Standing parity audit green (heights/innerText/tags/mobile/console).
3. [x] Fresh-eyes probes: family 1 (ghost) CONFIRMED, family 2 (budget)
    MEASURED, family 3 (SMTP) scoped.
4. [ ] RED: the unit battery + the e2e block + the session-32 control
   update → verified failing.
5. [ ] GREEN: the schema column (`db:push`), session.ts (ver embed/return),
   auth.ts (the DB re-validation), the two minting routes.
6. [ ] GUARD: full gate re-run (lint → typecheck → test → build →
   test:e2e) + the standing parity surfaces re-verified AFTER the changes
   (the standard re-seed first).
7. [ ] Screenshots (the s34 capture matrix on the remediated dev server).
8. [ ] Docs alignment (phase 4) + the gotcha-41 CSS-leak spec re-run LAST
   after every doc write.
9. [ ] Commit + SSH-wrapper push to main + the post-push session log.

## D. Risk table

| Risk | Mitigation |
|---|---|
| The `getSession` DB check slows authed RSC routes | One indexed `findUnique` on a ≤64-byte row (select 3 columns) — measured negligible on SQLite; the revocation contract is the documented deliberate-better trade |
| Pre-34 outstanding cookies invalidated | The `ver: 0` default + the schema default 0 keep them valid until the first bump |
| The e2e signup/verify throttle buckets (10/min each) | The new specs send 2 signup + 2 verify POSTs total; the existing suite sends ~4 signup + ~4 non-burst verify — under the thresholds even if fully colliding (the burst spec stays last) |
| The bundle spec flakes on chunk jitter | Sizes are build-deterministic (same build, same chunks); the 65 KB headroom absorbs any toolchain delta |
| The session-32 control update weakens the pin | The control's INTENT (a validly-signed fresh token authenticates) is preserved — it now ALSO carries the existence+epoch contract; the stale/future-iat specs are untouched (they assert null either way) |
| The schema `db:push` on a populated db | Additive column with a default — no data loss (`--accept-data-loss` is the standard flag, not an actual wipe here); the e2e global-setup re-pushes per run |
