# NexusLearn Remediation Plan — Session 19

**Source of truth**: baseline re-verification + live parity re-audit against
`https://nexuslearn-template.base44.app/` (Playwright parity probes + agent-browser
sessions, synced viewports 1920×1080 / 375×667, both sites signed in as the demo user;
the dev server on :3000 and the production standalone server on scratch ports).

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`, the `@source not` set in `globals.css`).

**Baseline before remediation** (the shipped session-18 tree, commit `a8eb7c1`):
lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · 231/231 e2e ✓ — fully green, matching
the documented session-18 end state.

---

## A. Findings inventory

| # | Finding | Severity | Status |
|---|---------|----------|--------|
| 1 | **The database could be created OUTSIDE the repository** (the reported bug). Root cause, reproduced three ways: (a) `bun run db:push` under a shell carrying `DATABASE_URL=file:/home/z/my-project/db/custom.db` (an absolute export pointing at the parent of the repo — the sandbox harness injects one into every shell) creates the database at `/home/z/my-project/db/custom.db`, OUTSIDE the repo; (b) the dev server under the same env fails outright (`Error code 14: Unable to open the database file` — the landing page renders the production error state); (c) the production standalone server under the same env serves zero courses (rigorously re-verified after an initial false-positive probe — a `grep \| head` pipeline masked the failure; the re-probe with an invalid path proved the shell value wins in the standalone runtime too). Mechanism: the Prisma CLI and the Next.js runtime both prefer a `DATABASE_URL` inherited from the shell over the repo's `.env` file, and `prisma/db-url.ts` (v1) passed absolute `file:` URLs through untouched — so any absolute export silently relocates (or breaks) the database. The README documents "unset it" as the manual workaround; the code now enforces it. | **High** | **FIXED (TDD)** |
| 2 | **Dev-origin warning / unhydrated preview**: Next 16's dev-origin protection warns on requests whose Origin host is the sandboxed preview proxy (`preview-<session>.space-z.ai`) — the same failure family as the session-12 `127.0.0.1` gotcha (silently-unhydrated pages when the chunk host differs). The allowlist carried only `127.0.0.1`. | **Low** | **FIXED** |
| 3 | **The /Contact subject `SelectTrigger` class ORDER differs from the live** (undocumented until now): the live's attribute interleaves the call-site additions (`flex h-9 w-full items-center … border border-input … line-clamp-1 mt-2 rounded-xl`), the clone appends them (`… line-clamp-1 w-full border-input mt-2 rounded-xl`). Token sets are IDENTICAL, rendering is identical (class order in the attribute never affects the cascade), and the live's own /Courses triggers use the appended form (the live is internally inconsistent — a Base44 runtime class-merge artifact). The clone's form is the documented gotcha-23 convention. | **Low** | **Accepted variance — documented** |
| 4 | **Verified at parity (no action)**: every standing surface — desktop + mobile heights ×11 routes byte-exact (including /CourseDetail 34246.25 / 38745 and the /login 762 mobile pin), class-set diffs confined to the documented variance families (the gradient class form + the mobile-panel mechanism), the FULL mobile-menu battery (405px panel byte-exact, 8 links, 4px pre-CTA gap, toggle close, route-change close, scroll lock, ARIA wiring, icon swap — **no Tailwind v4 display/breakpoint/space-y bug**), the dashboard byte-exact empty state (0/0/0/0% + "No courses yet", matching `docs/nexuslearn-template-dashboard.png`), the AI chat end-to-end (the "Thinking…" pending bubble + a full SDK answer on the clone), the /Courses select triggers byte-identical, the response-header surface (only CDN/proxy infra headers differ), the viewport-resize surface (the 768px breakpoint swap identical: trigger↔desktop row, nav 64→80px) and the locale/intl number formatting surface (all `$`/thousands/decimal/rating formats identical across /, /Courses, /Pricing, /CourseDetail). | — | Verified |
| 5 | **The vitest + playwright suites verified end-to-end**: `vitest.config.ts` (node env, `@` alias, `src/**` + `tests/**` include — never the e2e `*.spec.ts` files) and `playwright.config.ts` (production standalone server on :3100 with the isolated `db/e2e.db`, global-setup schema-push + seed + enrollment reset, single worker, retain-on-failure traces) both run green on this tree; the session adds the new db-url unit seam (below). | — | Verified |

### Root-cause note (finding 1)

The stale-export family is why the user-visible "db/ folder outside the repo" ever
happened: previous sessions ran inside the same sandbox, whose harness injects
`DATABASE_URL=file:/home/z/my-project/db/custom.db` (absolute, parent-of-repo) into
every shell. Every `db:push`/`db:seed`/`dev`/`start` silently honored it — the database
lived OUTSIDE the repo while all tools agreed on the same wrong file, so the suites
stayed green. The fix makes the repo's `.env` the source of truth (exactly the
user-facing contract: `DATABASE_URL="file:../db/custom.db"` → `<repo>/db/custom.db`).

---

## B. Remediation (TDD — RED first, then GREEN)

### Phase 1 — the database-location fix (executed)

- [1a] **RED** `tests/db-url.test.ts` (8 specs, new Vitest seam):
  - the repo `.env` declares `file:../db/custom.db` (the contract, pinned);
  - an ABSOLUTE shell URL pointing outside the repo is IGNORED when `.env`
    declares a relative one → resolves to `<repo>/db/custom.db`;
  - the default (no-args) path neutralizes a polluted `process.env` against the
    real `.env`;
  - a RELATIVE URL still resolves into the repo's `db/` folder (v1 behavior
    preserved);
  - an ABSOLUTE URL passes through when nothing relative is declared (production
    per `docs/DEPLOYMENT.md`) — including when `.env` itself declares an absolute
    one;
  - non-file URLs pass through untouched; undefined stays undefined.
  - RED verified: 4 failed for exactly the pinned reasons (the missing
    `readDeclaredDatabaseUrl` export + the missing pollution guard) before the
    implementation.
- [1b] **GREEN** `prisma/db-url.ts` v2:
  - new exported `readDeclaredDatabaseUrl(repoRoots)` — reads the `DATABASE_URL`
    line from the repo `.env` (first defining line wins; quotes stripped);
  - the **pollution guard**: a relative `.env` declaration beats an absolute
    process-env value (one-time stderr note outside tests — observed firing in
    the standalone verification log);
  - relative-URL anchoring unchanged (the standalone-proven furthest-candidate
    walk-up), so the e2e `file:../db/e2e.db` override keeps winning (it is
    relative — the guard only rewrites absolute shell values).
- [1c] **GREEN** `prisma/db-cli.ts` (new): the Prisma-CLI wrapper that re-exports
  the `.env` value over the shell value before spawning `bunx prisma` — protects
  `db:push` / `db:migrate` / `db:reset` / `db:generate` (the CLI never consults
  db-url.ts). `package.json` db-scripts now route through it.
  - RED-phase correction: `spawnSync` env typed as `NodeJS.ProcessEnv`
    (bun-types requires the `NODE_ENV` key) — caught by `next build`'s
    typecheck, fixed before the gate.
- [1d] **VERIFY (all under the polluted shell env)**: `db:push` + `db:seed` →
  `<repo>/db/custom.db` (no `/home/z/my-project/db` created); the dev server
  renders the 9-course catalog; the rebuilt standalone server renders the catalog
  AND prints the guard note; `tests/db-url.test.ts` 8/8; full unit suite 39/39
  (31 → 39).

### Phase 2 — dev-origin allowlist (executed)

- [2a] `next.config.ts` `allowedDevOrigins`: `["127.0.0.1"]` → `["127.0.0.1", "*.space-z.ai"]`
  (wildcard — the sandbox preview proxy's session-scoped host; dev-only, no
  production effect). Verified: the dev server accepts preview-origin requests
  with no warning.

### Phase 3 — parity re-audit (executed — see §A.4)

Heights ×11×2 byte-exact · class diffs documented-only · mobile battery green ·
dashboard byte-exact · AI chat functional · headers/resize/intl surfaces clean.

### Phase 4 — ship (remaining)

- [4a] `.env.example` re-verified against every `process.env` reference
  (`DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`) — must match the
  remediated codebase (the db-url contract is now enforced by tests, not just
  documented).
- [4b] Screenshots: the standard route set (desktop + mobile) + the session-19
  captures (the mobile menu open at 405px, the mobile menu mid-animation, the
  dashboard, the AI chat answer, the db-in-repo evidence) → `docs/screenshots/`.
- [4c] Docs alignment: README (badge 262 → 270, the session-19 row, the
  db-location troubleshooting row), AGENTS.md (gotcha 48 — the pollution guard +
  the wrapper + the class-order variance), CLAUDE.md (pyramid 39 + 231), PAD
  ([S19] revision + §7.1), `nexuslearn-template_SKILL.md` (v3.7.0 — the
  env-pollution audit surface), this plan (results), `docs/session_34.md`, the
  repo worklog.
- [4d] Full gate in order: `lint → typecheck → test → build → test:e2e`, then the
  session-14 CSS-leak spec re-run LAST (the session-15 process rule — every doc
  write can re-leak the canary).
- [4e] Commit to `main` + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py` via
  `docs/how-to-git-push-using-ssh-wrapper_SKILL.md`; key in a 0600 file OUTSIDE
  the repo).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The pollution guard ignores an operator's INTENTIONAL absolute shell URL while `.env` still declares the relative default | Documented in three places (db-url.ts docblock, README troubleshooting, DEPLOYMENT.md flow): put the absolute URL IN the `.env` — the documented production path. The guard only fires on absolute-vs-relative disagreement; a relative shell value (the e2e suite) still wins. |
| The db-cli wrapper hides a user's deliberate per-command `DATABASE_URL=… bun run db:push` override | Same contract: the `.env` is the source of truth for the repo's scripts; direct `bunx prisma …` calls keep standard precedence. The wrapper prints exactly what it overrides. |
| `readDeclaredDatabaseUrl`'s minimal parser mishandles exotic `.env` syntax (multiline, expansion) | The repo's `.env` is simple KEY="value" lines (pinned by the unit test); dotenv-style escapes are out of scope — the parser returns undefined rather than guessing, and `undefined` means "no declaration → env wins" (the v1 behavior). |
| The `*.space-z.ai` wildcard is too broad for some future deployment | Dev-only config (stripped from the production build); the host family only exists in the sandboxed preview environment. |
| The db-url change breaks the e2e webServer's `file:../db/e2e.db` | The guard only rewrites ABSOLUTE shell values; the webServer env is relative and keeps winning (the full e2e gate re-run is the proof). |
| Screenshot drift vs the 52-file session-18 set | The standard set is re-captured on the remediated dev server; the mobile-panel mechanism and all documented variances are unchanged (Phase 3 re-verified the byte-exact heights). |

---

## D. Phase 4 results (recorded after execution)

- **[4a] `.env.example`**: verified — matches `.env` byte-for-byte and covers every
  `process.env` reference in the codebase (`DATABASE_URL` — now guarded by
  `tests/db-url.test.ts`; `AUTH_SECRET`; `NEXT_PUBLIC_SITE_URL`). Committed.
- **[4b] Screenshots**: 54 files in `docs/screenshots/` — the standard route
  set re-captured on the remediated dev server (desktop + mobile, incl. the
  full-page landing/catalog/course-detail captures) + the session-19
  captures (mobile-menu-open--mobile at the 405px reference height,
  mobile-menu-route-close--mobile, aiassistant-answer--desktop with a real
  SDK answer — VLM-verified).
- **[4c] Docs**: README (badge 270, session-19 row, the troubleshooting row),
  AGENTS.md (gotcha 48), CLAUDE.md (39 + 231 pyramid + the new seam), PAD ([S19]
  + §7.1 row), SKILL v3.7.0 (the env-pollution surface), this plan,
  `docs/session_34.md`, the repo worklog.
- **[4d] Gates (final)**: lint ✓ · typecheck ✓ · 39/39 unit ✓ · build ✓ ·
  231/231 e2e ✓ (zero regressions) · the CSS-leak spec re-ran LAST after every
  doc write — clean.
- **[4e] Ship**: committed to `main` and pushed via the SSH wrapper — remote
  verified, key shredded after use.
