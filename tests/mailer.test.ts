import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi, afterEach } from "vitest";

import {
  buildResetEmail,
  buildVerificationEmail,
  deliveryMode,
  MailerError,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "@/lib/mailer";

// Session 36 — the SMTP transport surface (the DEPLOYMENT §13 drill's
// step 1, its ONLY remaining step). Pre-fix: no transport module existed —
// the signup route delivered the 6-digit code via console.info in BOTH
// branches regardless of the AUTH_DELIVERY gate, so an operator who enabled
// the session-35 real code comparison locked every new user out (the code
// was compared for real but never left the server log).
//
// The shipped seam: a ZERO-NEW-DEPENDENCY transport — the Resend HTTP API
// is a plain fetch POST (the session-32 dependency-hygiene precedent).
// The simulated default keeps the dev/test any-code contract (the e2e
// webServer env sets no AUTH_DELIVERY — verified in playwright.config.ts).

const REPO = join(import.meta.dirname, "..");

afterEach(() => {
  vi.restoreAllMocks();
});

describe("session-36: the mailer transport seam", () => {
  it("buildVerificationEmail embeds the code in the subject, text and html", () => {
    const email = buildVerificationEmail("654321");
    expect(email.subject).toContain("verification code");
    expect(email.subject, "the subject never carries the code (inbox-list previews)").not.toContain("654321");
    expect(email.text).toContain("654321");
    expect(email.html).toContain("654321");
  });

  it("deliveryMode: AUTH_DELIVERY unset -> simulated (the dev/test default)", () => {
    expect(deliveryMode({})).toBe("simulated");
    expect(deliveryMode({ AUTH_DELIVERY: undefined })).toBe("simulated");
  });

  it("deliveryMode: any non-smtp value stays simulated (the gate is exact-match, like codeComparisonEnabled)", () => {
    expect(deliveryMode({ AUTH_DELIVERY: "SMTP" })).toBe("simulated");
    expect(deliveryMode({ AUTH_DELIVERY: "smtp " })).toBe("simulated");
    expect(deliveryMode({ AUTH_DELIVERY: "sendgrid" })).toBe("simulated");
  });

  it("deliveryMode: smtp + RESEND_API_KEY -> resend", () => {
    expect(deliveryMode({ AUTH_DELIVERY: "smtp", RESEND_API_KEY: "re_test" })).toBe("resend");
  });

  it("deliveryMode: smtp WITHOUT a key -> misconfigured (fail loud, never silently log-only)", () => {
    expect(deliveryMode({ AUTH_DELIVERY: "smtp" })).toBe("misconfigured");
    expect(deliveryMode({ AUTH_DELIVERY: "smtp", RESEND_API_KEY: "" })).toBe("misconfigured");
  });

  it("simulated send logs the EXACT session-35 line and never touches the network", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchSpy = vi.fn();
    const result = await sendVerificationEmail(
      { AUTH_DELIVERY: undefined },
      "user@example.com",
      "123456",
      fetchSpy as unknown as typeof fetch
    );
    expect(result).toBe("simulated");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      "[auth] verification code for user@example.com: 123456 (simulated delivery)"
    );
  });

  it("resend send POSTs to the Resend endpoint with the Bearer key and the built email", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "email-1" }), { status: 200 })
    );
    const result = await sendVerificationEmail(
      { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "re_test_key", EMAIL_FROM: "NexusLearn <hi@example.com>" },
      "learner@example.com",
      "987654",
      fetchSpy as unknown as typeof fetch
    );
    expect(result).toBe("sent");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_test_key");
    const body = JSON.parse(String(init.body));
    expect(body.from).toBe("NexusLearn <hi@example.com>");
    expect(body.to).toBe("learner@example.com");
    expect(body.subject).toContain("verification code");
    expect(body.text).toContain("987654");
    expect(body.html).toContain("987654");
  });

  it("resend send honors RESEND_BASE_URL (the testability knob — the end-to-end proof runs a local mock)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response("{}", { status: 200 })
    );
    await sendVerificationEmail(
      { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k", RESEND_BASE_URL: "http://localhost:3555" },
      "learner@example.com",
      "111222",
      fetchSpy as unknown as typeof fetch
    );
    expect(String(fetchSpy.mock.calls[0][0])).toBe("http://localhost:3555/emails");
  });

  it("resend send defaults the from address (no EMAIL_FROM required to start)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    await sendVerificationEmail(
      { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
      "learner@example.com",
      "222333",
      fetchSpy as unknown as typeof fetch
    );
    const body = JSON.parse(String(fetchSpy.mock.calls[0][1].body));
    expect(body.from).toContain("NexusLearn");
  });

  it("a non-2xx Resend response throws MailerError (the delivery failure is visible)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "invalid from" }), { status: 422 })
    );
    await expect(
      sendVerificationEmail(
        { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
        "learner@example.com",
        "333444",
        fetchSpy as unknown as typeof fetch
      )
    ).rejects.toBeInstanceOf(MailerError);
  });

  it("a network failure throws MailerError (not the raw fetch error)", async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    await expect(
      sendVerificationEmail(
        { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
        "learner@example.com",
        "444555",
        fetchSpy as unknown as typeof fetch
      )
    ).rejects.toBeInstanceOf(MailerError);
  });

  it("the misconfigured mode throws MailerError with the config hint (fail loud, the s33 philosophy)", async () => {
    expect(() => deliveryMode({ AUTH_DELIVERY: "smtp" })).not.toThrow();
    await expect(
      sendVerificationEmail({ AUTH_DELIVERY: "smtp" }, "learner@example.com", "555666")
    ).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("source pin: the signup route wires sendVerificationEmail in BOTH branches (create + unverified-resend)", () => {
    const src = readFileSync(join(REPO, "src/app/api/auth/signup/route.ts"), "utf8");
    const calls = src.match(/sendVerificationEmail\(/g) ?? [];
    expect(calls.length, "exactly two wirings — the create branch and the resend branch").toBe(2);
    expect(src, "imports the mailer seam").toMatch(/from "@\/lib\/mailer"/);
    expect(src, "no direct console.info delivery left in the route").not.toMatch(/console\.info\(.{0,80}verification code/);
  });

  it("source pin: the signup route degrades with 502 on MailerError (the AI-route shape)", () => {
    const src = readFileSync(join(REPO, "src/app/api/auth/signup/route.ts"), "utf8");
    expect(src).toContain("MailerError");
    expect(src).toMatch(/status: 502/);
  });
});

describe("session-37: the reset-email family + the delivery timeout", () => {
  it("buildResetEmail embeds the reset link in the text and html (never the subject)", () => {
    const url = "http://localhost:3000/reset-password?token=abc123";
    const email = buildResetEmail(url);
    expect(email.subject).toContain("password");
    expect(email.subject, "the subject never carries the token (inbox-list previews)").not.toContain("token=abc123");
    expect(email.text).toContain(url);
    expect(email.html).toContain(url);
  });

  it("simulated reset send logs the reset-link line and never touches the network", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const fetchSpy = vi.fn();
    const result = await sendPasswordResetEmail(
      { AUTH_DELIVERY: undefined },
      "user@example.com",
      "http://localhost:3000/reset-password?token=abc123",
      fetchSpy as unknown as typeof fetch
    );
    expect(result).toBe("simulated");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      "[auth] password reset link for user@example.com: http://localhost:3000/reset-password?token=abc123 (simulated delivery)"
    );
  });

  it("resend reset send POSTs the link email with the Bearer key", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await sendPasswordResetEmail(
      { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "re_key" },
      "learner@example.com",
      "http://localhost:3000/reset-password?token=def456",
      fetchSpy as unknown as typeof fetch
    );
    expect(result).toBe("sent");
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_key");
    const body = JSON.parse(String(init.body));
    expect(body.to).toBe("learner@example.com");
    expect(body.text).toContain("/reset-password?token=def456");
    expect(body.html).toContain("/reset-password?token=def456");
  });

  it("a non-2xx reset send throws MailerError; the misconfigured mode throws too", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("{}", { status: 500 }));
    await expect(
      sendPasswordResetEmail(
        { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
        "learner@example.com",
        "http://localhost:3000/reset-password?token=x",
        fetchSpy as unknown as typeof fetch
      )
    ).rejects.toBeInstanceOf(MailerError);
    await expect(
      sendPasswordResetEmail(
        { AUTH_DELIVERY: "smtp" },
        "learner@example.com",
        "http://localhost:3000/reset-password?token=x"
      )
    ).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("a HUNG Resend endpoint aborts at the timeout and throws MailerError (the availability fix)", async () => {
    // Pre-fix: the fetch carried NO signal — a black-hole RESEND_BASE_URL
    // pinned POST /api/auth/signup indefinitely (requests piled up on a
    // delivery that never resolves). The AbortController caps the wait.
    // A fetch impl that honors the init.signal our seam passes:
    const fetchSpy = vi.fn(
      (_url: string | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            const err = new Error("The operation was aborted");
            err.name = "AbortError";
            reject(err);
          });
        })
    );
    await expect(
      sendVerificationEmail(
        { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
        "learner@example.com",
        "123456",
        fetchSpy as unknown as typeof fetch,
        { timeoutMs: 25 }
      )
    ).rejects.toBeInstanceOf(MailerError);
    const firstCall = fetchSpy.mock.calls[0];
    expect(firstCall?.[1]?.signal, "the seam passes an AbortSignal").toBeTruthy();
    await expect(
      sendPasswordResetEmail(
        { AUTH_DELIVERY: "smtp", RESEND_API_KEY: "k" },
        "learner@example.com",
        "http://localhost:3000/reset-password?token=x",
        fetchSpy as unknown as typeof fetch,
        { timeoutMs: 25 }
      )
    ).rejects.toBeInstanceOf(MailerError);
  });

  it("source pin: the timeout is wired in the seam (AbortController + the default cap)", () => {
    const src = readFileSync(join(REPO, "src/lib/mailer.ts"), "utf8");
    expect(src).toContain("AbortController");
    expect(src).toMatch(/signal/);
    expect(src).toMatch(/10_000|10000/);
  });
});
