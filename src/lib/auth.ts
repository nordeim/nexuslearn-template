import "server-only";
import { cookies } from "next/headers";

import { verifySessionToken, type SessionUser } from "@/lib/session";

/**
 * First-party cookie sessions — HMAC-SHA256 signed, no external auth service.
 * Pure crypto lives in `@/lib/session` (testable without Next.js runtime);
 * this module adds the cookies() adapter for RSC + route handlers.
 */

export const SESSION_COOKIE = "nexus_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type { SessionUser };
export { createSessionToken, hashPassword, verifyPassword, verifySessionToken } from "@/lib/session";

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
