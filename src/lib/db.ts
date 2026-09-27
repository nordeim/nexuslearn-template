import { PrismaClient } from "@prisma/client";

import { resolveDatabaseUrl } from "../../prisma/db-url";

// Prisma singleton — one client per process across RSC, route handlers and
// server actions (Next.js dev hot-reload would otherwise open a pool per
// import and exhaust SQLite handles). The URL resolver pins relative
// `file:` paths to the repo's db/ folder regardless of process CWD
// (see prisma/db-url.ts).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
