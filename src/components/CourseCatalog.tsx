"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";

import { CourseCard, type CourseCardData } from "@/components/CourseCard";
import { RevealController } from "@/components/reveal/RevealController";
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
  personal_development: "Personal Development",
  programming: "Programming",
  ai_innovation: "AI & Innovation",
};

type Course = CourseCardData;

export function CourseCatalog({ courses }: { courses: Course[] }) {
  const params = useSearchParams();
  const initialCategory = params.get("category");

  const [query, setQuery] = useState("");
  // Reference semantics (session 17): the slug maps through the
  // case-sensitive slug->name lookup; an UNMAPPED slug leaves the filter in
  // a no-match state (empty trigger via the "" placeholder, 0 cards, the
  // no-results copy) — NOT a fallback to "all". An absent or EMPTY param
  // value is "all" (the live treats ?category= as absent).
  const [category, setCategory] = useState<string>(
    initialCategory ? (CATEGORY_SLUGS[initialCategory] ?? "") : "all"
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

  const hasActiveFilters = query.trim() !== "" || category !== "all" || level !== "all";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setLevel("all");
  };

  return (
    <>
      {/* Dark hero with the search field (reference structure) */}
      <div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)] pt-16 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1
            className="text-3xl md:text-5xl font-bold text-white tracking-tight"
            data-reveal="a"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            Explore Our Courses
          </h1>
          <p
            className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto"
            data-reveal="a"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            Discover hundreds of expert-led courses to advance your career
          </p>
          <div
            className="mt-10 max-w-2xl mx-auto relative"
            data-reveal="a"
            style={{ opacity: 0, transform: "translateY(20px)" }}
          >
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
            {/* Reference input (session 6, corrected session 18): the live
                app ships the shadcn base with h-9 + py-6 — border-box
                collapses the content box to the reference 50px height — and
                NO type attribute (text is the UA default; the earlier
                "type=text" note was stale — the current live input is
                attribute-less, byte-verified by the attribute sweep). */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, topics, or instructors..."
              aria-label="Search courses"
              className="flex h-9 w-full border px-3 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-12 py-6 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl text-base focus:border-purple-500 focus:bg-white/15"
            />
          </div>
        </div>
      </div>

      {/* Results area — floating filter card overlapping the hero (the page
          shell provides the min-h-screen bg-gray-50 wrapper) */}
        <div className="max-w-7xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-wrap items-center gap-4">
            {/* Reference filter card (session 7): leads with the sliders icon
                (hidden below sm) before the three selects. */}
            <SlidersHorizontal
              className="h-5 w-5 text-gray-400 hidden sm:block"
              aria-hidden="true"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className="w-[180px] rounded-xl border-gray-200"
                aria-label="Filter by category"
              >
                <SelectValue placeholder="" />
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
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger
                className="w-[150px] rounded-xl border-gray-200"
                aria-label="Filter by level"
              >
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
              <SelectTrigger
                className="w-[160px] rounded-xl border-gray-200"
                aria-label="Sort courses"
              >
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
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 rounded-md px-3 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 ml-auto"
              >
                Clear Filters
              </button>
            )}
            <p className={hasActiveFilters ? "text-sm text-gray-500" : "ml-auto text-sm text-gray-500"}>
              {filtered.length} course{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="mt-10 pb-24">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400 mb-2">No courses found</p>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((course) => (
                  <div key={course.id} data-reveal="a" style={{ opacity: 0, transform: "translateY(20px)" }}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      {/* Session 15: the reference scroll-reveal system (12 targets here —
          the MutationObserver inside re-reveals newly-mounted cards when the
          catalog re-renders on search/filter, like the live's remount). */}
      <RevealController />
    </>
  );
}
