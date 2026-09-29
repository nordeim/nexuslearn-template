import { describe, expect, it, vi } from "vitest";

import { readDeclaredDatabaseUrl, resolveDatabaseUrl } from "../prisma/db-url";

// The repo root (vitest runs with CWD = the directory holding
// vitest.config.ts) and the reference database location it must pin.
const REPO = process.cwd();
const REPO_DB = `file:${REPO}/db/custom.db`;

describe("DATABASE_URL resolution (the repo-root db pin)", () => {
  it("the repo .env declares the repo-relative database URL", () => {
    // The user-facing contract: DATABASE_URL="file:../db/custom.db" in .env,
    // resolving to <repo>/db/custom.db (the db/ folder at the repo root).
    expect(readDeclaredDatabaseUrl([REPO])).toBe("file:../db/custom.db");
  });

  it("an ABSOLUTE shell DATABASE_URL pointing outside the repo is ignored when .env declares a relative one", () => {
    // The pollution guard: a stale absolute export (e.g. a sandbox shell
    // injecting file:/home/z/my-project/db/custom.db — OUTSIDE the repo)
    // must never move the database out of <repo>/db/.
    const polluted = "file:/home/z/my-project/db/custom.db";
    const resolved = resolveDatabaseUrl(polluted, {
      declaredUrl: "file:../db/custom.db",
    });
    expect(resolved).not.toBe(polluted);
    expect(resolved).toBe(REPO_DB);
  });

  it("the default (no opts) path neutralizes a polluted process.env against the real .env", () => {
    vi.stubEnv("DATABASE_URL", "file:/home/z/my-project/db/custom.db");
    try {
      expect(resolveDatabaseUrl()).toBe(REPO_DB);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("a RELATIVE DATABASE_URL still resolves into the repo's db/ folder", () => {
    expect(resolveDatabaseUrl("file:../db/custom.db")).toBe(REPO_DB);
  });

  it("an ABSOLUTE DATABASE_URL passes through when nothing relative is declared", () => {
    // Production deployments set an absolute URL (docs/DEPLOYMENT.md) —
    // with no relative .env declaration the explicit value wins.
    const absolute = "file:/srv/data/nexuslearn.db";
    expect(resolveDatabaseUrl(absolute, { declaredUrl: null })).toBe(absolute);
  });

  it("an ABSOLUTE DATABASE_URL passes through when .env itself declares an absolute one", () => {
    const absolute = "file:/srv/data/nexuslearn.db";
    expect(
      resolveDatabaseUrl(absolute, { declaredUrl: "file:/srv/data/nexuslearn.db" }),
    ).toBe(absolute);
  });

  it("non-file URLs pass through untouched", () => {
    const pg = "postgresql://user:password@localhost:5432/nexuslearn";
    expect(resolveDatabaseUrl(pg)).toBe(pg);
  });

  it("undefined stays undefined", () => {
    const had = process.env.DATABASE_URL;
    delete process.env.DATABASE_URL;
    try {
      expect(resolveDatabaseUrl(undefined, { declaredUrl: null })).toBeUndefined();
    } finally {
      if (had !== undefined) process.env.DATABASE_URL = had;
    }
  });
});
