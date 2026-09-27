import { Suspense } from "react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCatalog } from "@/components/CourseCatalog";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses",
  description: "Discover hundreds of expert-led courses to advance your career",
};

export default async function CoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + the floating filter/catalog area. */}
        <div className="min-h-screen bg-gray-50">
          <Suspense
            fallback={
              <div className="py-24 text-center text-gray-500">Loading courses…</div>
            }
          >
            <CourseCatalog courses={courses} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
