import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/ai/chat — NexusLearn AI Study Assistant.
 * Server-only z-ai-web-dev-sdk chat completion (never imported client-side).
 */
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    // Keep the last 12 turns to bound token usage
    const recent = messages.slice(-12).map(
      (m: { role?: string; content?: string }): { role: "user" | "assistant"; content: string } => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content ?? "").slice(0, 4000),
      })
    );

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      model: "glm-4.5",
      messages: [
        {
          role: "system",
          content:
            "You are the NexusLearn AI Study Assistant — an expert tutor covering programming, business, design, data science and more. Answer clearly and practically, with examples where useful. Keep answers focused on helping the user learn: explain concepts step by step, suggest practice exercises, and encourage the learner. Use markdown formatting when it improves readability.",
        },
        ...recent,
      ],
      thinking: { type: "disabled" },
    });

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
