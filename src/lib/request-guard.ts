/**
 * The request-size guard (session 31 — the request-size/payload-depth
 * surface, docs/remediation-plan-session31.md finding 1).
 *
 * The public writing routes accepted and PERSISTED unbounded strings: a
 * 1MB newsletter email returned 200 + the row; a 2MB contact message
 * likewise; a 1MB signup email created a User whose derived name was also
 * ~1MB. One curl per row could bloat the SQLite file without limit.
 *
 * Two layers, both pure and unit-pinned (tests/request-guard.test.ts):
 *
 *  1. the BODY pre-check — `Content-Length` strictly above 1MB is
 *     rejected 413 BEFORE any parsing (the cheap rejection; the largest
 *     legitimate request in the app is the ai/chat history — 12 turns x
 *     4,000 chars ~= 48KB, 20x under the cap). Chunked bodies without a
 *     Content-Length fall through to the field layer.
 *  2. the FIELD caps — after extraction, before persistence: email 254
 *     (the RFC 5321 practical max), password 1024, name/subject 200,
 *     message 10,000, the ai/chat turn count 100. Every cap is >= 40x the
 *     seeded catalog's longest field; none is reachable through the UI.
 *
 * The live reference offers no contract for these shapes — its platform
 * 405s every external POST to the writing APIs and demands "Security
 * verification" on login (its SPA submits through the Base44 internal
 * channel; docs/remediation-plan-session31.md finding 3). The clone owns
 * this surface entirely — the same deliberate-better family as the
 * session-24 CSP and the session-26 verb guard.
 */

/** The request-body ceiling (bytes). */
export const MAX_BODY_BYTES = 1_000_000;

/** The per-field length caps (characters unless noted). */
export const FIELD_LIMITS = {
  email: 254,
  password: 1024,
  name: 200,
  subject: 200,
  message: 10_000,
  /** The ai/chat messages-array length (turns). */
  chatTurns: 100,
} as const;

/** True when the request's declared Content-Length exceeds the cap. */
export function bodyTooLarge(contentLength: number): boolean {
  return contentLength > MAX_BODY_BYTES;
}

/** True when the extracted string exceeds its cap (strictly greater). */
export function fieldTooLong(value: string, max: number): boolean {
  return value.length > max;
}
