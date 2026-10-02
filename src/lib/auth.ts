import "server-only";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { verifySessionToken, SESSION_MAX_AGE, type SessionUser } from "@/lib/session";

/**
 * First-party cookie sessions — HMAC-SHA256 signed, no external auth service.
 * Pure crypto lives in `@/lib/session` (testable without Next.js runtime);
 * this module adds the cookies() adapter for RSC + route handlers.
 *
 * SESSION_MAX_AGE lives in `@/lib/session` (the single source of truth) —
 * the same window bounds BOTH the browser cookie (maxAge below) and the
 * server-side token verification (session 32).
 */

export const SESSION_COOKIE = "nexus_session";

export type { SessionUser };
export {
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
  SESSION_MAX_AGE,
  SESSION_MAX_AGE_MS,
  SESSION_CLOCK_SKEW_MS,
  // session-33: the timing equalizer + the enforced-secret contract.
  timingEqualizerHash,
  TIMING_EQUALIZER_PASSWORD,
  resolveSessionSecret,
  SessionSecretError,
} from "@/lib/session";

/**
 * Read the current session from cookies (RSC + route handlers).
 *
 * Session 34 — the revocation contract: the token's claims are RE-VALIDATED
 * against the database on every read. The pure verifySessionToken proves the
 * signature + the iat window; this adapter additionally proves the USER
 * still exists and the token's epoch (`ver`) matches the user's current
 * `sessionVersion`. Pre-fix a DELETED user's token authenticated until its
 * 7-day iat bound (the ghost-token probe) and the only revocation lever was
 * rotating the global AUTH_SECRET. The session's email/name also refresh
 * from the row, so a renamed user's token cannot serve stale claims.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = verifySessionToken(store.get(SESSION_COOKIE)?.value);
  if (!token) return null;
  const user = await db.user.findUnique({
    where: { id: token.userId },
    select: { email: true, name: true, sessionVersion: true },
  });
  if (!user || user.sessionVersion !== (token.ver ?? 0)) return null;
  return { userId: token.userId, email: user.email, name: user.name, ver: user.sessionVersion };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
