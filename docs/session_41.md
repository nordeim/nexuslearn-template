I'll continue the nexuslearn-template remediation task. Let me start by checking the current workspace state and refreshing it.
The workspace exists from previous sessions. Let me check git status and pull the latest changes.
Previous sessions completed work through session 21. Let me pull the latest and check the session documents referenced in the instructions (session_38, session_39, remediation-plan-session21).
The pull brought in `docs/session_39.md`. Now let me read the key session documents to understand the current project state.
现在让我阅读 remediation-plan-session21 和 worklog 以完成我对当前状态的理解。
Let me read the most recent worklog entries to understand where the last session ended.
我现在已经掌握了全貌。第 21 次会话已完成（提交 `8681fcf`，已推送），并且拉取带来了 `docs/session_39.md`（该会话的记录）。仓库目前处于 `e8d1a1e`，工作区干净，277 个测试全部通过（GREEN）。我的本次会话是 **第 22 次会话** —— 进行标准的重新审计，并采用全新的视角。让我来制定任务计划。
The Read tool is persisting long outputs. Let me read the docs in chunks via bash.
All core docs refreshed. Now validating understanding against the codebase — env contract, db location, skills exclusion, and the session-21 fixes in source.
All exclusion contracts verified. Now running the baseline gates (lint → typecheck → unit) and checking the dev server.
Dev server is up on :3000. Running baseline gates.
Baseline gates GREEN (lint ✓ typecheck ✓ 41/41 unit ✓) — matches the documented session-21 end state. Now let me check the persisted audit infrastructure and plan the session-22 fresh-eyes probes.
The live auth state is stale (0 cookies). Let me review the existing login script and re-establish auth on both sites.
Both sites authenticated. Now running the standing parity sweeps to confirm the documented state holds.
Class sweep matches the documented state: 8 gradient + 48 panel + 2 selectOrder + 20 panel-CTA (labeled "unexplained" by the script but documented as the session-9 panel-CTA variance) = 78 diff lines total. Now the mobile-menu battery.
这些 DIFF 是已记录的差异（ARIA 加固 + grid-collapse 与 unmount 机制）。让我运行感知可见性的关闭探测，这是标准的验证方法。
Mobile battery GREEN — clone's grid-collapse verified invisible (wrapperH=0, opacity=0, innerH=0), live unmounts — the documented mechanism variance. **No Tailwind v4 bug.** Now the console surface.
Console surface clean on the clone — session-21 fix holds; live's entries are platform noise only. All standing surfaces GREEN. Before designing the new probes, let me check what session 13's focus-state audit already covered to avoid overlap.
Session 16 already covered scroll restoration/focus-after-nav, session 13 focus rings. So session 22's five genuinely-new fresh-eyes probes will be: **(1) keyboard Tab-order inventory, (2) storage surface, (3) network-request surface, (4) media-emulation surface (reduced-motion/color-scheme/print), (5) text-scaling surface**. Let me review an s21 script structure first, then write the probes.
Standing surfaces all verified. Now writing the five session-22 fresh-eyes probes. Starting with the keyboard Tab-order inventory.
10 of 11 routes differ — significant signal. Let me capture the full output and analyze the pattern per route.
The pattern is exact: **the clone has +9 focusables on every route** (the mobile menu's 8 links + 1 CTA — kept mounted via grid-collapse). The live unmounts its panel. Let me see where they land in the order, then determine whether they ACTUALLY receive keyboard focus (the a11y-critical question).
The +9 elements are the mobile panel (kept mounted on the clone, unmounted on the live). But the static inventory includes `display:none` elements — at 1920px the panel is `md:hidden` → display:none → **not actually tabbable**. I need visibility filtering plus a REAL Tab-key walk as ground truth. Let me also test the keyboard behavior of the OPEN mobile menu (never probed — all prior battery tests were pointer-based).
Real findings surfacing. The Tab walk on `/` is identical, but `/Courses` shows **placeholder text drift** ("Search courses, topics, or instructors..." vs "Search courses") and select-trigger naming differences. Let me see the rest of the output.
Key findings: (1) **placeholder drift** on the /Courses search input, (2) select-trigger naming difference, (3) `nextjs-portal` dev-only chrome in the clone's Tab order, (4) documented variances confirmed. The mobile Tab-after-open sequence is **identical**. Let me check the source for the placeholder and select aria-labels.
The source HAS the full placeholder — so the probe's extraction must be hitting an `aria-label` first. Let me examine the search input markup.
The placeholder is byte-identical — the clone carries a clone-only `aria-label="Search courses"` (accessible-name hardening, like the mobile trigger). Let me check the selects.
The form aria-labels are only partially documented (icon-only buttons) — the search/select/newsletter/textarea aria-labels are an undocumented accessible-name variance family. Interesting: SKILL line 1160 already recommends exactly this probe. Now let me run the remaining probes — storage surface next.
Storage surface: clone is **completely clean** (no localStorage/sessionStorage, HttpOnly-only cookies) vs the live's 8 platform/analytics keys — accepted-by-nature platform infra. Now the network-request surface.
Network surface: live makes 3–6 client-side platform API calls per route (Base44 SPA data layer); the clone makes **zero** — full server-side rendering via Prisma. An architecture variance, now verified. Now the media-emulation surface.
Media-emulation results: **parity across all modes** — neither site changes anything under reduced-motion/dark-scheme/print. One cosmetic computed-value variance: the live reports `animation-duration: 0.5s` with `animation-name: none` (no actual animation runs on either site — zero rendering impact). Now the text-scaling surface.
Text-scaling: **byte-identical at 125% and 150% on 4 of 5 routes** — the rem system scales identically. The landing shows a 1px rounding flip at 24px (11394 vs 11395, ratio 1.4334 vs 1.4335) — sub-pixel rounding, not structural (20px state is byte-identical). Now let me verify the `nextjs-portal` finding against the production build and check the mobile panel's `tabindex=-1` link.
The mobile panel's "My Dashboard" link has `tabIndex={open ? 0 : -1}` — keyboard hardening. But what about the other 7 panel links? Let me examine the panel markup.
The 7 nav links in the collapsed panel have NO tabindex management (only the CTA does). On mobile with the panel closed (grid-collapse, not display:none), they may still be **keyboard-focusable while invisible** — the classic invisible-focus bug. The live unmounts its panel so it's immune. Let me test this directly.
**Excellent results**: the closed-panel Tab walk is **identical on both sites** — the collapsed panel's links are empirically NOT tabbable (no invisible-focus bug; previously only assumed). Focus-after-close returns to the trigger on both. Now let me verify the `nextjs-portal` finding against the production build and test Escape-key behavior.
Production Tab walk confirms **nextjs-portal is dev-only** (absent in prod, login sequence matches the live). The clone's panel closes on Escape (`expanded: true → false`). The live's Escape behavior is ambiguous in my probe — let me re-test with a DOM-presence check.
矛盾：probe 1d 显示克隆的 `aria-expanded` 在按下 Escape 后变为 `false`，但 1e 显示面板仍然打开。Probe 1e 确认**两个网站都不会在按下 Escape 时关闭**（一致）。让我检查一下 `Navbar` 源码中是否有 `Escape` 处理逻辑以进行核对。
The source DOES implement Escape-closes. Let me re-test more carefully on the dev server with aria-expanded tracking.
Escape 关闭了状态 (expanded=false, scroll lock released)，但 Teach 链接仍然报告 height>0。让我直接测量面板几何结构 —— 这里可能存在仅出现在 Escape 路径上的 transition/grid-collapse 问题。
The full picture: Escape closes the clone's panel (grid fully collapses to 0/opacity 0 — my earlier "visibleTeach" was a child-box measurement artifact; the container clips it). The live does **not** close on Escape — a clone-only hardening. Let me check whether the existing e2e suite covers Escape-close and the aria-label hardening family.
The audit found no source defects — all findings are undocumented variances, methodology lessons, and clean surfaces to pin. Before writing the plan, let me run one definitive accessible-name sweep across all form controls on all routes to complete the F1 family inventory.
Complete F1 inventory: the /Courses search input + 3 selects and the AI textarea carry clone-only aria-labels (deliberate stable-naming hardening — the live relies on placeholder/value naming which vanishes on input); the newsletter aria-label mirrors its placeholder exactly (names match); /Contact's flag was a dedup artifact (identical). The audit is complete. Now writing the remediation plan.
Plan written. Now validating it against the codebase — checking the existing spec conventions and the session-21 pin structure before appending the new specs.
Plan validated against the codebase — spec conventions confirmed, no conflicting pins. Now writing the session-22 e2e pin block (Phase 2).
Now appending the session-22 pins. First the three in `nexuslearn.spec.ts`:
Now the invisible-focus guard in the mobile spec:
Now let me kill my manual standalone server and run the new session-22 specs against the e2e infrastructure.
All 8 specs pass. But the manual server may still be holding :3100 (curl returned 200 after kill) — the e2e run may have used it instead of booting its own with `e2e.db`. Let me verify and clean up.
端口现已释放（stale server 之前将其进程重命名为 "next-server" —— 这就是为什么 pkill 漏掉了它；规格测试基于 `custom.db` 运行，但最终网关将在隔离的 `e2e.db` 上重新验证所有内容）。我添加了 8 个测试（而不是计划中的 4 个 —— aria-label 规格拆分到了 3 个测试中，invisible-focus 拆分到了 2 个）。让我更新计划数量，然后继续交付。
Plan updated. Now Phase 3b — screenshots. Let me check the capture script from session 21 and the current screenshots.
Now writing the session-22 screenshot capture script — the standard set re-captured plus the session-22 surfaces (Escape-close state, /Courses filter row, AI composer).
61 screenshots captured (58 standard re-captured + 3 new session-22 files). Let me VLM-verify the key session-22 captures.
The filter-row capture grabbed the wrong element. Let me find the correct selector for the filter card.
The outer wrapper matched instead of the card. Let me recapture with the correct selector.
Filter card verified. Now the other two session-22 captures:
The composer response came back in an odd format. Let me re-verify:
All three session-22 captures VLM-verified. Now Phase 3c — docs alignment. Starting with README:
Now AGENTS.md — gotcha 51 and the commands table:
Now CLAUDE.md — the test pyramid and session-22 spec family:
Now the PAD — [S22] revision entry and §7.1 row:
Now the SKILL doc — v3.10.0. Let me check its structure:
Now creating the session log `docs/session_40.md`:
Now the repo worklog entry:
All docs aligned. Now the final gate sequence: lint → typecheck → test → build → test:e2e.
Typecheck failed — `innerText` doesn't exist on `Element` (needs HTMLElement cast). Fixing:
Now build + the full e2e gate:
**244/244 e2e GREEN** on the isolated e2e.db. Now the CSS-leak spec LAST (the session-15 process rule):
**ALL FINAL GATES GREEN** — lint ✓ · typecheck ✓ · 41/41 unit ✓ · build ✓ · 244/244 e2e ✓ · CSS-leak LAST ✓. Now the commit + SSH-wrapper push. Let me review the wrapper instructions first.
The paramiko shim is in place. Committing the session-22 changes first:
Committed as `6253106`. Now the SSH key setup and wrapper push:
Dry-run clean. Executing the real push:
Push **verified** — the wrapper confirmed `refs/heads/main @ 6253106 == local HEAD`, git status shows up-to-date with origin/main, and the operator key is shredded. (The trailing ls-remote error is just the shim having no key after the shred — the wrapper's own verification is authoritative.) Let me update the workspace-level worklog:
## Session 22 Complete ✅

**What was done** (committed `6253106`, pushed to `main` via the SSH wrapper, remote verified, key shredded):

🔍 **Fresh-eyes audit** — Five new probe families (keyboard Tab-order inventory, storage surface, network-request surface, media-emulation sweep, text-scaling surface) found **zero source defects** — the strongest parity signal yet:
1. **Keyboard Tab order identical** on every probed surface — the collapsed mobile panel is empirically NOT tabbable (**no invisible-focus bug, no Tailwind v4 bug**), focus-after-close returns to the trigger on both sites
2. **Clone is totally clean underneath**: zero client-side storage, zero client-side data calls on load (pure SSR), byte-identical text scaling at 125%
3. **Documented + pinned variances**: the form-control aria-label hardening family (vs the live's fragile placeholder/value naming), Escape-to-close, the dev-only `nextjs-portal` Tab stop (verified absent in production)

🔧 **Remediation** — 8 new e2e pins (green-by-design guards), one typecheck fix during the gate

✅ **Verification** — 285 tests green (41 unit + 244 e2e), lint/typecheck/build clean, every standing surface byte-exact, 61 VLM-verified screenshots, docs aligned (SKILL v3.10.0, gotcha 51, PAD [S22])

**Suggested next steps**: review `docs/remediation-plan-session22.md` + `docs/session_40.md` for the evidence trail. Beyond-reference directions for a future session: a WCAG 2.2 AA formal audit (the a11y surfaces are now well-mapped), a CSP/security-headers pass, or an axe-core automated scan as a sixth probe family.
