# NexusLearn Remediation Plan — Session 32

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100 booted with
the exact Playwright webServer env; raw fetch for the API-level probes; the
evidence files under `/home/z/my-project/scripts/s32-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-31 tree, commit
`dc1b2e2` on top of the pushed `dfc9f14`): lint ✓ · typecheck ✓ · 77/77 unit
✓ · build ✓ · **291/291 e2e ✓** (5.4m). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` + `db/e2e.db`
at the repo root; `.env.example` byte-identical; vitest + playwright configs
verified against the codebase).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The auth-session-lifetime surface (fresh-eyes family 1 — the session-lifetime/cookie-hardening probe)**: the server NEVER enforces the session's advertised 7-day lifetime. `verifySessionToken` (`src/lib/session.ts`) decodes the payload but ignores the embedded `iat` — the token's MAC is the ONLY validity criterion. Verified at the API level on the dev server: a token re-signed with the same secret but `iat` shifted **30 days into the past** → `GET /api/auth/me` returns the user **PRESENT**; shifting `iat` 10 years back would equally pass. The 7-day limit exists ONLY in the browser cookie jar (`maxAge: 604800` on `nexus_session`): a restored/backed-up/exported cookie, or any client that ignores cookie expiry, authenticates FOREVER. A leaked token (log dump, XSS-read in less-HttpOnly times, backup file) is unrevocable-by-time. The live reference stores its JWT in **localStorage** (`token`, `base44_access_token` — probed; no Set-Cookie at all, no server-visible expiry either), so this is NOT a parity gap — it is a template-hardening gap in the clone's own first-party-cookie contract, the same deliberate-better family as the session-31 rate limiter. | HIGH (auth-integrity) | **FIX — server-side iat bounds + PIN** |
| 2 | **The future-`iat` / clock-skew direction of finding 1**: a token whose `iat` lies in the FUTURE (crafted, or minted on a skewed clock) is accepted without bound — the same unbounded-trust hole in the other direction. Verified: `iat` = now + 24h → user PRESENT. | MEDIUM | **FIX — fold into the finding-1 guard (60s skew tolerance)** |
| 3 | **The logout deletion-cookie attribute asymmetry**: `POST /api/auth/logout` clears with `nexus_session=; Path=/; Max-Age=0` — omitting the `HttpOnly`/`SameSite=Lax`/`Secure` attributes the login cookie carries (`sessionCookieOptions`). RFC 6265 identifies a cookie by name+domain+path so deletion works in practice, but attribute-symmetric deletion is strict cookie hygiene and some embedded browsers/proxies behave unexpectedly with asymmetric Set-Cookie pairs. | LOW | **FIX — spread `sessionCookieOptions` with `maxAge: 0`** |
| 4 | **The dependency-audit surface (fresh-eyes family 2 — `bun audit` + lockfile hygiene)**: `bun audit` flags **1 HIGH**: `deepmerge-ts < 8.0.0` — "stack exhaustion when merging recursive object graphs" (GHSA-ggr8-5vv4-36mx), via `prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5` (exact-pinned; no patched 7.x exists; prisma 8 is RC-only). The vulnerable path is CLI-time config merging (`@prisma/config`'s `deepmerge` for c12 config loads — operator-controlled input, never reachable from the app's HTTP surface; `@prisma/client` the server uses does not depend on it) — real-world exploitability ≈ nil, but the fix is cheap and the scanner verdict is HIGH. deepmerge-ts v8.0.2 keeps the exact `deepmerge` named export `@prisma/config` uses, has zero dependencies, engines node ≥ 16. | MEDIUM (scanner HIGH / runtime ≈ nil) | **FIX — bun `overrides` → `^8.0.2` + PIN** |
| 5 | **Stale `package-lock.json` shipped at the repo root**: committed at the scaffold era (`e0e2aef`/`d2b006e`) and never updated — it predates later-added devDependencies (verified: `@axe-core/playwright` present in `package.json` but MISSING from the lock). `AGENTS.md` is explicit that **`bun.lock` is authoritative**; a stale second lockfile actively misleads npm-using contributors into installing wrong versions. | LOW (repo hygiene) | **FIX — `git rm package-lock.json` (bun.lock stays)** |
| 6 | **The AI-chat aria-live politeness surface (fresh-eyes family 3 — the a11y announcement dimension)**: NEITHER site exposes any `aria-live`/`role=status|log|alert` surface on `/AIAssistant` (probed both, static + mid-thinking): the "Thinking..." transient and every assistant answer are INVISIBLE to screen readers — a blind learner gets no feedback that anything happened after pressing Enter. The live ships none either (so not a parity gap); the clone already ships deliberate aria-label hardening on the composer (`aria-label="Ask a question"`) + send button (`aria-label="Send message"`) from earlier sessions — this is the same deliberate-better WCAG family: invisible to the class/height/innerText/tag parity surfaces. | — (deliberate-better hardening) | **FIX — `aria-live="polite"` messages region + `role="status"` thinking bubble + PIN** |
| 7 | **Documentation staleness (found during the doc-review phase)**: `README.md`'s Testing code block still says 53 unit + 278 e2e (session-29-era; badge says 368); PAD §7.4 pre-PR checklist shows 31/31 + 141/141 (session-6-era); PAD §3.2/ADR-002 still describes `/Home` as "redirect → /" (superseded by session 10's renders-landing-directly behavior); `nexuslearn-template_SKILL.md` §2's test-inventory paragraph carries 31 + 155 (frontmatter `project_state` is current). | LOW (docs) | **FIX — align during the docs phase** |
| 8 | **Every standing surface re-verified at the documented session-31 state**: the full baseline gate (lint, typecheck, 77/77 unit, build, **291/291 e2e**); **heights ×9 routes ×2 viewports byte-exact 18/18** (after the standard re-seed); normalized innerText 18/18 identical; tag-of-shared-class drift 0 (the SVG-subtree-skip methodology); **the mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12), open NAV 375×469, link geometry y 81/129/177/225/273/321/369/417 — **NO Tailwind v4 bug**); console sweep 9/10 CLEAN (the 10th is the by-design 404 route). | — (the standing record) | **RECORDED** |

### Audit-surface note (the session-32 additions — THREE new probe families)

- **the auth-session-lifetime / cookie-hardening surface** (findings 1–3) —
  the time dimension of the session contract: what the browser jar enforces
  (`maxAge`) vs what the SERVER enforces (previously: nothing). The probe
  matrix: cookie attribute census on login (both sites), the live's storage
  mechanism (localStorage — confirmed), stale-iat acceptance, future-iat
  acceptance, malformed/no-iat acceptance, mangled-signature rejection
  (control — correctly null), logout deletion-attribute symmetry.
- **the dependency-audit surface** (findings 4–5) — `bun audit` over the
  resolved tree + lockfile-consistency checks (which lockfile is authoritative,
  does it match `package.json`, is a second stale lockfile shipped).
- **the aria-live politeness surface** (finding 6) — the announcement
  dimension of the a11y contract: what a screen reader is TOLD when async
  state changes (the same dimension the aria-label family covered for
  controls).

---

## B. The fix plan (TDD — RED → GREEN → GUARD for every source change)

### Phase 1 — server-side session lifetime enforcement (finding 1 + 2)

**Design**: the constants move to the pure module `src/lib/session.ts`
(the only place both the cookie adapter and the verifier can share):
`SESSION_MAX_AGE` (7 days, seconds — unchanged cookie value),
`SESSION_MAX_AGE_MS`, `SESSION_CLOCK_SKEW_MS` (60s). `verifySessionToken`
gains, after the existing HMAC + shape checks: `iat` must be a finite
number; `iat` must not exceed `now + skew` (future bound); `now - iat` must
not exceed `SESSION_MAX_AGE_MS` (stale bound). `src/lib/auth.ts` re-exports
`SESSION_MAX_AGE` (single source of truth; `sessionCookieOptions` unchanged).

- **RED unit** (`tests/session-lifetime.test.ts`, new): fresh token
  verifies; 6d23h-old verifies; **8d-old → null**; 7d+1h → null; **future
  +2min → null**; future +30s (within skew) verifies; **missing iat →
  null**; malformed (string) iat → null; `SESSION_MAX_AGE === 604800` pin.
- **RED e2e** (session-32 block, `tests/e2e/nexuslearn.spec.ts`): mint a
  30d-stale token with the e2e `AUTH_SECRET` (known: `playwright-e2e-
  session-secret` from `playwright.config.ts` webServer env) → `GET
  /api/auth/me` body `user` must be `null`; mint a fresh token with the
  same payload → `user` PRESENT (the control proving the mint is faithful);
  mint a future+2min token → `user` null.
- **GREEN**: implement the bounds in `src/lib/session.ts` + the re-export
  in `src/lib/auth.ts`.
- **GUARD**: the unit suite pins the boundary; the e2e pins the wire
  behavior.

### Phase 2 — logout deletion-cookie attribute symmetry (finding 3)

- **RED e2e**: `POST /api/auth/logout` → the `set-cookie` header must carry
  `HttpOnly`, `SameSite=Lax`, `Max-Age=0`, `Path=/` together.
- **RED source pin** (`tests/logout-cookie-source.test.ts`, new): the
  logout route source must spread `sessionCookieOptions` with `maxAge: 0`.
- **GREEN**: `res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions,
  maxAge: 0 })` in `src/app/api/auth/logout/route.ts`.

### Phase 3 — deepmerge-ts advisory override (finding 4)

- Add `"overrides": { "deepmerge-ts": "^8.0.2" }` to `package.json`; `bun
  install`; verify `node_modules/deepmerge-ts` resolves 8.x and `bun audit`
  goes clean.
- **GUARD source pin** (`tests/dependency-pin.test.ts`, new): `package.json`
  must keep the override; `bun.lock` must resolve `deepmerge-ts@8`.
- Verify the prisma CLI round-trip still works (`bun run db:push` + `bun run
  db:seed` — the `@prisma/config` → `deepmerge` path) and the full gate
  after.

### Phase 4 — remove the stale second lockfile (finding 5)

- `git rm package-lock.json` (bun.lock stays authoritative — already the
  documented rule in AGENTS.md). Note in AGENTS.md gotcha so future
  contributors don't re-add it.

### Phase 5 — AI chat aria-live politeness (finding 6)

- **RED e2e pin**: on `/AIAssistant` the messages region carries
  `aria-live="polite"` and the Thinking bubble carries `role="status"`
  (deliberate-better family — the live ships neither).
- **GREEN**: add `aria-live="polite"` to the messages scroll container
  (`src/components/AIAssistantChat.tsx` line ~182) and `role="status"` to the
  thinking bubble — classes byte-untouched (attributes are invisible to the
  class/height/innerText/tag parity surfaces; the svg-exposure + axe specs
  are unaffected).
- Re-verify the parity surfaces + the mobile battery after.

### Phase 6 — documentation alignment (finding 7 + the session record)

- `AGENTS.md`: gotcha 61 (the session-lifetime guard + the deletion symmetry
  + the override + the lockfile rule), counts, Where-things-live.
- `CLAUDE.md`: counts. `README.md`: fix the stale 53/278 block + the
  session-32 paragraph. PAD: `[S32]` row + fix §7.4 counts + fix the
  ADR-002 `/Home` wording. SKILL: version bump + fix §2 counts.
  `docs/DEPLOYMENT.md` §9: the override note. This plan + `docs/session_61.md`
  (retrospective) + `docs/session_62.md` (transcript) + the worklog entry.
- **Gotcha 41**: the CSS-leak spec re-runs LAST after every doc write.

### Phase 7 — screenshots + env verification

- Re-capture the standard route set (desktop + mobile) + the mobile-menu
  behavior captures under `docs/screenshots/`; a session-32 proof artifact
  (`api-session-s32.txt`: the stale/future/mangled token matrix + the audit
  output) as the textual evidence trail.
- Re-verify `.env.example` stays byte-identical (no new env vars this
  session).

### Phase 8 — the gate + ship

`bun run lint && bun run typecheck && bun run test && bun run build && bun
run test:e2e` → commit (main only) → push via `docs/ssh_git_wrapper_v3.py`.

---

## C. Risk assessment

| Risk | Mitigation |
|---|---|
| The lifetime bound breaks existing e2e login flows | Tokens are minted fresh at login inside each spec — `iat` is always current; the bound only rejects tokens older than 7 days, which no spec creates. The unit boundary specs use clearly-inside (6d23h) / clearly-outside (7d+1h) values to avoid edge flake. |
| `verifySessionToken` rejects legacy tokens without `iat` | `createSessionToken` has stamped `iat` since the initial scaffold — no legacy format exists; the db is re-seeded per e2e run. |
| The deletion-cookie attributes confuse the browser | Name+domain+path identify the cookie (RFC 6265); symmetric attributes are the STRICTER form. Pinned by the new e2e spec reading the actual header. |
| The deepmerge override breaks the prisma CLI | `@prisma/config` imports only the `deepmerge` named export — identical in v8 (zero deps, node ≥ 16). Verified by the `db:push` + `db:seed` round-trip + the e2e global-setup (which pushes + seeds `db/e2e.db`) before shipping. |
| Removing `package-lock.json` breaks npm users | The project contract is bun-only (`bun.lock` authoritative — AGENTS.md); the removed lockfile was already WRONG (stale). Gotcha 61 records the rule. |
| aria-live attributes perturb parity | Attributes are invisible to the class/height/innerText/tag surfaces (the aria-label precedent, session 18/22); the svg-exposure spec (no new exposed svgs) and the axe-core rule-set spec (`aria-live="polite"` used correctly is not a violation) both re-run in the gate. |
| Spec-order: session-32 e2e specs run after the session-31 burst spec | The burst spec poisons only the NEWSLETTER throttle bucket; the session-32 specs touch `/api/auth/me` (GET) + `/api/auth/logout` (POST) — neither is throttled; the login-throttle bucket is untouched. |

**Pre-execution validation**: every file this plan touches was read and
cross-checked this session (`src/lib/session.ts`, `src/lib/auth.ts`, the
login/logout/verify/signup routes, `playwright.config.ts` webServer env,
`tests/auth.test.ts` shape, the e2e spec's session-31 tail, the chat
component's messages container, `package.json` + both lockfiles,
`node_modules/@prisma/config`'s actual deepmerge import). No existing spec
asserts on the shapes being changed (the `/api/auth/me` 200-with-null-user
contract is preserved; only WHICH tokens yield a session changes).
