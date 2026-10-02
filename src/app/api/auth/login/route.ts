import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE,
  sessionCookieOptions,
  timingEqualizerHash,
  SessionSecretError,
} from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("login", clientIp(req), RATE_LIMITS.login);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    // session-31: the field caps (bounded lookup keys, bounded scrypt input).
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }
    if (fieldTooLong(password, FIELD_LIMITS.password)) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    // session-33: the timing equalizer — BOTH paths burn the same scrypt
    // compare, so the 401 no longer leaks whether the email exists (the
    // pre-fix drift was ~29ms: ~6ms not-found vs ~35ms real-user).
    const passwordOk = verifyPassword(password, user?.passwordHash ?? timingEqualizerHash());
    if (!user || !passwordOk) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // session-36: the unverified-account gate — the reference app BLOCKS
    // the session mint until the email is verified (probed on the live
    // through its own UI: the signin card shows the exact message below
    // and zero cookies are set; its raw API sits behind the documented
    // platform wall). The check runs AFTER the password-compare 401 gate:
    // a wrong-password caller still gets the indistinguishable 401, so
    // the account state is only revealed to a caller who already holds
    // the correct password — zero new enumeration oracle. 403 (not 401):
    // the credentials are valid, the account state forbids the session.
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error:
            "Please verify your email before logging in. Check your email for the verification code.",
        },
        { status: 403 }
      );
    }

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    res.cookies.set(SESSION_COOKIE, createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    }, user.sessionVersion), sessionCookieOptions);
    return res;
  } catch (err) {
    // session-33: the enforced AUTH_SECRET contract must fail LOUD, not be
    // muted into a generic 400 by this catch-all (the mint throws the typed
    // error when production runs without a real secret).
    if (err instanceof SessionSecretError) throw err;
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
