import { NextRequest, NextResponse } from "next/server";

import { CONTENT_ROUTES, resolveSlashPath } from "@/lib/slash-resolution";

/**
 * Case-insensitive content-route rewrites (session 17).
 *
 * Ships as the Next 16 `proxy` convention (the `middleware` file convention is
 * deprecated in 16.3 — same API, new name; the build warns otherwise).
 * The reference app's Base44 router matches its page routes
 * CASE-INSENSITIVELY: /courses, /COURSES and /cOurSes all render the catalog
 * with the typed URL preserved (probed on every content route). /login is the
 * one EXACT-match route (its case variants render the in-app 404 — it is a
 * platform-level route outside the app's route table). Next.js routes are
 * case-sensitive by default, so every case variant 404'd on the clone.
 *
 * The fix REWRITES case-variant paths to the canonical route (the URL bar
 * keeps what the user typed — a redirect would not be parity). The rendered
 * page keeps its canonical document title / canonical URL / og:url: the
 * live's raw-path titles on case variants ("COURSES | NexusLearn",
 * "C Our Ses | NexusLearn" — a title-caser splitting at case boundaries) are
 * artifact-grade output, in the same deliberate-better family as the
 * session-16 stale-title decision.
 *
 * /login is deliberately NOT in the list, and unknown paths pass through
 * untouched (the 404 behavior is spec-pinned — the session-24 status pins).
 *
 * ---
 *
 * Session 40 — the trailing-slash resolution tier (fresh-eyes family A: the
 * live renders content-route slash variants AT THE TYPED URL, platform-404s
 * the exact-match + unknown slash variants; Next's built-in pre-proxy 308
 * owned every shape before this proxy could see it). The decisions live in
 * the pure seam (src/lib/slash-resolution.ts — unit-tested); this adapter
 * carries them out AFTER the verb guard + the request-header injection:
 *
 *  - redirect (exact-case content route + slash) -> the s24 canonicalization
 *    308, constructed MANUALLY with the RELATIVE Location form
 *    (NextResponse.redirect() requires an absolute URL; the s24 pin asserts
 *    "/Courses") + the baseline security headers + the CSP (the s23
 *    every-response posture — the live's platform ships its headers on every
 *    response incl. redirects).
 *  - rewrite (case-variant content route + slash) -> the s17 render-at-
 *    typed-URL contract (one FEWER hop than the pre-fix 308-then-rewrite
 *    chain — the live renders these with zero hops).
 *  - not-found (exact-match route + slash) -> the rewrite to an internal
 *    unmatched path: the router renders not-found.tsx with a REAL 404 status
 *    (the s24 principle) while the injected x-nexus-raw-path/search headers
 *    drive the s38 head derivations (title "Login | NexusLearn", canonical
 *    /login — the live's platform-404 head family byte-for-byte).
 *
 * next.config.ts ships `skipTrailingSlashRedirect: true` — without it Next's
 * built-in handler 308s every single-slash shape BEFORE the proxy (the
 * request never reaches this file; empirically verified). The leading-//
 * and multi-slash shapes are normalized pre-proxy EITHER WAY (no flag
 * controls them) — the documented deliberate-variance family.
 */

/**
 * Content-Security-Policy with a per-request nonce (session 24 — the
 * session-23 documented future work; the deliberate-better hardening family:
 * neither the live nor the clone shipped a CSP before this). The proxy
 * generates a fresh nonce per request, exposes it on the REQUEST headers
 * (the documented Next.js pattern — the framework reads `x-nonce` + the CSP
 * header to auto-nonce its bootstrap scripts) and ships the policy on the
 * RESPONSE. `script-src 'self' 'nonce-X' 'strict-dynamic'` makes the
 * per-request nonce the ONLY script trust root (host allowlists are inert
 * under strict-dynamic; dynamically-imported chunks inherit trust from
 * their nonced loader).
 *
 * The companion fix lives in `src/app/layout.tsx`
 * (`export const dynamic = "force-dynamic"`): static-prerendered pages bake
 * their HTML at build time where no per-request nonce exists — their
 * scripts BLOCK under strict-dynamic and the pages render unhydrated (the
 * login form falls back to a native GET submit → `/login?`; the exact
 * gotcha-32 failure symptom, spike-verified before implementing). Forcing
 * per-request rendering on every route (incl. /_not-found) lets the nonce
 * reach every script.
 *
 * Directive decisions (docs/remediation-plan-session24.md §B-1b):
 *  - style-src carries 'unsafe-inline': the app renders inline style
 *    ATTRIBUTES (the reveal system's SSR pre-hide, the Navbar grid
 *    animation) — a nonce-only style-src would block them all.
 *  - img-src allowlists images.unsplash.com (the only external image host
 *    in src/ + the seed catalog).
 *  - font-src 'self': the app loads NO webfont (session 14 — the reference
 *    declares the stack and every visitor renders the system font).
 *  - connect-src 'self': the app fires zero client-side data calls on load
 *    (session 22, spec-pinned); the AI chat posts same-origin.
 *  - frame-ancestors 'self' mirrors the shipped X-Frame-Options SAMEORIGIN.
 *  - Deliberately NO upgrade-insecure-requests: the standalone template
 *    runs plain HTTP locally — the directive upgrades same-origin
 *    subresource URLs to https and breaks them; HSTS (session 23, inert
 *    over plain HTTP) already handles the deployment-layer upgrade.
 *  - Dev-only relaxations: 'unsafe-eval' (Turbopack HMR) + ws: (the HMR
 *    websocket) — never shipped in production.
 *
 * Adding a future external source (image host, API)? The directive list
 * below is the documented extension point. A future user-authored inline
 * <script> must read the nonce via `await headers()` in the component (the
 * official pattern) — no inline scripts ship today.
 */

/**
 * Builds the CSP header value for a request. The nonce is baked into
 * script-src; every other directive is nonce-independent.
 */
function cspHeaderValue(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const directives = [
    "default-src 'self'",
    // Per-request nonce is the only script trust root (strict-dynamic).
    // 'unsafe-eval' is dev-only (Turbopack HMR hot-reload runtime).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Inline style ATTRIBUTES render everywhere (reveal pre-hide, the
    // Navbar grid animation) — 'unsafe-inline' is required for them.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com",
    "font-src 'self'",
    // ws: is dev-only (the HMR websocket).
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];
  return directives.join("; ");
}

/**
 * The HTTP verb guard (session 26).
 *
 * The live's platform layer 405s EVERY non-GET/HEAD verb on every non-API
 * path (POST/PUT/DELETE/OPTIONS on pages, unknown paths and static public
 * files all return 405 — its uvicorn platform checks the method before path
 * resolution). Next.js App Router pages accept ANY method by default: POST
 * / rendered the full page HTML with 200, OPTIONS returned 400, and the
 * static file handler answered POST /logo.png with a 500 (its own crash
 * class). Pages are GET/HEAD-only resources — the guard restores that
 * contract: non-GET/HEAD on any path outside /api/ returns 405 with
 * `Allow: GET, HEAD` (the first-party {error} JSON body — the live's
 * {"error_type": "HTTPException"} body is its platform's artifact, the same
 * keep-our-own-forms family as the session-24 canonicalization pins).
 *
 * Scope decisions:
 *  - /api/* is excluded: route handlers own their verb semantics (405
 *    wrong-verb, 204 auto-OPTIONS preflight — the first-party API contract).
 *  - _next/* is excluded (the matcher already skips it): no parity axis
 *    (the live has no _next), and the dev server's internal routes stay
 *    untouched.
 *  - The guard runs BEFORE the canonical-rewrite logic: method beats path
 *    resolution (the live 405s POST on unknown paths that would 404 on GET).
 *  - GET/HEAD pass through untouched — including HEAD (Next auto-HEADs the
 *    GET handler and strips the body; the live 200s HEAD the same way).
 */
const ALLOWED_METHODS = new Set(["GET", "HEAD"]);

/** The internal unmatched path the not-found action rewrites to (session 40). */
const SLASH_NOT_FOUND_PATH = "/__nexus-slash-404__";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The verb guard (session 26) — non-GET/HEAD outside /api/ never reaches
  // the renderer.
  if (!ALLOWED_METHODS.has(req.method)) {
    if (!pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405, headers: { Allow: "GET, HEAD" } }
      );
    }
    // API verbs fall through to the route handlers' own semantics.
  }

  // The per-request CSP nonce (session 24).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = cspHeaderValue(nonce);
  // The request headers carry the nonce + the policy — Next.js reads them
  // to auto-nonce its bootstrap scripts on every render branch below.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  // Session 38 — the 404-metadata derivation inputs (REQUEST-scoped, never
  // response-exposed): the raw pathname + search string. The root layout's
  // generateMetadata reads them and derives the 404 family (the live's
  // raw-path title/canonical contract — src/lib/not-found-metadata.ts).
  // Every real page restates its full payload (routeMetadata), so the
  // derived values surface only on not-found renders.
  requestHeaders.set("x-nexus-raw-path", pathname);
  requestHeaders.set("x-nexus-raw-search", req.nextUrl.search);

  // Session 40 — the trailing-slash resolution tier (the seam decides; this
  // adapter acts). Runs AFTER the verb guard (method beats path resolution —
  // POST /Courses/ 405s directly) and AFTER the header injection (the
  // not-found branch's head derivations need the RAW slashed path).
  const slash = resolveSlashPath(pathname, req.nextUrl.search);
  if (slash.action === "redirect") {
    // The s24 canonicalization 308. The target is constructed ABSOLUTE —
    // Next's middleware adapter RELATIVIZES same-host Locations before the
    // response ships (server/web/adapter.js: getRelativeURL), so the emitted
    // header keeps the s24 pin's relative "/Courses" form. (A relative
    // Location passed straight through CRASHES the adapter — NextURL
    // requires an absolute URL; empirically verified.) The raw search rides
    // along on the seam's location; the every-response header posture (the
    // baseline security set + the CSP) applies to redirects too.
    const target = new URL(slash.location, req.nextUrl.toString()).toString();
    return NextResponse.redirect(target, {
      status: 308,
      headers: {
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Frame-Options": "SAMEORIGIN",
        "Strict-Transport-Security": "max-age=31536000",
        "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        "Content-Security-Policy": csp,
      },
    });
  }
  if (slash.action === "rewrite" || slash.action === "not-found") {
    const url = req.nextUrl.clone();
    url.pathname = slash.action === "rewrite" ? slash.path : SLASH_NOT_FOUND_PATH;
    // The search string is preserved by the clone(); only the path changes.
    // The rewritten request keeps the URL bar at the typed path (the s17
    // contract) while the x-nexus-raw-* headers drive the head derivations.
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  let res: NextResponse;
  if ((CONTENT_ROUTES as readonly string[]).includes(pathname)) {
    // Fast exit on the exact canonical form (the overwhelmingly common case).
    res = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    const canonical = CONTENT_ROUTES.find(
      (r) => r.toLowerCase() === pathname.toLowerCase()
    );
    if (canonical) {
      const url = req.nextUrl.clone();
      url.pathname = canonical;
      // The search string is preserved by the clone(); only the path changes.
      res = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
    } else {
      res = NextResponse.next({ request: { headers: requestHeaders } });
    }
  }
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  // Skip API routes, Next internals and the crawler route handlers — the
  // rewrite only ever fires on the nine content routes anyway, and a CSP
  // only protects DOCUMENT contexts (API/asset responses carry no scripts).
  // Keeping the middleware out of the hot asset path avoids the overhead.
  // favicon.ico / logo.png / manifest.json ARE included (session 26): the
  // verb guard must cover the static public files (POST on them was the
  // static handler's 500 — the live 405s); a GET just passes through with
  // the CSP header attached (inert on a non-document response).
  matcher: [
    "/((?!api|_next/static|_next/image|robots.txt|sitemap.xml).*)",
  ],
};
