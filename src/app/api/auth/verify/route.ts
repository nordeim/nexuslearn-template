import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, SessionSecretError } from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

/**
 * POST /api/auth/verify — confirm the 6-digit signup code and sign in.
 *
 * The template has no SMTP transport, so delivery is simulated and any
 * complete 6-digit code verifies the account (documented deviation — wire
 * real email + code comparison before production use). Verifying also sets
 * the session cookie, matching the reference flow which signs the user in
 * immediately after verification.
 *
 * Session 33: this is the SEVENTH public POST route — it mints the session
 * cookie, so it carries the full session-31 guard stack (the per-IP
 * throttle first, then the 413 body-size pre-check, then the email field
 * cap). Pre-fix a 14x burst returned 14x 200 — every request verified the
 * account AND minted a cookie; a >1MB body was parsed; a 100KB email
 * reached the DB lookup un-capped.
 */
export async function POST(req: NextRequest) {
  try {
    // session-33: the per-IP throttle first (the cheap rejection) — the
    // route mints sessions, so it gets signup's sibling limit.
    const verdict = checkRateLimit("verify", clientIp(req), RATE_LIMITS["verify"]);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-33: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const code = String(body.code ?? "").trim();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // session-33: the field cap (a bounded lookup key — the regex alone
    // happily passes a 100KB single-token email to the DB).
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
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
      createSessionToken(
        { userId: user.id, email: user.email, name: user.name },
        user.sessionVersion
      ),
      sessionCookieOptions
    );
    return res;
  } catch (err) {
    // session-33: the enforced AUTH_SECRET contract must fail LOUD, not be
    // muted into a generic 400 by this catch-all (the mint throws the typed
    // error when production runs without a real secret).
    if (err instanceof SessionSecretError) throw err;
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
