import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/** POST /api/enrollments — enroll the signed-in user in a course. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();
    if (!courseId || typeof courseId !== "string") {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const enrollment = await db.enrollment.upsert({
      where: { userId_courseId: { userId: session.userId, courseId } },
      update: {},
      create: { userId: session.userId, courseId },
    });

    return NextResponse.json({ enrollment });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

/** GET /api/enrollments — the signed-in user's enrollments with course data. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.userId },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ enrollments });
}
