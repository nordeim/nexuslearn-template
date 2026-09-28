/**
 * Course tag helpers.
 *
 * The reference app renders a "What You'll Learn" card on the course detail
 * page whose check-icon rows are the course's TAGS ONLY (session-8
 * re-verification: the live list carries no level row on any of the 9
 * courses). The level renders exactly once — in the separate
 * `mt-6 pt-6 border-t` divider row with the Award icon (session 6).
 * SQLite (Prisma) has no scalar lists, so tags are stored as a single
 * comma-separated string and parsed here.
 */
export function parseTags(tags: string | null | undefined): string[] {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
