import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

/**
 * POST /api/auth/signup — create an account (reference signup flow).
 *
 * Mirrors the reference behavior: a duplicate email that has already been
 * verified returns "A user with this email already exists"; re-submitting
 * for an existing UNVERIFIED account regenerates the code (the Resend
 * button in the verify view hits this route with resend: true).
 *
 * Email delivery is simulated: this template ships no SMTP transport, so
 * the 6-digit verification code is logged server-side and ANY complete
 * 6-digit code is accepted by /api/auth/verify (documented in the README —
 * wire real email before production use).
 */
export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("signup", clientIp(req), RATE_LIMITS.signup);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // session-31: the field caps (a 1MB email created a User whose derived
    // name was also 1MB — bounded at the door now).
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }
    if (fieldTooLong(password, FIELD_LIMITS.password)) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.emailVerified) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
      // Unverified account: refresh the stored credentials + code (resend).
      await db.user.update({
        where: { email },
        data: { passwordHash: hashPassword(password) },
      });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      console.info(`[auth] verification code for ${email}: ${code} (simulated delivery)`);
      return NextResponse.json({ ok: true });
    }

    // The reference greets users by the email prefix (the seeded demo user
    // follows the same convention).
    const name = email.split("@")[0];
    await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
        emailVerified: false,
      },
    });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    console.info(`[auth] verification code for ${email}: ${code} (simulated delivery)`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
