I'll start by checking the current workspace state and reviewing previous work context before proceeding with this multi-phase task.
The workspace exists with prior session-40/41 context. Now I'll run the session-42 pass. Let me set up the task plan and begin.
Workspace refreshed — the pull brought the owner's new `docs/session_89.md` (114 lines). Now let me review the session history documents.
Now let me review the remediation plan and repo worklog:
I have the full session-41 picture. The convention: session 42 → creates `session_90.md` (transcript) + `session_91.md` (final log). Session 89's suggested-next directions: (a) og:image URL variance via `opengraph-image.tsx`, (b) error-boundary surface, (c) bfcache/page-transition API.

Let me validate the codebase state and check the core docs' current version markers:
Env contract verified. Now let me validate the session-41 seams and check the session file inventory:
All session-41 seams verified. Let me check the gotcha format and kick off the baseline gates:
Gotcha 70 confirmed as latest. All docs at session-41 state. Now let me run the baseline gates:
Lint ✓ typecheck ✓ 279/279 unit ✓ — the documented state exactly. Now the build:
E2E running detached (~8 min). Meanwhile, let me review the skills catalog and prior audit scripts to plan this session's fresh-eyes families:
While e2e runs, let me review the house probe-script pattern and check what surfaces remain unpinned. Let me look at the s41 scripts and the e2e progress:
No `error.tsx`/`global-error.tsx`/`loading.tsx` in the clone — the error-boundary surface is indeed unpinned. Let me review the house probe pattern:
Let me check what the e2e spec already pins (to pick genuinely fresh surfaces) and monitor the baseline:
The spec inventory is clear. Now let me design the session-42 fresh-eyes families around session_89's suggested directions. Let me check e2e progress and boot the dev server:
The detached e2e died silently. Let me diagnose and restart properly:
E2E is running properly now. Note: Playwright's Chromium launches with `--disable-back-forward-cache` — important for family C probing. While it runs, let me write the session-42 probe scripts:
Now let me check e2e progress before booting the dev server (RAM contention lesson from s41):
E2E progressing (6/360, ~8 min total). The live-side probes don't need the dev server — let me run the og-image probe against the live while e2e runs (RAM is fine):
The live results were lost when the script hit the unbooted clone. Let me make the script site-selectable and run live-only first (e2e still owns the RAM):
Live og-image data captured — the key finding: **the live's og:image render URL actually serves a 630×630 PNG (452KB)** — a contain-fit render of the 1024×1024 raw logo — while the favicon/icon URLs serve the raw 1024×1024 (1.1MB). Let me check e2e progress and measure the clone's assets:
**Critical finding**: the clone's `public/logo.png` is 1024×1024 / 1,123,244 bytes — the EXACT byte count of the live's raw supabase object. So the raw tier (favicon/icon) content matches, but the **og:image tier drifts**: the live serves a 630×630 render (452KB), the clone serves the raw 1024×1024. Let me verify byte-identity and check render tooling:
**Byte-identity confirmed**: clone `logo.png` md5 `f2d0170f0c91` == live raw object md5. The raw tier (favicon/icons) matches perfectly — but the **og:image tier serves different content** (live: 630×630 render / clone: raw 1024×1024). This is a genuine content-level drift. Let me verify render stability and run the remaining live probes:
Render is deterministic. Now let me run the error-boundary probe on the live (making the script site-selectable first):
Rich findings from the live: (1) data-fetch failures render the **EMPTY STATE** ("0 courses / No courses found"), not an error boundary; (2) the AI chat failure = the **perpetual "Thinking..." bubble** with no alert; (3) the JSON.parse sabotage missed because `Response.json()` bypasses the global — I need a render-path sabotage. Let me refine probe (1) to force a real React render error:
**Definitive finding**: the live's forced render crash = **blank white page** (empty bodyText, no error boundary UI, no recovery). The platform ships NO visible crash UX. Now let me check e2e progress and boot the dev server for the clone-side probes:
E2E appears stuck at 6 tests for ~10 minutes. Let me diagnose:
The e2e died silently again (the environment reaps background processes between tool calls). The e2e takes ~8 min which fits a single 10-min foreground call — let me run it that way:
**Baseline gate complete: 639/639 (lint ✓ typecheck ✓ 279 unit ✓ build ✓ 360 e2e ✓)** — the documented session-41 state confirmed exactly. Now let me boot the dev server for the clone-side probes:
The reaper killed the dev server between calls. I'll chain server-boot + probe in single Bash calls:
The clone's /login DOM probe shows NO og:image metas (only icons) — but the e2e pins (raw-HTML level) pass. This smells like the documented dev-only metadata body-placement artifact. Let me verify at the raw-HTML tier:
Raw HTML confirms the full auth-shell og family — the DOM miss was the documented dev-only body-placement artifact. **Family A confirmed**: clone og:image serves the raw 1024×1024; live serves a 630×630 render. Now the clone-side error-boundary probe:
Clone findings: **apiAbort** → the clone shows "Network error — please try again." (informative, vs the live's perpetual "Thinking..."); **forcedException** → blank + Next dev portal (no error.tsx exists). Let me check the AIAssistant error code and run the bfcache probe:
The clone's network-error UX is implemented but unpinned — a deliberate-better to pin. Now the bfcache/navigation-timing probe (family C):
**Family C headline finding**: scroll restoration on back-nav — the live lands at **scrollY=0** (its async SPA rendering defeats browser scroll restoration), the clone restores to **~2020** (SSR content supports it). Plus: neither site registers a service worker (matching), and bfcache never serves in the probe context on either site. Now the standing parity battery (heights/mobile/console):
**Standing parity battery: ALL GREEN** (18/18 byte-exact, mobile IDENTICAL — no Tailwind v4 bug, console 13/13 clean). Now let me probe the production-tier behaviors (nav-abort, scroll restore) that the e2e specs will pin:
Sign-in timed out on the manually-booted production server — likely the DATABASE_URL resolution differs from the e2e's boot. Let me check the playwright config env:
Sign-in still fails on the manually-booted server while the e2e signs in fine. Let me debug the actual login response and check for stray DB files:
The manual boot gets a 500 (DB resolution broken) while dev works. Let me see the full e2e env block:
The standalone server gets `AUTH_SECRET` via env from the e2e config — my manual boot lacked it (the .env isn't copied into the standalone bundle). Let me reboot with the full env:
The .env's AUTH_SECRET didn't survive the shell extraction. Let me use the e2e's own precedent value:
Production results: scroll restore 2020 ✓ (pin-able), but two surprises — (1) nav-abort BLANKS the production page too, (2) my one-shot createElement sabotage didn't crash production (consumed by flight processing). The nav-abort blank is actually the more meaningful failure path. Let me isolate it with a surgical probe:
Key insight: Next 16 **falls back to browser navigation on RSC failure** (surgical abort → page still rendered), and the full-abort blank was the *browser's* failed-navigation page, not the app. The one-shot sabotage was likely consumed by the router's internal `createElement('link')` prefetch calls. Let me instrument to confirm and design a reliable trigger:
The trace reveals the truth: react-dom captures `document.createElement` at module load — my page-level sabotage can never reach the render path (only the router's meta/link calls). I need a render-phase global. Let me check what the client components call at render time:
`CourseCatalog` is a client component rendering on /Courses. Let me verify the count-formatting call path in its render:
`CourseCard.tsx:89` calls `course.students.toLocaleString(locale)` during the client render — a perfect render-phase injection point. Let me verify the trigger works on production:
The one-shot fired (5 logged errors) but React 19 **retried and recovered** (disarmed retry succeeded). So error.tsx fires only on persistent errors. Let me verify the persistent variant:
**The definitive picture**: Next 16's built-in default error boundary shows **"This page couldn't load — Reload to try again, or go back"** — while the live shows a blank white screen. The clone's crash UX is framework-default (unpinned, version-dependent). Now let me check the existing spec pins that reference `/logo.png` and the not-found.tsx design language:
Let me view the s41 spec block and the layout's metadata to plan the exact changes:
The audit is complete. Let me check the unit spec expectations before writing the remediation plan:
All pin locations mapped. Now let me write the remediation plan:
Plan written. Now the plan-time validation against the codebase — the s41 stripped spec's og:image assertions and the s42 block insertion point:
Validation complete — the og:image URL pins are exactly lines 884 + 5834, and the s42 block inserts before line 5971. Now the RED phase. First the unit spec updates:
Now the error-boundary source spec. Let me check the house source-pin pattern first:
Now the e2e spec updates — the two URL pins and the new session-42 block:
Now the session-42 e2e block. Let me check the insertion point:
All specs in place. Now verify RED — the unit layer first:
**Unit RED verified: 13 failing** (3 metadata + 10 error-boundary). Now the e2e RED — targeted run of the affected specs:
**E2E RED verified perfectly**: 6 fix-specs failing, 5 pin-specs passing (the already-true contracts). Now GREEN — the render asset, the metadata swap, and error.tsx:
Now the error boundary — following the not-found.tsx design language:
GREEN implemented. Verify the unit tier + lint + typecheck:
Three issues: my error.tsx doc comments literally contain the forbidden strings (toLocaleString, NumberFormat, the framework copy), plus two TS errors in the spec. Let me check the exact failures and fix:
Let me test the prop-shape regex against the actual source, then fix everything:
Found it — my regex required a second `reset` occurrence. Let me fix all four issues:
Now fix the error.tsx comments (removing the literal forbidden strings) and the two spec TS errors:
The first edit applied; only the first paragraph needs fixing now:
Now the two spec TS errors:
Unit GREEN (290/290, +11). One more TS fix at line 6097:
All gates clean, build done. Field-verify the production server before the e2e GREEN run:
Field verification passes — both tiers correct. Now the e2e GREEN run on the previously-failing specs:
9 passed, 2 failed. Let me get the failure details:
The 404 shape still serves the old URL — the root layout's `generateMetadata` carries its own image payload. Let me check:
Let me check for any other image-payload spots and the layout/404 unit pins:
The only remaining `/logo.png` is the LoginForm's rendered img (correct — raw tier). Now the error-boundary spec failure — my h1 is "500" and "Something went wrong" is the h2, but the spec locates an h1. Let me confirm and fix the spec to match the design:
Confirmed — the boundary rendered; the spec's heading level was wrong (design mirrors not-found.tsx: h1 "500" + h2 "Something went wrong"). Fixing the spec:
**All 11 targeted specs GREEN.** Now the GUARD phase — full unit suite, then the complete e2e:
**FULL E2E GUARD GREEN: 369/369** (360→369: +9 specs). Total 659 (290 unit + 369 e2e). Now the standing parity battery re-run:
**GUARD fully green: 659 tests (290 unit + 369 e2e), 18/18 byte-exact, mobile identical, console clean.** Now the evidence phase — the proof matrix. Let me check the s41 format:
The format is clear. Let me write the s42 proof-matrix script:
Two probe fixes needed: the live's metas are client-injected (need browser DOM, not raw fetch) and the AI-chat marker search needs the full body. Fixing:
The proof matrix is complete and clean. Now the screenshots — let me check the house capture convention:
Now the s42 capture script — the standard matrix + the prior shapes + the new session-42 captures:
33 captured (the log labels are single-dash cosmetic; files are double-dash per house convention). Let me verify the files:
Captures + matrix in place. Now the docs alignment — starting with AGENTS.md (gotcha 71 + counts):
Now gotcha 71 (after gotcha 70) and the Where-things-live update:
AGENTS.md done. Now CLAUDE.md — the counts and seams:
CLAUDE.md has dense long lines — let me update via targeted replacements:
Now README.md — badge + the session-42 paragraph:
Now the PAD [S42] revision row:
Now the SKILL bump to v3.30.0 + project_state:
Now the session logs — session_90.md (transcript) + session_91.md (final log):
Now the repo worklog entry:
All docs aligned. Now the final full gate (the gotcha-41 rule — full re-run after all doc writes). First let me review the complete changeset:
Changeset complete. Running the final full gate:
**FINAL GATE FULLY GREEN: 659 (lint ✓ typecheck ✓ 290 unit ✓ build ✓ 369 e2e ✓)** with all doc writes in place. Now the commit + push. Let me review the SSH wrapper skill:
Let me check the shim from prior sessions and the wrapper's remote handling:
The shim exists and the wrapper takes `--remote`. Now commit the changeset:
Committed `5f4f1ac`. Now materialize the operator key and run the dry-run:
Dry-run clean. Now the real push:
**Push verified: `main` @ `5f4f1ac` == local HEAD.** Now shred the operator key and verify the remote state:
All done. Final step — the shared workspace worklog entry:
**Session 42 complete — pushed to `main` (`5f4f1ac`) and verified.** ✅

**What ran this session:**

1. **Baseline & parity (all green):** full gate re-verified at the session-41 state (639 tests) → heights ×9 routes ×2 viewports **byte-exact 18/18**, **mobile battery identical — NO Tailwind v4 bug**, console 13/13 clean; env contract intact (`DATABASE_URL="file:../db/custom.db"`, `db/` at root, skills/ excluded).

2. **Four fresh-eyes families → TDD fixes + pins (659 tests: 290 unit + 369 e2e):**
   - **The og:image CONTENT tier (headline):** fetching every head-referenced asset revealed the live's og:image serves a **630×630 render** (452KB) — not the raw 1024×1024 its icons serve. Mirrored byte-exactly as `public/og-image.png`; icons stay on the raw `/logo.png` tier.
   - **The explicit error boundary:** `src/app/error.tsx` (500 / Something went wrong / Try again → `reset()` / Back to Home) replacing Next 16's version-dependent default — the live's crash UX is a blank white screen. Crash-probe methodology recorded (the createElement capture + React 19 retry semantics).
   - **Network-resilience + scroll/no-SW pins:** the dead-RSC fallback, the AI-chat "Network error" message, back-nav scroll restoration (~2020 vs the live's 0), no service worker on either site.

3. **Deliverables:** proof matrix (every og:image shape byte-identical both sites), 33 screenshots, `.env.example` verified, all docs aligned (gotcha 71, SKILL v3.30.0, [S42] PAD row, session_90/91, worklogs).

**Suggested next:** (a) the `global-error.tsx` tier, (b) a dynamic `opengraph-image.tsx` renderer, or (c) pinning the no-dark-mode contract.
