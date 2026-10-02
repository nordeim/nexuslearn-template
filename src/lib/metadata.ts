import type { Metadata } from "next";

import { processCanonicalQuery } from "./canonical-query";

/**
 * Reference head parity — session 6: the live app mirrors the per-route
 * document title into `og:title` + `twitter:title` and the per-route canonical
 * into `og:url` (including the `?id=` query on CourseDetail). Next.js replaces
 * a child route's `openGraph` / `twitter` objects wholesale, so this helper
 * restates the full root payload (description, type, siteName, images) with
 * the per-route title + url resolved — the single source for every route's
 * `metadata` export.
 *
 * Session 38 — the twitter:url dimension: the live ALSO ships
 * `<meta name="twitter:url">` mirroring the per-route canonical on EVERY
 * route (probed on /Courses + the 404 view; the clone never emitted it —
 * Next's typed Twitter object has no url field). The root-level `other`
 * map renders it (values are VERBATIM — no metadataBase resolution — so
 * the absolute URL is constructed here, matching how Next resolves og:url
 * against the same base). `other` MERGES per-key across the layout→page
 * chain (the page's keys win) — both levels restate it, the restate-
 * everything pattern of og/twitter.
 *
 * Session 39 — the processed canonical query: the live carries the PROCESSED
 * query on every real route's canonical/og:url/twitter:url (probed:
 * /Courses?x=1 -> .../Courses?x=1; /Courses?utm_source=a&x=1 -> .../Courses?x=1;
 * /CourseDetail?id=X&extra=2 -> .../CourseDetail?extra=2&id=X — the pinned
 * algorithm in src/lib/canonical-query.ts). The optional `search` is the RAW
 * search string (the proxy-injected x-nexus-raw-search header, read by
 * src/lib/page-metadata.ts — the header-reading half lives there so this
 * module stays free of next/headers and unit-importable).
 *
 * Session 41 — the auth-shell head family (fresh-eyes family A: the complete
 * per-route head census, probed on all 14 live route shapes): the live's two
 * platform-AUTH routes (/login + /reset-password, incl. its ?token= variant)
 * carry a head family the app routes NEVER see — the og:image gains
 * width=1200/height=630/alt="Base44 link preview", twitter gains
 * twitter:image:alt="Base44 link preview", and (via the page wiring) the
 * viewport meta gains viewport-fit=cover + a theme-color #000000 meta + the
 * apple-touch-icon link (sizes="180x180"). The platform alt string is
 * mirrored byte-exactly (the platform-404-body precedent — the observable
 * contract is the string itself). The INVERSE finding: the live's app-shell
 * routes (all 9 content routes + the 404) ship og:image/twitter:image
 * URL-ONLY — the dimensions the clone shipped on every route were an
 * unpinned beyond-reference addition, now stripped for exact parity.
 */

export const REFERENCE_DESCRIPTION =
  "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future.";

const SITE_NAME = "NexusLearn";

/** The metadataBase origin (NEXT_PUBLIC_SITE_URL, the dev fallback). */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** The verbatim-rendered twitter:url value: the canonical against SITE_URL. */
function twitterUrlFor(canonical: string): string {
  return new URL(canonical, SITE_URL).toString();
}

export function routeMetadata({
  title,
  canonical,
  search = "",
  authShell = false,
}: {
  /** Title segment (e.g. "Courses") — omitted on / and /login (reference behavior). */
  title?: string;
  /** Route canonical (path or path + query), mirrored into og:url. */
  canonical: string;
  /** The RAW search string ("?x=1") — processed per the pinned algorithm. */
  search?: string;
  /**
   * Session 41 — the platform-AUTH head family (only /login +
   * /reset-password): the live's auth shell ships the dimensioned og:image
   * (1200x630 + the platform alt) and the apple-touch-icon link. The app
   * routes keep the URL-only image family (the live's app-shell shape).
   */
  authShell?: boolean;
}): Metadata {
  // The resolved document title: "Courses | NexusLearn" with a segment,
  // plain "NexusLearn" without (matches the root title template).
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  // Session 39: the canonical carries the PROCESSED query (the live's
  // contract — tracking params dropped, kept params alpha-sorted).
  const canonicalWithQuery = `${canonical}${processCanonicalQuery(search)}`;

  return {
    // Session 38: the no-title branch pins the ABSOLUTE plain title. The
    // layout's default title is now the DERIVED 404 family (the live's
    // raw-path contract — src/lib/not-found-metadata.ts); the four
    // no-title renders (/, /Home, /login, /reset-password) must render the
    // plain "NexusLearn" regardless of the layout default, so they carry
    // the absolute form instead of inheriting it.
    ...(title ? { title } : { title: { absolute: SITE_NAME } }),
    alternates: { canonical: canonicalWithQuery },
    openGraph: {
      title: resolvedTitle,
      description: REFERENCE_DESCRIPTION,
      url: canonicalWithQuery,
      type: "website",
      siteName: SITE_NAME,
      // Session 41: URL-only on the app routes (the live's app-shell shape —
      // probed on all 12 app route shapes: no width/height/alt anywhere);
      // the auth routes carry the live's auth-shell dimensions + alt.
      images: authShell
        ? [{ url: "/logo.png", width: 1200, height: 630, alt: "Base44 link preview" }]
        : [{ url: "/logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: REFERENCE_DESCRIPTION,
      images: authShell ? [{ url: "/logo.png", alt: "Base44 link preview" }] : ["/logo.png"],
    },
    // Session 41: the auth shell's apple-touch-icon (the live's sizes
    // attribute probed verbatim). The page-level icons key REPLACES the
    // layout's wholesale, so the icon is restated alongside the addition.
    ...(authShell
      ? { icons: { icon: "/logo.png", apple: [{ url: "/logo.png", sizes: "180x180" }] } }
      : {}),
    // Session 38: the live's twitter:url (every route — the missing sixth
    // head dimension). Rendered verbatim by Next's `other` map.
    other: { "twitter:url": twitterUrlFor(canonicalWithQuery) },
  };
}
