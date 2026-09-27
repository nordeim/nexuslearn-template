/**
 * Course tag helpers.
 *
 * The reference app renders a "What You'll Learn" card on the course detail
 * page whose topics are the course's TAGS plus its level (e.g. the AWS course
 * shows: AWS, Cloud, DevOps, Serverless, Microservices, Intermediate Level).
 * SQLite (Prisma) has no scalar lists, so tags are stored as a single
 * comma-separated string and parsed here.
 */
export function parseTags(tags: string | null | undefined): string[] {
  return (tags ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Topics for the "What You'll Learn" card: parsed tags + "<level> Level". */
export function whatYouLearnTopics(tags: string, level: string): string[] {
  return [...parseTags(tags), `${level} Level`];
}
