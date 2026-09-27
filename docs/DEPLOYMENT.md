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
bun run build && bun run test:e2e        # 25-spec Playwright suite (local)
```

## 7. Common production issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Error code 14: Unable to open the database file` | Server started from a directory with no `prisma/schema.prisma` anchor and no absolute `DATABASE_URL` | Start via `bun run start`, or set an absolute `file:` URL (§4) |
| Logins loop back to the landing page unauthenticated | `AUTH_SECRET` changed between restarts | Keep the secret stable across restarts |
| Data written to an unexpected `custom.db` | A stale `DATABASE_URL` export in the shell overrides the repo `.env` | Unset it, or pin `DATABASE_URL` per command (§4.1) |
