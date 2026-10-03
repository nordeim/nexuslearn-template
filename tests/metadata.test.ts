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
      images?: Array<{ url: string }>;
    };
    expect(og.description).toBe(REFERENCE_DESCRIPTION);
    expect(og.type).toBe("website");
    expect(og.siteName).toBe("NexusLearn");
    // Session 41 (finding 2 — the head census): the LIVE's app-shell routes
    // ship og:image/twitter:image URL-ONLY (no width/height/alt on any of
    // the 12 probed app shapes) — the dimensions were an unpinned
    // beyond-reference addition, now stripped for exact parity.
    // Session 42 (finding 1 — the render-byte census): the URL is the
    // RENDER tier (/og-image.png — the live's og:image serves a 630x630
    // contain-fit render, NOT the raw logo; the raw tier stays on
    // rel=icon/apple-touch-icon/the manifest icons).
    expect(og.images).toEqual([{ url: "/og-image.png" }]);
    const twitter = m.twitter as { card?: string; description?: string; images?: string[] };
    expect(twitter.card).toBe("summary_large_image");
    expect(twitter.description).toBe(REFERENCE_DESCRIPTION);
    expect(twitter.images).toEqual(["/og-image.png"]);
  });
});

describe("routeMetadata — the auth-shell head family (session 41)", () => {
  // The live's two platform-AUTH routes (/login + /reset-password incl. its
  // ?token= variant) carry an auth-shell head family the app routes never
  // see (probed on all 14 live route shapes): the og:image gains
  // width=1200/height=630/alt="Base44 link preview" AND twitter carries
  // twitter:image:alt="Base44 link preview" — the platform generator's
  // artifact, mirrored byte-exactly (the platform-404-body precedent).
  it("authShell: true carries the og:image dimensions + the platform alt", () => {
    const m = routeMetadata({ canonical: "/login", authShell: true });
    const og = m.openGraph as {
      images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
    };
    // Session 42: the URL is the RENDER tier on BOTH shapes (the live's
    // og:image render URL serves every route — app and auth alike).
    expect(og.images).toEqual([
      { url: "/og-image.png", width: 1200, height: 630, alt: "Base44 link preview" },
    ]);
    const twitter = m.twitter as {
      images?: Array<{ url: string; alt?: string }>;
    };
    expect(twitter.images).toEqual([{ url: "/og-image.png", alt: "Base44 link preview" }]);
  });

  it("authShell keeps the icons on the RAW tier (/logo.png — the render swap touches ONLY the image payloads)", () => {
    // Session 42 (finding 1): the live's rel=icon/apple-touch-icon/manifest
    // icons all serve the RAW 1024x1024 object (the clone's /logo.png is
    // byte-identical to it) — only og:image/twitter:image move to the
    // 630x630 render tier.
    const auth = routeMetadata({ canonical: "/login", authShell: true }) as {
      icons?: { icon?: string; apple?: Array<{ url: string; sizes?: string }> };
    };
    expect(auth.icons?.icon).toBe("/logo.png");
    expect(auth.icons?.apple).toEqual([{ url: "/logo.png", sizes: "180x180" }]);
    // The app shape ships no icons key at all (the layout's default applies
    // — the s41 contract).
    const app = routeMetadata({ title: "Courses", canonical: "/Courses" }) as {
      icons?: unknown;
    };
    expect(app.icons).toBeUndefined();
  });

  it("the default (app) payload carries NO image dimensions or alt — the live's URL-only app shape", () => {
    for (const args of [
      { title: "Courses", canonical: "/Courses" },
      { canonical: "/login" },
    ]) {
      const m = routeMetadata(args);
      const og = m.openGraph as {
        images?: Array<{ url: string; width?: number; height?: number; alt?: string }>;
      };
      expect(og.images).toEqual([{ url: "/og-image.png" }]);
      // Twitter's app shape is the plain-string image list (Next renders
      // <meta name="twitter:image"> only — no alt, no dims).
      const twitter = m.twitter as { images?: string[] };
      expect(twitter.images).toEqual(["/og-image.png"]);
    }
  });

  it("authShell changes ONLY the image family — the canonical/query processing is identical (the s39 contract)", () => {
    const app = routeMetadata({ canonical: "/reset-password", search: "?token=abc&utm_source=z" });
    const auth = routeMetadata({
      canonical: "/reset-password",
      search: "?token=abc&utm_source=z",
      authShell: true,
    });
    expect(auth.alternates?.canonical).toBe(app.alternates?.canonical);
    expect(auth.openGraph?.url).toBe(app.openGraph?.url);
    expect(auth.twitter?.title).toBe(app.twitter?.title);
    expect((auth.other as Record<string, string>)["twitter:url"]).toBe(
      (app.other as Record<string, string>)["twitter:url"]
    );
  });

  it("authShell keeps the no-title ABSOLUTE form (the plain NexusLearn title)", () => {
    const m = routeMetadata({ canonical: "/login", authShell: true });
    expect(m.title).toEqual({ absolute: "NexusLearn" });
    expect(m.openGraph?.title).toBe("NexusLearn");
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
