/**
 * The email transport seam (session 36 — the DEPLOYMENT §13 drill's step
 * 1, its ONLY remaining step). Server-only like the AI SDK import; no
 * Next.js imports so the unit tests (vitest, node environment) exercise
 * it directly (the `session.ts` / `verification.ts` pattern).
 *
 * ZERO NEW DEPENDENCIES by design (the session-32 dependency-hygiene
 * precedent): the Resend HTTP API is a plain `fetch` POST, so the
 * template ships a real, working transport without growing the install
 * graph. Swapping in nodemailer/SES later means implementing the same
 * two-function surface against this seam.
 *
 * The delivery modes (the AUTH_DELIVERY gate — the same env the
 * session-35 code comparison reads):
 *  - simulated (the default): the EXACT session-35 console.info line —
 *    the dev/test contract (any 6-digit code verifies; the code is logged
 *    server-side). The e2e suite runs here (playwright's webServer.env
 *    sets no AUTH_DELIVERY).
 *  - resend (AUTH_DELIVERY=smtp + RESEND_API_KEY): the real HTTP delivery
 *    — the operator wiring production email. EMAIL_FROM optionally brands
 *    the sender; RESEND_BASE_URL exists for the end-to-end proof (a
 *    local mock endpoint) and for Resend-compatible self-hosts.
 *  - misconfigured (AUTH_DELIVERY=smtp without a key): FAIL LOUD — the
 *    session-33 enforced-secret philosophy. An operator who declared
 *    real delivery must not silently watch codes drown in a log line
 *    users never read; the signup route surfaces this as a 502.
 */

/** The typed delivery failure (the SessionSecretError pattern — visible, not swallowed). */
export class MailerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailerError";
  }
}

export interface MailerEnv {
  AUTH_DELIVERY?: string | undefined;
  RESEND_API_KEY?: string | undefined;
  EMAIL_FROM?: string | undefined;
  RESEND_BASE_URL?: string | undefined;
  [key: string]: string | undefined;
}

/** The default sender (Resend's documented test address — override with EMAIL_FROM). */
const DEFAULT_FROM = "NexusLearn <onboarding@resend.dev>";

/** The Resend endpoint (overridable for the e2e proof / self-hosts). */
function resendEndpoint(env: MailerEnv): string {
  const base = env.RESEND_BASE_URL?.trim() || "https://api.resend.com";
  return `${base.replace(/\/+$/, "")}/emails`;
}

export type DeliveryMode = "simulated" | "resend" | "misconfigured";

/**
 * Which delivery channel the environment selects. The gate is the EXACT
 * string "smtp" (the `codeComparisonEnabled` contract — case-sensitive,
 * whitespace-sensitive: anything else keeps the simulated default).
 */
export function deliveryMode(env: MailerEnv): DeliveryMode {
  if (env.AUTH_DELIVERY !== "smtp") return "simulated";
  return env.RESEND_API_KEY && env.RESEND_API_KEY.trim().length > 0 ? "resend" : "misconfigured";
}

/** The verification email content (pure — the code never rides the subject). */
export function buildVerificationEmail(code: string): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = "Your NexusLearn verification code";
  const text =
    `Welcome to NexusLearn!\n\n` +
    `Your verification code is: ${code}\n\n` +
    `Enter it in the app to verify your email. The code expires in 10 minutes.\n\n` +
    `If you didn't create an account, you can ignore this email.`;
  const html =
    `<div style="font-family:Inter,system-ui,-apple-system,sans-serif;max-width:480px;margin:0 auto;padding:24px">` +
    `<h2 style="margin:0 0 12px">Welcome to NexusLearn!</h2>` +
    `<p style="margin:0 0 12px;color:#334155">Your verification code is:</p>` +
    `<p style="margin:0 0 12px;font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>` +
    `<p style="margin:0 0 12px;color:#64748b">Enter it in the app to verify your email. The code expires in 10 minutes.</p>` +
    `<p style="margin:0;color:#94a3b8;font-size:13px">If you didn't create an account, you can ignore this email.</p>` +
    `</div>`;
  return { subject, text, html };
}

/**
 * Deliver the signup verification code through the selected channel.
 * Returns "simulated" | "sent" so callers/tests can assert the path taken.
 * Throws the typed MailerError on any real-delivery failure.
 */
export async function sendVerificationEmail(
  env: MailerEnv,
  to: string,
  code: string,
  fetchImpl: typeof fetch = fetch
): Promise<"simulated" | "sent"> {
  const mode = deliveryMode(env);

  if (mode === "simulated") {
    // The EXACT session-35 log line — the simulated delivery channel the
    // s35 proof's log-grep and the operator's dev workflow rely on.
    console.info(`[auth] verification code for ${to}: ${code} (simulated delivery)`);
    return "simulated";
  }

  if (mode === "misconfigured") {
    throw new MailerError(
      "Email delivery is not configured: AUTH_DELIVERY=smtp requires RESEND_API_KEY (see docs/DEPLOYMENT.md §13)."
    );
  }

  const email = buildVerificationEmail(code);
  let res: Response;
  try {
    res = await fetchImpl(resendEndpoint(env), {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM?.trim() || DEFAULT_FROM,
        to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
  } catch (err) {
    throw new MailerError(
      `Email delivery failed (network): ${err instanceof Error ? err.message : String(err)}`
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new MailerError(`Email delivery failed (HTTP ${res.status}): ${body.slice(0, 200)}`);
  }
  return "sent";
}
