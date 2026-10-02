# Deployment Guide

NexusLearn ships as a single Next.js **standalone** build with a SQLite file
database — one process, zero external services. This guide covers the
supported production paths and the environment contract.

## 1. Build

```bash
bun install
bun run build          # next build + standalone assembly (.next/standalone)
```

The build compiles the page shell and the API route handlers
(auth, enrollments, AI chat, contact, newsletter, health), then copies
`.next/static` and `public/` into `.next/standalone/` (see the `build`
script in `package.json`).

## 2. Run

```bash
bun run start          # NODE_ENV=production bun .next/standalone/server.js
```

The server listens on port 3000 by default (`PORT` overrides). Always start
it from the repo root via the bun script — the standalone server changes its
working directory, and the SQLite path resolution (§4) walks up from the
process CWD to find the repo anchor. Behind a reverse proxy, forward
`X-Forwarded-Proto` so cookie attributes derive the right scheme.

## 3. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | SQLite connection string. See §4. |
| `AUTH_SECRET` | **Yes in production — ENFORCED (session 33)** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. When unset or shorter than 16 characters in production, the server REFUSES to sign/verify session tokens (the login/verify routes fail loudly with the typed `SessionSecretError`; a token forged with the public dev fallback constant is rejected). Dev (`next dev`) and tests keep the documented zero-config fallback. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical public origin, used for metadata URLs and `robots.txt` (e.g. `https://nexuslearn.example.com`). |

`.env.example` documents the same contract — copy it to `.env` and adjust.

## 4. Database location (the `.env.example` reference)

`DATABASE_URL` accepts three forms:

1. **Relative `file:` URL (the default, zero-config local story).**
   ```
   DATABASE_URL="file:../db/custom.db"
   ```
   Relative URLs resolve against the **`prisma/` directory that owns
   `schema.prisma`** — exactly like the Prisma CLI — so this string points
   at `<repo>/db/custom.db` for `prisma db push`, `prisma/seed.ts`,
   `next build` and the running server alike, regardless of the process
   working directory. The resolution rule lives in
   `prisma/db-url.ts` and is applied by every PrismaClient in the repo
   (`src/lib/db.ts`, `prisma/seed.ts`) via `datasourceUrl:
   resolveDatabaseUrl()`.

   One caveat: an `DATABASE_URL` **already exported in your shell** wins
   over the repo `.env` (standard precedence). If a stale export points
   elsewhere, `db:push`/`db:seed`/`dev` will happily write to that other
   file — unset it or pin the value per command.

2. **Absolute `file:` URL (recommended for production).**
   ```
   DATABASE_URL="file:/var/lib/nexuslearn/custom.db"
   ```
   Absolute paths pass through untouched — immune to any working-directory
   ambiguity across service managers, containers, or cron wrappers. Point
   them at a persisted volume and back the file up.

3. **PostgreSQL.** Switch `provider = "postgresql"` in
   `prisma/schema.prisma`, set a `postgresql://` URL, then
   `bun run db:push && bun run db:seed`.

Initialize (or reset) the database with:

```bash
bun run db:push        # apply schema (db push — no migrations folder)
bun run db:seed        # reference 9-course catalog + demo user (idempotent)
```

`db/*.db` is gitignored; every fresh clone recreates it from the two
commands above.

## 5. Updating

```bash
git pull
bun install
bunx prisma generate   # after schema changes
bun run db:push
bun run build
# restart the server process
```

## 6. Verification checklist

```bash
curl -s https://your-host/api/health     # {"ok":true,"service":"nexuslearn"}
bun run lint && bun run typecheck && bun run test
bun run build && bun run test:e2e        # 266-spec Playwright suite (local)
```

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory with no `prisma/schema.prisma` anchor and no absolute `DATABASE_URL` | Start via `bun run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to the landing page unauthenticated | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| Data written to an unexpected `custom.db` | A stale `DATABASE_URL` export in the shell overrides the repo `.env` | Unset it, or pin `DATABASE_URL` per command (§4.1) |

## 8. Compression & caching posture (session 27)

The app carries its own response-efficiency tiers; one layer needs a proxy.

**What the app ships itself** (all pinned by the session-27 e2e specs —
`tests/e2e/nexuslearn.spec.ts`, "the compression/content-encoding surface" +
"the cache-revalidation + range surface"):

| Tier | Contract |
|------|----------|
| Dynamic pages + API JSON | gzip when negotiated (`compress: true` is pinned explicitly in `next.config.ts`), always `Vary: Accept-Encoding`-guarded; identity when asked |
| `/_next/static` chunks (content-hashed JS/CSS) | gzip + `Cache-Control: public, max-age=31536000, immutable` (the session-24 pin) + the full validator contract (weak `ETag` + `Last-Modified`, 304 on both revalidators, 206 partial responses) |
| `public/` statics (`/logo.png`, `/manifest.json`) | served identity (Node's static handler never compresses — `/logo.png` is a PNG payload deflate cannot shrink anyway; `/manifest.json` is 610 B) + the same full validator/304/206 contract |
| Dynamic HTML pages | deliberately NO validators (`no-store` — the per-request CSP nonce makes nonced HTML uncacheable by design; do not "fix") |

**What needs the proxy layer**: **brotli** and **public/-static compression**.
The reference app's platform (Cloudflare edge) compresses every compressible
response with gzip AND brotli; Node's built-in compression middleware is
gzip/deflate-only and never touches static-file responses, so a standalone
server cannot carry those two tiers in-app (unlike the baseline security
headers of session 23, which the app ships itself because headers are
app-controllable). For parity, front the standalone server with a
compression-capable reverse proxy — e.g. Caddy (`encode zstd br gzip`),
Nginx (`gzip_brotli`/`brotli on` + `gzip_static`), or Cloudflare. This is
the same reasoning chain as the session-23 header work, applied to the one
layer that genuinely cannot move into the app.

**Known quirk** (harmless, documented): gzip on tiny responses grows them —
`/api/health` is 34 B raw, 54 B gzipped — Node's middleware has no
minimum-size threshold; disabling compression app-wide to avoid it would
cost far more on real payloads (the landing HTML is 242 KB → 28 KB gzipped).

**The protocol tier (session 28)**: the same proxy-layer family extends to
the HTTP protocol itself — the reference platform speaks **HTTP/2 AND
HTTP/3** (its Cloudflare edge terminates both), while the standalone Node
server speaks **HTTP/1.1 only** (Node's standalone server does not carry
ALPN/QUIC termination, and h2c upgrade attempts are refused). Like brotli
and public/-static compression, this capability cannot move into the app;
the same reverse proxy that adds the compression tier adds the protocol
tier in one move (Caddy and Nginx both negotiate h2 + h3 with modern
clients out of the box; Cloudflare terminates h3 at its edge). Verified by
direct probe: `curl --http2` against the reference answers `2`, `--http3`
answers `3`; against the standalone server every request negotiates
`1.1`.

## 9. Rate limiting posture (session 31)

The six public POST routes (`/api/auth/login`, `/api/auth/signup`,
`/api/auth/forgot-password`, `/api/contact`, `/api/newsletter`,
`/api/ai/chat`) carry an **in-memory fixed-window per-IP throttle**
(`src/lib/rate-limit.ts` — login 30/min, signup + forgot-password 10,
newsletter + contact 15, ai-chat 30; 429 + `Retry-After` + the house
`{ error }` body). Two deployment notes:

- **The bucket store is per-process.** Run ONE server instance per
  deployment (the standalone `server.js` is single-process anyway) — or
  move the `buckets` map to shared memory (Redis, a sidecar) if you ever
  scale horizontally, otherwise each instance keeps its own window and the
  effective limit multiplies by the instance count.
- **The client IP comes from the proxy headers.** `clientIp()` reads
  `x-forwarded-for`'s first value, then `x-real-ip`, then falls back to the
  `local` sentinel. Behind no reverse proxy every client shares that one
  bucket — front the server with Caddy/Nginx/Cloudflare (already
  recommended for §8's compression/protocol posture) and let the proxy set
  the header. A spoofed `x-forwarded-for` can still rotate the key, which
  is why the store's map sweep bounds tracked keys at 5,000 (expired
  entries drop first); a determined attacker behind a botnet defeats any
  per-IP scheme — that is the WAF/edge layer's job.

The thresholds are code constants sized ≥ 4× the e2e suite's measured
per-bucket load; tune them in `src/lib/rate-limit.ts` (the `RATE_LIMITS`
table is unit-pinned — update `tests/rate-limit.test.ts` in the same
commit).

## 10. Session lifetime + dependency posture (session 32)

Two hardening notes from the session-32 pass:

- **The 7-day session window is enforced server-side too.** The cookie's
  `maxAge` was always 7 days, but before session 32 only the BROWSER jar
  honored it — `verifySessionToken` now also bounds the token's embedded
  `iat` (older than 7 days → rejected; issued more than 60s in the future →
  rejected; missing/malformed → rejected). Deployment note: **server clock
  accuracy matters** — keep NTP healthy on the host; the 60-second skew
  window absorbs normal drift but not a misconfigured clock. Rotating
  `AUTH_SECRET` still invalidates every outstanding token instantly (the
  recommended lever if a leak is ever suspected).
- **`deepmerge-ts` is pinned to `^8.0.2` via the `overrides` field** in
  `package.json` (GHSA-ggr8-5vv4-36mx — the advisory is in prisma's
  CLI-time config-loading path, never reachable over HTTP, but `bun audit`
  stays clean only while the override holds; `tests/dependency-pin.test.ts`
  guards it). **`bun.lock` is the only lockfile** — never re-add a second
  one (a stale `package-lock.json` was removed in session 32).

## 11. Verify-route guards + the enforced secret (session 33)

Three notes from the session-33 pass:

- **`POST /api/auth/verify` is the seventh throttled public POST route**
  (10 requests/min per IP — signup's sibling; the UI sends exactly one
  verify per signup). The route also carries the 413 body-size pre-check
  and the email field cap like every other public POST route. If a future
  route accepts public POSTs — especially one that mints or changes auth
  state — add it to `RATE_LIMITS` and to `tests/api-guard-source.test.ts`
  (the exact-set pin is the discipline that catches escapes).
- **The login 401 burns a scrypt compare on the user-not-found path**
  (the timing equalizer): both paths pay the same cost, so response timing
  no longer enumerates valid emails. No deployment action — but do not
  remove the equalizer "for performance"; the ~30ms is the security.
- **The enforced `AUTH_SECRET` contract** (see §3): production deployments
  without a ≥16-character secret fail LOUD on the auth surfaces (500 with
  the actionable `SessionSecretError` message) while anonymous public
  pages keep rendering — the failure lands exactly where a smoke test
  looks. Wire a real secret into the environment before the first login;
  rotating it still invalidates every outstanding token instantly.

## 12. Session revocation (session 34) — the per-user epoch

`getSession()` re-validates the user row on every read: the token's
embedded epoch (`ver`, minted from `User.sessionVersion`) must match the
user's CURRENT `sessionVersion`, and the user must still exist. Two
operator levers, neither of which requires rotating the global
`AUTH_SECRET`:

The account owner can trigger the same lever for THEMSELVES —
`POST /api/auth/revoke-sessions` (session 35; requires the session cookie):
one indexed increment kills every outstanding token for the caller
(including the presented one) and clears the cookie with the
attribute-symmetric deletion form. The account survives; a fresh login
re-mints at the bumped epoch.

```sql
-- Revoke ONE user's every outstanding session (a leaked cookie, a
-- suspicious account, an offboarding):
UPDATE User SET sessionVersion = sessionVersion + 1 WHERE email = 'user@example.com';

-- Revoke everything a user ever held (enrollments cascade):
DELETE FROM User WHERE email = 'user@example.com';
```

Notes:

- **Scope**: one indexed `findUnique` per authenticated request — the
  standard price of revocable sessions (the reference's JWT-in-localStorage
  has no server check at all; this is deliberate-better hardening of the
  clone's own first-party contract).
- **Rollout**: tokens minted before session 34 carry no `ver` and read as
  `0` (the schema default), so a deploy forces no re-login wave.
- **Do not** "optimize" the check away because the signature is valid — a
  validly-signed token whose user is gone is exactly the ghost-token
  problem the check closes.

## 13. The SMTP swap-in drill (the simulated-delivery seam)

The verify-code and password-reset deliveries are **simulated** in the
template: the 6-digit code is logged server-side
(`[auth] verification code for <email>: <code> (simulated delivery)`) and
ANY complete 6-digit code verifies (`POST /api/auth/verify`). This is the
documented template simplification (PAD §10). The drill to swap in real
email:

1. **Add a transport module** (e.g. `src/lib/mailer.ts` — nodemailer,
  Resend, SES; keep it server-only like the AI SDK import).
2. **Persist the code** — ~~add `verificationCode String?` +
  `codeExpiresAt DateTime?` to `User`; the signup route (both the create
  and the unverified-resend branches) writes them instead of logging.~~
  **SHIPPED (session 35)**: both columns exist, the signup route persists
  an HMAC-SHA256 hash of the code (keyed by `AUTH_SECRET` — never the raw
  digits, so a DB leak does not expose live codes) + the 10-minute expiry,
  and `src/lib/verification.ts` is the pure seam. The `AUTH_DELIVERY=smtp`
  gate (step 5) is also shipped: setting it activates the real comparison
  with zero code changes — only the transport module (step 1) remains.
3. **Compare for real** — `POST /api/auth/verify` reads the stored code,
  checks the expiry window, and clears both fields on success (the
  `emailVerified: true` write stays as-is).
4. **Keep the guards** — the throttle (10/min), the 413 pre-check and the
  email field cap must survive the rewrite (the source pin
  `tests/api-guard-source.test.ts` enforces the route set; add specs for
  the new branches).
5. **Test impact** — the e2e signup/verify specs RELY on the simulated
  any-code contract; either gate the real comparison behind an env flag
  (`AUTH_DELIVERY=smtp` with the simulated path as the test default) or
  re-pin the specs deliberately when the contract changes.
6. **Forgot-password** is a stub that always returns ok (no user
  enumeration — reference parity); wiring real reset emails means the
  same transport + a `resetToken` column + an expiry, with the same
  always-ok response shape.
