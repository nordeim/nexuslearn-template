import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * POST /api/enrollments/progress — mark a lesson complete and recompute the
 * enrollment progress percentage (completed lessons / total lessons * 100).
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { enrollmentId, lessonId } = await req.json();
    if (!enrollmentId || !lessonId) {
      return NextResponse.json({ error: "enrollmentId and lessonId are required" }, { status: 400 });
    }

    const enrollment = await db.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { include: { lessons: true } } },
    });
    if (!enrollment || enrollment.userId !== session.userId) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    await db.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { enrollmentId, lessonId, completed: true, completedAt: new Date() },
    });

    const total = enrollment.course.lessons.length || 1;
    const done = await db.lessonProgress.count({
      where: { enrollmentId, completed: true },
    });
    const progress = Math.min(100, Math.round((done / total) * 100));

    const updated = await db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress,
        completedAt: progress >= 100 ? new Date() : null,
      },
    });

    return NextResponse.json({ enrollment: updated, completedLessons: done, totalLessons: total });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
