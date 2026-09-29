import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Resolve a relative SQLite `file:` DATABASE_URL to an absolute one,
 * anchored at the PRISMA SCHEMA DIRECTORY — the same convention the
 * Prisma CLI uses ("The path is resolved relative to prisma/schema.prisma").
 *
 * Why this exists: the Prisma CLI resolves `file:../db/custom.db` against
 * `prisma/schema.prisma` → `<repo>/db/custom.db`, but a `datasourceUrl`
 * handed to PrismaClient is resolved against the process CWD — so `next dev`
 * from another directory, and `bun .next/standalone/server.js` (which
 * chdir()s into `.next/standalone/`, home to a traced copy of
 * `prisma/schema.prisma`), could all touch DIFFERENT database files.
 *
 * Anchor selection: walk up from CWD collecting every directory that has
 * `prisma/schema.prisma`. The standalone bundle ships its own copy at
 * `.next/standalone/prisma/schema.prisma`, so "nearest" is wrong — prefer
 * the FURTHEST candidate whose resolved database file actually exists
 * (that's where the CLI put it), and if none exists yet (fresh clone),
 * the furthest candidate overall (the real repo root, where `db:push`
 * will create it).
 *
 * Shell-environment pollution guard: the repo's `.env` file is the source
 * of truth for the database location. When `.env` declares a RELATIVE
 * `file:` URL (the documented repo layout — `db/` at the repo root), an
 * ABSOLUTE `DATABASE_URL` inherited from the shell is ignored, whatever
 * path it points at. Rationale: an absolute export that disagrees with the
 * repo's declared relative layout is, in every observed case, stale
 * environment pollution (a previous workspace exporting
 * `file:/home/z/my-project/db/custom.db`, which silently moves the
 * database OUT of the repository); honoring it reproduces the
 * "database created outside the repo" bug. Production deployments that
 * need an absolute path put it IN the `.env` file
 * (docs/DEPLOYMENT.md §4) — a declared absolute URL is always honored,
 * and a RELATIVE shell value (the e2e suite's `file:../db/e2e.db`)
 * still wins over the file, so per-run overrides keep working.
 */
export function resolveDatabaseUrl(
  url: string | undefined = process.env.DATABASE_URL,
  opts: { declaredUrl?: string | null } = {},
): string | undefined {
  if (!url || !url.startsWith("file:")) return url;

  // Repo-root candidates, nearest-first (see the anchor-selection note).
  const candidates: string[] = [];
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    if (existsSync(path.join(dir, "prisma", "schema.prisma"))) candidates.push(dir);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  // The declared URL: the DATABASE_URL line of the repo's .env (furthest
  // candidate first — the real repo root when running from the standalone
  // bundle, which carries its own traced .env copy with identical content).
  const declared =
    opts.declaredUrl !== undefined
      ? opts.declaredUrl
      : readDeclaredDatabaseUrl([...candidates].reverse());

  // Pollution guard (see the docblock): relative .env declaration beats an
  // absolute shell value.
  if (
    declared !== null &&
    declared !== undefined &&
    isRelativeFileUrl(declared) &&
    !isRelativeFileUrl(url)
  ) {
    warnPollutionOverride(url, declared);
    url = declared;
  }

  const rel = url.slice("file:".length);
  if (path.isAbsolute(rel)) return url;
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

/**
 * Read the DATABASE_URL declared in the `.env` of the first repo root (from
 * `repoRoots`, tried in order) that defines one. Returns undefined when no
 * `.env` declares it, or null-ishly when passed an empty candidate list.
 * Exported for reuse by the Prisma CLI wrapper (prisma/db-cli.ts) and for
 * tests pinning the declared repo layout.
 */
export function readDeclaredDatabaseUrl(repoRoots: string[]): string | undefined {
  for (const root of repoRoots) {
    const url = parseEnvVar(path.join(root, ".env"), "DATABASE_URL");
    if (url !== undefined) return url;
  }
  return undefined;
}

/** A `file:` URL whose path part is relative (`file:../db/custom.db`). */
function isRelativeFileUrl(url: string): boolean {
  if (!url.startsWith("file:")) return false;
  return !path.isAbsolute(url.slice("file:".length));
}

let warnedPollution = false;
function warnPollutionOverride(shellUrl: string, declaredUrl: string): void {
  if (warnedPollution || process.env.NODE_ENV === "test") return;
  warnedPollution = true;
  console.error(
    `[db-url] ignoring the shell's absolute DATABASE_URL (${shellUrl}) — ` +
      `the repo .env declares ${declaredUrl}; the database stays in the repo's db/ folder. ` +
      `(Put an absolute URL in .env if you really need it elsewhere — docs/DEPLOYMENT.md)`,
  );
}

/**
 * Minimal .env reader for a single variable: first defining line wins,
 * surrounding quotes stripped, trailing comments removed. Deliberately not
 * a dotenv dependency — the repo's .env carries no expansions or multiline
 * values, and this runs on every PrismaClient construction.
 */
function parseEnvVar(envPath: string, variable: string): string | undefined {
  let text: string;
  try {
    text = readFileSync(envPath, "utf8");
  } catch {
    return undefined; // no .env or unreadable
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(new RegExp(`^\\s*(?:export\\s+)?${variable}\\s*=\\s*(.*)$`));
    if (!match) continue;
    let value = match[1].trim();
    const quoted = value.match(/^"([^"]*)"|^'([^']*)'/);
    if (quoted) return quoted[1] ?? quoted[2];
    value = value.split(/\s+#/)[0].trim(); // strip a trailing comment
    return value.length > 0 ? value : undefined;
  }
  return undefined;
}
