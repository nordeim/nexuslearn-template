import { NextRequest, NextResponse } from "next/server";

import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

/**
 * POST /api/auth/forgot-password — request a password reset link.
 *
 * Reference behavior: the response is always ok (no user enumeration) and
 * the UI shows the same "Check your email" state whether or not the address
 * exists. This template ships no SMTP transport, so the request is logged
 * server-side (simulated delivery — documented deviation).
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

    console.info(`[auth] password reset requested for ${email} (simulated delivery)`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
