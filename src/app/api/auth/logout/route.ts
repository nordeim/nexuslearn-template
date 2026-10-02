import { NextResponse } from "next/server";

import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // session-32: attribute-symmetric deletion — the clearing Set-Cookie
  // carries the SAME HttpOnly/SameSite/Secure/Path attributes the login
  // cookie carries (RFC 6265 identifies by name+domain+path, but symmetric
  // attributes are strict hygiene for proxies/embedded browsers).
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return res;
}
