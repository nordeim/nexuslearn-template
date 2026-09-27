import type { MetadataRoute } from "next";

/**
 * sitemap.xml — mirrors the reference app's URL set: the landing plus the 8
 * canonical routes (original casing), all weekly / 0.8 with the landing at 1.0.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = [
    { path: "", priority: 1.0 },
    { path: "Courses", priority: 0.8 },
    { path: "CourseDetail", priority: 0.8 },
    { path: "AIAssistant", priority: 0.8 },
    { path: "Pricing", priority: 0.8 },
    { path: "BecomeInstructor", priority: 0.8 },
    { path: "About", priority: 0.8 },
    { path: "Contact", priority: 0.8 },
    { path: "Dashboard", priority: 0.8 },
  ];

  return routes.map((route) => ({
    url: `${siteUrl}/${route.path}`.replace(/\/$/, ""),
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
