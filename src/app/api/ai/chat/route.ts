import { NextRequest, NextResponse } from "next/server";

import { callAiCompletion } from "@/lib/ai-chat";
import { RATE_LIMITS, checkRateLimit, clientIp, rateLimitResponse } from "@/lib/rate-limit";
import { bodyTooLarge, FIELD_LIMITS } from "@/lib/request-guard";

/**
 * POST /api/ai/chat — NexusLearn AI Study Assistant.
 * Server-only z-ai-web-dev-sdk chat completion (never imported client-side).
 */
export async function POST(req: NextRequest) {
  try {
    // session-31: the per-IP throttle first (the cheap rejection — an LLM
    // call is the most expensive request in the app).
    const verdict = checkRateLimit("ai-chat", clientIp(req), RATE_LIMITS["ai-chat"]);
    if (!verdict.ok) return rateLimitResponse(verdict);

    // session-31: the body-size pre-check (before any parse).
    if (bodyTooLarge(Number(req.headers.get("content-length") ?? 0))) {
      return NextResponse.json({ error: "Request body too large" }, { status: 413 });
    }

    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }
    // session-31: the turn cap (the client sends the last 12 turns; 100 is
    // defense-in-depth against a synthetic array).
    if (messages.length > FIELD_LIMITS.chatTurns) {
      return NextResponse.json({ error: "messages array is too long" }, { status: 400 });
    }

    // Keep the last 12 turns to bound token usage
    const recent = messages.slice(-12).map(
      (m: { role?: string; content?: string }): { role: "user" | "assistant"; content: string } => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, 4000),
      })
    );

    // Session 38: the completion routes through the BOUNDED seam
    // (src/lib/ai-chat.ts — the s37 mailer-timeout sibling). The SDK's raw
    // fetch carries no signal and accepts none, so the seam races it against
    // a 60s bound; a hung endpoint now degrades to this route's existing
    // 502 + friendly message instead of pinning the request forever.
    const completion = await callAiCompletion(recent);

    const reply = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[ai/chat]", err);
    return NextResponse.json(
      { error: "The AI assistant is unavailable right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
