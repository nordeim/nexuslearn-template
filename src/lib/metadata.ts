import type { Metadata } from "next";

/**
 * Reference head parity — session 6: the live app mirrors the per-route
 * document title into `og:title` + `twitter:title` and the per-route canonical
 * into `og:url` (including the `?id=` query on CourseDetail). Next.js replaces
 * a child route's `openGraph` / `twitter` objects wholesale, so this helper
 * restates the full root payload (description, type, siteName, images) with
 * the per-route title + url resolved — the single source for every route's
 * `metadata` export.
 */

export const REFERENCE_DESCRIPTION =
  "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future.";

const SITE_NAME = "NexusLearn";

export function routeMetadata({
  title,
  canonical,
}: {
  /** Title segment (e.g. "Courses") — omitted on / and /login (reference behavior). */
  title?: string;
  /** Route canonical (path or path + query), mirrored into og:url. */
  canonical: string;
}): Metadata {
  // The resolved document title: "Courses | NexusLearn" with a segment,
  // plain "NexusLearn" without (matches the root title template).
  const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return {
    ...(title ? { title } : {}),
    alternates: { canonical },
    openGraph: {
      title: resolvedTitle,
      description: REFERENCE_DESCRIPTION,
      url: canonical,
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
  };
}
