/**
 * The trailing-slash resolution seam (session 40 — fresh-eyes family A: a
 * REAL functional parity drift, probed shape-by-shape on the live).
 *
 * The live resolves single-trailing-slash paths through a THREE-tier
 * contract:
 *
 *  (a) content routes RENDER at the typed slashed URL — /Courses/, /courses/
 *      (case+slash!), /CourseDetail/?id=… all render 200 with the URL bar
 *      preserved, the clean title, and the clean canonical + processed query
 *      (probed: /courses/?x=1 -> canonical /courses?x=1 — the typed case, the
 *      documented s17 deliberate-variance family).
 *  (b) the EXACT-MATCH routes (/login, /reset-password) + trailing slash ->
 *      the Base44 PLATFORM 404 ("The page "login/" could not be found in
 *      this application." — no nav/footer) carrying the DERIVED head family:
 *      title "Login | NexusLearn" (the s38 raw-path derivation), canonical
 *      /login (trailing slash stripped, query processed).
 *  (c) unknown paths + trailing slash -> the same platform-404 family.
 *
 * The clone's resolution (this seam — the decisions; src/proxy.ts adapts):
 *
 *  - an EXACT-CASE content route + slash -> the s24 canonicalization 308
 *    (the deliberate-better SEO pin — Location = the stripped canonical +
 *    the RAW search, the relative form Next itself emits).
 *  - a CASE-VARIANT content route + slash -> the s17 render-at-typed-URL
 *    contract (the rewrite — one FEWER hop than the pre-fix 308-then-
 *    rewrite chain, matching the live's zero-hop render).
 *  - an EXACT-MATCH route + slash -> the in-app 404 view (the platform
 *    tier's in-app equivalent: the head family matches byte-for-byte through
 *    the existing s38 derivations; the page CONTENT is the documented
 *    platform-artifact variance — the same family as the live's %zz
 *    infra-400, unreachable platform chrome).
 *  - an unknown path + slash -> pass (the router's natural 404 — the head
 *    derivations already handle the shape).
 *
 * The PRE-PROXY framework-normalization family (leading // and
 * multi-trailing-slash shapes) never reaches this seam: Next.js normalizes
 * them BEFORE the proxy regardless of skipTrailingSlashRedirect (empirically
 * verified — the s40 deliberate-variance documentation). The seam still
 * resolves those shapes deterministically (pass) should the framework ever
 * hand them over.
 */

/** The nine content routes (case-insensitive at the live's platform tier). */
export const CONTENT_ROUTES: readonly string[] = [
  "/Home",
  "/Courses",
  "/CourseDetail",
  "/AIAssistant",
  "/Pricing",
  "/About",
  "/Contact",
  "/BecomeInstructor",
  "/Dashboard",
];

/**
 * The exact-match routes (CASE-SENSITIVE — the s17 convention: the live's
 * platform table serves their case variants through the catch-all, so
 * /Login/ and /Reset-Password/ fall to the router's natural 404 whose
 * derived heads match the live's platform-404 heads anyway).
 */
export const EXACT_MATCH_ROUTES: readonly string[] = ["/login", "/reset-password"];

/** The resolution the proxy must carry out for a trailing-slash path. */
export type SlashResolution =
  | { action: "pass" }
  | { action: "redirect"; location: string }
  | { action: "rewrite"; path: string }
  | { action: "not-found" };

/**
 * Resolve a single-trailing-slash request path. `rawSearch` (the request's
 * search string, "?"-prefixed) rides along on the redirect Location only —
 * the rewrite preserves the search by construction and the not-found/pass
 * actions leave the request untouched for the router.
 */
export function resolveSlashPath(rawPath: string, rawSearch: string): SlashResolution {
  // No trailing slash, or the root itself — nothing slash-specific to do
  // (the s17 case-rewrite logic owns the no-slash case variants).
  if (!rawPath.endsWith("/") || rawPath === "/") {
    return { action: "pass" };
  }

  const stripped = rawPath.replace(/\/+$/, "");
  const normalized = stripped || "/";

  // (a) The exact-case content route: the s24 canonicalization 308.
  if ((CONTENT_ROUTES as readonly string[]).includes(normalized)) {
    return { action: "redirect", location: `${normalized}${rawSearch}` };
  }

  // The case-VARIANT content route: the s17 render-at-typed-URL contract.
  const caseMatch = CONTENT_ROUTES.find(
    (r) => r.toLowerCase() === normalized.toLowerCase()
  );
  if (caseMatch) {
    return { action: "rewrite", path: caseMatch };
  }

  // (b) The exact-match route: the live's platform-404 tier (the in-app 404
  // view with the derived head family).
  if ((EXACT_MATCH_ROUTES as readonly string[]).includes(normalized)) {
    return { action: "not-found" };
  }

  // (c) Everything else (unknown paths, deep paths): the router's natural
  // 404 — the s38/s39 head derivations handle the shape.
  return { action: "pass" };
}
