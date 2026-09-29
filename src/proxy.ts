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
 * untouched (the 404 behavior is spec-pinned).
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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Fast exit on the exact canonical form (the overwhelmingly common case).
  if ((CANONICAL_ROUTES as readonly string[]).includes(pathname)) {
    return NextResponse.next();
  }
  const canonical = CANONICAL_ROUTES.find(
    (r) => r.toLowerCase() === pathname.toLowerCase()
  );
  if (canonical) {
    const url = req.nextUrl.clone();
    url.pathname = canonical;
    // The search string is preserved by the clone(); only the path changes.
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next internals and the static public files — the
  // rewrite only ever fires on the nine content routes anyway, but keeping
  // the middleware out of the hot asset path avoids the overhead.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|manifest.json|robots.txt|sitemap.xml).*)",
  ],
};
