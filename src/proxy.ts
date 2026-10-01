import { NextRequest, NextResponse } from "next/server";

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
const CANONICAL_ROUTES = [
  "/Home",
  "/Courses",
  "/CourseDetail",
  "/AIAssistant",
  "/Pricing",
  "/About",
  "/Contact",
  "/BecomeInstructor",
  "/Dashboard",
] as const;

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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The per-request CSP nonce (session 24).
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = cspHeaderValue(nonce);
  // The request headers carry the nonce + the policy — Next.js reads them
  // to auto-nonce its bootstrap scripts on every render branch below.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  let res: NextResponse;
  if ((CANONICAL_ROUTES as readonly string[]).includes(pathname)) {
    // Fast exit on the exact canonical form (the overwhelmingly common case).
    res = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    const canonical = CANONICAL_ROUTES.find(
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
  // Skip API routes, Next internals and the static public files — the
  // rewrite only ever fires on the nine content routes anyway, and a CSP
  // only protects DOCUMENT contexts (API/asset responses carry no scripts).
  // Keeping the middleware out of the hot asset path avoids the overhead.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
