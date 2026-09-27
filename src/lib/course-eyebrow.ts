/**
 * Reference card-eyebrow display map.
 *
 * The reference app renders a SHORT category label on the course card
 * eyebrow ("Personal Dev") while the catalog filter dropdown and the landing
 * category grid keep the full name ("Personal Development"). The map below
 * reproduces that display-only difference without touching the seeded
 * `Course.category` data (filters must keep matching the full name).
 */
const CATEGORY_EYEBROWS: Record<string, string> = {
  "Personal Development": "Personal Dev",
};

export function courseEyebrow(category: string): string {
  return CATEGORY_EYEBROWS[category] ?? category;
}
