import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import {
  hashPassword,
  resolveSessionSecret,
  SESSION_COOKIE,
  sessionCookieOptions,
  SessionSecretError,
} from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";
import {
  hashResetTokenForStorage,
  isCodeExpired,
  resetTokenMatches,
} from "@/lib/verification";

/**
 * POST /api/auth/reset-password — consume a password-reset token and set
 * the new password (session 37 — the drill's step 6, the consumption leg of
 * the /reset-password parity gap: the LIVE ships the flow; the clone
 * 404'd).
 *
 * The reference contract (probed through the live's own UI):
 *  - The page renders the "Set new password" form for ANY non-empty
 *    `?token=` (optimistic — the validation happens HERE).
 *  - An invalid/expired/absent token at submit returns 400 with the
 *    exact message "Invalid or expired reset token" (the live's alert
 *    text, rendered by the client in the [role=alert] slot).
 *  - The client validates the confirm-match + the length locally
 *    ("Passwords do not match" / "Password must be at least 8 characters
 *    long") — this route re-validates the length defensively.
 *
 * The consumption semantics (the security contract):
 *  - The token is SINGLE-USE: the successful update CLEARS both stored
 *    fields (the s35 housekeeping pattern).
 *  - A successful reset BUMPS the user's sessionVersion (the session-34
 *    epoch lever): every outstanding session for the account dies with
 *    the old password — the industry-standard consequence, for free.
 *  - The caller's cookie (if any) is cleared attribute-symmetrically (the
 *    logout shape — harmless when absent).
 */
export async function POST(req: NextRequest) {
  try {
    // session-37: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("reset-password", clientIp(req), RATE_LIMITS["reset-password"]);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-37: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const body = await req.json();
    const token = String(body.token ?? "");
    const password = String(body.password ?? "");

    if (!token || !password) {
      return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
    }
    // session-37: the field caps (a bounded lookup key; bounded scrypt input).
    if (fieldTooLong(token, FIELD_LIMITS.resetToken)) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }
    if (fieldTooLong(password, FIELD_LIMITS.password)) {
      return NextResponse.json({ error: "Password is too long" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const secret = resolveSessionSecret(process.env);
    const user = await db.user.findFirst({
      where: { resetTokenHash: hashResetTokenForStorage(token, secret) },
    });

    // Fail-closed: absent storage, a hash mismatch, or a lapsed window all
    // render the SAME 400 (the exact reference message — no oracle about
    // WHICH leg failed; the lookup itself is the hash, so the timing-safe
    // compare is the belt-and-suspenders re-assertion).
    if (
      !user ||
      !resetTokenMatches(user.resetTokenHash, token, secret) ||
      isCodeExpired(user.resetTokenExpiresAt)
    ) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
    }

    // The single consumption write: the new hash + the cleared token +
    // the epoch bump in ONE update (the atomic single-use contract).
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(password),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        sessionVersion: { increment: 1 },
      },
    });

    const res = NextResponse.json({ ok: true });
    // Clear the caller's cookie if present (a signed-in user resetting
    // through a second device — the attribute-symmetric deletion form).
    res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
    return res;
  } catch (err) {
    if (err instanceof SessionSecretError) throw err;
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
