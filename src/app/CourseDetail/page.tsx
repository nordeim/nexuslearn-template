import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  Play,
  CheckCircle2,
  Monitor,
  Award,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { EnrollButton } from "@/components/course-detail/EnrollButton";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const LEVEL_BADGE: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
  "All Levels": "bg-blue-100 text-blue-700",
};

export default async function CourseDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const course = await db.course.findUnique({
    where: { id },
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
  });
  if (!course) notFound();

  const session = await getSession();
  const enrollment = session
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId: session.userId, courseId: course.id } },
      })
    : null;

  const perks = [
    { icon: Monitor, text: "Full lifetime access" },
    { icon: Award, text: "Certificate of completion" },
    { icon: ShieldCheck, text: "30-day money-back guarantee" },
    { icon: Smartphone, text: "Access on mobile and desktop" },
  ];

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Breadcrumb + header */}
        <section className="py-12 px-4 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/Courses"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Courses
            </Link>

            <Badge className={`${LEVEL_BADGE[course.level] ?? "bg-blue-100 text-blue-700"} font-medium mb-4`}>
              {course.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight max-w-3xl">
              {course.title}
            </h1>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl leading-relaxed">
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                <span className="font-semibold text-gray-900">{course.rating.toFixed(1)}</span>
              </span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {course.students.toLocaleString()} students
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {course.hours} hours
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" aria-hidden="true" />
                {course.lessonsCount} lessons
              </span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              { }
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{course.instructorName}</p>
                <p className="text-sm text-gray-500">{course.instructorTitle}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Content + sidebar */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-12">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-12">
              {/* Course curriculum */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-semibold shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                        <p className="text-sm text-gray-500">Lesson {i + 1}: Module Content</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        {lesson.duration}m
                      </div>
                      <Play
                        className="h-5 w-5 text-gray-300 group-hover:text-purple-600 transition-colors shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* What you'll learn */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You&apos;ll Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    `Master the core concepts of ${course.category.toLowerCase()}`,
                    "Build real-world projects for your portfolio",
                    "Apply industry best practices and patterns",
                    "Prepare for certification and interviews",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" aria-hidden="true" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:sticky lg:top-28 h-fit space-y-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-500/5 overflow-hidden">
                <div className="relative aspect-video">
                  { }
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group cursor-pointer hover:scale-110 transition-transform duration-300">
                      <Play className="h-7 w-7 text-purple-600 ml-1" fill="currentColor" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-gray-900">${course.price.toFixed(2)}</span>
                    <span className="text-lg text-gray-400 line-through">
                      ${course.originalPrice.toFixed(2)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-600 text-xs font-semibold">
                      {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                    </span>
                  </div>

                  <EnrollButton
                    courseId={course.id}
                    isLoggedIn={Boolean(session)}
                    alreadyEnrolled={Boolean(enrollment)}
                  />

                  <div className="mt-6 space-y-3">
                    {perks.map((perk) => (
                      <div key={perk.text} className="flex items-center gap-3 text-sm text-gray-600">
                        <perk.icon className="h-4 w-4 text-purple-600" aria-hidden="true" />
                        {perk.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
