I'll continue the task from where we left off. Let me start by checking the current workspace state and refreshing the repository.
The worklog shows prior sessions' work. Now let me refresh the workspace with the latest changes and check the current repo state.
The repo has extensive history through session 15. Now let me pull the latest changes and check the session docs mentioned in the task (session_26, remediation-plan-session15, session_27).
`git pull` brought in `docs/session_27.md` (03e45de → 3257f45). Let me set up the task plan and review the required documents.
Now let me review the key session documents, starting with the newest ones.
session_27.md is the Session 15 transcript — completed scroll-reveal parity work. Session 16 (current) suggestions: scroll-position-restoration/navigation-transition sweep or performance surface (LCP/CLS/bundle-size). Let me review the other instructed docs.
Now let me review the repo worklog and re-verify the core docs' current state.
The docs confirm Session 15 shipped at 224 tests green. Let me spot-check the remaining core docs (AGENTS, CLAUDE, PAD) for their latest state.
All docs are aligned at the Session 15 state. Now let me validate the codebase state — env, skills exclusion, and the baseline gates.
Environment validated. Now running the baseline gates — starting with the fast ones (lint, typecheck, unit).
Lint ✓ typecheck ✓. Now unit tests and the build.
Build ✓. Now the e2e suite (193 specs — the long gate).
**All baseline gates GREEN: lint ✓ typecheck ✓ 31/31 unit ✓ build ✓ 193/193 e2e ✓** — the shipped session-15 tree is fully verified. Now let me set up the audit environment.
Dev server is alive. Let me verify it's serving current code and load the agent-browser skill for the dual-session audit.
Now let me set up the dual agent-browser sessions (live + clone) with synced viewports.
Login redirected to root. Let me verify both sessions' login states.
Both sessions logged in with synced viewports. **Audit environment ready.** Let me check the persisted audit scripts' usage and run the standing surfaces.
Desktop 11/11 byte-exact. Mobile sweep next.
Class diffs show only documented variances. Now the space-y sweep, text diffs, and CourseDetail.
Space-y sweep clean ×10. Now text diffs and the CourseDetail like-for-like sweep.
CourseDetail ×9 byte-exact. Now the **mobile-menu battery** (the user's key focus).
Live menu open: panel 375×405. Let me get the finer measurements (visible links, CTA gap, scroll lock) and then compare with the clone.
Menu structure: 8 links (Home, Courses, AI Assistant, Pricing, Teach, About, Contact, My Dashboard) + CTA. Let me measure the CTA gap precisely and then close + replicate on the clone.
Live menu: 8 links 44px high, CTA at 417 (4px gap after Contact bottom 413). Now the same on the clone.
克隆菜单在几何结构上完全一致（面板 405，所有 8 个链接位置完全相同，CTA 位于 417/h36，4px 间距）。让我验证一下 CTA 类字符串（live 显示为 "block mt-3..."，克隆显示为 "block..."）——这里值得仔细核对。
**发现类字符串差异**：移动端 CTA 的 `<a>` 标签在 live 环境中是 `block mt-3`，但在克隆环境中是 `block` —— 但两者渲染的位置完全相同（顶部 417）。让我调查一下其结构。
**Significant discovery**: The live CTA's `mt-3` is DEAD — its computed margin-top is **4px** (the live's v3-style space-y engine overrides the child's own mt-3), while the clone omits `mt-3` and renders the same 4px via v4's margin-bottom-on-sibling mechanism. Both land at 417 — rendered parity through *opposite* mechanisms, but the class string differs. Let me check how the standing class audit handles the open menu state.
The standing class audit runs with the menu **closed** — an **open-menu class diff is a new surface**. Both menus are currently open; let me enumerate ALL class differences in the open state.
**NEW FINDING #1 (candidate)**: Open-menu class diff — LIVE-ONLY `mt-3` (the CTA's dead margin class, v3-space-y-killed on the live, absent on the clone). The CLONE-ONLY list is the documented panel-mechanism variance. Let me check the Navbar code and whether this case was already documented.
The `mt-3` variance is the **documented session-9 remediation decision** (the dead-class drop) — the Navbar code comment confirms it. Not a new finding; rendered parity holds (417/405/4px). Let me complete the mobile battery: close behaviors and scroll lock.
Scroll lock confirmed as documented (clone hardening, live unhardened). Now close behaviors on both sites.
Route-close ✓ on both. Now Escape-close.
Live does NOT close on Escape (unhardened reference — documented). Now the clone.
Mobile battery complete — all green (Escape/scroll-lock = documented clone hardening). Now the /Home hero-state trigger check on mobile.
/Home scroll-0: both navs identical (transparent bg, same trigger class). Let me verify the logo element specifically and the scrolled state.
/Home states both match (oklab form = documented variance). Now the remaining standing surfaces on desktop: shadow sweep + focus pin + reveal inventory.
34 diff lines — mostly documented form variances, but one line needs investigation (a white-ring avatar span shadow). Let me see its route context.
The avatar diff is the documented empty-slot + color-form variance. Let me confirm ALL remaining diff lines fall into documented families.
Shadow sweep GREEN (all documented form families). Now the focus-ring pin and reveal inventory.
The focus sweep output needs interpretation against the documented methodology (programmatic vs keyboard focus). Let me check the script's focus method and verify the session-13 keyboard-focus pin directly.
The sweep truncates strings. Let me probe the login inputs' keyboard-focus ring directly (the session-13 pin) with full-string reads.
**Session-13 focus pin HOLDS** — the slate-400 4px ring slot is byte-identical on both sites (clone's empty-slot prefixes = documented form variance). Now the reveal inventory (session-15's standing surface).
Let me write the session-16 reveal inventory comparison (per-route target counts + style distribution, both sites).
**Reveal inventory: COUNT-MATCH on all 10 routes** — the Y30/DONE splits are the documented WAAPI-vs-framer timing artifacts (e2e specs pin the end state). **All standing surfaces GREEN.**

Now the NEW session-16 surfaces per the session-27 suggestion: **(A) scroll-position-restoration/navigation-transition sweep** and **(B) performance surface (LCP/CLS/bundle-size)**.
Selector issue — let me check the nav link hrefs on both sites.
The clone's nav includes the hidden mobile panel links (documented mechanism). Let me fix the script's selectors (logo → /Home).
**Three candidate findings from Surface A**: in-app nav settle position (493 vs 654), logo-click scroll (live=600 stays, clone=0 resets), and reload restoration (live=0, clone=3020 restores). Let me characterize each precisely with trajectory sampling.
**Clear findings emerging**: the live does NOT reset scroll on in-app nav (stays at clamped position 493 — the CSR initial-render clamp), while the clone smoothly scrolls to top (Next.js default). Also reload restoration differs (CSR artifact vs SSR native). Let me verify the live's no-reset behavior across ALL navigation paths.
**Comprehensive scroll-path results**: the live NEVER resets scroll on any in-app navigation (keeps position, clamped by the new page's CSR shell height — 493 is the /Courses loading-shell clamp), while the clone always scrolls to top. Same-route no-ops match. Let me now run **Surface B: the performance profile** (LCP/CLS/bundle-size).
CLS=0 on both — but the clone's numbers are polluted by the **dev server** (on-demand compilation: TTFB 798-1543ms). Let me re-measure against the production build for a fair comparison.
Production comparison: **CLS 0.0000 on both sites** (byte-equal), clone LCP/FCP comparable-or-better everywhere, no bundle pathologies — Surface B cleared (structural CSR/SSR differences to document). Let me probe one more navigation-transition dimension: focus management after route change.
**New discovery**: after SPA soft-nav to /Pricing, the live's `document.title` stays "NexusLearn" (no title update on soft navigation!) while the clone updates to "Pricing | NexusLearn". Let me characterize this across routes with fresh-load baselines.
**Confirmed NEW finding**: the live's SPA soft-nav does NOT update `document.title` (stays stale — "NexusLearn" after navigating to /Pricing//Courses//About), while fresh-load titles match on both. Same family as the scroll finding: the Base44 CSR router lacks navigation management (scroll reset, title update, focus reset) that Next.js provides. Let me complete the surface with a mobile popstate check.
**Mobile divergence found**: live restores on back (3041≈3000 ✓) but the clone returns 0 on mobile (desktop restored fine!). The suspect: the mobile menu's scroll lock interfering with restoration. Let me isolate — footer-link nav (no menu involvement) vs menu-nav on the clone.
**REAL BUG ISOLATED**: the clone's back-navigation scroll restoration fails on mobile (0 instead of 3000) even without the menu — desktop works, mobile fails. The scroll lock is exonerated. Let me instrument the restoration sequence to find the root cause.
轨迹显示：在移动端 + 平滑固定（smooth pin）的情况下，恢复**从未触发**（平坦 0）；在自动覆盖（auto override）下，恢复正常触发（14219 = 点击时保存的位置 —— 页脚点击已滚动到底部）；在桌面端 + 平滑（desktop + smooth）的情况下，它会动画到目标位置。让我运行一个干净的矩阵（菜单链接导航，保存位置正好是 3000）。
**令人惊讶的转折**：这次使用最新的上下文，克隆版的移动端恢复**成功运行**了（平滑动画至 3000）！之前的失败是由于状态依赖导致的。线上环境恢复表现一致。让我来量化一下不稳定性（flake rate）——连续进行 5 次干净的测试，并加上确切的早前失败序列。
**模式已识别**：菜单导航恢复 6/6；**页脚导航（保存的位置 ≈ 页面底部）在移动端 + 平滑固定（smooth pin）下失败**（已还原为 0）—— 而在 `auto` 模式下则正常工作。让我通过轨迹数据确认其确定性，并运行 live-control 页脚测试。
**Root cause identified for Finding 1**: the live's back/forward restoration is the **browser-native instant snap** (14483 instantly), while the clone's is a ~1.5s **smooth glide** (the session-13 universal smooth pin animating Next.js's scrollTo-based restore) — plus a racy restore-to-0 failure when clicks fire mid-smooth-scroll. One more check: does the reveal system re-animate on back-nav identically on both sites?
Back-nav reveal behavior is **IDENTICAL** on both sites (re-hide → re-reveal, restore 3000) ✓. Let me confirm the restoration glide also exists on the production build (the fix's target environment).
Production build also glides (9 → ... → 3000, ~900ms). Before writing the plan, let me **prototype the fix mechanism** (popstate suppression) via injection to prove it works.
**Fix mechanism PROVEN** — instant restoration (3000, no glide) on both prod and dev, matching the live. Now verify it also fixes the race case (footer click mid-smooth-scroll).
**Prototype fixes BOTH manifestations**: instant restore (3000) AND the race (14219, not 0). The fix design is validated. Let me check the spec file conventions before writing the remediation plan.
Conventions clear. Now let me write the remediation plan for session 16.
Plan written. Now let me validate it against the codebase before executing (per the process): check layout.tsx, globals.css, and the attribute uniqueness.
Structure clear: the universal pin is in `@layer base`; the session-13/14 pins are unlayered at the end. My suppression rule joins the unlayered set (beats `@layer base` regardless of specificity). Now **Phase 1 — RED specs first**. Let me check the mobile-viewport convention in existing specs.
Now writing the **session-16 RED specs** (Phase 1 — TDD):
Block 1 is **RED as expected** (the glide). Block 2 (race) passed — the race may be dev-server-specific (e2e runs the prod build). Let me verify the race against prod directly.
**The race is dev-server-only** — production restores correctly (14219 × 3). So finding 1's production manifestation is the glide (Block 1 RED ✓); Block 2 pins the correct behavior as a guard. Let me fix the typecheck cast, then implement the fix.
Typecheck clean, RED verified. Now **Phase 2 — GREEN**: implementing the ScrollRestoreNormalizer.
Now the scoped CSS rule (unlayered, at the end of globals.css):
Build clean. Now the **GREEN run** — session-16 specs against the fixed build:
The e2e run likely **reused my old manually-started :3100 server** (pre-fix build). Let me kill it and re-run against the fresh build.
**GREEN: 5/5 session-16 specs pass** (the stale server was both failures' cause). Now the full e2e suite for regressions:
One session-15 spec failed — let me check if it's a flake or a real regression from the layout change.
The spec is flaky in isolation (passed once, failed once) — a pre-existing timing race, possibly shifted by the extra hydration step. Let me examine its timing assumption.
The flake: the probe can land in the SSR→normalized serialization gap (`opacity:0;transform:translateY(30px)` — neither expected string). Let me confirm the failure detail, then make the spec race-free.
已确认 —— 探测已捕获 SSR 序列化。正在修补该 `spec` 以接受两种形式（固定意图，无竞态）：
Now let me verify the patched spec is stable (3 consecutive runs) and then re-run the full suite:
Syntax error introduced by my edit — let me inspect and fix.
The multi-line regex literal is invalid JS. Fixing to a single line:
Stable 3/3. Now the full suite:
**198/198 GREEN** (+5 session-16 specs, zero regressions, session-15 flake fixed). Now Phase 3b — visual re-verification on the dev server.
The dev server is alive; :3100 is dead (expected — fix is in the code now). Let me verify the fix is live on :3000 and run the restoration battery.
Fix is live on dev (both rules compiled). Now the full restoration battery:
**Restoration battery ALL GREEN** — instant on both viewports, race fixed (14219), forward OK, smooth rule preserved outside popstate (the session-13 pin intact). Now the standing surfaces re-verification:
Heights byte-exact ×11 ×2. Class diffs + text + reveal inventory:
All standing surfaces GREEN with the fix. Unit tests, then screenshots:
Only 4 of 24 re-captured screenshots differ from the session-15 versions (capture-timing artifacts in full-page stitches) — the rest are byte-identical, confirming the remediation changed no rendered state. Now `.env.example` verification and docs alignment:
`.env.example` covers all code references ✓. Now docs alignment — README first:
README 已完成。现在进行 AGENTS.md 中的问题清单更新：
Now the PAD — [S16] revision entry and §7.1 test distribution:
Now the SKILL doc (v3.4.0):
Now updating the remediation plan with the results, and writing the session log:
Now the session log (docs/session_28.md):
Now the repo worklog entry:
All docs aligned. Now the **final gate sequence** — build (post-doc-writes) then the full e2e (the leak spec tests the final CSS):
**ALL GATES GREEN: lint ✓ typecheck ✓ 31/31 unit ✓ build ✓ (CSS clean) 198/198 e2e ✓.** Now the commit + SSH push. Let me verify the wrapper instructions:
The wrapper sequence is clear. Let me commit first, then push via the wrapper:
已提交为 `cab2449`（16 个文件）。现在开始 SSH 推送流程：
Fingerprint matches the recorded operator key. Dry-run push:
Dry-run clean (fast-forward 3257f45..cab2449). Real push:
**Push confirmed: `cab2449` on main** — remote verified, operator key shredded, working tree clean. Let me record the session in the workspace worklog and close out:
**Session 16 complete — pushed to main (`cab2449`, remote verified, operator key shredded).**

**What this session delivered:**

The audit re-verified all standing surfaces (heights ×11 ×2 byte-exact, mobile-menu battery clean — **no Tailwind v4 bug**, reveal inventory matching ×10) and added two new surfaces from the session-27 suggestions:

1. **High finding — the scroll-restoration glide**: the live's back/forward restore snaps instantly (browser-native), while the clone's Next.js restore glided ~1s under the session-13 smooth-scroll pin. Fixed with a prototype-proven `ScrollRestoreNormalizer` + a scoped popstate-window CSS rule — restoration now snaps like the live, smooth behavior preserved everywhere else.
2. **Deliberate-better decisions documented + spec-pinned**: the live's unmanaged router (scroll carryover landing mid-page, stale tab titles, stale focus) — kept Next.js's correct behavior.
3. **Performance cleared**: CLS 0.0000 on both sites, LCP/FCP comparable-or-better.

**Gates: 229 tests green (31 unit + 198 e2e), lint/typecheck/build clean, leak spec last.**

**Suggested next**: verify with `bun run test:e2e`, review `docs/session_28.md`, or for Session 17: a form-state persistence sweep, print-to-PDF comparison, or deep-link/query-parameter surface.
