I'll start executing the task chain. First, let me check the workspace state and set up the repository.
The workspace exists with a nexuslearn-template clone. Let me refresh it with git pull.
Pull successful — `docs/session_29.md` was added. Now let me set up the task plan and begin the document review.
Now let me read the remaining core documents.
Let me read the PAD's revision block and recent sections, plus the SKILL.md file.
Session 16 is complete and pushed. Now let me review the remediation plan and worklog.
Let me read the tail of the worklog for the most recent state.
The repo is at Session 16 state (pushed at `cab2449`, plus `docs/session_29.md` transcript). The session-29 transcript suggests Session 17 surfaces: **form-state persistence, print-to-PDF, or deep-link/query-parameter surfaces**. Let me review the SKILL.md and PAD key sections.
Documentation review complete. Now let me validate the codebase state — .env, skills exclusion, and test configs.
Env config verified. Now let me check skills exclusion and test suite configs.
All configs verified. Now running the baseline gates — lint, typecheck, and unit tests first.
Lint ✓ typecheck ✓ 31/31 unit ✓. Now the build (e2e prerequisite).
**All baseline gates GREEN: lint ✓ typecheck ✓ 31/31 unit ✓ build ✓ 198/198 e2e ✓** — the shipped session-16 tree is fully verified. 

Now for Session 17: the parity re-audit with the fresh-eyes surfaces suggested by the session-29 transcript (**form-state persistence, print-to-PDF, deep-link/query-parameter surfaces**). Let me update the todo list and set up the audit environment.
Dev server alive. Let me check the standing audit scripts and the agent-browser setup from previous sessions.
The pattern is clear: Playwright probes for complex surfaces, agent-browser dual sessions for shell sweeps. Let me set up the dual sessions with login on both sites.
Live logged in. Now the clone.
Both sessions logged in. **Audit environment ready.** Now running the standing surfaces — desktop + mobile height sweeps first.
**Heights byte-exact: desktop 11/11, mobile 11/11.** Now class diffs and text diffs.
Class diffs (documented variances only) ✓, text IDENTICAL ✓. Now the **mobile-menu battery** — the user's key focus.
Let me check the mobile-nav script structure — it appears to only cover the live side.
Mobile battery outputs are byte-identical between sites. Interesting — the clone now shows `ctaClass: "block mt-3"`. Let me verify the Navbar source to confirm the current mechanism.
The source says the CTA omits `mt-3`, but the probe returned `block mt-3` on the clone. Let me inspect the actual CTA markup and re-verify.
The probe may have re-run against the live URL — let me check how BASE is defined in the script.
Confirmed — my clone run accidentally re-hit the live URL. Let me re-run the clone battery correctly with the positional arg.
**Mobile battery ALL GREEN** — panel 404, 8 links, 4px pre-CTA gap (documented session-9 engine-variance form), route-close ✓, bodyOverflow hidden = the documented clone scroll-lock hardening. **NO Tailwind v4 display/breakpoint bug.**

Now the space-y sweep, shadow sweep, focus pin, and reveal inventory.
Space-y sweep clean ×10. Now the shadow sweep + focus pin + reveal inventory.
Shadow sweep — all diffs in documented form families (rgba/oklab color forms, 9999px/infinity radius). Let me verify the full result set and run the focus pin + reveal inventory.
Shadow sweep GREEN — 46 diff lines, all in the three documented form families, zero unknown. Now the focus pin + reveal inventory.
Focus pin holds (slate-400 slot byte-identical). Let me see the full reveal inventory.
**All standing surfaces GREEN** (heights ×11×2 byte-exact, class/text diffs documented-only, mobile battery clean, space-y ×10, shadow 46 documented-form lines, focus pin, reveal inventory COUNT-MATCH ×10).

Now the **fresh-eyes Session 17 surfaces** suggested by the session-29 transcript: deep-link/query-parameter, form-state persistence, and print-to-PDF. Let me first check how the clone handles URL params.
The clone reads `?category=` from the URL. Let me check the CATEGORY_SLUGS map and then write the deep-link audit probing both sites.
Significant findings emerging. The `seed-N` ids are clone-side ids — the live has its own ids (a known probe-artifact lesson from session 14). Let me extract the live's real course ids and characterize the `/courses` casing behavior.
Key findings: the live matches routes **case-insensitively** (with titles derived from raw casing — "C Our Ses | NexusLearn"!), but `/LOGIN` 404s. The live's `?category=bogus` applies the raw value (0 cards, empty select) while the clone falls back to "all". Let me characterize these fully.
CourseDetail parity **confirmed** with real ids (earlier DIFFs were probe artifacts). The casing and category-slug findings are real. Let me probe the remaining edge cases: `/home`, empty `?category=`, hash fragments, param casing, duplicates, and the no-results DOM.
Major findings: the live's slug map differs (`personal-development`/`ai-innovation` DON'T map on the live — 0 cards), and **duplicate `?id=` params crash the clone** ("This page couldn't load" error page) while the live takes the first value. Let me enumerate the live's valid slugs and check the landing category hrefs.
**Findings crystallized**: the live uses **underscore slugs** (`personal_development`, `ai_innovation`) while the clone's landing hrefs use hyphens; unknown slugs apply raw (0 cards) on the live vs fallback-to-all on the clone; duplicate `?id=` crashes the clone (array passed to Prisma). Now let me probe **Surface A (form-state persistence)** and **Surface B (print-to-PDF)**.
The filter combination emptied the results. Let me make the script resilient.
**Surface A (form-state): MATCH** — both sites reset search/login state identically on back-nav (and the "python" search yields the same 3 cards on both). Now **Surface B: print-to-PDF**.
**Surface B (print-to-PDF): CLEARED at parity** — page counts match exactly (11/11, 4/4, 3/3) in both fresh and scrolled states, with near-identical hidden-at-print counts. The reveal system's print interplay behaves identically on both sites.

Now let me locate the exact source files for the deep-link remediation.
Let me examine the CourseCatalog select wiring and the landing category href construction.
Now let me check the Navbar's active-state logic and how the live's nav behaves on a lowercase URL.
My probe regex matched hover classes. Let me fix it.
The live's nav highlights "Courses" on `/courses` and `/COURSES` — case-insensitive active detection. With a middleware rewrite, the clone's `usePathname()` stays case-sensitive, so the Navbar needs case-insensitive matching too. Let me check for any other hyphen-slug hrefs across the app.
Let me run one final edge probe (AIAssistant params + a couple of remaining cases) before writing the remediation plan.
Audit complete. The AI/Dashboard params are ignored on both sites (the msgs count diff is a selector artifact — structure pinned by session-6 specs). Now let me write the remediation plan.
Plan written. Now let me validate it against the codebase before executing.
Codebase validated. Now **Phase 1 — RED specs**. Let me check the spec file's header conventions.
Now let me append the session-17 RED specs to the spec file.
Let me verify the spec files and run the new specs to confirm RED.
**RED verified: 13 failed for exactly the pinned reasons, 3 passed by design.** Now **Phase 2 — GREEN**. Starting with the CourseDetail id normalization.
Now the landing slugs and the catalog semantics.
Now the middleware for case-insensitive content routes.
Now the Navbar's case-insensitive isActive.
All GREEN changes in place. Now lint + typecheck, rebuild, and run the session-17 specs.
Build succeeded, but Next 16.3 deprecates the `middleware` file convention in favor of `proxy`. Let me check the proxy convention and migrate.
The proxy convention requires a `proxy`-named export. Let me migrate.
Clean build with no deprecation warning. Now the GREEN run.
**GREEN: 16/16 session-17 specs pass.** Now the full e2e suite for regressions.
**214/214 e2e GREEN — zero regressions.** Now Phase 3b: visual re-verification on the dev server.
Mobile heights 11/11 byte-exact, deep-link matrix now MATCH (the seed-id DIFFs are the known probe artifact — per-site ids verified earlier). Let me re-verify with per-site ids and the casing matrix.
The lowercase forms now MATCH. The remaining DIFFs should be title-only (the documented raw-path-title variance). Let me verify.
**Every remaining DIFF is title-only** — functional parity achieved everywhere (pages render, 404s match, content matches); the titles are the documented deliberate-better decision. Now the remaining standing surfaces.
All surfaces GREEN. Now Phase 3d — screenshots. Let me check the capture script and existing set.
Standard set captured. Now the new session-17 deep-link captures.
47 screenshots. Now docs alignment — starting with `.env.example` verification and the README.
`.env.example` verified. Now the docs updates — README first.
Now AGENTS.md — gotchas 44–45 and the components list.
Now CLAUDE.md — pyramid counts and the session-17 specs.
Now the PAD — [S17] revision entry and §7.1.
There's a table formatting issue on line 528 — let me fix it.
PAD fixed. Now the SKILL doc — v3.5.0.
Let me update the stale description and project_state fields in the SKILL frontmatter.
Now let me add the Appendix A surface 18 entry.
Now the remediation plan results and the session log.
Now the session log (docs/session_30.md).
Now the repo worklog entry.
All docs written. Now the critical process rule: **the leak spec re-runs LAST** after every doc write. Let me find and run it.
**Leak spec passes** — doc writes did not re-leak. All gates green. Now the commit + SSH push. Let me review the wrapper instructions.
Instructions clear, shim available. Now the commit.
Committed as `ae7fa3f`. Now the SSH push sequence — key to a 0600 temp file outside the repo.
Key parses. Now the dry-run.
The remote has newer commits — let me fetch and check.
The fetch shows the remote at `6812919` (my parent) — the dry-run failed because the wrapper's **default remote is the task-management repo** (per the skill doc). I need to pass `--remote` explicitly. Let me verify the wrapper's interface.
Dry-run clean (`6812919..ae7fa3f` fast-forward). Now the real push.
**Push confirmed: `ae7fa3f` on main — remote verified.** Now shred the operator key.
Push complete, key shredded, tree clean. Let me record the session in the workspace worklog and finalize.
**Session 17 complete — pushed to main (`ae7fa3f`, remote verified, operator key shredded).**

**What this session delivered:**

All standing surfaces re-verified at the byte-exact state (heights ×11 routes ×2 viewports, mobile-menu battery clean — **no Tailwind v4 bug**), then three fresh-eyes surfaces from the session-29 suggestions found and fixed **4 deep-link/query-parameter gaps**:

1. **Duplicate `?id=` params crashed CourseDetail** (Next.js delivers repeated params as `string[]` → Prisma error boundary) — fixed with first-value normalization
2. **Landing href slugs**: hyphen → the reference's underscore forms (`personal_development`, `ai_innovation`)
3. **Unknown `?category=` slug**: now the reference's no-match state (empty trigger + 0 cards), not a fallback
4. **Route casing**: content routes now match case-insensitively like the reference (new `src/proxy.ts`), `/login` kept exact-match, nav active-state case-insensitive

Form-state persistence and print-to-PDF were **verified at parity** (no action). Gates: **245 tests green** (31 unit + 214 e2e, +16 TDD specs, zero regressions), 28 screenshots, all docs aligned (SKILL v3.5.0, session_30.md).

**Suggested next**: verify with `bun run test:e2e`, review `docs/session_30.md`, or for Session 18: an error/empty-state sweep (API failure modes), a full keyboard-navigation/a11y pass, or a data-mutation deep-dive (enrollment/progress edge cases).
