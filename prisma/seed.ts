/**
 * NexusLearn seed — imports the reference catalog from ./seed-data (the pure
 * module pinned by tests/seed-data.test.ts) and writes it plus the demo user.
 *
 *   bun run db:push && bun run db:seed
 *
 * Demo credentials (matches the reference app's demo account):
 *   sepnetflix2023@outlook.com / $Abcd1234
 */
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

import { resolveDatabaseUrl } from "./db-url";
import { COURSES, buildLessons } from "./seed-data";

const prisma = new PrismaClient({
  datasourceUrl: resolveDatabaseUrl(),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Seeding NexusLearn database…");

  // Courses + lessons (the reference app's auto-generated curricula:
  // lessonsCount rows per course, each "Lesson N: Module Content")
  for (const c of COURSES) {
    const course = await prisma.course.upsert({
      where: { id: `seed-${c.sortOrder}` },
      // ⚠ Prisma's update only touches keys PRESENT in the payload — a key
      // that is undefined is skipped, so an optional column keeps its OLD
      // row value. longDescription is the schema's only optional Course
      // field: restating it as an explicit null here is what makes the seed
      // idempotent across data changes (session 8: the session-7 reorder
      // left the pre-reorder texts on seed-3/4/5 because the update branch
      // never cleared them, surfacing as phantom "About This Course"
      // sections that the live app does not render).
      update: { ...c, longDescription: c.longDescription ?? null, id: undefined as never },
      create: { id: `seed-${c.sortOrder}`, ...c },
    });
    // Replace lesson set each seed (idempotent)
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });
    await prisma.lesson.createMany({
      data: buildLessons(c.lessonsCount).map((lesson) => ({
        courseId: course.id,
        ...lesson,
      })),
    });
    console.log(`  ✓ ${c.title} (${c.lessonsCount} lessons)`);
  }

  // Demo user (the reference app's demo account)
  await prisma.user.upsert({
    where: { email: "sepnetflix2023@outlook.com" },
    update: {},
    create: {
      email: "sepnetflix2023@outlook.com",
      name: "sepnetflix2023",
      passwordHash: hashPassword("$Abcd1234"),
    },
  });
  console.log("  ✓ demo user sepnetflix2023@outlook.com / $Abcd1234");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
