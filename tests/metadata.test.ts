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

  it("keeps the plain NexusLearn title when no title segment is given (session 38: the ABSOLUTE form — no layout-default inheritance)", () => {
    const m = routeMetadata({ canonical: "/login" });
    expect(m.openGraph?.title).toBe("NexusLearn");
    expect(m.twitter?.title).toBe("NexusLearn");
    // Session 38: the no-title branch pins the ABSOLUTE plain title — the
    // /login + /reset-password + landing guard. The layout's default title
    // is now the DERIVED 404 family (the raw-path contract); these pages
    // must not inherit it.
    expect(m.title).toEqual({ absolute: "NexusLearn" });
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

describe("routeMetadata — the processed canonical query (session 39)", () => {
  // The live carries the PROCESSED query on every real route's canonical,
  // og:url and twitter:url (probed: /Courses?x=1 -> .../Courses?x=1;
  // /Courses?utm_source=a&x=1 -> .../Courses?x=1; /CourseDetail?id=X&extra=2
  // -> .../CourseDetail?extra=2&id=X). The `search` param is the RAW search.
  it("appends the processed query to the canonical + og:url + twitter:url", () => {
    const m = routeMetadata({ title: "Courses", canonical: "/Courses", search: "?x=1" });
    expect(m.alternates?.canonical).toBe("/Courses?x=1");
    expect(m.openGraph?.url).toBe("/Courses?x=1");
    expect(m.other?.["twitter:url"]).toBe("http://localhost:3000/Courses?x=1");
  });

  it("drops the tracking params and sorts the rest (the pinned algorithm)", () => {
    const m = routeMetadata({
      title: "Courses",
      canonical: "/Courses",
      search: "?utm_source=a&z=1&a=2",
    });
    expect(m.alternates?.canonical).toBe("/Courses?a=2&z=1");
    expect(m.openGraph?.url).toBe("/Courses?a=2&z=1");
  });

  it("a fully-excluded or empty query renders the bare canonical (the standing identity)", () => {
    expect(routeMetadata({ canonical: "/Courses", search: "?utm_source=test" }).alternates?.canonical).toBe("/Courses");
    expect(routeMetadata({ canonical: "/Courses", search: "?" }).alternates?.canonical).toBe("/Courses");
    expect(routeMetadata({ canonical: "/Courses", search: "" }).alternates?.canonical).toBe("/Courses");
    expect(routeMetadata({ canonical: "/Courses" }).alternates?.canonical).toBe("/Courses");
  });

  it("the root canonical carries the query after the slash (probed: /?x=1 -> .../?x=1)", () => {
    const m = routeMetadata({ canonical: "/", search: "?x=1" });
    expect(m.alternates?.canonical).toBe("/?x=1");
    expect(m.other?.["twitter:url"]).toBe("http://localhost:3000/?x=1");
  });

  it("keeps duplicate id params sorted (the live's dupe behavior)", () => {
    const m = routeMetadata({
      title: "Course Detail",
      canonical: "/CourseDetail",
      search: "?id=seed-1&extra=2",
    });
    expect(m.alternates?.canonical).toBe("/CourseDetail?extra=2&id=seed-1");
  });
});
