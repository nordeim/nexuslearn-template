import { describe, expect, it } from "vitest";

import { routeMetadata } from "@/lib/metadata";

const REFERENCE_DESCRIPTION =
  "SkillSphere is a dynamic online learning platform offering a wide range of courses, structured learning paths, and AI-powered study tools to empower students, creators, and instructors in shaping their future.";

describe("routeMetadata — per-route OG identity (session 6)", () => {
  it("resolves the document title through the reference template", () => {
    const m = routeMetadata({ title: "Courses", canonical: "/Courses" });
    expect(m.title).toBe("Courses");
    expect(m.alternates?.canonical).toBe("/Courses");
  });

  it("mirrors the resolved document title into og:title + twitter:title", () => {
    const m = routeMetadata({ title: "Courses", canonical: "/Courses" });
    expect(m.openGraph?.title).toBe("Courses | NexusLearn");
    expect(m.twitter?.title).toBe("Courses | NexusLearn");
  });

  it("keeps the plain NexusLearn title when no title segment is given", () => {
    const m = routeMetadata({ canonical: "/login" });
    expect(m.openGraph?.title).toBe("NexusLearn");
    expect(m.twitter?.title).toBe("NexusLearn");
    expect(m.title).toBeUndefined();
  });

  it("points og:url at the route canonical (incl. query strings)", () => {
    const plain = routeMetadata({ title: "Courses", canonical: "/Courses" });
    expect(plain.openGraph?.url).toBe("/Courses");

    const withQuery = routeMetadata({
      title: "Course Detail",
      canonical: "/CourseDetail?id=seed-1",
    });
    expect(withQuery.openGraph?.url).toBe("/CourseDetail?id=seed-1");
  });

  it("restates the full OG + Twitter payload (child objects replace the root's)", () => {
    const m = routeMetadata({ title: "Pricing", canonical: "/Pricing" });
    // Next's OpenGraph/Twitter types are unions whose base members carry
    // neither `type` nor `card`, so narrow before reading them.
    const og = m.openGraph as {
      type?: string;
      siteName?: string;
      description?: string;
      images?: Array<{ url: string; width: number; height: number; alt: string }>;
    };
    expect(og.description).toBe(REFERENCE_DESCRIPTION);
    expect(og.type).toBe("website");
    expect(og.siteName).toBe("NexusLearn");
    expect(og.images).toEqual([
      { url: "/logo.png", width: 1200, height: 630, alt: "NexusLearn" },
    ]);
    const twitter = m.twitter as { card?: string; description?: string; images?: string[] };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.description).toBe(REFERENCE_DESCRIPTION);
    expect(twitter.images).toEqual(["/logo.png"]);
  });
});
