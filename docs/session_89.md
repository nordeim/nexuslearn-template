The workspace exists from previous sessions. Let me read the worklog and check the repo state first.
The workspace is at the session-40 end state. Now let me refresh with `git pull` as instructed and check for the session files mentioned (session_85, session_86, remediation-plan-session40).
`git pull` brought in one new commit: `docs/session_86.md` (the newest session log to review). Let me set up the task plan and begin the meticulous review phase.
Now let me review the session history files, starting with the new `session_86.md` and `session_85.md`:
`session_86.md` is the transcript-style log of the session-40 run (pushed by the repo owner after session 40). Now let me read `session_85.md`, the remediation plan, and the repo worklog tail:
Now let me check the repo worklog and compare session_84 vs session_86 (the new file) to understand the numbering convention:
Now I have the session-40 picture. The convention: session N creates session_(2N+4) transcript + session_(2N+5) final log; the owner manually added session_86.md as a post-hoc recap. My session is **session 41**. Let me now review the core docs. First, check sizes and the session file inventory:
Docs are compact. Let me read all five core docs:
AGENTS.md is dense (84.6KB, 129 lines with very long gotcha lines). Let me read the persisted output:
The gotchas are extremely dense. Let me extract the gotcha titles efficiently and read the tail sections:
All 69 gotchas cataloged. Now the AGENTS.md tail (Where-things-live) plus CLAUDE.md and README.md:
Now CLAUDE.md and README.md:
Now the PAD revision history and structure:
Core docs reviewed. Now let me validate understanding against the codebase — environment contract, session-40 seams, and config state:
Environment contract verified. Now the session-40 seams and configs:
Seams verified. Now the proxy adapter, test configs, and skills-exclusion checks:
All configs verified — skills/ excluded everywhere, session-40 seams in place. Now let me count the specs and kick off the baseline gates:
Static grep undercounts (test.each iterations). Let me run the actual baseline gates in order — lint, typecheck, unit tests first:
267/267 unit ✓. Now the production build:
Build ✓. Now the e2e suite (~7 min) — I'll run it in the background and review the skills catalog in parallel:
TDD skill rules internalized. Let me check the e2e progress and scan which dimensions are already pinned (to pick fresh-eyes families for session 41):
s22 已将深色/还原动态固定在计算样式层级。让我检查一下 e2e 基准进度，然后检查清单 + html 属性状态：
The clone ships appleWebApp + manifest but no `<meta name="theme-color">`. Let me review the house probe-script pattern while e2e runs:
House pattern captured (live CourseDetail id: `699081e752032065b878129d`). Let me check e2e progress and the saved live-state:
The background e2e died (nohup didn't survive). Let me restart it properly detached with setsid:
E2E is running. Now let me boot the dev server on :3000 and write the session-41 probe scripts in parallel:
Dev server up (and gotcha-48's .env enforcement visibly working). Now the probe scripts — first the head/html-attribute census:
The dev server died when the previous shell session closed. Let me restart it with full detachment:
Rich findings! The live's `/login` ships a platform auth-shell head (theme-color, viewport-fit=cover, apple-touch-icon, og:image dimensions) and the live's 404 ships the FULL meta family while the clone's may be reduced. Let me inspect the clone's /nope head:
The clone's dev-server 404 head looks reduced vs the live. Let me check what the s38/s40 e2e pins actually assert for the 404 head (they run on the production build):
The s38 pins assert canonical+og on the production 404, but my dev census shows them missing. Let me curl the dev server's 404 HTML directly:
The stream may place metadata later. Let me grep the full HTML:
The metadata IS in the HTML — my census DOM read must have raced the stream. Let me re-probe the /nope DOM directly:
The raw HTML has them but the DOM head doesn't — they may be parsed into `<body>` (late-streamed chunk). Let me check document-wide:
Confirmed — on the clone's 404, 18 metas + 2 links parse into `<body>`. Let me check the e2e progress, then verify this against the production build:
E2E is progressing (early specs). Meanwhile, the e2e's production server on :3100 is up — let me check the production build's viewport serialization and 404 head placement:
The e2e died again mid-run. Let me check why:
The e2e died silently — likely OOM from dev-server + chromium contention. Let me stop the dev server and re-run the e2e cleanly:
E2E restarted with plenty of RAM. While it runs, let me study what's already pinned about route transitions (family B design):
s16 documented the live's "CSR loading shell" but never probed its visible transition UX. Let me write the remaining probes — family B (transition UX), C (reduced-motion reveal), D (asset edges):
Live asset edges mapped (platform SPA-shell 200s + the manifest/favicon 302s — mostly the documented variance family). Now the transition-UX probe on the live:
The live's transitions are INSTANT under throttle (SPA client-swap, stale titles — the s16 pin confirmed). Now the reduced-motion reveal probe on the live:
Live's reveal animations PLAY under reduced-motion (no-adaptation confirmed). Now let me check the existing og:image pins to assess the /login head findings:
The e2e server is on :3100 — let me check the production build's 404 head placement right now:
Production 404 head is CORRECT (dev-only artifact — documented, not a defect). Now let me extend the head census to ALL routes on the live to complete the family-A picture:
The live's RAW HTML shows no metas — they're client-injected. Let me verify the raw HTML structure directly (the s38 record said SSR):
My regexes were attribute-order-dependent (the live emits `content` before `name`). Let me fix and re-run:
The live's auth-shell family covers BOTH /login and /reset-password (theme-color #000000, viewport-fit=cover, apple-touch-icon, og:image dims/alt). Let me check e2e progress and the auth-route og:image URL detail:
E2E at 245/352. While it finishes, let me review the clone's /login and /reset-password page metadata structure for the fix plan:
Let me verify the live's raw app-route head for the apple-mobile metas and check what Next's Twitter metadata supports for image alt:
The auth-shell apple-touch-icon carries `sizes="180x180"`. Let me verify Next's metadata type support for twitter image alt + icon sizes:
All framework capabilities confirmed (viewportFit, twitter alt, icon sizes, themeColor). Let me parameterize the probes for the clone side while e2e finishes:
**Baseline gate complete: 619/619 (lint ✓ typecheck ✓ 267 unit ✓ build ✓ 352 e2e ✓)** — the documented session-40 state confirmed exactly. Now the standing parity battery — boot the dev server and run the house audit scripts:
Clone asset edges mapped (the flag's static-slash tolerance — 200s at slashed paths; new pin surface). Now the clone-side transition and reduced-motion probes:
The clone's transitions = old-page-persist (React transition, no spinner — Next's dynamic-route prefetch limit). Now the clone's reduced-motion reveal:
Reveal animations play identically under reduce on both sites — matching no-adaptation. Now the standing parity battery (heights/mobile/console):
**Standing parity battery: 18/18 byte-exact heights, mobile IDENTICAL (no Tailwind v4 bug), console 13/13 clean.** The audit is complete. Let me check the spec insertion points before writing the remediation plan:
Now let me write the remediation plan for session 41:
Plan written. Now the final plan-time validation against the codebase:
Plan validated (strip is safe; patterns exist). Now the RED phase — first, the existing unit spec structure:
The existing s6 spec pins the OLD images payload — it becomes part of RED. Let me write the unit spec changes:
Now the source-pin spec. Let me check the house pattern first:
Now the e2e block. Let me view the insertion point:
Specs inserted (s33 burst stays last). Now verify RED — the unit specs must fail against the current tree:
**RED verified — 9 unit specs failing as designed.** Now GREEN — the seam first:
Now the layout's own payload, the page-metadata pass-through, and the auth pages:
Now the two auth pages — the viewport export + authShell flag:
GREEN implemented. Verify the unit specs:
The spec's twitter expectation is wrong (the app shape uses the string form). Fix the spec:
Unit GREEN + typecheck. Field-verify on the dev server before the e2e:
All field checks pass. Let me verify the exact emitted viewport metas:
Exact forms verified. Now lint + build + the targeted new e2e specs:
7/8 pass — the token-shape spec compares pathname against a path+query (needs `pathname + search`, the s38 house pattern). Fix:
**All 8 session-41 e2e specs GREEN.** Now the GUARD phase — full unit suite:
279/279 unit (+12). Now the full e2e GUARD — kill the dev server first (the OOM lesson), then run:
**E2E GUARD: 360/360 passed — 639 total (279 unit + 360 e2e), zero regressions.** Now the standing parity battery re-run:
**GUARD fully green — 18/18 byte-exact, mobile identical, console clean.** Now the proof matrix. Let me check the s40 format:
Now the s41 proof-matrix script:
Proof matrix complete (auth family 7/8 MATCH per shape with the documented notation DIFF; stripped family 15/15 MATCH). Now the screenshot capture — check the house script:
The capture uses the production server on :3100. Let me boot it and write the s41 capture script:
30 screenshots captured. Now the docs alignment — starting with AGENTS.md gotcha 70:
Now CLAUDE.md counts and seam:
Now the README session-41 paragraph:
The paragraph landed after the footer — let me fix the placement:
README fixed. Now the PAD [S41] row and SKILL bump:
Now the SKILL project_state update:
Now the session logs — session_87.md (transcript) + session_88.md (final log):
Now the repo worklog entry:
Repo worklog done. Now the final full gate after all doc writes (the gotcha-41 rule):
While the final e2e runs, let me prepare the push — read the SSH wrapper skill:
Shim + paramiko ready. Let me materialize the operator key and review the changeset while the e2e runs:
The tracked screenshots use a **double-dash** convention (`landing--desktop.png`) — my captures used single dashes. Let me check the s40 script's actual template and fix:
Fix the naming to the house convention, delete the wrong files:
The glob may have over-deleted tracked double-dash files. Restore them from git:
99 standing screenshots restored. Waiting for the e2e to complete:
**Final gate fully green: 639 (lint ✓ typecheck ✓ 279 unit ✓ build ✓ 360 e2e ✓)** with all doc writes in place. Now the corrected screenshot capture:
Capture complete with correct naming (console labels cosmetic). Now stage and commit:
Committed `0a4cc0c`. Now the push — shim on PATH, dry-run first:
**Push verified: main @ 0a4cc0c == local HEAD.** Now shred the key, verify the remote, and clean up:
Remote verified at push time (the wrapper's step-6 assertion). Final step — the shared workspace worklog:
**Session 41 complete — pushed to `main` (`0a4cc0c`) and verified.** ✅

**What ran this session:**

1. **Baseline & parity (all green):** full gate re-verified at the session-40 state (619 tests) → heights ×9 routes ×2 viewports **byte-exact 18/18**, **mobile battery identical — NO Tailwind v4 bug**, console 13/13 clean; env contract intact (`DATABASE_URL="file:../db/custom.db"`, `db/` at repo root).

2. **Four fresh-eyes families → TDD fixes + pins (639 tests: 279 unit + 360 e2e):**
   - **The auth-route head family (headline):** a complete 14-route head census found the live's `/login` + `/reset-password` carrying `viewport-fit=cover`, `theme-color #000000`, `apple-touch-icon`, and dimensioned og:image — mirrored via the new `authShell` seam + viewport exports; the clone's unpinned og:image dimensions stripped from app routes for exact parity.
   - **Reduced-motion reveal, transition UX, asset-slash tolerance** — all verified matching and pinned.
   - Methodology catch recorded (gotcha 70): the live emits `content` before `name` — order-agnostic extraction required.

3. **Deliverables:** proof matrix, 30 screenshots, `.env.example` verified aligned, all docs updated (SKILL v3.29.0, session_87/88, worklogs).

**Suggested next:** (a) the og:image URL variance (a dynamic `opengraph-image.tsx` renderer), (b) the error-boundary surface (`error.tsx`), or (c) the bfcache/page-transition API surface.
