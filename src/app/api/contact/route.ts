import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, fieldTooLong, FIELD_LIMITS } from "@/lib/request-guard";

/** POST /api/contact — persist a contact-form message (form POST or fetch). */
export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection).
    const verdict = checkRateLimit("contact", clientIp(req), RATE_LIMITS.contact);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse — a 2MB message
    // previously parsed AND persisted).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const contentType = req.headers.get("content-type") ?? "";
    let name = "", email = "", subject = "General Inquiry", message = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      name = String(body.name ?? "").trim();
      email = String(body.email ?? "").trim();
      subject = String(body.subject ?? "General Inquiry").trim();
      message = String(body.message ?? "").trim();
    } else {
      const form = await req.formData();
      name = String(form.get("name") ?? "").trim();
      email = String(form.get("email") ?? "").trim();
      subject = String(form.get("subject") ?? "General Inquiry").trim();
      message = String(form.get("message") ?? "").trim();
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
    }
    // session-31: the field caps (bounded rows — the 2MB message class is
    // rejected at the door).
    if (fieldTooLong(name, FIELD_LIMITS.name)) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    if (fieldTooLong(email, FIELD_LIMITS.email)) {
      return NextResponse.json({ error: "Email is too long" }, { status: 400 });
    }
    if (fieldTooLong(subject, FIELD_LIMITS.subject)) {
      return NextResponse.json({ error: "Subject is too long" }, { status: 400 });
    }
    if (fieldTooLong(message, FIELD_LIMITS.message)) {
      return NextResponse.json({ error: "Message is too long" }, { status: 400 });
    }

    await db.contactMessage.create({ data: { name, email, subject, message } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
