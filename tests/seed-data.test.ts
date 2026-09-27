import { describe, expect, it } from "vitest";

import { buildLessons, COURSES } from "../prisma/seed-data";

describe("seed data (reference catalog parity)", () => {
  it("contains the 9 reference courses", () => {
    expect(COURSES).toHaveLength(9);
  });

  it("gives every course a comma-separated tags string", () => {
    for (const course of COURSES) {
      expect(course.tags, `tags for ${course.title}`).toBeTruthy();
      expect(course.tags).not.toHaveLength(0);
      // comma-separated, no leading/trailing separators
      expect(course.tags).toMatch(/^[^,].*[^,]$/);
    }
  });

  it("keeps the AWS course tag list captured from the reference app", () => {
    const aws = COURSES.find((c) => c.title === "Cloud Computing with AWS");
    expect(aws?.tags).toBe("AWS, Cloud, DevOps, Serverless, Microservices");
  });
});

describe("buildLessons (reference curriculum model)", () => {
  it("generates exactly lessonsCount rows", () => {
    expect(buildLessons(220)).toHaveLength(220);
    expect(buildLessons(3)).toHaveLength(3);
  });

  it("titles every row like the reference app: 'Lesson N: Module Content'", () => {
    const rows = buildLessons(3);
    expect(rows.map((r) => r.title)).toEqual([
      "Lesson 1: Module Content",
      "Lesson 2: Module Content",
      "Lesson 3: Module Content",
    ]);
  });

  it("numbers rows sequentially from 1", () => {
    const rows = buildLessons(5);
    expect(rows.map((r) => r.sortOrder)).toEqual([1, 2, 3, 4, 5]);
  });
});
