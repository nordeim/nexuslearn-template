import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Resolve a relative SQLite `file:` DATABASE_URL to an absolute one,
 * anchored at the PRISMA SCHEMA DIRECTORY — the same convention the
 * Prisma CLI uses ("The path is resolved relative to prisma/schema.prisma").
 *
 * Why this exists: the Prisma CLI resolves `file:../db/custom.db` against
 * `prisma/schema.prisma` → `<repo>/db/custom.db`, but the runtime query
 * engine resolves it against the process CWD — so `next dev`, the seed
 * script, and `bun .next/standalone/server.js` (which chdir()s into
 * `.next/standalone/`) could all touch DIFFERENT database files.
 *
 * Anchor selection: walk up from CWD collecting every directory that has
 * `prisma/schema.prisma`. The standalone bundle ships its own copy at
 * `.next/standalone/prisma/schema.prisma`, so "nearest" is wrong — prefer
 * the FURTHEST candidate whose resolved database file actually exists
 * (that's where the CLI put it), and if none exists yet (fresh clone),
 * the furthest candidate overall (the real repo root, where `db:push`
 * will create it).
 *
 * Already-absolute `file:` URLs and non-SQLite URLs pass through untouched
 * (the recommended production setup — docs/DEPLOYMENT.md).
 */
export function resolveDatabaseUrl(url: string | undefined = process.env.DATABASE_URL): string | undefined {
  if (!url || !url.startsWith("file:")) return url;
  const rel = url.slice("file:".length);
  if (path.isAbsolute(rel)) return url;

  // Candidates, nearest-first.
  const candidates: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    if (existsSync(path.join(dir, "prisma", "schema.prisma"))) candidates.push(dir);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  if (candidates.length === 0) {
    // No repo root found from CWD — let Prisma apply its own resolution.
    return url;
  }

  // Furthest candidate with an existing database file wins; else furthest.
  for (let i = candidates.length - 1; i >= 0; i--) {
    const abs = path.resolve(candidates[i], "prisma", rel);
    if (existsSync(abs)) return "file:" + abs;
  }
  const outermost = candidates[candidates.length - 1];
  return "file:" + path.resolve(outermost, "prisma", rel);
}
