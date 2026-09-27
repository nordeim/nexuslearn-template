"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { CourseCard, type CourseCardData } from "@/components/CourseCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_SLUGS: Record<string, string> = {
  business: "Business",
  technology: "Technology",
  marketing: "Marketing",
  design: "Design",
  "personal-development": "Personal Development",
  programming: "Programming",
  "ai-innovation": "AI & Innovation",
};

type Course = CourseCardData;

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const params = useSearchParams();
  const initialCategory = params.get("category");

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(
    initialCategory && CATEGORY_SLUGS[initialCategory] ? CATEGORY_SLUGS[initialCategory] : "all"
  );
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let list = [...courses];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructorName.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((c) => c.category === category);
    if (level !== "all") list = list.filter((c) => c.level === level);
    switch (sort) {
      case "popular":
        list.sort((a, b) => b.students - a.students);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "price-low":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        list.sort((a, b) => b.price - a.price);
        break;
      default:
        list.sort((a, b) => (a.id > b.id ? 1 : -1));
    }
    return list;
  }, [courses, query, category, level, sort]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(courses.map((c) => c.category)))],
    [courses]
  );
  const levels = useMemo(
    () => ["all", ...Array.from(new Set(courses.map((c) => c.level)))],
    [courses]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="pt-16 pb-12 px-4 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Explore Our Courses
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Discover hundreds of expert-led courses to advance your career
          </p>
        </div>
      </section>

      {/* Search + filters */}
      <section className="py-8 px-4 bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search courses, topics, or instructors..."
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-label="Search courses"
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-gray-400" aria-hidden="true" />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[160px] h-11 rounded-xl border-gray-200 bg-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories
                      .filter((c) => c !== "all")
                      .map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-gray-200 bg-white">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels
                    .filter((l) => l !== "all")
                    .map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[140px] h-11 rounded-xl border-gray-200 bg-white">
                  <SelectValue placeholder="Newest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-gray-500 mb-6">
            {filtered.length} course{filtered.length === 1 ? "" : "s"}
            {category !== "all" ? ` in ${category}` : ""}
          </p>
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setLevel("all");
                }}
                className="inline-flex items-center justify-center gap-2 text-sm font-medium shadow h-9 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl px-8 py-3 hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
