/**
 * The 404-metadata seam (session 38 — fresh-eyes family 1: a REAL functional
 * parity drift found by probing the live's raw HTML head).
 *
 * The live derives the 404 view's ENTIRE head family from the RAW REQUEST
 * PATH — server-rendered (its SSR HTML carries it; not a client-side swap):
 *
 *  - document title = the last NON-EMPTY path segment (percent-decoded),
 *    lodash-startCase-style, + " | NexusLearn".
 *    Probed shapes: "/definitely-not-a-real-route" -> "Definitely Not A Real
 *    Route | NexusLearn"; "/RESET-PASSWORD" -> "RESET PASSWORD | NexusLearn"
 *    (the rest of each word is PRESERVED, not lowercased); "/cOurSes" ->
 *    "C Our Ses | NexusLearn" (words split at lower->upper camel boundaries);
 *    "/UPPER_CASE_word" -> "UPPER CASE Word"; "/with123numbers" ->
 *    "With123numbers" (digits never split); "/a.b.c" -> "A.b.c" (dots never
 *    split); "/Courses/deeper/missing" -> "Missing | NexusLearn" (the LAST
 *    non-empty segment); "/trailing/" -> "Trailing | NexusLearn".
 *
 *  - canonical = the raw path, TRAILING SLASH STRIPPED, QUERY INCLUDED
 *    ("/no-such-page?x=1" -> ".../no-such-page?x=1"); og:title +
 *    twitter:title mirror the derived title; og:url + twitter:url mirror the
 *    canonical (probed: all three carry the query).
 *
 *  - one deliberate variance (documented, the s17 deliberate-better family):
 *    the live DECODES the canonical ("/%20space%20word" -> a literal space
 *    in the href — an invalid URL, artifact-grade output). The clone keeps
 *    the percent-encoded form (the Next metadata API re-encodes by
 *    construction — a valid canonical URL).
 *
 * The wiring: the proxy (src/proxy.ts) injects the raw path + search as
 * REQUEST headers; the root layout's generateMetadata (src/app/layout.tsx)
 * derives the family through this seam. Every real page restates its full
 * payload via routeMetadata() (gotcha 18 — a child's openGraph/twitter
 * REPLACE the root's wholesale), so the derived values surface ONLY on
 * not-found renders. The four no-title renders (/, /Home, /login,
 * /reset-password) pin the ABSOLUTE plain title (src/lib/metadata.ts) —
 * they never inherit the derived default.
 */

import { processCanonicalQuery } from "./canonical-query";

const SITE_NAME = "NexusLearn";

/**
 * The reference title-caser: insert a boundary at every lower/digit ->
 * upper transition (the camel humps), split on hyphen/underscore runs,
 * uppercase each word's FIRST letter and PRESERVE the rest.
 */
export function startCaseSegment(raw: string): string {
  return raw
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .split(/ +/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

/**
 * The derived 404 document title: startCase of the LAST non-empty segment
 * (percent-decoded) + " | NexusLearn". The empty path falls back to the
 * plain root title (unreachable in practice — every request carries a path;
 * the fail-safe default).
 *
 * Session 39 — the decode-ORDER contract (fresh-eyes family A): the live
 * decodes the FULL raw path FIRST, THEN splits on "/" — the last non-empty
 * DECODED segment is the title source. The previous seam split the raw
 * path first and decoded only the last raw segment, which diverges exactly
 * when a segment carries an encoded slash (%2F): "/enc%2Fslash" titled
 * "Enc/slash" instead of the live's "Slash" (decode -> "/enc/slash" ->
 * the last segment "slash"). Probed on 7 shapes: /a%2F -> "A" (the decoded
 * trailing slash behaves as a real trailing slash), /a%2Fb%2Fc -> "C",
 * /%2F -> the plain root title (decode -> "/" -> no non-empty segment),
 * /x%2FmyPage -> "My Page" (the decoded segment's camel humps still split).
 * On every s38-pinned shape the output is byte-identical (the decode is a
 * no-op on plain-ASCII paths, and the space shapes split identically inside
 * startCaseSegment).
 */
export function notFoundTitle(rawPath: string): string {
  let decodedPath = rawPath;
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch {
    // malformed percent-encoding — the raw path is the fail-safe form
    // (the live's infra 400s these shapes before the app; the clone's own
    // 404 + raw-segment title is its documented contract)
  }
  const segments = decodedPath.split("/").filter((s) => s.length > 0);
  const last = segments[segments.length - 1];
  if (!last) return SITE_NAME;
  const cased = startCaseSegment(last);
  return cased ? `${cased} | ${SITE_NAME}` : SITE_NAME;
}

/**
 * The derived 404 canonical: the raw path with the trailing slash stripped,
 * the PROCESSED query appended. The empty path normalizes to the root.
 *
 * Session 39 — the query now routes through the canonical algorithm
 * (src/lib/canonical-query.ts — the same contract every real route follows:
 * tracking params dropped, the kept params alpha-sorted, URLSearchParams
 * serialization). The s38 raw pass-through only coincided with the live for
 * single kept params; probed on the live: "?utm_source=a&y=2" -> "?y=2",
 * "?z=1&a=2" -> "?a=2&z=1".
 *
 * The path stays ENCODED (the documented s38 deliberate variance: the
 * live DECODES the canonical — a literal space or a decoded %2F makes a
 * different/invalid URL; the Next metadata API re-encodes by construction,
 * which is the valid-URL form).
 */
export function notFoundCanonical(rawPath: string, rawSearch: string): string {
  const withoutTrailingSlash = rawPath.replace(/\/+$/, "");
  const path = withoutTrailingSlash || "/";
  return `${path}${processCanonicalQuery(rawSearch)}`;
}
