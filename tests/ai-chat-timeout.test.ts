import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  AI_CHAT_TIMEOUT_MS,
  AiChatTimeoutError,
  withTimeout,
} from "@/lib/ai-chat";

/**
 * Session 38 — the AI-chat timeout seam (fresh-eyes family 2: the s37
 * mailer-timeout sibling). `POST /api/ai/chat` awaits the SDK's raw fetch
 * (verified: the SDK accepts no `signal` parameter) with NO bound — a hung
 * LLM endpoint pinned the route indefinitely. The seam races the completion
 * against a typed timeout; the route's existing catch maps it to the same
 * 502 + friendly message.
 */

describe("withTimeout — the bounded-await race (session 38)", () => {
  it("passes a fast resolution through untouched", async () => {
    const result = await withTimeout(Promise.resolve("ok"), 1000, "test");
    expect(result).toBe("ok");
  });

  it("resolves with the winner's VALUE when the promise beats the bound", async () => {
    const value = await withTimeout(
      new Promise<string>((resolve) => setTimeout(() => resolve("late-ok"), 20)),
      5000,
      "test"
    );
    expect(value).toBe("late-ok");
  });

  it("rejects with the typed error when the bound wins (a never-resolving await)", async () => {
    const never = new Promise<string>((_resolve) => {
      /* never resolves — the hung-endpoint shape */
    });
    await expect(withTimeout(never, 5, "ai chat completion")).rejects.toThrow(
      AiChatTimeoutError
    );
  });

  it("the typed error carries the label + the bound (the log-line contract)", async () => {
    const never = new Promise<never>(() => {});
    try {
      await withTimeout(never, 5, "ai chat completion");
      expect.unreachable("must throw");
    } catch (err) {
      expect(err).toBeInstanceOf(AiChatTimeoutError);
      const message = (err as AiChatTimeoutError).message;
      expect(message).toContain("ai chat completion");
      expect(message).toContain("5");
    }
  });

  it("propagates the ORIGINAL rejection when the promise fails fast", async () => {
    const boom = Promise.reject(new Error("sdk down"));
    await expect(withTimeout(boom, 5000, "test")).rejects.toThrow("sdk down");
  });

  it("the default bound is the LLM-legitimate 60s window (a constant, not a knob)", () => {
    expect(AI_CHAT_TIMEOUT_MS).toBe(60_000);
  });
});

describe("ai-chat route source pin (session 38)", () => {
  const ROUTE = readFileSync(
    join(process.cwd(), "src/app/api/ai/chat/route.ts"),
    "utf8"
  );

  it("the route delegates the completion to the bounded seam (no direct SDK await left)", () => {
    expect(ROUTE).toContain("callAiCompletion");
    expect(ROUTE).not.toMatch(/await\s+zai\.chat\.completions\.create/);
  });

  it("the route maps the timeout to the existing 502 degrade family", () => {
    // the catch stays the single degrade path — the timeout joins it via
    // the typed error (never a raw crash)
    expect(ROUTE).toMatch(/status: 502/);
  });
});

describe("withTimeout — the late-rejecting loser invariant (session 39)", () => {
  // The losing promise keeps running when the bound wins (the SDK accepts
  // no signal — documented). Its LATER rejection is consumed by
  // Promise.race's internal handlers (race attaches handlers to every input
  // at creation; settling an already-settled race is a no-op), so NO
  // unhandledRejection fires. This is the empirical pin of that analysis:
  // a hung-then-reset socket (the 60s bound fires, the socket dies at 90s
  // and rejects) must never take down the standalone server process
  // (Node >= 15 default: an unhandled rejection crashes).
  it("a loser rejected AFTER the bound won raises NO unhandledRejection", async () => {
    const unhandled: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      unhandled.push(reason);
    };
    process.on("unhandledRejection", onUnhandled);
    try {
      let rejectLoser!: (reason: Error) => void;
      const loser = new Promise<never>((_, reject) => {
        rejectLoser = reject;
      });
      const raced = withTimeout(loser, 5, "late loser test");
      await expect(raced).rejects.toBeInstanceOf(AiChatTimeoutError);
      // the loser rejects LATE (after the race already settled)
      rejectLoser(new Error("the socket died at 90s"));
      // give the microtask queue time to surface any unhandled rejection
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(unhandled).toEqual([]);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });
});
