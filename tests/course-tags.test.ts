import { describe, expect, it } from "vitest";

import { parseTags } from "@/lib/course-tags";

describe("parseTags", () => {
  it("returns an empty array for an empty string", () => {
    expect(parseTags("")).toEqual([]);
  });

  it("splits a comma-separated tag list and trims whitespace", () => {
    expect(parseTags("AWS, Cloud ,DevOps")).toEqual(["AWS", "Cloud", "DevOps"]);
  });

  it("drops empty segments", () => {
    expect(parseTags("AWS,, Cloud,")).toEqual(["AWS", "Cloud"]);
  });

  // Session 8: whatYouLearnTopics() (tags + appended "{level} Level" row) was
  // removed — the live check list renders parsed tags ONLY and the level
  // renders once, in the Award-icon divider row (pinned by the session-6 +
  // session-8 e2e specs). parseTags is the whole pure seam now.
});
