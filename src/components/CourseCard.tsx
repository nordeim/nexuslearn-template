import Link from "next/link";
import { Star, Users, Clock } from "lucide-react";

import { courseEyebrow } from "@/lib/course-eyebrow";

export interface CourseCardData {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  rating: number;
  students: number;
  hours: number;
  instructorName: string;
  instructorAvatar: string;
  image: string;
  price: number;
  originalPrice: number;
}

// Reference level badge colors (session-7 audit): Beginner = emerald,
// Intermediate = amber, Advanced = red.
const LEVEL_BADGE: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
  "All Levels": "bg-blue-100 text-blue-700",
};

/** Exact structural clone of the live course card (classes copied verbatim). */
export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link href={`/CourseDetail?id=${course.id}`}>
      <div className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 hover:-translate-y-2">
        <div className="relative overflow-hidden aspect-video">
          { }
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {/* Reference badge (session 7): a plain div — class string copied
              verbatim from the live app (hover:bg-primary/80 before the
              positioning utilities, border-0 before font-medium). */}
          <div
            className={`inline-flex items-center rounded-md px-2.5 py-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-primary/80 absolute top-3 left-3 ${LEVEL_BADGE[course.level] ?? "bg-blue-100 text-blue-700"} border-0 font-medium text-xs`}
          >
            {course.level}
          </div>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2">
            {courseEyebrow(course.category)}
          </p>
          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-3 group-hover:text-purple-700 transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              <span className="text-gray-700 font-medium">{course.rating.toFixed(1)}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {course.students.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {course.hours}h
            </span>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              { }
              <img
                src={course.instructorAvatar}
                alt={course.instructorName}
                className="w-7 h-7 rounded-full object-cover"
                loading="lazy"
              />
              <span className="text-sm text-gray-500">{course.instructorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">
                ${course.originalPrice.toFixed(2)}
              </span>
              <span className="font-bold text-lg text-gray-900">${course.price.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
