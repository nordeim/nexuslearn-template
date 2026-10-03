The workspace exists with both repos. Let me set up my task plan and refresh the workspace.
Workspace is clean on `main`. Let me refresh both repos.
任务 1 已完成。现在让我来审查核心文档。
核心文档篇幅较大，内容详细。让我分块阅读它们，以掌握关键信息。
AGENTS.md 已内化 —— 这是 Next.js 16 + React 19 + Tailwind v4 + Prisma/SQLite 克隆的 base44 应用，包含 315 个 Vitest + 393 个 e2e 测试用例和 75 个记录在案的坑。现在处理剩余的核心文档。
现在处理架构文档和技能文件。
Core docs internalized. Now the session history documents.
现在是工作日志 —— 最近有条目的尾部记录。
会话历史记录显示，在 `cd3ddcf`（+ 文档提交 `f338561`）处已完成并推送了 Session 46，测试通过 708 项。`session_104.md` 建议了后续方向：**(a) 新的 CSS 媒体层级（prefers-reduced-transparency, prefers-contrast）、(b) navigator.share/web-share 系列、(c) 空闲层级（requestIdleCallback + IdleDetector）**。本次会话是 **Session 47 阶段**。让我根据代码库验证当前状态。
环境约定已验证。接下来提供测试配置和仓库结构。
测试配置已验证。接下来处理技能目录和源代码结构。
House skills identified: `tdd`, `agent-browser`, `code-review-and-audit`. Let me quickly review the TDD skill, then start baseline gates.
现在让我审计一下源码结构和近期变更，然后启动 baseline gates。
结构已验证。正在按顺序启动基线门控——首先检查是否存在杂散服务器（RAM 争用问题）。
Lint clean. Now typecheck and unit tests.
315/315 unit ✓. Now the production build.
Build ✓. Now the full e2e suite (393 specs, ~10 min) — output piped to a log.
The tool timed out. Let me check if the e2e run is still alive and monitor the log.
Run survived and is at 391/393. Waiting for completion.
**BASELINE GATES: 708 GREEN** — lint ✓ typecheck ✓ 315/315 unit ✓ build ✓ 393/393 e2e ✓ (10.6m). Exactly the documented session-46 state. Now the standing parity battery — checking prior session scripts.
Battery scripts found. Let me boot the standalone server with the explicit-secret convention (session-46 lesson).
Battery server up on :3000 with custom.db + explicit AUTH_SECRET. Running the three-part standing battery (heights → mobile → console).
The detached server died (sandbox kills detached groups — known lesson). Re-chaining the battery in one call instead.
**Heights 18/18 byte-exact ✓**. Now the mobile-nav battery (the Tailwind v4 check) and console sweep.
**STANDING PARITY BATTERY FULLY GREEN**: heights 18/18 byte-exact, mobile IDENTICAL (no Tailwind v4 bug), console 13/13 clean. Now the fresh-eyes phase — source recon on the three session_104 directions.
The clone ships zero `prefers-*` queries, zero `navigator.share`, zero idle-tier APIs. Now let me study the s46 probe pattern and author the three s47 fresh-eyes probes.
House probe pattern internalized. Now authoring the three s47 fresh-eyes probe scripts.
**Family A: PARITY-CLEAN on the new tiers** — zero `prefers-contrast`/`prefers-reduced-transparency` rules on both sites, nothing adapts under emulation (heights + computed styles identical at every tier). The Part-3 "diffs" are generic-selector pick noise (they exist at baseline too — the standing battery is the real parity proof). Let me qualify the `forced-colors: clone=9 live=0` count against the s43 census.
The s43 census said the clone shipped 0 forced-colors rules (after the zinc wrapper removal). My probe now counts 9 — that needs investigation. Let me extract the actual rules.
已识别出该规则：Tailwind v4 内置的 `.outline-hidden` 辅助功能规则（`@media (forced-colors: active)`）。让我检查一下它是何时引入的，以及 `outline-hidden` 是否在任何地方被使用。
Found it: `outline-hidden` shipped in `select.tsx` since commit 1 — the s43 census missed the rule because its walker skipped `@layer` blocks (Tailwind v4 emits utilities inside `@layer`; the s43 zinc wrapper was unlayered, hence visible to it). The rule renders nothing (transparent outline, height 7683 unchanged under forced-colors). Now Families B and C.
**Family B: PARITY-CLEAN** — zero Web-Share surface on both sites (API undefined in context, no share_target in manifests, zero calls/UI/events ×9 routes). Now Family C.
**All three families PARITY-CLEAN** — plus one genuine fresh-eyes discovery (the s43 census under-count: layer-unaware walker). Now let me study the e2e insertion point and the s44 source-pin shape for the remediation plan.
The lifecycle pin docstring mentions "2 prefers-contrast rules" on the live — but my census counted 0. Let me verify against the s43 records.
The s43 finding was on **/login's platform sheets** — which my CSSOM census didn't cover (it swept the 9 signed-in routes). Let me re-probe /login specifically on both sites.
Key finding: the live's auth routes carry **2 prefers-contrast + 8 prefers-reduced-motion rules** (platform chrome; the app routes carry 0). The clone ships none — but rendering stays identical under emulation. Let me extract the rule texts to fully document this platform family.
The two contrast rules are **Google Identity Services button chrome** (injected sheet), and the 8 reduced-motion rules are the live's auth-shell bundle (motion-safe/motion-reduce utilities + sonner toast) — all inert, render tier byte-identical. Let me check the existing source-pin tests to design the s47 pins.
The zinc pin pattern is clear. Now let me verify the CSS-leak protection (the gotcha-41 rule) before writing docs that quote the live's utility classes.
Leak spec located (line 2004), both `.env` files tracked. Quick scandihaven reference re-check, then the remediation plan.
Scandihaven unchanged. Let me check the e2e CDP usage pattern, then write the session-47 remediation plan.
Both media tiers natively supported by Playwright 1.63 `emulateMedia` — specs can use the clean API. Now writing the session-47 remediation plan.
Plan written. Now the plan-time validation against the codebase before executing.
Validation complete — all clear. Now authoring the session-47 pins. First the unit source-pin file.
4/4 unit pins green. Quick RED sanity check — proving the sweep actually catches offenders.
单元测试引脚已验证有效。现在开始编写 e2e session-47 代码块 —— 将其插入到 s33 突发规格（burst spec，其位置保持在最后）之前。
E2E block inserted. Now lint + typecheck, then run the 4 new specs against the current tree.
`reducedTransparency` isn't in Playwright's types (the runtime silently ignored it — my earlier "SUPPORTED" was a no-op; the true matchMedia flip came from the CDP send). Fixing the spec to drive all tiers through CDP.
Clean. Now running the 4 new session-47 e2e specs against the current tree.
**All 4 session-47 specs GREEN** (40.7s). Now the GUARD phase — full gate in order. Build first (fresh), then the full e2e.
319/319 unit ✓ (40 files), build ✓. Now the full e2e run (397 specs, ~16 min) — launching with output to log, will poll.
The timeout killed the run at 385/397. The full run needs ~10.5 min — just over the 10-min tool cap. Splitting into two runs (the burst-spec constraint holds: s44–47 blocks don't touch verify).
378 specs green across runs 1–2. Now the s44–s47 tail.
**GUARD COMPLETE: 716 GREEN** — lint ✓ typecheck ✓ 319/319 unit ✓ build ✓ 397/397 e2e ✓ (14+364+19, zero regressions). Now the standing parity battery re-run.
Battery fully green. Now the proof matrix — checking the s46 proof pattern first.
Writing the s47 proof matrix generator.
Proof matrix written. Now the screenshot captures — checking the s46 capture pattern.
Writing the s47 capture script — standard matrix + prior shapes + the new media-tier visuals.
32 shots captured. Checking re-capture diffs against the tracked set (the asset-variance qualification).
5 个差异需要界定：课程/课程详情对（Unsplash 资源变体系列），仪表板对（custom.db 数据状态 —— 针对 e2e.db 重新截屏），以及 AI 错误截图。让我来处理它们。
AI 错误 diff：23/2M 像素，最大 delta 为 1 —— 文本抗锯齿噪声，合格。现在针对 e2e.db 重新截取仪表板配对（:3101 约定）。
The split e2e runs left a different enrollment state in e2e.db than a single full run (the tracked set's artifact). Let me inspect the state.
e2e.db has 0 enrollments — run 3's global-setup reset them and the s44–s47 tail creates none. The tracked shots show the post-full-suite state. Let me check the global-setup reset semantics and which specs create the enrollments.
Let me find all enrollment-creating specs in run order to reproduce the canonical post-suite state.
No un-enroll specs — the canonical state is seed-1 + seed-3 + seed-5 (1 lesson done). Reproducing it directly via the API against the reset e2e.db.
The script hung — switching to a simpler curl-based approach.
The hung script actually completed its work (it never exited because the browser wasn't closed — the timeout discarded the buffered output). Verifying the state:
Canonical state restored (seed-1 0%, seed-3 0%, seed-5 1% — 1 lesson). Re-shooting the dashboard pair.
Dashboard pair byte-identical. Final qualification of the courses/course-detail diffs (the Unsplash asset-variance family).
All diffs qualified (asset-variance / antialiasing families). Screenshots complete. Now the docs-alignment phase — starting with AGENTS.md.
Counts updated. Now adding gotcha 76 after gotcha 75.
Gotcha 76 added. Let me update the Where-things-live tests reference, then CLAUDE.md.
AGENTS.md 已完成。接下来是 CLAUDE.md 的金字塔计数和 e2e 尾部。
CLAUDE.md 已完成。现在处理 README 徽章和 session-47 段落。
README done. Now the PAD [S47] row.
PAD done. Now the SKILL.md update to v3.35.0.
SKILL v3.35.0 done. Now the session logs — session_105.md (transcript-style) and session_106.md (final log).
Now the repo worklog entry.
Docs aligned. Now the FINAL GATE after all doc writes (the gotcha-41 rule) — lint, typecheck, unit, fresh build, then the split e2e.
**FINAL GATE: 716 FULLY GREEN** — CSS-leak spec re-ran clean after all doc writes (gotcha-41 satisfied). Now the commit + push. First the changeset review and the SSH wrapper instructions.
Changeset clean (dashboard pair byte-identical as restored). Now the SSH wrapper instructions.
已收到指令。正在检查 ssh shim 环境，然后提交。
Shim + paramiko ready. Materializing the operator key (outside the repo) and committing.
Committed (`bac1a20`). Now the push via the SSH wrapper — dry-run first, then the real push.
**Push verified: `main @ bac1a20` == local HEAD.** Now shredding the operator key and cleaning up.
**Session 47 complete — pushed to `main` (`bac1a20`) and verified** ✅

**What ran:**

1. **Baseline & standing battery (all green):** 708 re-verified at the session-46 state → heights **18/18 byte-exact**, **mobile battery identical — no Tailwind v4 bug**, console **13/13 clean**, env contract intact (`.env` == `.env.example`, `DATABASE_URL="file:../db/custom.db"`, db/ at root).

2. **Three fresh-eyes families (the session_104 directions) — all parity-clean, no source change:**
   - **New CSS media tiers**: zero `prefers-contrast`/`prefers-reduced-transparency` rules on both sites, nothing adapts under emulation. Two discoveries: the **layer-aware census correction** (the s43 walker missed `@layer`-nested rules — the clone's Tailwind v4 `.outline-hidden` forced-colors helper found, renders nothing) and the **live's auth-route platform sheets identified** (2 Google Identity Services contrast rules + 8 motion-safe utilities — all inert).
   - **Web-Share census**: zero surface on both sites (API absent, zero calls/UI, no `share_target`).
   - **Idle tier**: APIs exist but zero registrations anywhere.

3. **TDD: +4 unit source pins +4 e2e = 716 green**; proof matrix + 32 screenshots (dashboard pair byte-identical after the e2e.db state restore); docs aligned (gotcha 76, SKILL v3.35.0, README badge 716, session_105/106).

**Suggested next** (per session_106): (a) the `navigator.clipboard` family, (b) the fullscreen/Picture-in-Picture tier, or (c) the gamepad/WebHID surface census.
