import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

/**
 * POST /api/auth/verify — confirm the 6-digit signup code and sign in.
 *
 * The template has no SMTP transport, so delivery is simulated and any
 * complete 6-digit code verifies the account (documented deviation — wire
 * real email + code comparison before production use). Verifying also sets
 * the session cookie, matching the reference flow which signs the user in
 * immediately after verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Enter the 6-digit verification code" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    await db.user.update({ where: { email }, data: { emailVerified: true } });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(
      SESSION_COOKIE,
      createSessionToken({ userId: user.id, email: user.email, name: user.name }),
      sessionCookieOptions
    );
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
