import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

/** POST /api/newsletter — subscribe an email (form POST or fetch). */
export async function POST(req: NextRequest) {
  try {
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
