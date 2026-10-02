import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Pure session-token + password crypto — no Next.js imports, so unit tests
 * (vitest, node environment) can exercise it directly.
 *
 * Cookie format: base64url(JSON payload).base64url(HMAC-SHA256(payload))
 * The signing secret comes from AUTH_SECRET (falls back to a dev-only constant).
 */

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

/**
 * Session 32 — the server-side session-lifetime contract (single source of
 * truth). The cookie carries `maxAge` for the BROWSER jar; these constants
 * let the SERVER enforce the same window on the token's embedded `iat`, so a
 * restored/backed-up/exported cookie cannot outlive the promise.
 */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, seconds (cookie maxAge)
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1000; // the verify window
export const SESSION_CLOCK_SKEW_MS = 60 * 1000; // future-iat tolerance (clock drift)

/**
 * Session 33 — the typed error for the enforced AUTH_SECRET contract. The
 * login + verify routes wrap their bodies in catch-all 400s; a plain throw
 * there would be MUTED into a generic "Invalid request" — the typed error
 * is rethrown so a misconfigured production deployment fails LOUD (500 +
 * the actionable message) instead of silently.
 */
export class SessionSecretError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionSecretError";
  }
}

/**
 * Session 33 — the ENFORCED production secret contract (pure, so unit
 * tests can exercise every branch). Production (NODE_ENV === "production")
 * with an unset or <16-char AUTH_SECRET throws: the old console.warn left
 * every misconfigured deployment signing tokens with the PUBLIC repo
 * fallback constant — a forged token was accepted end-to-end (verified on
 * a deliberately secretless production standalone). Dev/test keep the
 * documented zero-config fallback.
 */
export function resolveSessionSecret(env: {
  NODE_ENV?: string;
  AUTH_SECRET?: string;
}): string {
  const secret = env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (env.NODE_ENV === "production") {
    throw new SessionSecretError(
      "AUTH_SECRET must be set to a >= 16 character value in production " +
        "(generate one with `openssl rand -hex 32`). Refusing to sign or verify " +
        "session tokens with the public dev fallback constant."
    );
  }
  return "nexuslearn-dev-only-insecure-secret";
}

function getSecret(): string {
  return resolveSessionSecret(process.env);
}

export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify({ ...user, iat: Date.now() })).toString("base64url");
  const mac = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifySessionToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof data.userId !== "string" || typeof data.email !== "string") return null;
    // session-32: server-side lifetime — the embedded iat bounds the token
    // itself (not just the browser's copy of it). Missing/malformed iat,
    // future-issued beyond the skew window, or older than the 7-day window
    // are all rejections.
    const iat = typeof data.iat === "number" ? data.iat : Number.NaN;
    if (!Number.isFinite(iat)) return null;
    const now = Date.now();
    if (iat > now + SESSION_CLOCK_SKEW_MS) return null;
    if (now - iat > SESSION_MAX_AGE_MS) return null;
    return { userId: data.userId, email: data.email, name: String(data.name ?? "") };
  } catch {
    return null;
  }
}

/**
 * Session 33 — the login timing equalizer. The pre-fix login 401 path
 * short-circuited on user-not-found (~6ms) while the user-exists path
 * burned scryptSync (~35ms) — a 29ms user-existence timing oracle. The
 * login route burns this dummy compare on the not-found path so BOTH
 * paths pay the same scrypt cost. Lazily computed ONCE, then cached.
 */
export const TIMING_EQUALIZER_PASSWORD = "nexuslearn-timing-equalizer-constant";

let equalizerHash: string | null = null;

export function timingEqualizerHash(): string {
  equalizerHash ??= hashPassword(TIMING_EQUALIZER_PASSWORD);
  return equalizerHash;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
