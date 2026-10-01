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
| `AUTH_SECRET` | **Yes in production** | HMAC secret for session cookies. Generate with `openssl rand -hex 32`. An insecure dev constant is used when unset — never ship that. |
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
