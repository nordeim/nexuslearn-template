import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MyCourses } from "@/components/dashboard/MyCourses";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

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
    { label: "Enrolled Courses", value: String(stats.enrolled), iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: "book-open" },
    { label: "In Progress", value: String(stats.inProgress), iconBg: "bg-purple-100", iconColor: "text-purple-600", icon: "play" },
    { label: "Completed", value: String(stats.completed), iconBg: "bg-green-100", iconColor: "text-green-600", icon: "award" },
    { label: "Avg. Progress", value: `${stats.avgProgress}%`, iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: "trending-up" },
  ];

  return (
    <div className="min-h-dvh bg-gray-50">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {session ? `Welcome back, ${session.name}` : "Welcome back"}
            </h1>
            <p className="mt-2 text-gray-400">Continue your learning journey</p>
          </div>
        </section>

        {/* Stats (overlapping the hero) */}
        <div className="max-w-7xl mx-auto px-4 -mt-10">
          <div className="dashboard-stats grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center mb-3`}
                >
                  {card.icon === "book-open" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M12 7v14" />
                      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                    </svg>
                  )}
                  {card.icon === "play" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                  )}
                  {card.icon === "award" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11a7 7 0 1 1 6.954 0z" />
                      <circle cx="12" cy="8" r="5" />
                    </svg>
                  )}
                  {card.icon === "trending-up" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                      <polyline points="16 7 22 7 22 13" />
                    </svg>
                  )}
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
      </main>
      <Footer />
    </div>
  );
}
