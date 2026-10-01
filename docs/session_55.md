I'll resume from where the previous session left off. Let me first check the current state of the workspace and verify everything is still in place.
The workspace has been reset — the repo and worklog are gone. Let me check what remains and re-clone the repository.
The workspace was fully reset — the environment scaffold replaced the repo. The session-29 work was on local disk only and was not pushed before the interruption. Let me re-read the prompt file and re-clone the repo to assess what needs to be redone.
The repo is at `17a294d` — the exact state where the previous session (session 29) began. **The session-29 work was lost in the workspace reset** (it was never pushed). I need to redo it: the audit, the locale fix, the specs, docs, and then push. Fortunately, the previous session's record gives me a precise map of the findings and fixes.

Let me set up the task plan:
Now let me review the key documentation. I'll read the operational contract and session docs in parallel:
The persisted output is nesting. Let me read AGENTS.md directly in sections:
The Read tool persists large outputs. Let me use targeted grep/sed via bash instead:
I have the full AGENTS.md contract. Now let me review the session docs and worklog:
The worklog gives me the complete session-28 record. Now let me quickly review the remaining docs — session_53 (raw transcript), CLAUDE.md, README, and the SKILL doc's project state:
Docs review nearly complete. Let me check the README session paragraph and SKILL doc project state, then validate the codebase:
Docs review complete. Now let me validate the codebase state (todo 2):
Env contract verified. Now the test configs and session-28 fixes:
Let me get the authoritative spec count via Playwright's list mode (after installing dependencies):
**272 tests confirmed** — the documented session-28 end state. Let me verify the skills/ exclusion set, then set up the db and run the baseline gates:
Environment validated. Now the baseline gates in the required order:
44/44 unit ✓. Now the build:
Build ✓ — all routes dynamic per the session-24 force-dynamic pin. Now the e2e gate (~5 min). I'll run it in a detached background process and prepare the audit scripts while it runs:
E2e is running. While it runs, let me set up the audit script infrastructure (workspace-root node_modules symlink so scripts outside the repo can import playwright):
Playwright imports work. Now let me write the session-29 audit scripts while e2e runs. First, quick facts I need — the seed student counts and the exact number-formatting sites:
All facts confirmed: 2 `toLocaleString` sites (CourseCard:73 + CourseDetail:149), 6 featured courses (12450/4210/8320/5430/3890/6750 students). Now let me write the audit scripts — starting with the dual-login and the standing parity audit:
Now the three fresh-eyes probes — the locale/number-formatting family first (the one with the real finding):
196/272 green. While e2e finishes, let me review the e2e spec house style for the session-29 insertion point:
The house style is clear. Let me check whether any existing spec pins student-count strings (the fix must not break them):
No existing student-count pins — the fix is safe for existing specs. Let me check e2e progress and start the dev server prep:
**Baseline gate fully GREEN — 272/272 e2e (5.1m)**, matching the documented session-28 end state. Now the session-29 audit. Starting the dev server:
Dev server up. Now the dual login, then the standing parity audit:
The 2 height diffs + 13 tag-drift lines + the CourseDetail text diff are all one artifact: `?id=seed-1` is the **clone's** id — the live's CourseDetail needs the live's own id (the interrupted session hit exactly this). Let me fix the pairing and re-verify:
Text 11/11 ✓, class diffs = 12 lines all in the documented gradient-notation family ✓. Two items to resolve: the 4 tag-drift lines (my token-level comparison vs the documented class-STRING methodology) and the `/Home|mobile` height diff (live=12252 vs clone=15150 — likely a live CSR settle flake since `/|mobile` was byte-exact). Let me re-verify both:
`/Home` mobile converges to **15150 on both sites** — the 12252 was a live CSR settle flake. Heights are effectively 22/22 byte-exact. Now the documented tag-of-class-STRING comparison (vs my token-level variant):
Tag drift is 0 in reality — the 5 lines are one script artifact (`[object SVGAnimatedString]` — svg elements stringify their className; the documented methodology skips SVGs). Now the mobile battery (the user-directed Tailwind v4 watch) and console sweep:
**Mobile battery GREEN** — trigger byte-identical, panels 375×469 identical, per-link geometry byte-identical (y 81/129/177/225/273/321/369/417, heights 44×7+36); the DIFFs are all the documented clone hardening (ARIA, scroll lock, Escape). **No Tailwind v4 bug.** Now the console sweep:
Console clean on the clone (the live's 401s are its platform-auth layer — documented variance). Standing surfaces all GREEN. Now the three fresh-eyes families — first the locale/number-formatting probe:
**FINDING 1 CONFIRMED** — exactly as the interrupted session found: under de-DE/fr-FR the live renders "12.450"/"12 450" everywhere (CSR SPA, browser locale), the clone's client catalog matches, but the clone's **SSR surfaces (landing featured grid + CourseDetail) bake "12,450"** (Node-locale) regardless of the visitor's locale — proven in the raw HTML under an `Accept-Language: de-DE` request. Let me complete the record with the live's CourseDetail count and the price-invariance check:
The record is complete: live CourseDetail = "12.450 students" vs clone "12,450" — the third drifted surface; prices/ratings identical (toFixed is locale-invariant). Now the print-surface probe (family 2):
**Print surface: PARITY** — zero `@media print` blocks, zero media attributes, print emulation changes nothing on either site (the frozen-adaptation family — to pin). Now the resource-hints probe (family 3), dev server first:
Live ships **zero image preloads**; the clone dev's React 19 hoisting emits them per unique img (12 on /, 16 on /Courses, all unmatched=0). Now the production standalone (booting with the exact Playwright env):
Standalone matches: `/` = 12 deterministic, `/Courses` = 10 (the SSR subset). Let me check the /Courses racy range across rounds — the interrupted session found client Float backfill is nondeterministic:
**Racy range confirmed**: `/` = 12 deterministic; `/Courses` = 10 or 16 (client Float backfill nondeterministic). The audit is complete — all three families characterized. Let me kill the standalone and write the remediation plan:
Plan written. Now the pre-execution validation — confirming the page signatures and the exact fix-site structure:
Both pages are async server components — validation complete. Now **TDD Phase 1 [1a] — the RED specs**. Let me view the spec file tail and append the session-29 blocks:
Both pages validated. Before writing the fr-FR spec, one critical check — whether Bun's Intl and Chromium agree on the fr-FR group separator (U+202F vs U+00A0 — a mismatch would cause hydration text mismatches):
**All three runtimes agree on U+202F** — no hydration risk. One more mechanism check for the plan's claims — that Playwright's default context sends no Accept-Language:
Both mechanism checks verified. One more subtlety to check before writing the specs — CourseCatalog is `"use client"` but still SSR'd by Next.js; under de-DE the catalog's SSR HTML could carry the server-locale format and get patched at hydration (a console-error risk the fix should also address):
**Critical extension of finding 1**: the /Courses catalog (a `"use client"` boundary) **is** server-rendered — its SSR HTML carries Bun's "12,450" while a de-DE browser hydrates to "12.450" → **"Hydration failed… server rendered text didn't match the client"** — a real page error for every non-en-US visitor (the landing/CourseDetail RSC surfaces don't re-execute at hydration, so they're safe). The fix must pass the header-derived locale through **all three** paths. Let me check the Courses page + catalog structure:
Structure confirmed. Let me verify my extractor selector against the real DOM before writing the specs:
The extractor works and re-confirms the drift (de-DE: landing/detail = "12,450" vs catalog = "12.450"). Now writing the **RED specs** — appending the session-29 blocks:
Specs appended. Now the **RED phase** — running the session-29 specs against the current (pre-fix) build:
**RED confirmed exactly as designed**: the two locale specs fail (de-DE renders "12,450" + the hydration pageerror; fr-FR the same), the 4 pins pass green-by-design. Now **[1b] — the FIX**. First the pure parser seam:
Now the source changes — CourseCard's prop first:
CourseCard done. Now the landing page:
Now CourseDetail:
Now the /Courses page + CourseCatalog (the hydration fix):
Now CourseCatalog — accept and forward the prop:
All 6 source changes complete. Now **[1c]+[1d]** — the unit tests (parser + source guard):
Now lint + typecheck + the unit gate:
53/53 unit ✓. Two typecheck errors in the spec's print census — `CSSConditionRule` doesn't expose `.media` in this lib. Fixing with structural casts:
Lint ✓ typecheck ✓ build ✓. Now the **GREEN phase** — the session-29 specs against the fixed build:
**6/6 session-29 specs GREEN.** Let me verify stability with a second run, then re-check live parity under de-DE (the clone must now match the live):
6/6 stable, and the dev server's SSR HTML under de-DE now carries "12.450" with zero en-US remnants. Now the **full e2e regression** — stopping the dev server first to avoid CPU contention:
Full e2e running. Meanwhile, let me prepare the screenshot capture — first the current inventory to replicate the standard set:
The full standard set is 71 PNGs. Let me check which seeds lack `longDescription` (for the course-detail-no-about capture) and monitor the e2e:
E2e at 39/278. Let me check the login state-machine button texts for the capture script:
Now writing the full screenshot capture script (standard set + session-29 additions):
E2e at 122/278 all green. Let me write the hints-census proof script (for the screenshots folder):
277/278 — one flake in my own print spec (it passed twice standalone). Let me examine the failure:
A sub-pixel float-dust flake (144 vs 143.99998 — Chromium's compositor re-snapping `getBoundingClientRect` on media toggling, not a layout change). Rounding both measurements to integer pixels:
Now verify the fix, then re-run the full suite for a clean final gate:
Final e2e running. While it runs, the docs alignment — first AGENTS.md (gotcha 58 + the commands table):
Let me verify the AGENTS.md edit is clean (one E2E line only):
Clean. Now appending gotcha 58 to AGENTS.md:
Gotcha 58 added. Let me update the `src/lib/` line in "Where things live" and check e2e progress:
AGENTS.md done. Now CLAUDE.md — the test pyramid counts:
CLAUDE.md clean. Now README.md — badge, commands line, and the session-29 paragraph:
Now appending the session-29 paragraph to README (before "## API Reference"):
Now the PAD revision history:
PAD done. Now the SKILL doc — project_state v3.17.0:
Clean. While the e2e finishes, let me write the session log `docs/session_54.md` (per the numbering convention — session 29 → session_54.md):
E2e at 181/278 all green. Let me append the worklog entry now:
Worklog appended (I'll correct the screenshot file count after the capture). Waiting for the e2e to complete:
**ALL GATES GREEN — 278/278 e2e** (zero regressions). Now the screenshots — restarting the dev server and running the capture:
Proof texts are perfect. Let me verify the capture completeness — which PNGs are present vs the standard set:
The "unchanged" files are byte-identical re-captures (deterministic PNG encoding on fully-settled static pages — identical pixels → identical bytes). Let me confirm the capture log covered the full set:
All fresh mtimes — every file re-captured (the unchanged ones are byte-identical deterministic encodes). Let me reconcile the count against HEAD:
HEAD had 70 PNGs; the working tree has 73 = 70 standard + 3 new locale captures — **complete**. Final inventory: 79 files (73 PNG + 6 txt). Let me correct the counts in the worklog and session_54:
Now the final pre-commit checks: `.env.example` verification and the **CSS-leak spec re-run LAST** (the gotcha-41 rule — every doc write can re-leak the canary):
Env verified. The leak spec has a different name — let me find it:
**Leak spec clean.** Everything is green. Now the commit — reviewing the change set first:
Complete change set. Now the commit:
Committed as `818e648`. Now the SSH-wrapper push — reviewing the procedure first:
I have the procedure. Let me check the ssh availability and set up the key:
No ssh binary and no paramiko — the runbook's Appendix-A path. Let me install paramiko and extract the shim:
Paramiko ready. Now extracting the full Appendix-A shim and deploying it:
Key verified. Now the dry-run with the shim on PATH:
Dry-run clean. Now the real push:
**Push verified** — remote main @ 818e648 == local HEAD. Shredding the operator key and final verification:
**Session 29 complete — pushed and independently verified.** Let me clean up and finalize the workspace records:
**Session 29 complete — commit `818e648` pushed to `main` and verified (remote == local HEAD, operator key shredded).**

**What was done:**
- 🔄 Re-cloned the reset workspace at the session-28 state; baseline gates re-verified green (**272/272 e2e**)
- 🔍 **Standing parity audit GREEN** — heights ×11 routes ×2 viewports byte-exact, innerText 11/11, tag drift 0, class diffs 12 documented-gradient lines; **mobile battery fully identical** (trigger byte-identical, 375×469 panels, link geometry byte-identical — **no Tailwind v4 bug**); console clean
- 🧪 **Three fresh-eyes families → one real fix**: the **locale surface** — the live formats student counts with the browser locale (de-DE `12.450`, fr-FR `12 450`) while the clone's SSR baked Node's en-US into the HTML, and the /Courses catalog even threw **"Hydration failed"** under non-en-US visitors. Fixed via `pickLocale()` (Accept-Language parser) threaded through all three count surfaces; the **print surface** frozen by spec; the **resource-hints** matching contract pinned (React 19 SSR preloads = deliberate-better)
- ✅ **331 tests green** (53 unit + 278 e2e, zero regressions); 79 screenshot files; all 8 docs aligned (gotcha 58, PAD [S29], SKILL v3.17.0, `remediation-plan-session29.md`, `session_54.md`, worklog)

**Suggested next steps**: review `docs/session_54.md` + `docs/remediation-plan-session29.md` for the evidence trail; future session directions include a Lighthouse CI budget pass, an Intl date-rendering guard, or a locale-context tab-order re-verification.
