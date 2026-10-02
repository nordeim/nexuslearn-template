import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { MailerError, sendPasswordResetEmail } from "@/lib/mailer";
import { resolveSessionSecret, SessionSecretError } from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";
import {
  generateResetToken,
  hashResetTokenForStorage,
  resetExpiryFromNow,
} from "@/lib/verification";

/**
 * POST /api/auth/forgot-password — request a password reset link.
 *
 * Reference behavior: the response is always ok (no user enumeration) and
 * the UI shows the same "Check your email" state whether or not the
 * address exists.
 *
 * Session 37 (the drill's step 6 — the /reset-password parity gap): for an
 * EXISTING user the route now MINTS a single-use bearer token (32 bytes,
 * persisted as an HMAC-SHA256 hash — never the raw token at rest) with a
 * 10-minute expiry, and delivers the reset link through the transport seam
 * (`src/lib/mailer.ts`: the simulated log line by default, real Resend
 * HTTP delivery under AUTH_DELIVERY=smtp + RESEND_API_KEY). The link lands
 * on the reference's /reset-password route (consumed by
 * POST /api/auth/reset-password).
 *
 * Two deliberate contract points:
 *  - The MISS path pays the SAME crypto cost (the s33 timing-equalizer
 *    precedent): both branches mint + hash a token, so the response and
 *    its CPU-time profile stay indistinguishable — no enumeration oracle.
 *  - A MailerError on the HIT path is SWALLOWED into the ok response
 *    (logged server-side) — the no-enumeration contract outranks the
 *    fail-loud contract HERE: a 502 only for existing emails would leak
 *    the account-existence signal the always-ok shape exists to hide.
 *    (The signup route 502s because its caller has already proven the
 *    email exists — theirs.)
 */
export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("forgot-password", clientIp(req), RATE_LIMITS["forgot-password"]);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // session-31: the field cap (a bounded log line, not a megabyte one).
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }

    // The timing equalizer's shared cost: both paths mint + hash a token.
    // The MISS path discards it (no row to write, no delivery).
    const token = generateResetToken();

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      await db.user.update({
        where: { email },
        data: {
          resetTokenHash: hashResetTokenForStorage(token, resolveSessionSecret(process.env)),
          resetTokenExpiresAt: resetExpiryFromNow(),
        },
      });
      const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || req.nextUrl.origin;
      const resetUrl = `${origin}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail(process.env, email, resetUrl);
      } catch (err) {
        // The no-enumeration override: the delivery failure is VISIBLE to
        // the operator (the log), never to the caller (the response).
        if (err instanceof MailerError) {
          console.error(`[auth] ${err.message}`);
        } else {
          throw err;
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SessionSecretError) throw err;
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
