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

  it("matches the reference lesson counts (session-4 re-capture)", () => {
    const EXPECTED: Record<string, number> = {
      "Cloud Computing with AWS": 220,
      "Advanced Python Programming": 178,
      "Machine Learning & AI Masterclass": 245,
      "Complete Web Development Bootcamp 2026": 380,
      "UI/UX Design Professional Certificate": 210,
      "Digital Marketing Strategy A-Z": 190,
      "Data Science with Python & SQL": 230,
      "Business Strategy & Leadership": 156,
      "Emotional Intelligence & Mindfulness": 95,
    };
    for (const course of COURSES) {
      expect(course.lessonsCount, `lessons for ${course.title}`).toBe(EXPECTED[course.title]);
    }
  });
});

describe("seed imagery parity (session-4 audit)", () => {
  it("uses the reference course cover images", () => {
    const byTitle = (t: string) => COURSES.find((c) => c.title === t);
    expect(byTitle("Machine Learning & AI Masterclass")?.image).toBe(
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80"
    );
    expect(byTitle("Business Strategy & Leadership")?.image).toBe(
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80"
    );
    expect(byTitle("Emotional Intelligence & Mindfulness")?.image).toBe(
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80"
    );
  });

  it("maps avatars per instructor exactly like the reference app", () => {
    const AVATARS: Record<string, string> = {
      "David Wright": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      "Dr. Sarah Mitchell": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      "Prof. James Chen": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      "Alex Kim": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      "Emma Rodriguez": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      "Michael Park": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
      "Dr. Lisa Chen": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
    };
    for (const course of COURSES) {
      expect(course.instructorAvatar, `avatar for ${course.instructorName} (${course.title})`).toBe(
        AVATARS[course.instructorName]
      );
    }
  });
});

describe("long descriptions (reference About This Course data)", () => {
  it("carries the 4 reference long descriptions", () => {
    const byTitle = (t: string) => COURSES.find((c) => c.title === t);
    expect(byTitle("Machine Learning & AI Masterclass")?.longDescription).toContain(
      "Dive deep into the world of artificial intelligence"
    );
    expect(byTitle("Complete Web Development Bootcamp 2026")?.longDescription).toContain(
      "absolute beginner to professional web developer"
    );
    expect(byTitle("UI/UX Design Professional Certificate")?.longDescription).toContain(
      "Become a professional UI/UX designer"
    );
    expect(byTitle("Digital Marketing Strategy A-Z")?.longDescription).toContain(
      "every aspect of digital marketing"
    );
  });

  it("leaves the other 5 courses without a long description (reference behavior)", () => {
    const without = [
      "Cloud Computing with AWS",
      "Advanced Python Programming",
      "Data Science with Python & SQL",
      "Business Strategy & Leadership",
      "Emotional Intelligence & Mindfulness",
    ];
    for (const title of without) {
      expect(COURSES.find((c) => c.title === title)?.longDescription).toBeUndefined();
    }
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
