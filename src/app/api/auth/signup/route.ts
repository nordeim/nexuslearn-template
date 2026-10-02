import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { hashPassword, resolveSessionSecret, SessionSecretError } from "@/lib/auth";
import { MailerError, sendVerificationEmail } from "@/lib/mailer";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";
import { generateVerificationCode, hashCodeForStorage, codeExpiryFromNow } from "@/lib/verification";

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
 * wire real email before production use). Session 35 (the DEPLOYMENT §13
 * drill's first half): the code is now ALSO PERSISTED — an HMAC-SHA256
 * hash + a 10-minute expiry on the User row — so the verify route can
 * compare for real the moment an operator sets AUTH_DELIVERY=smtp (the
 * hash uses the AUTH_SECRET as its key; no new secret to manage).
 *
 * Session 36 (the drill's step 1 — its ONLY remaining step): delivery now
 * routes through the transport seam `src/lib/mailer.ts`. The simulated
 * default keeps the exact log line; AUTH_DELIVERY=smtp + RESEND_API_KEY
 * delivers for real via Resend's HTTP API (zero new dependencies); a
 * misconfigured gate fails LOUD with a 502 (the account row persists —
 * the Resend button recovers with a fresh code once the operator fixes
 * the config).
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
      // session-35: the code is persisted (hash + expiry) in BOTH branches.
      const code = generateVerificationCode();
      await db.user.update({
        where: { email },
        data: {
          passwordHash: hashPassword(password),
          verificationCode: hashCodeForStorage(code, resolveSessionSecret(process.env)),
          codeExpiresAt: codeExpiryFromNow(),
        },
      });
      // session-36: the transport seam (simulated log line by default;
      // Resend HTTP delivery under AUTH_DELIVERY=smtp + RESEND_API_KEY).
      await sendVerificationEmail(process.env, email, code);
      return NextResponse.json({ ok: true });
    }

    // The reference greets users by the email prefix (the seeded demo user
    // follows the same convention).
    const name = email.split("@")[0];
    const code = generateVerificationCode();
    await db.user.create({
      data: {
        email,
        name,
        passwordHash: hashPassword(password),
        emailVerified: false,
        verificationCode: hashCodeForStorage(code, resolveSessionSecret(process.env)),
        codeExpiresAt: codeExpiryFromNow(),
      },
    });
    // session-36: the transport seam (simulated log line by default;
    // Resend HTTP delivery under AUTH_DELIVERY=smtp + RESEND_API_KEY).
    await sendVerificationEmail(process.env, email, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    // session-35: the code hash needs the AUTH_SECRET — a misconfigured
    // production deployment fails LOUD here too (the session-33 contract:
    // auth-using requests fail fast, anonymous pages keep rendering).
    if (err instanceof SessionSecretError) throw err;
    // session-36: a delivery failure is VISIBLE, not swallowed — the
    // AI-route degrade shape (502 + the house { error } body). The account
    // row persists with its code hash, so the verify-view's Resend button
    // recovers the user with a fresh code once the operator fixes the
    // delivery config.
    if (err instanceof MailerError) {
      console.error(`[auth] ${err.message}`);
      return NextResponse.json(
        { error: "Email delivery is not configured. Please try again later." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
