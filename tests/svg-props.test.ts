import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Session-21 (finding 1): the /Pricing FAQ icons carried KEBAB-CASE SVG
// props (stroke-width etc.) — React 19 logs "Invalid DOM property" console
// errors for them on every dev-server /Pricing load. Rendering is unaffected
// (React passes the attribute through), which is why every DOM/class/height
// parity diff stayed green for 20 sessions — only the CONSOLE surface sees
// it. These specs pin the camelCase prop form at the SOURCE level (the e2e
// suite runs the production build where React strips the warning, so the
// rendered-DOM pin lives in the session-21 e2e block instead).

// React maps these SVG presentation attributes to camelCase props; the
// kebab form as a JSX prop triggers the "Invalid DOM property" warning.
const KEBAB_SVG_PROPS = [
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "stroke-miterlimit",
  "fill-rule",
  "fill-opacity",
  "clip-rule",
];

// Attribute names that legitimately keep their kebab form in JSX.
const ALLOWED_KEBAB = /^(data-|aria-)/;

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

function kebPropHits(): { file: string; line: number; prop: string; text: string }[] {
  const hits: { file: string; line: number; prop: string; text: string }[] = [];
  for (const file of collectTsxFiles(SRC_ROOT)) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((text, i) => {
      for (const prop of KEBAB_SVG_PROPS) {
        // JSX prop form: `prop="…"` (quoted) or `prop={…}` — not part of a
        // longer attribute name (e.g. data-stroke-width) and not inside a
        // string payload such as a d= path. No lookbehind (ES2018) — the
        // tsconfig target predates it; a non-capturing prefix group works.
        const re = new RegExp(`(?:^|[^-\\w])${prop}(?=["'={\\s])`);
        if (ALLOWED_KEBAB.test(prop)) continue;
        if (re.test(text)) {
          hits.push({ file, line: i + 1, prop, text: text.trim().slice(0, 90) });
        }
      }
    });
  }
  return hits;
}

describe("session-21: SVG props use the React camelCase form (console hygiene)", () => {
  it("no kebab-case SVG presentation props appear as JSX props anywhere in src/", () => {
    const hits = kebPropHits();
    expect(
      hits.map((h) => `${h.file.replace(SRC_ROOT, "src")}:${h.line} ${h.prop}`)
    ).toEqual([]);
  });

  it("the /Pricing FAQ icons declare strokeWidth / strokeLinecap / strokeLinejoin", () => {
    const source = readFileSync(join(SRC_ROOT, "app", "Pricing", "page.tsx"), "utf8");
    // The inlined lucide circle-help glyph's opening tag carries the three
    // camelCase props (React renders them as stroke-width="2" etc. — pinned
    // byte-for-byte by the session-21 e2e FAQ-attribute spec).
    // `[^>]*` matches across newlines (character classes are not
    // line-anchored), so the multi-line svg opening tag matches without the
    // dotAll flag (the tsconfig target predates es2018 regex flags).
    const svgOpen = source.match(/<svg[^>]*lucide-circle-help[^>]*>/)?.[0] ?? "";
    expect(svgOpen).toContain('strokeWidth="2"');
    expect(svgOpen).toContain('strokeLinecap="round"');
    expect(svgOpen).toContain('strokeLinejoin="round"');
  });
});
