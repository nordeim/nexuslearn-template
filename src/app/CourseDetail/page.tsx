import Link from "next/link";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  CirclePlay,
  Check,
  Award,
} from "lucide-react";
import type { Metadata } from "next";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EnrollButton } from "@/components/course-detail/EnrollButton";
import { AboutCourse } from "@/components/course-detail/AboutCourse";
import { RevealController } from "@/components/reveal/RevealController";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseTags } from "@/lib/course-tags";
import { routeMetadata } from "@/lib/metadata";
import { pickLocale } from "@/lib/number-format";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Next.js App Router delivers a REPEATED search param as string[] (the type
// below reflects what actually arrives). The reference's URLSearchParams.get
// semantics take the FIRST value — `?id=<real>&id=x` renders the course,
// `?id=x&id=<real>` the not-found state. The naive destructure passed the
// array to Prisma and rendered the error boundary (session 17).
type IdSearchParams = Promise<{ id?: string | string[] }>;

function firstId(params: { id?: string | string[] }): string | undefined {
  return Array.isArray(params.id) ? params.id[0] : params.id;
}

// The reference canonical + og:url include the query string
// (origin + /CourseDetail?id=<id>) — session 6 mirrors both via the helper.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: IdSearchParams;
}): Promise<Metadata> {
  const id = firstId(await searchParams);
  return routeMetadata({
    title: "Course Detail",
    canonical: id ? `/CourseDetail?id=${id}` : "/CourseDetail",
  });
}

const COURSE_PERKS = [
  "Full lifetime access",
  "Certificate of completion",
  "30-day money-back guarantee",
  "Access on mobile and desktop",
];

export default async function CourseDetailPage({
  searchParams,
}: {
  searchParams: IdSearchParams;
}) {
  const id = firstId(await searchParams);

  // The visitor locale for the SSR students row (session 29): the live
  // renders the count with the browser locale; the server's only proxy for
  // it is the Accept-Language request header.
  const headerList = await headers();
  const locale = pickLocale(headerList.get("accept-language"));

  const course = id
    ? await db.course.findUnique({
        where: { id },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      })
    : null;

  // The reference app renders an in-page "Course not found" state inside
  // the gray shell for unknown/missing ids — NOT the 404 page.
  if (!course) {
    return (
      <div className="min-h-dvh bg-white">
        <Navbar />
        <main className="pt-20">
          <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <p className="text-xl text-gray-500">Course not found</p>
            <Link href="/Courses">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                Browse Courses
              </button>
            </Link>
          </div>
        </main>
        {/* Session 15: the reference scroll-reveal system (2 targets here). */}
      <RevealController />

      <Footer />
      </div>
    );
  }

  const session = await getSession();
  const enrollment = session
    ? await db.enrollment.findUnique({
        where: { userId_courseId: { userId: session.userId, courseId: course.id } },
      })
    : null;

  // Session 8: the reference check list is the parsed tags ONLY — the level
  // renders once, in the Award-icon divider row below the list.
  const topics = parseTags(course.tags);

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + the curriculum body. */}
        <div className="min-h-screen bg-gray-50">
          {/* Dark hero — header info + price card (reference structure) */}
          <div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)] pt-8 pb-16 px-4">
          <div className="max-w-7xl mx-auto">
            <Link
              href="/Courses"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Courses
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Left column — course info */}
              <div className="lg:col-span-2">
                {/* Session 15: the live wraps the category badge + the price
                    card in classless motion divs (measured live structure) —
                    the route's 2 reveal targets, mount-animated (in view). */}
                <div data-reveal="a" style={{ opacity: 0, transform: "translateY(20px)" }}>
                  <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow hover:bg-primary/80 bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
                    {course.category}
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {course.title}
                </h1>
                <p className="mt-4 text-lg text-gray-400 leading-relaxed">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 mt-8 text-gray-300">
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    <span className="font-semibold text-white">{course.rating.toFixed(1)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" aria-hidden="true" />
                    {/* Explicit locale argument (session 29): the
                        Accept-Language-derived tag keeps the SSR output in
                        the visitor's format — guarded by
                        tests/locale-format-source.test.ts. */}
                    {course.students.toLocaleString(locale)} students
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" aria-hidden="true" />
                    {course.hours} hours
                  </span>
                  <span className="flex items-center gap-2">
                    {/* Reference (session 7): the lessons stat uses CirclePlay. */}
                    <CirclePlay className="h-5 w-5" aria-hidden="true" />
                    {course.lessonsCount} lessons
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-6">
                  <img
                    src={course.instructorAvatar}
                    // Reference markup (session 18): the live ships alt=""
                    // (decorative) — the instructor name renders in the
                    // adjacent paragraph, so screen readers announce it
                    // once. alt={instructorName} made them read it twice.
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{course.instructorName}</p>
                    <p className="text-sm text-gray-500">{course.instructorTitle}</p>
                  </div>
                </div>
              </div>

              {/* Right column — price / enroll card */}
              <div>
                <div data-reveal="a" style={{ opacity: 0, transform: "translateY(20px)" }}>
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="aspect-video relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <CirclePlay className="h-10 w-10 text-white" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-baseline gap-3 mb-6">
                      <span className="text-3xl font-bold text-gray-900">
                        ${course.price.toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        ${course.originalPrice.toFixed(2)}
                      </span>
                    </div>

                    <EnrollButton
                      courseId={course.id}
                      isLoggedIn={Boolean(session)}
                      alreadyEnrolled={Boolean(enrollment)}
                    />

                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      {COURSE_PERKS.map((perk) => (
                        <div key={perk} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                          {perk}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body — About (when present) + curriculum + What You'll Learn */}
          <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className={course.longDescription ? "lg:col-span-2 space-y-12" : "lg:col-span-2"}>
              {course.longDescription && (
                <AboutCourse description={course.longDescription} />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h2>
                <div className="space-y-3">
                  {course.lessons.map((lesson, i) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                        {i + 1}
                      </div>
                      <span className="text-gray-700 font-medium">{lesson.title}</span>
                      <CirclePlay className="h-5 w-5 text-gray-400 ml-auto" aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-4">What You&apos;ll Learn</h3>
                <div className="space-y-3">
                  {topics.map((topic) => (
                    <div key={topic} className="flex items-start gap-2">
                      <Check
                        className="h-5 w-5 text-purple-600 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-gray-600">{topic}</span>
                    </div>
                  ))}
                </div>
                {/* Reference level row (session 6): divider section with the
                    Award icon + "{level} Level" under the tag checklist */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-700">{course.level} Level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>

      {/* Session 15: the reference scroll-reveal system (2 targets here). */}
      <RevealController />

      <Footer />
    </div>
  );
}
