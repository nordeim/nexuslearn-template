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
}: {
  /** Title segment (e.g. "Courses") — omitted on / and /login (reference behavior). */
  title?: string;
  /** Route canonical (path or path + query), mirrored into og:url. */
  canonical: string;
  /** The RAW search string ("?x=1") — processed per the pinned algorithm. */
  search?: string;
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
      images: [{ url: "/logo.png", width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: REFERENCE_DESCRIPTION,
      images: ["/logo.png"],
    },
    // Session 38: the live's twitter:url (every route — the missing sixth
    // head dimension). Rendered verbatim by Next's `other` map.
    other: { "twitter:url": twitterUrlFor(canonicalWithQuery) },
  };
}
