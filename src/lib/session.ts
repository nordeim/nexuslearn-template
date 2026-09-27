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

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production" && !secret) {
    console.warn("[auth] AUTH_SECRET unset in production — using insecure dev fallback. Set it!");
  }
  return "nexuslearn-dev-only-insecure-secret";
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
    return { userId: data.userId, email: data.email, name: String(data.name ?? "") };
  } catch {
    return null;
  }
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
