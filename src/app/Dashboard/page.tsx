import { Navbar } from "@/components/Navbar";
import { RevealController } from "@/components/reveal/RevealController";
import { Footer } from "@/components/Footer";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { Award, BookOpen, CirclePlay, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

import type { Metadata } from "next";

import { pageMetadata } from "@/lib/page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ title: "Dashboard", canonical: "/Dashboard" });
}

export default async function DashboardPage() {
  // The reference app renders the dashboard for signed-out visitors too —
  // a generic "Welcome back" heading, zeroed stats and the empty course
  // state. No server-side redirect happens.
  const session = await getSession();

  const enrollments = session
    ? await db.enrollment.findMany({
        where: { userId: session.userId },
        include: {
          course: { include: { lessons: { orderBy: { sortOrder: "asc" } } } },
          lessons: { where: { completed: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const stats = {
    enrolled: enrollments.length,
    inProgress: enrollments.filter((e) => e.progress > 0 && e.progress < 100).length,
    completed: enrollments.filter((e) => e.progress >= 100).length,
    avgProgress: enrollments.length
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
      : 0,
  };

  const statCards = [
    { label: "Enrolled Courses", value: String(stats.enrolled), iconBg: "bg-blue-100", iconColor: "text-blue-600", Icon: BookOpen },
    { label: "In Progress", value: String(stats.inProgress), iconBg: "bg-purple-100", iconColor: "text-purple-600", Icon: CirclePlay },
    { label: "Completed", value: String(stats.completed), iconBg: "bg-green-100", iconColor: "text-green-600", Icon: Award },
    { label: "Avg. Progress", value: `${stats.avgProgress}%`, iconBg: "bg-amber-100", iconColor: "text-amber-600", Icon: TrendingUp },
  ];

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + the overlapping stats/My-Courses area. */}
        <div className="min-h-screen bg-gray-50">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-20 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Session 15: the live wraps the heading block in a classless
                  motion div (measured live structure). */}
              <div data-reveal="a" style={{ opacity: 0, transform: "translateY(20px)" }}>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {session ? `Welcome back, ${session.name}` : "Welcome back"}
                </h1>
                <p className="mt-2 text-gray-400">Continue your learning journey</p>
              </div>
            </div>
          </div>

          {/* Stats (overlapping the hero) */}
          <div className="max-w-7xl mx-auto px-4 -mt-10">
          {/* Session 8: bare reference grid (no hook classes) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100"
                data-reveal="a"
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3`}
                >
                  {/* Session 8: lucide components (the reference ships the
                      lucide svg classes + width/height attributes) */}
                  <card.Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* My Courses */}
          <MyCourses enrollments={enrollments.map((e) => ({
            id: e.id,
            progress: e.progress,
            completedLessonIds: e.lessons.map((l) => l.lessonId),
            course: {
              id: e.course.id,
              title: e.course.title,
              image: e.course.image,
              instructorName: e.course.instructorName,
              hours: e.course.hours,
              lessonsCount: e.course.lessonsCount,
            },
            lessons: e.course.lessons.map((l) => ({ id: l.id, title: l.title })),
          }))} />
          </div>
        </div>
      </main>
      {/* Session 15: the reference scroll-reveal system (5 targets here). */}
      <RevealController />

      <Footer />
    </div>
  );
}
