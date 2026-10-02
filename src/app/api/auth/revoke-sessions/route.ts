import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

/**
 * POST /api/auth/revoke-sessions — sign out of EVERY device (session 35).
 *
 * The session-34 per-user epoch gave operators a SQL-only revocation lever
 * (UPDATE User SET sessionVersion = sessionVersion + 1). This route is the
 * same lever for the ACCOUNT OWNER: one indexed increment kills every
 * outstanding token for the caller — including the presented one — and the
 * response clears the cookie with the session-32 attribute-symmetric
 * deletion form. The account itself survives (a fresh login re-mints at
 * the bumped epoch).
 *
 * Authed route (the session-31 deliberate-unthrottled family: it requires
 * a valid session, so the throttle would add nothing — an attacker WITH
 * the cookie wants to revoke; an attacker WITHOUT it gains nothing here).
 * Zero visual footprint: the byte-exact parity contract is untouched (the
 * UI affordance is deliberately deferred — any Dashboard/login surface
 * addition would break the pinned heights; documented as a future
 * beyond-reference decision in docs/session_70.md).
 */
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // The revocation: bump the per-user epoch. Every outstanding token
  // (including this request's) fails the getSession() epoch compare on
  // its next read.
  await db.user.update({
    where: { id: session.userId },
    data: { sessionVersion: { increment: 1 } },
  });

  const res = NextResponse.json({ ok: true });
  // session-32 pattern: the clearing Set-Cookie carries the SAME
  // HttpOnly/SameSite/Secure/Path attributes the login cookie carries.
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
