import { describe, expect, it } from "vitest";

import { courseEyebrow } from "@/lib/course-eyebrow";

/**
 * The reference app renders a SHORT category label on the course card
 * eyebrow while the catalog filter and the landing category grid keep the
 * full name ("Personal Development"). Only the EQ course differs — every
 * other category renders its own name verbatim.
 */
describe("courseEyebrow (reference card eyebrow display map)", () => {
  it("maps Personal Development to the reference short label", () => {
    expect(courseEyebrow("Personal Development")).toBe("Personal Dev");
  });

  it("passes every other reference category through unchanged", () => {
    for (const category of [
      "Business",
      "Technology",
      "Marketing",
      "Design",
      "Programming",
      "AI & Innovation",
    ]) {
      expect(courseEyebrow(category)).toBe(category);
    }
  });

  it("falls back to the raw category for unknown values", () => {
    expect(courseEyebrow("Whatever Comes Later")).toBe("Whatever Comes Later");
  });
});
