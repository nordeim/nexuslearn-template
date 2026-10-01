import { Suspense } from "react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCatalog } from "@/components/CourseCatalog";
import { db } from "@/lib/db";
import { pickLocale } from "@/lib/number-format";
import { headers } from "next/headers";

import { routeMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = routeMetadata({
  title: "Courses",
  canonical: "/Courses",
});

export default async function CoursesPage() {
  // The visitor locale for the catalog's count rows (session 29): the
  // catalog is a CLIENT boundary — its SSR pass must format the counts with
  // the same locale the browser will use at hydration, or React throws
  // "Hydration failed" and regenerates the tree. The Accept-Language header
  // is the server's only proxy for the browser locale (the live, a CSR SPA,
  // formats with the browser locale directly).
  const headerList = await headers();
  const locale = pickLocale(headerList.get("accept-language"));
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
            <CourseCatalog courses={courses} locale={locale} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
