"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, BookOpen, Clock, Play, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

export interface EnrollmentView {
  id: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  course: {
    id: string;
    title: string;
    image: string;
    instructorName: string;
    hours: number;
    lessonsCount: number;
  };
  lessons: { id: string; title: string }[];
}

export function MyCourses({ enrollments }: { enrollments: EnrollmentView[] }) {
  return (
    <div className="mt-12 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <Link href="/Courses">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border bg-background shadow-sm h-9 px-4 py-2 rounded-xl border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300">
            Browse More
            <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </button>
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Start your learning journey by enrolling in a course</p>
          <Link href="/Courses">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow h-9 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl px-8 py-3 hover:scale-105 transition-all duration-300">
              Browse Courses
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrollments.map((enrollment) => (
            <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseProgressCard({ enrollment }: { enrollment: EnrollmentView }) {
  const router = useRouter();
  const [progress, setProgress] = useState(enrollment.progress);
  const [completed, setCompleted] = useState(
    new Set(enrollment.lessons.slice(0, enrollment.completedLessons).map((l) => l.id))
  );
  const [open, setOpen] = useState(false);

  const markLesson = async (lessonId: string) => {
    if (completed.has(lessonId)) return;
    const res = await fetch("/api/enrollments/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enrollmentId: enrollment.id, lessonId }),
    });
    if (res.ok) {
      const data = await res.json();
      setProgress(data.enrollment.progress);
      setCompleted(new Set([...enrollment.lessons.slice(0, data.completedLessons).map((l) => l.id)]));
      // Refresh server-rendered stat cards (Enrolled/In Progress/Avg. Progress)
      router.refresh();
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        { }
        <img
          src={enrollment.course.image}
          alt={enrollment.course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center justify-between text-xs text-white mb-1.5">
            <span>{progress}% complete</span>
            <span>
              {completed.size}/{enrollment.lessons.length} lessons
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1 line-clamp-2">
          {enrollment.course.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4">{enrollment.course.instructorName}</p>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {enrollment.course.hours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            {enrollment.course.lessonsCount} lessons
          </span>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <Play className="h-4 w-4 mr-1" aria-hidden="true" />
          {progress === 0 ? "Start Learning" : "Continue Learning"}
        </button>

        {open && (
          <div className="mt-4 space-y-1 border-t border-gray-50 pt-4">
            {enrollment.lessons.map((lesson, i) => {
              const done = completed.has(lesson.id);
              return (
                <button
                  key={lesson.id}
                  onClick={() => markLesson(lesson.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors",
                    done
                      ? "bg-green-50 text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                      done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : i + 1}
                  </span>
                  <span className="flex-1 truncate">{lesson.title}</span>
                  {!done && (
                    <span className="text-xs text-gray-400 hover:text-purple-600">Mark done</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
