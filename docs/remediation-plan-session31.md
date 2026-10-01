# NexusLearn Remediation Plan — Session 31

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes, synced
viewports 1920×1080 / 375×667, both sites signed in as the demo user; the dev
server on :3000; the e2e production standalone server on :3100 booted with
the exact Playwright webServer env; raw fetch for the API-level probes; the
evidence files under `/home/z/my-project/scripts/s31-*`).

**Rule**: `skills/` folder excluded from checking/testing/compilation
(re-verified: tsconfig `exclude`, eslint `ignores`, vitest `include` matches
`*.test.ts` in `src/**` + `tests/**` only, playwright `testDir: ./tests/e2e`,
the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-30 tree, commit
`4576c00` on top of the pushed `dcf0e44`): lint ✓ · typecheck ✓ · 54/54 unit
✓ · build ✓ · **283/283 e2e ✓** (5.3m, re-verified this session on the
pulled workspace). The environment contract re-verified
(`DATABASE_URL="file:../db/custom.db"` in `.env`, `db/custom.db` +
`db/e2e.db` at the repo root; `.env.example` byte-identical; vitest +
playwright configs verified against the codebase).

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The request-size / unbounded-field surface (API surface, fresh-eyes family 1 — the request-size/payload-depth guard sweep)**: the clone's public writing routes accept and PERSIST unbounded strings. Verified at the API level on the dev server: `POST /api/newsletter` with a 1,048,588-char email → **200 + the row persisted**; `POST /api/contact` with a 2MB message → **200 + the row persisted**; `POST /api/auth/signup` with a 1MB email → **200 + a User row persisted (email AND the email-prefix-derived name both ~1MB)**. No `Content-Length` cap, no field-length caps anywhere — one curl per row can bloat the SQLite file with megabyte payloads (the DB grew 4KB→364KB+ in minutes of probing; unbounded under sustained abuse). The deep-JSON probes (5k/50k nesting, 10k-item arrays, JSON string/null bodies) all fail CLEANLY into the existing 400 catch — the parser and the field-coercion layer are NOT the problem; only the persisted-string length is. | HIGH (data-integrity + abuse vector) | **FIX — size guards + PIN** |
| 2 | **The rate-limiting / abuse-throttle surface (API surface, fresh-eyes family 2 — the per-IP throttle family)**: **neither site throttles**. 12 rapid requests ×4 sequences (login nonexistent-email, newsletter, contact, login-same-email) produced ZERO 429s, ZERO `Retry-After`, ZERO `x-ratelimit-*`/`cf-mitigated` headers on EITHER site. The difference: the live is protected by its PLATFORM layer — every external `POST /api/newsletter|/api/contact|/api/ai/chat` returns **405** `{"error_type":"HTTPException","message":"Method Not Allowed"}` (regardless of content-type or browser-header spoofing — its SPA submits through the Base44 internal channel), and `POST /api/auth/login` returns **400 "Security verification is required"** (a platform anti-bot token the browser flow injects). The clone has NO protection at all: any script can hammer `/api/auth/login` (scrypt CPU burn per attempt), `/api/contact` + `/api/newsletter` (unbounded DB bloat, finding 1) and `/api/ai/chat` (LLM cost) with no ceiling. | MEDIUM (template-hardening gap; the live has no app-level throttle either — not a parity gap) | **FIX — per-IP throttle + PIN (deliberate-better)** |
| 3 | **The live's platform-wall behavior (documentation finding, no code action)**: the live's `405`-on-external-POST + `Security verification is required`-on-login contract is a deployment-platform artifact the clone CANNOT mirror without breaking itself — the clone's own UI POSTs these routes by design (the documented keep-our-own-forms family, session 26). The live's own reachable validation shapes (422 FastAPI missing-field, 400 parse errors) are likewise its platform's dialect, already superseded by the clone's first-party `{ error }` contract. Recorded here as the deliberate-better decision + pinned by the existing session-26 verb-matrix specs. | — (documentation) | **DOCUMENT (this plan §C)** |
| 4 | **Every standing surface re-verified at the documented session-30 state**: the full baseline gate (lint, typecheck, 54/54 unit, build, **283/283 e2e**); **heights ×9 routes ×2 viewports byte-exact 18/18** (the one first-run `/Dashboard` diff was the known enrollment-state artifact — the dev `db/custom.db` carried session-30 probe enrollments; re-seeded, re-probed: 1573/2271 byte-exact, text IDENTICAL); normalized innerText 18/18 identical; tag-of-shared-class drift 0 (the SVG-subtree-skip methodology); **the mobile battery fully identical** (trigger `md:hidden p-2 rounded-lg text-white/80` byte-identical, 40×40 @ (319,12), open NAV 375×469, link geometry y 81/129/177/225/273/321/369/417 — **NO Tailwind v4 bug**); console sweep 9/10 CLEAN (the 10th is the by-design 404 route). | — (the standing record) | **RECORDED** |

### Audit-surface note (the session-31 additions — TWO new probe families)

- **the request-size / payload-depth surface** (finding 1) — the dimension
  the payload-integrity family (session 30) shares a border with but neither
  covers: session 30 asked "does every id BELONG to the caller's entity
  graph"; this family asks "does the route bound WHAT IT PERSISTS at all".
  The probe matrix: oversized strings (1MB/2MB) on every writing field,
  deep-JSON nesting (5k/50k), wrong content-types, non-object JSON bodies —
  against BOTH sites. The live is externally untouchable (its platform wall,
  finding 3), so the live offers NO reference contract for these shapes —
  the clone owns the contract entirely (the deliberate-better family).
- **the rate-limiting / abuse-throttle surface** (finding 2) — the
  time/frequency dimension of the public API contract: 12-request rapid
  bursts ×4 sequences against the auth/contact/newsletter APIs on both
  sites, recording every status + the rate-limit-relevant response headers.
  The live's protection is platform-level (its own UI bypasses it through
  the internal channel); the clone's is absent. The fix is the same
  deliberate-better family as the session-24 CSP and the session-26 verb
  guard: hardening the live never shipped at the app layer, invisible to
  the normal UX.

Family 1 was found by sending the session-30 payload-integrity probe shape
to the NON-id fields (the strings nobody bounds); family 2 by extending the
session-26 verb matrix from the method dimension to the frequency dimension.

---

## B. Remediation (TDD)

This session carries **two real source fixes** (findings 1 + 2) + one
documentation finding (finding 3). Both fixes are pure additive hardening:
no route's success-path behavior changes, no UI surface changes, zero
impact on the standing parity surfaces (verified below).

### Phase 1 — the request-size guards (finding 1)

- [1a] **RED (unit)**: new `tests/request-guard.test.ts` — the pure
  boundary specs: `bodyTooLarge(contentLength)` trips strictly above
  `MAX_BODY_BYTES` (1,000,000 — the 1MB contract: a 1MB email is already
  4,000× the 254-char RFC-max; every legitimate request in the app is
  < 100KB); `fieldTooLong(value, max)` boundary (254 ok / 255 rejects);
  the `FIELD_LIMITS` table pin (email 254 — RFC 5321 practical max,
  password 1024, name 200, subject 200, message 10,000, chatTurns 100 —
  the documented values, frozen against casual drift).
- [1b] **RED (e2e)**: the session-31 spec block (appended at the file
  tail, after the session-30 block — the burst spec must be the suite's
  LAST API-touching spec, see [2b]):
  1. newsletter 300KB email (< 1MB body) → **400** `Email is too long`
     (RED: 200 + a row persisted);
  2. contact 300KB message → **400** `Message is too long`, then a valid
     small contact POST → **200** (the happy path holds);
  3. signup 300KB email → **400** + the spec-side Prisma read (the
     session-30 `s30ForeignLessonId` pattern against `db/e2e.db`) asserts
     ZERO users with the probe email prefix (RED: the user row persists);
  4. login 300KB email → **400** (the field cap — RED: the 401);
  5. newsletter 1.5MB email (> 1MB body) → **413** `Request body too large`
     (RED: 200 + the megabyte row persisted);
  6. ai/chat 101-turn messages array → **400** (the turn cap; RED: the
     request reaches the SDK/502 path).
- [1c] **FIX**: new `src/lib/request-guard.ts` — `MAX_BODY_BYTES` +
  `bodyTooLarge(contentLength)` (pure) + `FIELD_LIMITS` +
  `fieldTooLong(value, max)` (pure). Wired into all six public POST
  routes (`login`, `signup`, `forgot-password`, `contact`, `newsletter`,
  `ai/chat`): the `Content-Length` pre-check (before any parse — cheap
  rejection with **413** + the house `{ error }` body) + the field caps
  after extraction (**400** + the specific message). The ai/chat route
  keeps its existing 4,000-char-per-turn slice (bounding the SDK payload)
  and gains the 100-turn array cap.
- [1d] **GUARD**: the source-wiring pin — new
  `tests/api-guard-source.test.ts` asserting every one of the six routes
  imports + calls the guard helpers (the session-30 source-guard pattern:
  a future refactor cannot silently drop a route's protection).

### Phase 2 — the per-IP rate limiter (finding 2)

- [2a] **RED (unit)**: new `tests/rate-limit.test.ts` — the pure limiter
  logic: under-limit requests pass; the (limit+1)th request inside the
  window rejects; `retryAfterSec` is the positive seconds-to-window-end;
  the window rolls over (a real 50ms test window); buckets are isolated
  (login ≠ newsletter); IPs are isolated; the map sweep bounds memory
  (the spoofed-`x-forwarded-for` defense); `clientIp` precedence
  (x-forwarded-for first value → x-real-ip → the local fallback).
- [2b] **RED (e2e)**: the burst spec — 20 rapid invalid-email POSTs to
  `/api/newsletter` (invalid emails ⇒ every pre-throttle response is a
  deterministic 400 ⇒ zero persistence): every response ∈ {400, 429},
  at least one **429**, and the 429 carries `Retry-After` + the house
  `{ error }` body. RED on the baseline: 20× 400, zero 429s. The spec is
  deliberately the LAST API-touching spec in the file: it poisons the
  newsletter bucket for the window's remainder (the suite's alphabetical
  file order runs `mobile-navigation.spec.ts` before `nexuslearn.spec.ts`,
  and the CSS-leak spec re-run is GET-only).
- [2c] **FIX**: new `src/lib/rate-limit.ts` — an in-memory fixed-window
  limiter (`checkRateLimit(bucket, ip, limit, windowMs = 60_000)` — no
  Redis, keeping the zero-config template story), `clientIp(req)`
  (x-forwarded-for → x-real-ip → "local"), the expired-bucket sweep, the
  shared `rateLimitResponse()` (429 + `Retry-After` + `{ error }`), and
  the `RATE_LIMITS` table. Thresholds sized against the measured e2e load
  (the 5.3-minute suite makes ~7 real login POSTs, ~2 newsletter, ~1
  contact, 0 real ai-chat — the AI specs intercept the route): login 30,
  signup 10, forgot-password 10, newsletter 15, contact 15, ai/chat 30
  (per minute, per bucket, per IP — ≥ 4× headroom above the suite's
  burst rate in every bucket). Wired as the FIRST statement of each of
  the six handlers (before any parse — the cheap rejection).
- [2d] **GUARD**: the e2e happy-path pin — a valid newsletter subscribe
  → 200 (the throttle is invisible to the normal UX), running BEFORE the
  burst spec in the same describe block.

### Phase 3 — documentation

- AGENTS.md: gotcha 60 (the request-size + rate-limit surfaces — the
  platform-wall lesson: the live's 405/"Security verification" wall vs
  the clone's open first-party API; the guard architecture; the
  burst-spec-poisons-the-bucket e2e rule) + the commands-table counts.
- CLAUDE.md: the test-pyramid counts + the session-31 family.
- README.md: the tests badge + the session-31 paragraph.
- `Project_Architecture_Document.md`: the [S31] revision row + the
  security-layer section note.
- `nexuslearn-template_SKILL.md`: the project_state bump (v3.18.0 →
  v3.19.0).
- `docs/DEPLOYMENT.md`: the limiter's per-instance scope note (the
  in-memory window is per-process — one instance per deployment, or move
  the bucket store to Redis for multi-instance).
- This plan + `docs/session_58.md` + the worklog entry.

### The pre-execution validation (against the codebase)

- The six target routes verified one-by-one (`login`, `signup`,
  `forgot-password`, `contact`, `newsletter`, `ai/chat`) — each has a
  single POST handler with the house try/catch → `{ error }` 400 shape;
  the guards slot in before the parse with zero control-flow conflicts.
- The authed routes (`enrollments`, `enrollments/progress`, `logout`,
  `me`) are deliberately NOT throttled: they require a valid session
  cookie (the abuse surface is the public routes; the enrollments spec
  makes 6 rapid POSTs the limiter could flake on). Documented decision.
- `clientIp`'s "local" fallback keys all e2e/dev traffic to one bucket —
  validated against the thresholds above (the suite's per-bucket maximum
  is ~7/min vs the 15-30 limits).
- No existing spec asserts on any of the six routes' REJECTION statuses
  for oversized/throttled shapes (grep-verified: the newsletter specs use
  valid emails + `page.route` interception; the contact spec sends a
  small valid payload; the login specs use real credentials) — the new
  specs cannot collide with the old ones.
- The 413 status + the new error messages are first-party contracts (the
  live 405s externally — finding 3); they follow the house `{ error }`
  shape pinned since session 5.
- The e2e webServer env adds no variable (thresholds are code constants —
  `.env.example` stays byte-identical; re-verified at the end).

### Risks

| Risk | Mitigation |
|---|---|
| The limiter flakes the e2e suite (a bucket trips mid-suite) | Thresholds ≥ 4× the measured per-bucket suite load; the burst spec is the file's LAST API-touching test; every full-suite run boots a fresh server process (a fresh bucket map); the dev-tier probes that trip buckets are one-off evidence captures. |
| The burst spec's 429 poisons a later manual run | The window is 60s; any re-run after 60s (or a server restart) is clean; the spec asserts "at least one 429" not an exact trip point (robust to the ≤4 earlier in-window requests the session-5/18/31 specs make). |
| The 1MB body cap breaks a legitimate flow | The largest legitimate request in the app is the ai/chat history (12 turns × 4,000 chars ≈ 48KB) — 20× under the cap; every form field's realistic content is < 100KB. |
| The in-memory store leaks (spoofed x-forwarded-for creates unbounded keys) | The map sweep (expired-entry drop at > 5,000 tracked keys) is unit-pinned [2a]. |
| A field cap rejects a real-world value | email 254 = the RFC 5321 practical max; password 1024 = 8× any real password; contact message 10,000 = ~2 screens of text — every cap is ≥ 40× the seeded catalog's longest field. |
