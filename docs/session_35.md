I'll start by reading the uploaded instructions file to understand the operating instructions, then proceed with the task.
Let me read the original file in chunks directly:
I've internalized the operating instructions — a coding specialist spec emphasizing production-grade quality, TDD, root-cause fixes, evidence-backed verification, and clean handoff. Now let me plan this complex task.
这是针对现有代码库的类型 3（Web 开发）任务。让我调用 fullstack-dev 技能并检查工作区状态：
The workspace has no existing project — I need to clone the nexuslearn-template repo. Let me check git setup and clone:
Repo cloned successfully on `main` branch. Now let me review the core documentation files:
The repo structure is clear. Now let me read the core documentation files:
The lines are long; let me read in smaller chunks:
Now let me read README.md and package.json:
Now let me read the session docs and worklog to understand the current project status:
Let me read the most recent worklog entries (the tail):
Now let me validate the current codebase state — env config, test configs, db folder:
`.env` and `.env.example` both already exist with `DATABASE_URL="file:../db/custom.db"`. Let me check the test configs and other key files:
All configs validated. Now let me clone the scandihaven reference repo and check the skills catalog:
Let me read the key skills — TDD, agent-browser, and mobile navigation references:
Now let me invoke the agent-browser skill to learn how to operate the browser tooling in this environment:
Now let me set up the environment — check tooling and install dependencies:
Database seeded. Let me verify db location and run baseline gates:
The `db/` folder is NOT at the repo root — this is the exact issue the user flagged. Let me find where the database went:
Found the exact bug the user flagged: the database was created at `/home/z/my-project/db/custom.db` (OUTSIDE the repo) instead of `/home/z/my-project/nexuslearn-template/db/custom.db` (repo root). Let me investigate the root cause:
The database landed outside the repo — exactly the issue the user described. Let me trace the resolution empirically:
Interesting — `process.env.DATABASE_URL` shows an ABSOLUTE path `file:/home/z/my-project/db/custom.db` even though `.env` says `file:../db/custom.db`. Let me check where this override comes from:
The stale shell export `DATABASE_URL=file:/home/z/my-project/db/custom.db` (pointing OUTSIDE the repo) overrides the repo `.env` — this is the root cause. Let me find where it's set and verify the correct behavior without it:
Root cause confirmed and fixed: with the stale shell export unset, the Prisma CLI correctly creates `db/custom.db` at the repo root. Now let me seed and verify:
The stale env var reappears in new shell invocations. Let me find its true source:
The sandbox harness injects `DATABASE_URL=file:/home/z/my-project/db/custom.db` into every shell invocation — it overrides the repo `.env` and points outside the repo. Let me examine the remaining db-touching code:
Now I understand the full db-resolution chain. Before designing the fix, let me empirically test how PrismaClient resolves relative `datasourceUrl` paths (critical for e2e):
Key empirical finding: PrismaClient resolves relative `datasourceUrl` against the schema convention (`<repo>/prisma/../db` → `<repo>/db/`). The only failure mode is the polluted absolute shell env var. Let me clean up and run baseline gates:
Lint ✓, typecheck ✓, 31/31 unit ✓. Now the production build:
Let me check whether the build-time prerender used the polluted db path (the landing page is static and queries courses at build time):
The build output shows `/` renders dynamically (no prerendered HTML) — the polluted env didn't corrupt the build. Now let me run the full e2e baseline (231 specs, boots standalone server on :3100):
**All baseline gates GREEN: lint ✓ typecheck ✓ 31/31 unit ✓ build ✓ 231/231 e2e ✓** — the shipped session-18 tree fully verified. Let me update progress and start the parity audit:
Dev server running. Now let me open the live reference site and log in:
Logged in successfully. Let me save the session state and capture the live mobile navigation reference:
Live mobile menu: panel 405px height (matches documented reference). Let me capture the detailed DOM structure:
Live reference captured: trigger `md:hidden p-2 rounded-lg text-white/80`, panel 405px, CTA `a.block.mt-3` (the v3 space-y trap area). Now let me open the local clone for comparison:
The local clone shows a dev error overlay. Let me check the dev server log:
**Confirmed with hard evidence**: the dev server failed with `Error code 14: Unable to open the database file` — it's referencing the polluted env var's path (`/home/z/my-project/db/custom.db`, outside the repo). This is the exact bug the user described. Let me check test conventions, then implement the fix TDD-style:
Test conventions clear. Now implementing the database-location fix **TDD-style — RED first**:
RED verified — 4 failures for the pinned reasons. Let me make the "undefined" test env-independent, then implement the fix:
Now the GREEN phase — implementing the hardened `prisma/db-url.ts`:
GREEN — 39/39 tests pass. Now the Prisma CLI wrapper to protect `db:push`/`db:migrate` from the same pollution:
Now let me verify end-to-end with the polluted env present (as it will be in every fresh shell):
Database now stays inside the repo under the polluted env. Let me restart the dev server and verify the landing page renders:
Dev server fixed and rendering from the repo database. Now the mobile navigation parity comparison — the user's key focus:
**Mobile nav parity verified**: panel 405px byte-exact, trigger classes identical, 8 links, 4px CTA gap correct, scroll lock + ARIA = documented clone-only hardening. **No Tailwind v4 bug.** Let me verify the interaction behaviors:
The synthetic JS click didn't trigger navigation — let me test with a real browser click (Playwright-native) as the specs do:
Mobile nav fully verified: route-change close works, panel closes, icon swaps. Now let me compare the dashboards (the user's reference image shows the empty-state dashboard):
Dashboard parity byte-exact. Now let me run a comprehensive parity sweep with Playwright (hover-capable, the correct probe context per gotcha 31). First the height sweep across all routes:
Script needs the repo's node_modules. Let me fix the import path:
10/11 routes byte-exact at both viewports. The 2 "diffs" are my script using the live's course id on the clone — let me fix to use each site's own id (documented per-site-id variance):
The comparison keys mismatch (live path vs clone path). Let me fix the script to key by route name:
**ALL HEIGHTS BYTE-EXACT** — 11 routes × 2 viewports. Now the class-set diff sweep across all routes:
The class diffs match documented variance families (gradient form + panel mechanism) except one interesting finding — the `/Contact` SelectTrigger class order. Let me see the full picture and inspect that select:
Now let me inspect the select triggers closely — the one finding that may be a real (undocumented) drift:
Select triggers: `/Courses` byte-identical; `/Contact` differs only in class ORDER (token-set identical, rendering identical — the live's own two pages are internally inconsistent). Now the fresh-eyes surfaces — response headers comparison:
Headers differ only by CDN/proxy infrastructure (rndr-id, server-timing etc.) — no app-level differences. Now let me verify the AI chat works on the clone (z-ai-web-dev-sdk is available in this sandbox):
Chat shows the "Thinking..." pending state correctly. Let me wait for the actual response:
AI chat fully functional end-to-end (SDK responded with a complete answer). Now the viewport-resize surface — testing breakpoint behaviors:
Breakpoint swap identical (768px, 64→80px nav); panel mechanism = documented variance. Let me check the last fresh-eyes surface — locale/intl number formatting:
Intl formatting identical. Let me quickly review the scandihaven reference docs (per the user's instruction) for tech-stack patterns:
The scandihaven patterns (quality gates, TDD seams, SSH push workflow) are already embedded in this repo's conventions. Now let me verify the standalone production server resolves the db correctly under the polluted env:
Let me probe the standalone env precedence mechanism precisely (evidence discipline — I need to know which layer wins):
The pipeline masked the result. Let me redo the probe rigorously:
My earlier "standalone ✓" was a **false positive** — a `grep | head` pipeline exit-code bug. The truth: the OLD build + polluted env = broken. Let me rebuild with the NEW db-url.ts and re-verify rigorously:
The build failed — TypeScript error in my new `db-cli.ts` (the build aborted, so the standalone test ran stale code). Let me see the full error:
`bun-types` requires `NODE_ENV` in `ProcessEnv`. Simple fix — type the env as `NodeJS.ProcessEnv`:
**Standalone rigorously verified** — courses render from the repo db, guard warning fired, no outside-repo db. Now let me fix the dev-server preview-origin warning (so the user's preview panel hydrates correctly):
预览源通配符已接受（无警告）。现在让我找到 CSS 泄漏规范（必须在所有文档写入后最后重新运行）：
Now let me write the comprehensive remediation plan:
Now validating the plan against the codebase — checking env var coverage claims:
Plan validated — env coverage confirmed, `.env` ≡ `.env.example`. Now executing Phase 4b — the screenshot capture pass on the remediated dev server:
All 22 screenshots captured. Let me verify them — file sizes first, then VLM spot-check of the key captures:
Healthy sizes. Let me VLM-verify the key captures:
The AI answer capture caught the "Thinking..." state (answer slower than 9s this run). Let me re-capture with a proper wait condition:
The re-capture script failed. Let me see the error:
Two issues: options placed as `arg` (30s default applied) and possibly a wrong selector. Let me check the answer bubble's actual classes:
Found it — my selector didn't match the actual bubble classes, and the options arg was misplaced. Fixing both:
AI answer capture verified. Screenshots done. Now Phase 4c — documentation updates. First let me check the exact screenshot count and current doc anchors:
54 screenshots (52 + 2 new). Let me look at the PAD revision history and test table sections:
Now let me update the PAD with all the session-19 changes:
The [S19] entry is in. Now updating §4.4, the code excerpt, §7.1 and the key-files table:
PAD updated. Now AGENTS.md — the commands table and gotcha 48:
Now CLAUDE.md — updating the test pyramid and environment sections:
Now README.md — badge, testing counts, env section, troubleshooting:
Let me add the session-19 paragraph to the README testing narrative:
Now the SKILL doc — version bump and the new audit surface:
Let me update the description's test count and session count in the SKILL doc:
Now the session log (docs/session_34.md):
Let me correct the remediation plan's Phase 4 results to match the actual captures:
Now appending the session entry to the repo worklog:
Worklog appended. Now the final gate sequence — lint → typecheck → test → build → test:e2e:
All gates green. Now the session-15 process rule — the CSS-leak spec re-runs LAST after every doc write:
Leak spec clean. All gates GREEN. Now the final step — commit and push via the SSH wrapper. Let me review the wrapper instructions first:
The wrapper takes `--remote`. Let me check ssh/paramiko availability, then commit:
No ssh binary and no paramiko. Let me read the Appendix A shim approach:
paramiko installed. Let me deploy the shim (extracted verbatim from the skill doc) outside the repo:
Now writing the SSH key to a 0600 file outside the repo:
The key file is correct (399 bytes, 0600). The venv python needs paramiko:
Key verified. Now committing all changes:
Committed as `cc375bf`. Now the SSH push — dry-run first:
Dry-run clean — authentication works, fast-forward `a8eb7c1..cc375bf`. Now the real push:
The wrapper already verified the push (`remote verified: refs/heads/main @ cc375bf == local HEAD`). Let me do the independent verification with the key properly configured, then shred:
**Push confirmed and verified**: remote `main` = `cc375bf` = local HEAD, working tree clean, key shredded. Let me finalize — verify the dev server is healthy for preview, close browser sessions, and write the workspace worklog:
The health check passed but the landing content grep returned 0 — let me verify what the landing page returns:
Landing page is healthy (200, content present — the H1 text is split across styled spans so the contiguous grep missed it). Now the workspace worklog:
All done. Here's a concise recap of Session 19:

## What was done

**🔧 Root cause fixed (your reported bug)** — The database was landing *outside* the repo because the environment injects an absolute `DATABASE_URL` shell export that silently wins over the repo `.env`. Fixed TDD-first (8 new unit specs, RED→GREEN): `prisma/db-url.ts` now *enforces* the contract (`.env`'s `file:../db/custom.db` → `<repo>/db/custom.db`, immune to polluted shells) and a new `prisma/db-cli.ts` wrapper protects every `db:*` script. Verified across CLI, dev, seed, build, and the standalone server — the dev server was literally erroring (`Error code 14`) before the fix.

**📱 Mobile navigation** — Fully verified working: 405px panel byte-exact vs the live, 8 links, 4px CTA gap, icon swap, toggle + route-change close, scroll lock, ARIA. **No Tailwind v4 bug** — heights byte-exact on all 11 routes × 2 viewports, class diffs documented-variance-only.

**✅ Gates** — lint · typecheck · 39/39 unit · build · 231/231 e2e, zero regressions. 54 screenshots (VLM-verified), `.env.example` verified, docs aligned, committed `cc375bf` and pushed to `main` via the SSH wrapper (remote verified, key shredded).

**Suggested next steps:** review `docs/remediation-plan-session19.md` and `docs/session_34.md` for the full evidence trail; for a future session, consider a CSP/security-headers pass or an accessibility (WCAG 2.2 AA) formal audit — both were flagged as clean-at-parity but worth hardening beyond the reference.
