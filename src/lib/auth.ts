import "server-only";
import { cookies } from "next/headers";

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
} from "@/lib/session";

/** Read the current session from cookies (RSC + route handlers). */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
