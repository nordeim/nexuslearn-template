import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Session 29 (finding 1): the locale-formatting SOURCE guard (the
// img-attributes pattern). The student counts are the site's only
// locale-sensitive rendering. The live reference (a CSR SPA) formats every
// count with the browser locale; the clone's SSR surfaces must derive the
// visitor's locale from the Accept-Language header — the only signal at
// render time — and pass it EXPLICITLY into the formatting call on every
// tier (server components AND the /Courses catalog's client boundary, whose
// SSR output must agree with the browser's hydration render or React throws
// "Hydration failed" and regenerates the whole tree). The pre-fix tree
// carried the drift twice over: the RSC surfaces baked the Node runtime's
// en-US format into the HTML regardless of the visitor's locale, AND the
// catalog's SSR pass disagreed with its own hydration render under every
// non-en-US visitor.

const SRC_ROOT = join(import.meta.dirname, "..", "src");

function collectSourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

/** Strip line comments, block comments and JSX text so the sweep only reads
 *  executable code (a doc comment quoting the call shape is not a call). */
function stripComments(source: string): string {
  return source
    .split("\n")
    .filter((line) => {
      const t = line.trim();
      return !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*");
    })
    .join("\n");
}

describe("session-29: the locale-formatting source guard", () => {
  it("every count-formatting call in src/ passes an explicit locale argument (no bare runtime-locale calls)", () => {
    const offenders: string[] = [];
    for (const file of collectSourceFiles(SRC_ROOT)) {
      const code = stripComments(readFileSync(file, "utf8"));
      const lines = code.split("\n");
      lines.forEach((line, i) => {
        if (/\.toLocaleString\(\s*\)/.test(line)) {
          offenders.push(`${file.replace(SRC_ROOT + "/", "")}:${i + 1} -> ${line.trim()}`);
        }
      });
    }
    expect(
      offenders,
      "a bare count-formatting call follows the RUNTIME locale (the Node default on the server, the browser default on the client) — the exact SSR/hydration drift class session 29 closed; pass the Accept-Language-derived tag explicitly (see docs/remediation-plan-session29.md finding 1)"
    ).toEqual([]);
  });

  it("the three count surfaces wire the Accept-Language header through to the formatting calls", () => {
    const read = (...seg: string[]) =>
      readFileSync(join(SRC_ROOT, ...seg), "utf8");

    // (a) the landing featured grid: header -> pickLocale -> CourseCard prop
    const landing = read("app", "page.tsx");
    expect(landing).toContain('pickLocale(headerList.get("accept-language"))');
    expect(landing).toContain("<CourseCard course={course} locale={locale} />");

    // (b) the /Courses catalog's client boundary: the page resolves the
    // locale and threads it through CourseCatalog -> CourseCard so the SSR
    // pass and the hydration render format identically
    const coursesPage = read("app", "Courses", "page.tsx");
    expect(coursesPage).toContain('pickLocale(headerList.get("accept-language"))');
    expect(coursesPage).toContain("<CourseCatalog courses={courses} locale={locale} />");
    const catalog = read("components", "CourseCatalog.tsx");
    expect(catalog).toContain("<CourseCard course={course} locale={locale} />");

    // (c) the CourseDetail hero students row formats with the resolved tag
    const detail = read("app", "CourseDetail", "page.tsx");
    expect(detail).toContain('pickLocale(headerList.get("accept-language"))');
    expect(detail).toContain("course.students.toLocaleString(locale)");

    // (d) CourseCard's count row passes the prop into the call
    const card = read("components", "CourseCard.tsx");
    expect(card).toContain("course.students.toLocaleString(locale)");
  });
});
