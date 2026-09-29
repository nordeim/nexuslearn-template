#!/usr/bin/env bun
/**
 * Prisma CLI wrapper — the repo .env is the source of truth for DATABASE_URL.
 *
 *   bun prisma/db-cli.ts db push --accept-data-loss
 *   bun prisma/db-cli.ts migrate dev
 *
 * The Prisma CLI prefers a `DATABASE_URL` inherited from the shell over the
 * repo's `.env` file. In sandboxed/CI shells that carry a stale absolute
 * export (e.g. `file:/home/z/my-project/db/custom.db`, pointing OUTSIDE the
 * repo), every `db:push`/`db:migrate` silently created the database outside
 * the repository. This wrapper re-exports the `.env` value over the shell
 * value before spawning the CLI, so `DATABASE_URL="file:../db/custom.db"`
 * always lands the database at `<repo>/db/custom.db` (the Prisma CLI
 * resolves relative `file:` URLs against `prisma/schema.prisma`).
 *
 * Run through the package.json scripts (`bun run db:push` etc.); direct
 * `bunx prisma …` calls keep standard precedence.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

import { readDeclaredDatabaseUrl } from "./db-url";

const repo = path.resolve(import.meta.dirname, "..");
const declared = readDeclaredDatabaseUrl([repo]);

const env: NodeJS.ProcessEnv = { ...process.env } as NodeJS.ProcessEnv;
if (declared !== undefined && process.env.DATABASE_URL !== declared) {
  if (process.env.DATABASE_URL) {
    console.error(
      `[db-cli] overriding the shell's DATABASE_URL (${process.env.DATABASE_URL}) ` +
        `with the repo .env value (${declared}) — the database stays in the repo's db/ folder.`,
    );
  }
  env.DATABASE_URL = declared;
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("usage: bun prisma/db-cli.ts <prisma command> [args…]  e.g. db push");
  process.exit(2);
}

// Prefer the repo-local prisma binary; bunx is the portable fallback.
const result = spawnSync("bunx", ["prisma", ...args], {
  cwd: repo,
  env,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
