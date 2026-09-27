import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

/** POST /api/contact — persist a contact-form message (form POST or fetch). */
export async function POST(req: NextRequest) {
  try {
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

    await db.contactMessage.create({ data: { name, email, subject, message } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
