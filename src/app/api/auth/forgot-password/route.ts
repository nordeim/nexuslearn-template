import { NextRequest, NextResponse } from "next/server";

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
    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    console.info(`[auth] password reset requested for ${email} (simulated delivery)`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
