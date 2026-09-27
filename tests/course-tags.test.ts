import { describe, expect, it } from "vitest";

import { parseTags, whatYouLearnTopics } from "@/lib/course-tags";

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
});

describe("whatYouLearnTopics", () => {
  it("appends the course level to the parsed tags (reference app behavior)", () => {
    expect(whatYouLearnTopics("AWS, Cloud, DevOps, Serverless, Microservices", "Intermediate")).toEqual([
      "AWS",
      "Cloud",
      "DevOps",
      "Serverless",
      "Microservices",
      "Intermediate Level",
    ]);
  });

  it("still appends the level when there are no tags", () => {
    expect(whatYouLearnTopics("", "Beginner")).toEqual(["Beginner Level"]);
  });
});
