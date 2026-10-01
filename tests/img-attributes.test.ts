import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Session-28 (finding 1): the image LOADING-attribute parity guard. The live
// reference ships ZERO loading-family attributes — no <img> anywhere on the
// live app carries `loading`, `decoding` or `fetchpriority`; every image is
// EAGER (the browser default). The clone had drifted with `loading="lazy"`
// on 33/36 images (CourseCard cover + avatar, testimonial avatar) —
// undocumented drift that changed the fetch behavior itself (below-fold
// images deferred until scroll where the live fetches at page load). Fixed
// toward the live in session 28; this SOURCE-LEVEL guard (the svg-props
// pattern) makes any future creep fail the unit gate — most importantly it
// catches an accidental next/image migration, whose DEFAULT loading="lazy"
// would silently drift the whole surface (the e2e pin lives in the
// session-28 block: "the image loading/attribute surface").

const FORBIDDEN_IMG_PROPS = ["loading=", "decoding=", "fetchpriority="];

const SRC_ROOT = join(import.meta.dirname, "..", "src");

function collectTsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectTsxFiles(full));
    } else if (entry.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function imgPropHits(): { file: string; line: number; prop: string; text: string }[] {
  const hits: { file: string; line: number; prop: string; text: string }[] = [];
  for (const file of collectTsxFiles(SRC_ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((text, i) => {
      for (const prop of FORBIDDEN_IMG_PROPS) {
        // JSX prop form: `loading=` / `decoding=` / `fetchpriority=` followed
        // by a value (string or expression).
        if (new RegExp(`\\s${prop.replace(/=$/, "")}\\s*=`).test(text)) {
          hits.push({ file, line: i + 1, prop, text: text.trim() });
        }
      }
    });
  }
  return hits;
}

describe("session-28: the img loading-attribute parity guard (eager like the live)", () => {
  it("no loading/decoding/fetchpriority prop appears on any img in src/", () => {
    const hits = imgPropHits();
    expect(
      hits.map((h) => `${h.file.replace(SRC_ROOT + "/", "")}:${h.line} → ${h.text}`),
      "the live ships plain EAGER imgs (0/36 loading-family attributes); a loading prop here is parity drift — see docs/remediation-plan-session28.md finding 1"
    ).toEqual([]);
  });

  it("the three formerly-lazy sources render eager imgs (CourseCard cover + avatar, testimonial avatar)", () => {
    const card = readFileSync(join(SRC_ROOT, "components", "CourseCard.tsx"), "utf8");
    expect(card).toContain('src={course.image}');
    expect(card).toContain('src={course.instructorAvatar}');
    const landing = readFileSync(join(SRC_ROOT, "app", "page.tsx"), "utf8");
    expect(landing).toContain("src={t.avatar}");
    // None of the three carries a loading prop (belt-and-braces with the
    // sweep above — these were the session-28 fix sites).
    for (const [name, src] of [
      ["CourseCard.tsx", card],
      ["page.tsx", landing],
    ] as const) {
      expect(src.match(/loading\s*=/), `${name} ships no loading prop`).toBeNull();
    }
  });
});
