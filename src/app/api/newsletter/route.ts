import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

/** POST /api/newsletter — subscribe an email (form POST or fetch). */
export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("newsletter", clientIp(req), RATE_LIMITS.newsletter);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse — a 1MB email
    // previously parsed AND persisted).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let email = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      email = String(body.email ?? "").trim().toLowerCase();
    } else {
      const form = await req.formData();
      email = String(form.get("email") ?? "").trim().toLowerCase();
    }

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }
    // session-31: the field cap (a 1MB email passed the regex and persisted
    // — bounded at the door now).
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }

    await db.subscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
