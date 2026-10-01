I'll start by reading the uploaded instructions file and checking the current workspace state.
Let me read the full operating instructions file to internalize them.
The file is large; let me read it in sections to fully internalize the instructions.
I've internalized the operating instructions. Now let me set up the task plan and initialize the workspace.
Workspace is set up. Now let me read the core documentation files (batch 1: project overview docs).
Let me read the persisted outputs of these docs and continue with the remaining key docs.
Let me read the remaining docs directly with proper limits.
Now let me read the session docs and worklog (batch 2).
Now I understand the session numbering convention (session N → session_(N+25).md; this will be session 30 → session_56.md). Let me read the worklog and remediation plan.
Now let me review the PAD and SKILL doc (key sections), plus the skills catalog.
现在让我查看仓库中包含的 skills 目录，以寻找相关的审计/审查技能。
Now let me validate the codebase state against the documentation — env contract, test configs, and key file structure.
环境符合文档中的约定。现在让我安装依赖并设置数据库。
Database is at the repo root as required. Now running the baseline gates in the documented order (lint → typecheck → unit).
53/53 unit green. Now the build gate.
Build ✓ — all routes dynamic per the session-24 pin. Now launching the e2e gate (~5 min) in the background while I set up the live parity audit.
While e2e runs, let me set up the live parity audit. First, check the reference dashboard image and start the dev server.
Now let me check e2e progress and prepare the live parity audit scripts.
The background process died with the shell. Let me restart it fully detached with setsid.
E2E is running. While it runs, let me review the remaining key source files.
The e2e process gets killed when the shell session ends. Let me run it in the foreground with a long timeout instead (the suite takes ~5 min).
**基线完全通过 (Baseline fully GREEN)** — 278/278 e2e 测试与文档记录的 session-29 最终状态相匹配。让我更新一下进度，并测试一下进程持久化以启动开发服务器 (dev server)。
The sandbox kills detached processes. I'll run the dev server + audit within single bash invocations. Let me create a wrapper that starts the server, runs the audit, then cleans up.
The mobile battery shows byte-identical trigger/panel/link geometry, but the clone's route-change close behaves differently in my probe (stayed on `/`, menu open). Let me examine the e2e spec and debug this.
The e2e uses `.tap()` while my probe used `.click()`. Let me debug this precisely with a focused script.
`.click()` on the panel link doesn't navigate on the clone while `.tap()` (e2e) does. Let me investigate deeper — checking event flow, and testing the production standalone server too.
矛盾的结果 —— 在 `touch contexts` 中，`dev server` 的表现与 `production e2e` 不同。让我测试一下 `production standalone server` 以定位问题。
Production works perfectly — the anomaly is dev-server-specific in touch contexts. Let me trace exactly what happens on the dev server with touch.
The tap navigated this time — this smells like a race condition. Let me reproduce the exact original failing scenario to isolate it.
All rounds pass now — the earlier failure is intermittent. Let me re-run the exact original failing script to check reproducibility.
Both pass now. The failures occurred only in scripts running dual browsers (live+clone) — possible CPU contention during cold dev-server compile. Let me try to reproduce the exact dual-browser scenario.
All 3 dual rounds pass — the early flake is unreproducible (11+ consecutive successes + green e2e + verified production standalone). **No Tailwind v4 mobile-nav bug.** Now running the full standing parity audit (heights/innerText/tags).
Heights and innerText are byte-exact. But there's tag drift on `/`, `/Courses`, `/Dashboard` — previously recorded as 0. Let me examine the details.
That's an audit-script artifact — I excluded `svg` elements but not their children (`polyline`/`path` inside SVGs). The documented methodology skips the whole SVG subtree. Let me fix the probe.
**All standing parity surfaces GREEN** — heights 18/18, innerText 18/18, tag drift 0, mobile battery identical. Now the code audit of recent changes. Let me examine the session-29 diff closely.
Now the code-review dimension of the audit. Let me systematically review the API routes and lib files.
Let me scan the remaining key components for code-quality issues (stray JSX artifacts, dead code).
Found 3 stray `{ }` dead-code artifacts. Let me examine MyCourses and review the remaining components.
Let me run the full console sweep across all routes (standing audit surface).
A new finding: Next.js dev warning about `scroll-behavior: smooth` on `<html>` during route transitions. Let me examine the session-16 specs to understand the pinned behavior.
The nav reset glide is currently pinned behavior, but Next.js offers a cleaner mechanism. Let me examine the Next.js 16 source to understand exactly what `data-scroll-behavior="smooth"` does.
Let me verify where this function is used by the App Router in Next 16.
Confirmed: the App Router's `layout-router.js` uses this mechanism for its scroll resets. Now let me verify the progress-route lesson-membership gap empirically via the API.
**Finding CONFIRMED**: a foreign-course lesson was accepted (200, completedLessons: 1) — a real data-integrity gap. Let me review the AI chat route to complete the audit.
The AI route is clean. Let me complete the audit with a check of the remaining auth routes and the globals.css structure.
The audit is complete. Now let me review the scandihaven repo as the user requested (tech stack patterns reference).
Scandihaven's patterns (proxy.ts, Vitest+Playwright, TDD, 5-layer rule) are already established in this repo. Now let me check the seed's lesson id scheme for the spec design.
Let me check the e2e house style for DB access and the global-setup pattern.
I have all the audit evidence. Now let me write the session-30 remediation plan.
Now let me validate the plan against the codebase — reading layout.tsx and confirming the spec insertion points.
Plan validated. Now executing the TDD phases. First, the RED specs — let me check the e2e spec file tail for the insertion point.
Now writing the RED specs (TDD Phase 1a). Let me check the spec file imports first.
Now appending the session-30 RED spec block to the e2e suite.
The display was mangling `[h` — the real selector is `a[href=...]`. Let me verify what my appended spec actually wrote.
My appended selector is genuinely wrong (`aref` instead of `a[href`) — I copied the mangled display form. Let me fix it.
Let me verify the entire appended block is clean.
The od dump confirms the bytes are correct (`a[href`) — the display layer collapses `[h` (an artifact). Typecheck passes. Now the unit-layer source guard.
Now run the RED phase — the unit guard and the session-30 e2e specs against the unfixed code.
**Unit RED confirmed** (1 failed = the new guard). Now the e2e RED phase against the current (unfixed) build.
**E2E RED confirmed exactly as designed** — 3 failed (the two source defects + the contract), 2 green-by-design. Now applying the fixes (GREEN phase).
Now adding the documentation comment for the attribute and removing the 3 dead-code artifacts.
All fixes applied. Now update the session-16 spec comment per plan [2c], then run the gates.
Now the GREEN phase — lint, typecheck, unit tests, then rebuild and run the session-30 specs.
**GREEN — 5/5.** Let me verify stability with a second run, then the full e2e regression.
**FULL GATE GREEN — 283/283 e2e** (278 + 5 new, zero regressions). Now verifying the dev-tier behavior — the scroll warning should be gone after a client-side transition.
All dev-tier verifications GREEN — warning gone, reset snaps at 0ms, mobile battery intact. Now capturing the screenshot set.
73 张 PNG 需要重新捕获。我来编写完整的捕获脚本（标准集 + 会话 30 证明）。
The state-capture flow needs page reloads between delayed-route states. Let me fix the capture script.
The errors are harmless post-capture route teardown noise. Let me verify the capture inventory.
The FAQ row capture hit the wrong h3. Let me fix it with a targeted recapture.
FAQ row now matches HEAD exactly. Let me spot-check key captures' dimensions for sanity.
All dimensions correct. Now the documentation alignment phase. Starting with AGENTS.md (gotcha 59 + counts).
Now CLAUDE.md — updating the test pyramid counts.
Now README.md — badge and session-30 paragraph.
Now the PAD revision history.
Now the SKILL doc's project_state bump to v3.18.0.
Now the session log (docs/session_56.md) and worklog entry.
Now the critical gotcha-41 rule — the CSS-leak spec must re-run LAST after every doc write. Let me find and run it.
Leak spec clean. Now the final pre-commit review of the complete change set.
Source diffs are surgical and clean. Final verification of the env contract, then commit.
Committed as `dcf0e44`. Now the SSH wrapper push — first verify paramiko and deploy the shim.
Now materialize the operator key (0600, outside the repo) and run the fingerprint sanity check.
Dry-run clean — remote at `ad7bc2e`, will update to `dcf0e44`. Now the real push.
**Session 30 complete — commit `dcf0e44` pushed to `main` and verified (remote == local HEAD, operator key shredded).**

**What was done:**
- 🔄 Re-cloned at the session-29 end state; all 5 core docs + session docs reviewed; baseline gates re-verified green (**278/278 e2e**)
- 🔍 **Standing parity audit vs the live app GREEN** — heights 18/18 byte-exact, innerText 18/18 identical, tag drift 0; **mobile battery fully identical** (trigger byte-identical, 375×469 panels, link geometry y 81/129/177/225/273/321/369/417 — **no Tailwind v4 bug**)
- 🧪 **Two fresh-eyes families → two source fixes (genuine RED→GREEN TDD):**
  1. **Request-payload integrity** — the progress API accepted *foreign-course* lessonIds (verified: 200 + a cross-course row persisted); fixed with a zero-cost membership guard
  2. **Router-scroll contract** — the missing `data-scroll-behavior="smooth"` made every nav reset *glide* ~600ms + fired a dev warning invisible to page-load sweeps; the reset now lands at **0ms**
- ✅ **337 tests green** (54 unit + 283 e2e, zero regressions); 81 screenshot files; `.env`/`.env.example` verified (`DATABASE_URL="file:../db/custom.db"`, `db/` at repo root); vitest + playwright configs verified; docs aligned (gotcha 59, PAD [S30], SKILL v3.18.0)

**Suggested next steps**: review `docs/session_56.md` + `docs/remediation-plan-session30.md` for the evidence trail; future session directions include a rate-limiting surface probe on the auth/contact APIs, or a dependency-audit pass.
