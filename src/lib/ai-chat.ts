import ZAI from "z-ai-web-dev-sdk";

/**
 * The AI-chat timeout seam (session 38 — fresh-eyes family 2: the s37
 * mailer-timeout sibling). `POST /api/ai/chat` awaited the SDK's raw fetch
 * with NO bound (verified in the SDK's dist source: `createChatCompletion`
 * calls `fetch(url, {...})` with no `signal`, and the `create(body)` type
 * accepts none) — a hung/slow LLM endpoint pinned the route indefinitely.
 * This seam races the completion against a typed timeout; the route's
 * existing catch maps the error to the same 502 + friendly message.
 *
 * The bound: 60s — the LLM-legitimate window (thinking disabled, <= 12
 * turns, <= 4000 chars/turn). The mailer's 10s fits a simple email POST;
 * an LLM completion does not. A CONSTANT, not a knob (the mailer precedent):
 * operators do not tune per-request timeouts via env.
 *
 * The losing promise keeps running when the bound wins (the SDK accepts no
 * `signal` — documented): the socket dies at the OS level, but the ROUTE
 * returns within the bound, which is the failure mode being fixed (request
 * pile-up past the rate-limit bucket, the client's "Thinking..." spinning
 * forever).
 */

export const AI_CHAT_TIMEOUT_MS = 60_000;

export class AiChatTimeoutError extends Error {
  constructor(label: string, ms: number) {
    super(`${label} timed out after ${ms}ms`);
    this.name = "AiChatTimeoutError";
  }
}

/**
 * Races a promise against a timeout. The typed error wins when the bound
 * expires first; the original resolution/rejection passes through
 * untouched when the promise beats it.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new AiChatTimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/** The message shape the route validates before calling the seam. */
export type AiChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The bounded completion call: ZAI.create() (the local-fs config read —
 * bounded) + the chat completion raced against AI_CHAT_TIMEOUT_MS.
 */
export async function callAiCompletion(messages: AiChatMessage[]) {
  const completion = (async () => {
    const zai = await ZAI.create();
    return zai.chat.completions.create({
      model: "glm-4.5",
      messages: [
        {
          role: "system",
          content:
            "You are the NexusLearn AI Study Assistant — an expert tutor covering programming, business, design, data science and more. Answer clearly and practically, with examples where useful. Keep answers focused on helping the user learn: explain concepts step by step, suggest practice exercises, and encourage the learner. Use markdown formatting when it improves readability.",
        },
        ...messages,
      ],
      thinking: { type: "disabled" },
    });
  })();
  return withTimeout(completion, AI_CHAT_TIMEOUT_MS, "ai chat completion");
}
