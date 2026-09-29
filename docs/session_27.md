I'll continue the task from where we left off. Let me start by checking the current state of the workspace and refreshing it.
The workspace exists with previous session work. Let me refresh it with git pull and check the current state.
Local is at session 14, but the task references session_24/25 docs. Let me pull the latest changes.
Workspace refreshed to `728e351`. Now let me set up the task plan and begin the document review.
Core docs part 1 reviewed. Now README.md and Project_Architecture_Document.md.
PAD 已保存至文件。让我高效地阅读一下最新的修订条目和关键部分。
PAD reviewed through S14. The README badge shows 202 tests now — sessions 15-24 have happened since. Let me review the instructed session docs: session_24, remediation-plan-session14, worklog, session_25.
session_24.md documents parity Session 14 (171 e2e). Now the freshly pulled session_25.md and the repo worklog.
session_25.md is the Session 14 transcript — the project is now at Session 15's start. Let me review the repo worklog and remediation plan.
Repo worklog confirms Session 14 complete (202 tests). Now let me review remediation-plan-session14.md and validate the codebase state.
Remediation plan for Session 14 reviewed. Now validating the codebase state — env, skills exclusion, session-14 fixes in place.
Codebase state validated — all session-14 pins in place. Now running baseline gates.
Lint ✓ typecheck ✓ 31/31 unit ✓. Now build + e2e (the long gates).
170/171 — one baseline failure in the CSS-leak spec. This is unexpected (Session 14 shipped green). Let me investigate.
A `::selection` rule appeared in the stylesheets. Let me examine the spec and find the leak source.
The spec walks DOM stylesheets for `::selection` rules. Let me find the leak source in the built CSS.
Root cause identified: the root `worklog.md` gained `::selection`/`selection:` mentions in the session-14 final entry (written after the last green gate run) and is NOT in the `@source not` exclusion list. Let me verify empirically.
Confirmed: `.selection\:bg-red-200` rules are back in the built CSS. The only non-excluded file carrying the canary strings is the root `worklog.md` (its session-14 entry was written *after* the final gate run). Let me verify.
**Baseline failure root-caused**: the session-14 worklog entry (written *after* the final gate run) contains the `.selection:bg-red-200` canary string, and the root `worklog.md` was never in the `@source not` exclusion set — a post-gate doc-write regression. This becomes Session-15 finding #1 (its RED spec already exists and is failing).

Let me check the audit scripts from previous sessions and start the dev server.
Dev server alive. Now let me load the agent-browser skill to set up the dual-session audit environment.
Both sessions alive. Let me sync viewports and verify login state on both.
Both sessions logged in with synced viewports. **Audit environment ready.** Let me re-run the standing surfaces using the persisted audit scripts.
Desktop 11/11 byte-exact. Mobile sweep next.
Mobile 11/11 byte-exact. Now CourseDetail ×9 (with per-site ids) and class diffs.
CourseDetail ×9 byte-exact. Now class diffs and the space-y sweep.
Class diffs show only documented variances. Now space-y sweep, text diffs, and the mobile battery.
Text IDENTICAL ×4, space-y clean. Now the **mobile-menu battery** (the user's key focus).
The battery output was truncated. Let me capture it fully.
The script's live section ran; the clone side needs manual verification. Let me run the clone battery directly.
The panel was already open (stale state) and the last eval had an escaping issue. Let me redo it cleanly.
Panel 404px ✓, 8 links ✓, scroll lock ✓. Now the CTA gap and close behaviors.
Route-close ✓, Escape-close ✓. Re-checking the CTA gap (output was swallowed).
Mobile battery GREEN (4px gap, 404px panel, all closes work). Now the shadow sweep and focus-ring pin to complete the standing surfaces.
Shadow sweep: 46 documented form-variance pairs only (same count as session 14). Now the focus-ring pin check.
Focus-ring pin holds (slate-400 on both, extra slots = documented variance). **All standing surfaces GREEN.** 

Now Phase 2 — the Session-15 fresh-eyes surfaces per the session-25 suggestion: **the scroll-reveal ENTRY animation** and **forced-colors/accessibility rendering**. Let me first characterize the live's reveal system precisely.
The live's reveal system characterized at a high level: 40 inline-styled elements on / (hidden below fold, revealed on intersection, one-way, no re-hide). The clone has none. Now I need the precise targeting + animation timing for faithful replication.
The live's reveal curve is now characterized: ~130ms delay → ~350ms animation, opacity ease-out, translateY 20→0 with ~12% overshoot (spring-like), end state `opacity: 1; transform: none` left inline forever. Let me check whether it's framer-motion, inventory reveal targets on ALL routes, and test the load-time behavior.
**framer-motion confirmed in the live's bundle.** Route inventory: 40 targets on / (+/Home), 12 /Courses, 10 /Pricing, 12 /About, 6 /Contact, 13 /BecomeInstructor, 3 /AIAssistant, 5 /Dashboard, 0 /login. All start hidden (even hero elements — revealed in-viewport at mount). Now let me capture a high-resolution animation curve and fit the easing model.
Spring model fits captures 0/1 (ζ≈0.56, ωn≈27 → ~12% overshoot, 290ms settle; opacity is a slower separate curve; capture 2 = main-thread jank artifact). Now **surface B: forced-colors/accessibility rendering sweep**.
**Surface B cleared: all four accessibility emulation modes IDENTICAL** (both sites fall to the same UA behavior). CourseDetail has 2 targets; mobile / has the same 40 targets. Now let me capture the full per-route target inventory + stagger behavior for the replication plan.
The `/` inventory top was cut off. Let me get it.
Complete inventory captured. Now the critical stagger question: do sibling cards animate simultaneously or staggered?
Two key wrinkles: (1) the hero mount animation is slower (~800ms) and may start from y≈30, not 20; (2) siblings may stagger ~50ms. Let me measure both precisely.
Hero mount: all 5 pre-hidden at 629ms with **y=30**, staggered starts (92-346ms deltas), ~700ms duration, no overshoot. Scroll targets: y=20, ~290ms, spring overshoot. Two distinct configs. Let me nail the intrinsic IO→animation delay with instant scrolls + confirm exact style strings.
Two more variants discovered: **translateX(±30px)** slides and an **opacity-only** target, plus sibling cards stagger ~115ms with a ~36ms intrinsic IO delay. Let me map which elements use which variant.
The 750ms sample caught mid-animation frames. I need first-observed styles per element. Let me run a systematic high-frequency sampler that captures each element's true pre-hide + timing across all routes.
Rich data! Key insight: mount durations are ~250-320ms on ALL routes except `/`'s hero (~670-735ms). Let me do one final verification of `/`'s hero vs mid-page scroll curves on the same load.
The testimonial card shows a *decoupled* curve (fast op ~300ms, slow y ~700ms, no overshoot) vs the category elements' coupled ~290ms spring. Different sections have different motion configs. Let me map each section's curve systematically.
Eval serialization issue — let me fix with plain JSON config.
Two animation families confirmed: **A "snappy"** (op ~310ms ease-out + y spring ~280ms w/ 12% overshoot — category cards, headers, newsletter, other routes' grids) and **B "floaty"** (op ~310ms + slow y ~700ms back-loaded — featured/AI/testimonial/pricing cards). Plus `/`-hero (coupled ~735ms, y=30) and other-route heroes (~280ms, y=20). Let me measure the remaining unknowns: X-variants, FAQ, and below-fold families.
Two unknowns remain (path-card family, BI-image X30). Quick isolated probes, then I'll write the remediation plan.
Complete spec captured: path-card = Family B; BI-image X30 = fast spring with ~7% overshoot. **Audit phase complete.** Let me update the task list and write the remediation plan.
Plan written. Now validating it against the codebase — spec insertion point and the page structures.
Before implementing, let me verify the exact hero DOM structure on both sites — the live's hero wrapper inventory showed a classless div where the clone has `text-center px-4 max-w-4xl mx-auto`.
Structures match. But the first hero reveal target is a *classless* div — let me identify it precisely.
**Major structural discovery**: many live reveal targets are *classless wrapper divs* (framer-motion wrappers) around cards — wrappers the clone lacks (invisible to class-set diffs for 14 sessions). Let me map the full wrapper structure.
The `/` map is complete — **17 of 40 targets are classless motion-wrapper divs the clone lacks** (badge wrappers, category/featured card wrappers, section-badge wrappers, newsletter title wrapper). Let me dump the other routes' target structures.
All routes mapped — 34 classless wrapper divs need adding for structural parity. Let me examine the clone's page files to build the precise wiring.
Now let me check CourseCard's rendered structure and the other page files.
Now let me examine the remaining route pages for the wrapper wiring points.
All wiring points mapped. Now — **TDD Phase 1: RED specs first.** Let me check the spec file's conventions, then write the session-15 specs.
Config: Desktop Chrome 1280×720. Now writing the session-15 RED specs.
Now the RED run against the pre-implementation build.
**RED verified: 19/21 failing** for exactly the right reasons (no reveal system). The 2 passes are the trivially-true pre-implementation guards (/login 0 targets, scrollHeight-stable). 

Before implementing, one more live behavior to verify: does the live's catalog re-animate cards on filter/search?
The filter is a Select, not chips. Let me use the search input instead.
The first card was a surviving node. Let me sample ALL matching cards to catch any newly-mounted ones.
**Confirmed: the live re-animates newly-mounted cards on search** — the MutationObserver design is right (and instant-scroll-past elements don't reveal — IO gives this for free). Now implementing. First the keyframe tables.
Tables generated (A overshoot −2.38 matches the measured −2.4 exactly). Now writing the RevealController.
Now the worklog exclusion in globals.css (finding 1).
Now the landing page wiring (40 targets). Applying the edits to page.tsx.
Now add the controller import and render to page.tsx.
Now the CourseCatalog (/Courses — 12 targets).
Let me verify the CourseCatalog JSX balance with a typecheck pass on this file.
JSX imbalance — I added an extra `</div>`. Fixing.
Typecheck clean. Now the remaining pages — Pricing first.
Now the About page (12 targets, mountAll).
Now Contact (6 targets).
Now Dashboard (5 targets).
Finally CourseDetail (2 wrappers).
Now I must close the price-card wrapper — finding the right column's closing structure.
All wired, typecheck clean. Now lint + build + the GREEN run.
16/21 green. Investigating the 5 remaining failures.
Spec bug: I read the `a` child's style instead of the wrapper's. Let me check the other two failures then fix all specs.
Three spec bugs (my side): the category locator reads the child `a` instead of the wrapper; the stagger selector also matches featured cards (CourseCard stars); 498px is viewport-dependent (320 at 1280). Fixing the specs.
Two spec refinements needed: (1) trailing 1.0 samples before the style flip break the "intermediate" check; (2) my pricing-card filter matched only 1 card. Let me check the PRICING data then fix.
Featured cards also match (h3 + $). Scoping to the pricing section instead.
**21/21 session-15 specs GREEN.** Now the full suite for regressions.
**ALL 192 SPECS GREEN — zero regressions.** Now the live-vs-clone visual re-verification. First check the dev server picked up the new code.
Dev server serves the reveal system (40 targets, 35 hidden, hero revealed at mount). Now the critical height sweeps — the wrappers must not move a single pixel.
**Every height still byte-exact** — wrappers are layout-neutral. Now the clone's animation curves vs the live's measurements.
Curve parity is excellent (A: −2.2 overshoot vs live −2.4; B: y 728-746 vs live 722-729; op ~300ms both). Now the remaining standing surfaces.
Text IDENTICAL ×4. Re-verifying the clone mobile battery on the current build directly.
Mobile battery GREEN (404/8/lock/4px). Shadow sweep + focus pin next.
All standing surfaces green. Final reveal-parity check: side-by-side inventory comparison across routes.
/About is a sampling-timing artifact (live's CSR mount latency), but **/CourseDetail targets never registered** — the style is still the un-normalized React form. Let me debug.
The controller is placed correctly. Let me check whether this is dev-specific streaming behavior — probe the production standalone server.
Reproduced on production — a real bug. Let me capture the console during load to check for hydration errors.
**The controller's effect never runs on /CourseDetail.** Let me examine the page's full render structure.
Found it — the page has TWO render branches (not-found + main) and my replace only hit the first `<Footer />`. Adding the controller to the main branch.
Let me check all pages for the same multi-branch issue.
All pages balanced now. Let me check the live's not-found state targets, then strengthen the spec to pin mount-reveal on every route.
Live not-found = 0 targets (clone's no-op controller = parity). Adding the spec that would have caught the branch bug.
**193/193 GREEN.** Re-running the side-by-side reveal inventory to confirm the fix.
CourseDetail fixed. The /About diff is the live's mount latency — let me confirm with a later sample.
**Critical correction**: re-reading the original spec-run data, the /About *values* cards showed `start=- done=-` — they never mount-animated; I conflated them with the stats cards. The live's /About is standard whileInView. Let me verify the scroll-reveal on the live, then remove `mountAll`.
Confirmed — standard whileInView. Removing `mountAll` (it was based on my misreading) and fixing the spec.
Now fix the spec to pin the correct /About behavior (values hidden at load, reveal on scroll).
Fixing a syntax slip in the spec.
Updating the spec's block comment and the remediation plan to reflect the corrected /About behavior.
193/193 with the corrected behavior. Final side-by-side inventory.
**ALL 9 ROUTES MATCH — full reveal parity achieved.** Now the screenshots. Let me check the existing conventions.
Writing the session-15 capture script — with incremental reveal sweeps before full-page captures (jumped-past sections stay hidden per IO semantics).
All captured with full reveal sweeps. Spot-checking the key new shots.
Screenshots verified (prehide dark hero → midframe partial → endstate full). Now docs alignment — README first.
Now AGENTS.md — the new gotchas.
Now CLAUDE.md.
Now the PAD — [S15] revision + §7.1.
Now the SKILL doc.
Now the session log (docs/session_26.md) and the remediation plan results.
Updating the remediation plan with GREEN results and appending the repo worklog entry.
.env.example verified. Final gate sequence — build + full e2e (the leak spec runs LAST, after all doc writes, per the new process rule).
All gates green. Quick canary check on the final build, then commit.
CSS clean, all changes staged-ready. Let me review the SSH wrapper skill and commit.
Fingerprint matches the recorded operator key. Dry-run push now.
**Session 15 complete and pushed to main.** Let me record the session in the workspace worklog and close out.
**Session 15 complete — pushed to main (`ecb4846`, remote verified, operator key shredded).**

## What this session delivered

**Baseline finding (Medium):** the shipped session-14 tree failed its own CSS-leak spec (170/171) — the session-14 worklog entry, written *after* the final gate ran, re-leaked the `.selection:bg-red-200` canary through the repo-root `worklog.md`, the one file missing from the `@source not` set. Fixed + a new process rule: the leak spec re-runs LAST after every doc write.

**Main finding (High) — the scroll-reveal ENTRY animation, the last documented visible behavioral variance:**
- Characterized the live's framer-motion system at frame resolution: **103 targets across 9 routes**, 5 measured animation families (spring with 12% overshoot / slow float / coupled hero / FAQ / ±30px sliders), 100ms sibling stagger, one-way `opacity: 1; transform: none;` end state
- Discovered **34 classless motion-wrapper divs** the clone had been missing for 14 sessions (invisible to class-set diffs)
- Replicated it all with a zero-dependency WAAPI controller + SSR pre-hide styles — the reveal inventory now **MATCHES the live on all 9 routes**, and every height measurement stayed byte-exact

**Cleared:** forced-colors/contrast/inverted/dark-scheme emulations — identical everywhere.

**Gates:** 224 tests green (31 unit + 193 e2e, +22 TDD red-first, zero regressions) · lint/typecheck/build clean · 28 fresh screenshots · all docs aligned (SKILL doc v3.3.0).

**Suggested next steps:** verify with `bun install && bun run test:e2e`, or review `docs/session_26.md`. For Session 16, remaining candidates: a scroll-position-restoration/navigation-transition sweep, or a performance surface (LCP/CLS/bundle-size comparison against the live).
