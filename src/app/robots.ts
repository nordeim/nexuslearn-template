import type { MetadataRoute } from "next";

/**
 * robots.txt — mirrors the reference app: allow everything, link the sitemap.
 * The origin comes from NEXT_PUBLIC_SITE_URL (localhost fallback in dev).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
