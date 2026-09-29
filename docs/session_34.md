# Session 19 — Environment-integrity pass: the database-location contract enforced + the fresh-eyes surfaces

Continuing from session 18 (`5c1fc05` + the pulled transcript, remote at
`a8eb7c1`). Sessions 1–18 closed every static, content, state, computed-style,
cascade, font, preflight, reveal-entry, navigation-transition, deep-link and
pending-state/attribute/tag/token surface — every height byte-exact, the
mobile battery green, 262 tests. This session's mandate came from the
operator's direct report: **the `db/` folder must live at the root of the
`nexuslearn-template` repo, with `.env` reading `DATABASE_URL="file:../db/custom.db"`
and the relevant code files referencing the right location** — plus the
standard parity re-audit with a mobile-navigation focus (the Tailwind v4
watch) and the full ship ritual (screenshots, `.env.example`, docs, gates,
SSH-wrapper push).

## Root cause (reproduced three ways)

The baseline gates were fully green on the shipped tree (lint ✓ typecheck ✓
31/31 unit ✓ build ✓ 231/231 e2e ✓) — and yet the operator's report was
correct: the first `bun run db:push` in this workspace created the database
at `/home/z/my-project/db/custom.db`, OUTSIDE the repository. The cause: the
sandbox harness injects `DATABASE_URL=file:/home/z/my-project/db/custom.db`
(an absolute export pointing at the repo's PARENT) into every shell, and both
the Prisma CLI and the Next.js runtime prefer a shell-inherited
`DATABASE_URL` over the repo's `.env`. The repo's own docs documented the
trap ("a stale `DATABASE_URL` shell export overrides the repo `.env` — unset
it") as a manual workaround. Under the polluted shell:

1. `bun run db:push` → `/home/z/my-project/db/custom.db` (outside the repo).
2. `bun run dev` → the landing page renders the production error state
   (`Error code 14: Unable to open the database file` — the polluted path
   targets a nonexistent file after cleanup).
3. The standalone production server → zero courses served (the OLD
   db-url.ts passes absolute URLs through untouched). The first probe of
   this case returned a FALSE PASS — a `grep | head` pipeline masked grep's
   exit code; the re-probe with an invalid path proved the shell value wins
   in the standalone runtime too. (Verification lesson recorded in the SKILL
   doc: explicit exit-code discipline on every "verified" claim.)

Previous sessions ran inside the same polluted shell — the database lived
outside the repo across 18 sessions while all tools agreed on the same wrong
file, which is exactly why the suites stayed green and the drift went
unnoticed.

## Remediation (TDD)

**RED first**: `tests/db-url.test.ts` — 8 specs pinning the contract (the
repo `.env` declares `file:../db/custom.db`; an absolute shell URL pointing
outside the repo is ignored when `.env` declares a relative one; the
default path neutralizes a polluted `process.env`; a relative URL still
resolves into `<repo>/db/`; absolute URLs pass through when nothing relative
is declared — the production setup; non-file URLs untouched; undefined stays
undefined). RED verified: 4 failed for exactly the pinned reasons.

**GREEN**:
- `prisma/db-url.ts` v2 — the **pollution guard**: a RELATIVE `.env`
  declaration beats an ABSOLUTE process-env value (one-time stderr note
  outside tests); relative shell values (the e2e `file:../db/e2e.db`) still
  win; a `.env`-declared absolute URL always passes. Plus the exported
  `readDeclaredDatabaseUrl()` (the minimal `.env` reader, reused by the
  wrapper). The standalone-proven furthest-candidate walk-up is unchanged.
- `prisma/db-cli.ts` (new) — the Prisma-CLI wrapper that re-exports the
  `.env` value over the shell value before spawning `bunx prisma`;
  `package.json`'s `db:push`/`db:generate`/`db:migrate`/`db:reset` route
  through it (the CLI never consults db-url.ts). RED-phase correction: the
  `spawnSync` env needed the `NodeJS.ProcessEnv` type (bun-types requires
  the `NODE_ENV` key) — caught by `next build`'s typecheck.
- `next.config.ts` — `allowedDevOrigins` gains the `*.space-z.ai` wildcard
  (the sandboxed preview-proxy family; the dev server now accepts
  preview-origin requests with no warning — the same unhydrated-page failure
  family as the session-12 `127.0.0.1` gotcha).

**VERIFY (all under the polluted shell)**: `db:push` + `db:seed` →
`<repo>/db/custom.db` (no `/home/z/my-project/db` created); the dev server
renders the 9-course catalog; the REBUILT standalone server renders the
catalog AND prints the `[db-url]` guard note; 39/39 unit (31 → 39).

## Parity re-audit (live vs clone, both signed in; Playwright probes + agent-browser)

Every standing surface GREEN at the byte-exact state:
- **Heights ×11 routes ×2 viewports byte-exact** (including CourseDetail
  34246.25 / 38745 and the /login 762 mobile pin — each site navigates with
  its own course id).
- **Class diffs**: only the documented variance families (the gradient class
  form + the mobile-panel mechanism) — plus ONE new accepted variance: the
  /Contact subject SelectTrigger's class ORDER (the live interleaves the
  call-site additions, the clone appends them; token sets identical,
  rendering identical, and the live's own /Courses triggers use the appended
  form — the live is internally inconsistent). The /Courses triggers are
  byte-identical.
- **The FULL mobile-menu battery — no Tailwind v4 bug**: the trigger's bare
  reference classes byte-identical (`md:hidden p-2 rounded-lg text-white/80`),
  the open panel at the reference 405px byte-exact, 8 links, the 4px
  pre-CTA gap, the Menu↔X icon swap, the toggle close, the route-change
  close, the body scroll lock + ARIA (the documented clone-only hardening).
- **The dashboard**: byte-exact empty state on both sites ("Welcome back,
  sepnetflix2023" + 0/0/0/0% + "No courses yet" — matching
  `docs/nexuslearn-template-dashboard.png`).
- **The AI chat end-to-end**: the "Thinking..." pending bubble → a full SDK
  answer rendered on the clone (captured in
  `docs/screenshots/aiassistant-answer--desktop.png`).

Three fresh-eyes surfaces (the session-33 transcript's suggestions) — all
clean: **response headers** (only CDN/proxy infrastructure headers differ —
rndr-id, server-timing, priority; no app-level differences), **viewport-resize
behaviors** (the 768px breakpoint swap identical: trigger↔desktop row, nav
64→80px; the panel mechanism difference is the documented variance), and
**locale/intl number formatting** (every `$`/thousands/decimal/rating format
identical across /, /Courses, /Pricing, /CourseDetail).

## Gates (final)

lint ✓ · typecheck ✓ · 39/39 unit ✓ · build ✓ · 231/231 e2e ✓ (zero
regressions — the e2e webServer's relative `file:../db/e2e.db` still wins
over the `.env`, exactly as designed). The CSS-leak spec re-ran LAST after
every doc write (the session-15 process rule).

## Ship

- 54 screenshots in `docs/screenshots/` (the standard set re-captured on the
  remediated dev server + the session-19 captures: the mobile menu open at
  the 405px reference height, the route-change close, the AI answer —
  VLM-verified).
- `.env.example` re-verified: byte-identical to `.env`, covering every
  user-facing `process.env` reference (`DATABASE_URL` — now enforced by
  tests, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`). Included in the commit.
- Docs aligned: README (badge 270 + the session-19 paragraph + the
  troubleshooting row), AGENTS.md (gotcha 48 + the commands table),
  CLAUDE.md (the 39-spec pyramid + the DATABASE_URL row), PAD ([S19] +
  §4.4 + §7.1 + the code excerpt + the key-files table),
  `nexuslearn-template_SKILL.md` v3.7.0 (the environment-pollution surface
  18f + the exit-code-discipline lesson), `docs/remediation-plan-session19.md`
  (with the Phase 4 results), this session log, the repo worklog.
- Committed to `main` + pushed via the SSH wrapper
  (`docs/ssh_git_wrapper_v3.py`) — remote verified, operator key shredded
  after use.
