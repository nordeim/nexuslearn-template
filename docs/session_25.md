There's existing work from previous sessions. Let me check the worklog and git status to understand where we left off.
工作区显示会话 10-13 已完成（上次推送：`639b081`）。用户的任务现在引用了 `docs/session_22.md`、`docs/remediation-plan-session13.md` 和 `docs/session_23.md` —— 这是 **会话 14** 的一个新周期。让我来制定任务计划并刷新工作区。
已拉取：`e0398ba` 引入了 `docs/session_23.md` —— 来自操作员的新会话指令。让我与关键利益相关者一起审查这些文档。
`session_23.md` is the Session 13 transcript — its closing suggests Session 14 surfaces: **print stylesheet comparison** and **`::selection`/cursor style sweep**. Now reviewing the session docs.
Session 13 docs confirmed. Now validating the codebase state — repo worklog tail, env, skills exclusion, test config.
Codebase state matches Session 13 docs. Now verifying skills/ exclusion configs and running baseline gates.
记录在案的过期沙盒 `DATABASE_URL` 导出依然存在 —— 正在按命令进行消除。正在查找单元测试并运行基线门控。
Lint ✓ · Typecheck ✓ · 31/31 unit ✓. Now build + e2e (the long gates).
**Baseline gates all green**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **155/155 e2e ✓** — Session-13 state confirmed. Moving to the audit phase.
Dev server alive (200). Verifying it serves current session-13 code, then setting up the audit environment.
Dev server is current. Now setting up the dual-session audit environment with agent-browser.
Both audit sessions still active. Verifying login state and syncing viewports.
Clone session needs re-login. Setting synced viewports first, then logging in.
已登录克隆版本（导航栏显示 "My Dashboard"）。正在验证 Dashboard 访问权限，随后运行 standing-surfaces 审计。
Both sessions logged in, viewports synced. Running the standing surfaces — checking script interfaces first.
桌面端高度均符合文档记录范围（−30/−49/−29 区间，其余完全一致）。正在进行移动端扫描。
Mobile heights all at documented bands (−299/−121/−50/−46/−45/−22/−58/−22/−44). Running class-set diffs.
Class diffs show only documented variances (gradient form + panel mechanism). Running CourseDetail + space-y sweeps.
CourseDetail at documented bands (7× +1px, WebDev/UIUX −25px). Running space-y + text + shadow sweeps.
Space-y sweep clean on all 12 routes (session-13 fix holds). Running text diffs + shadow sweep.
Text diffs IDENTICAL ×4. Running the shadow sweep (session-12 pin verification).
Shadow sweep: session-12 pin holds — only documented oklab/rounded-full form variances. Now the mobile-menu battery (user's key focus).
**Mobile battery GREEN** — panel 404px byte-exact, 8 links, route-close works, no Tailwind v4 display/breakpoint bug (differences only in the documented scroll-lock/ARIA hardening + panel mechanism variances).

All standing surfaces verified. Now the **Session 14 fresh-eyes surfaces** (per session_23.md's suggestion): **print stylesheet comparison** + **`::selection`/cursor sweep**. Writing the probes.
Print rules: **0 on both sites** (no print stylesheet on either — parity there). But `/CourseDetail?id=seed-1` shows a massive diff — likely the live/clone course-id mismatch (live uses its own ids). Checking how the standing CourseDetail sweep handles this.
Confirmed — probe artifact (live uses its own course ids). Re-running the print probe with correct per-site ids.
CourseDetail print state: at the documented −25 band with correct ids — **print surface GREEN** (neither site ships print rules; print layout = screen layout). Now surface 2: **`::selection`/cursor sweep**.
**Major findings on the new surface!** (A) The live `/login` ships 8 `::selection` rules (blue-100/slate-500/slate-900/white) the clone lacks; (B) the clone shows `cursor: default` counts on every route — the **Tailwind v4 preflight dropped `button { cursor: pointer }`** (the SIXTH v4 trap). Verifying both against the DOM and source.
No `selection:` classes in live's main subtree. Checking the whole live DOM + where the clone's red-200 rules come from.
Neither DOM carries `selection:` classes — both sites' rules are INERT. Finding where each side's rules come from.
**Root cause found** — the clone's inert selection rules leak from `skills/gift-evaluator/html_tools.py` via Tailwind v4's automatic source detection (the skills/ folder is excluded from tsconfig/eslint/tests but NOT from Tailwind's content scanning). Now verifying the cursor finding — which elements compute `default` on the clone.
The 4 login BUTTONs (+ descendants) compute `default` on the clone vs `pointer` on the live — the **v4 preflight dropped the v3 `button, [role="button"] { cursor: pointer }` rule** (the sixth v4 trap). Extracting the live's exact preflight rule for the pin.
The live ships the exact v3 preflight rule `button, [role="button"] { cursor: pointer; }` (in both its static and runtime sheets). Quantifying the cursor drift on `/` for the record.
已确认所有 15 个克隆按钮上的光标漂移（实时：0 个默认元素 — 所有按钮均通过 v3 预检设为 `pointer`）。现在正在量化 `skills/` CSS 泄漏 — 检查有多少 distictive 类从 `skills/` 泄露到了编译后的样式表中。
283 skills files with class strings leak into the CSS compile. Quantifying the leak in the production build, then testing the `@source not` fix mechanism.
Production CSS (157KB, 1994 rules) contains the leaked utilities. Testing the `@source not` fix mechanism on the dev server.
2014 rules on dev, incl. the 2 leaked selection rules. Applying the candidate `@source not` fix.
**Huge win**: 2014 → 987 rules — **51% of the compiled CSS was skills/-leaked unused utilities**! Verifying nothing needed was dropped (heights + rendering intact).
Heights unchanged — the 1027 dropped rules were all inert. Now sweeping ALL live routes for any REAL `selection:` class usage (vs runtime-preset inert rules).
**完整路由扫描判定**：在两个站点的任何地方都没有元素携带 `selection:` 类——线上站点的 8 条规则是惰性的运行时预设（已接受的形式差异）；克隆站点的 2 条规则是 `skills/` 泄露（现已修复）。 

**会话 14 发现**：(1) 高危 — v4 按钮光标预检（preflight）丢失；(2) 中危 — 51% 的 CSS `skills/` 泄露（已修复机制）；(3) 印刷/选择/插入符号（caret）表面已清除。现在验证光标修复机制。
Cursor fix verified on /login — histogram now byte-identical with live (`{"auto":44,"pointer":12,"default":2,"text":2}`, the 2 defaults = the LABELs). Checking `/`.
Both sites now show **zero default-cursor elements** on `/` (count deltas = the documented element-count variance family). Running the regression checks — shadow sweep, focus ring, space-y — to confirm the CSS changes moved nothing.
Shadow sweep holds (46 documented form-variance pairs, no shadow-sm drift). Focus ring + space-y intact. Both fixes validated. Now snapshotting the pre-fix CSS selector set for spec design, then building the remediation plan.
已确认 Canary 选择器（`.bg-amber-400`、`.bg-indigo-500`、`.bg-lime-50`、`.bg-teal-600` — 源码无使用，修复前 CSS 中存在）。同时也在检查 `docs/` 文件夹是否也存在类似泄漏。
Post-fix CSS is clean (`bg-blue-100` is src-used; all leak canaries gone). Adding one more fresh-eyes surface for completeness — **pseudo-element rules (::placeholder/::marker/scrollbar) + computed font-family + dark-mode emulation**.
**重大新发现** — 字体栈（font stacks）存在差异：线上环境使用的是 `Inter, system-ui, -apple-system, sans-serif`（除了 `/login` 使用的是 **v3 默认栈** `ui-sans-serif, system-ui...`！），而克隆环境使用的是 `next/font` 的 `Inter, "Inter Fallback"`。此外，线上环境的 `/login` 包含 27 个滚动条伪规则（scrollbar pseudo-rules）。正在深入分析究竟实际渲染了什么。
**Critical discovery**: the live NEVER loads Inter as a webfont (`document.fonts` empty on `/`; the `/login` runtime declares only unused Wix/Dazzed fonts) — it renders the **system font** (width 546 = system, ≠ Inter 509). The clone bundles real Inter via next/font. The documented "font-metric height bands" (−30/−49/−29) are this font difference's symptom. Sweeping all live routes + checking the live's font declarations.
**已确认：在所有 10 个线上路由中均无任何 Inter** —— 线上环境到处都在渲染系统字体（声明的栈在 9/10 的路由中会向下回落；/login 使用了 v3 默认栈）。克隆版本捆绑了真实的 Inter。正在寻找生成该线上环境 `Inter, system-ui...` 栈的具体规则。
The live's Inter stack is a **runtime-injected inline `body` rule on 9/10 routes** (absent on /login → engine default). No webfont anywhere. The fix: unbundle next/font, declare the live's exact stack. Checking the clone's font wiring.
克隆版本通过 `next/font/google` 打包 Inter，并作为 `--font-sans` 变量。正在检查 mono-font 的使用情况，然后应用字体一致性修复。
No rendered code elements on either site (chat-only) — default mono stacks match engine-to-engine. Applying the font parity fix.
Now adding the `--font-sans` declaration to globals.css `@theme`:
**字体修复已验证** — body 计算出与线上环境完全一致的堆栈，渲染宽度为 546.02（与线上环境的系统字体相同），html 无 class。现在到了关键时刻：高度区间是否会被合并？
**突破**：8/10 个路由现在达到字节级精确一致（/Courses 和 /About 的区间已消除！）。仅 / 和 /Home 仍有 +24px 的偏差。正在定位剩余的漂移。
Single wrapper div — drilling deeper.
Hero H1 differs (live 144 vs clone 180) — but that's inside the `h-screen` clamp. Reading the H1's computed font metrics + finding the real +24 source below the hero.
H1 metrics identical (72px/72px) — but the live H1 uses the **default stack** (a `font-sans`-style class on headings?) while inheriting body is Inter-stack. Both render system font. The drill's index alignment drifted; measuring the H1 directly.
Sessions were on /AIAssistant — navigating both back to `/` and re-measuring.
**THE SEVENTH V4 TRAP FOUND**: same H1 class + font-size 72px, but **line-height 72px (v3, ratio 1.0) vs 90px (v4, ratio 1.25)** — v4 changed the default line-heights on the large text-* scale! Checking v4's default theme + the P drift.
Stock v4 says `--text-7xl--line-height: 1` — something overrides it to 1.25 on the clone. Reading the H1's actual classes + the generated rule.
Both H1s carry identical classes incl. `leading-tight` — but the live computes ratio 1.0 (text-7xl's own lh wins) vs the clone's 1.25 (v4's `--tw-leading` composition makes leading-tight win). Checking the live's rule ORDER — likely the runtime-cascade flip again.
只找到 2 条规则 —— `md:` 变体必须存在于其他地方（或者作为运行时规则）。正在更广泛地搜索。
**已确定的根本原因**：在 live (v3) 上，`md:text-7xl`（位于 media 块中，位于第 936 位）重新声明了 `line-height: 1`，它在层叠样式表中位于 `leading-tight`（第 534 位）**之后** → 1.0 获胜。v4 的 `--tw-leading` 自定义属性组合使得 `leading-tight` 在任何顺序下都能获胜 → 1.25。**第四类结构性盲点：变体块层叠顺序 + v4 自定义属性组合。** 顺便也测量一下 P 的 +14。
P: live lh=28px (ratio 1.4) vs clone lh=32.5px (1.625 = leading-relaxed). The live's winner is neither md:text-xl's nor leading-relaxed's stock value — reading the live's actual `md:text-xl` + the P's full classes.
**完全根源已确定** — 漂移模式（H1 和 P）：v3 的响应式 `md:text-*` 规则在后面的 media 块中重新声明了基于 rem 的 `line-height`，从而在级联中胜过普通的 `leading-*`；而 v4 的 `--tw-leading` 组合则让 `leading-*` 胜出。**第七个 v4 陷阱：`text-*`↔`leading-*` 的组合反转。** 正在扫描代码库以查找所有受影响的组合。
受影响的三个元素（Hero H1、Hero P、CTA H2 —— 均位于 `page.tsx` 中）。正在从实际运行页面中读取精确的 v3 胜出值以进行固化，并检查是否存在响应式 `leading-*` 的使用。
Live 的精确胜出值已提取。正在验证在 `grep` 中没有其他 `leading-*` 用法（包括多行）与 `responsive text-*` 结合，随后应用 `unlayered cascade pins`。
Only the 3 confirmed combos. Applying the unlayered line-height pins after the session-13 pin.
H1 (72px/144) and P (28px/84) now byte-identical with the live. Checking the CTA H2, then the full height sweep.
All 48px H2s byte-identical. Running the full height sweeps.
**COMPLETE HEIGHT PARITY**: desktop **11/11 byte-exact**, mobile **10/11 byte-exact** — 13 sessions of documented "font-metric bands" eliminated! Only /login mobile remains (−12, was −44). Investigating.
The FORM interior is 12px shorter on the clone. Drilling into the form's children.
Drift isolated to the Email+Password block (live 160 vs clone 148). Drilling into its children.
Field groups: live 74px vs clone 68px each (spacing engines equivalent — the 6px is in the label/input themselves). Measuring label + input separately.
Label 和 input 完全相同 —— 但组高度不匹配。正在导出包含边距的完整组后代树。
**发现第八个 v4 陷阱**：v4 的 space-y 引擎将 `margin-block-end` 放在了 **行内 (inline)** 标签上，这在此处是无效的 —— 而 v3 的引擎则对后续的块级 (block) div 进行了 margin 处理（始终有效）。正在验证标签显示模式。
已确认 — 两个网站上的标签均为 `display: inline`；v4 的引擎在行内子元素上会失效（垂直外边距失效），而 v3 的引擎则作用于后续的块级 div。这种漂移存在于所有宽度中（桌面端被视口裁剪所掩盖）。正在检查 v4 生成的 space-y 规则以设计修复方案。
v4 引擎已在生成的 CSS 中确认。在设计修复方案之前，我正在对所有路由进行全面审计，以找出所有带有内联（行内）非末尾子元素的 `space-y` 容器（进行 `gap-by-gap` 对比）。
Two findings: (1) the confirmed /login label gap loss (−6px ×2); (2) a subtle 0.8px gap drift on / and /Pricing `space-y-4` containers. Identifying the 0.8px container.
The pricing feature lists. Measuring one row's precise fractional metrics.
Sub-pixel (0.8px) drift in the pricing feature rows — reading exact fractional values to diagnose.
svg measures 21×21 with `h-5 w-5` (should be 20) and the gap 16.8 — smells like a spacing-scale variance. Reading computed `--spacing` and root font-size directly.
Computed svg size is 20×20 on both, but the clone's bounding rect is 21×21 — **a 1.05 scale on an ancestor** (16×1.05=16.8, 20×1.05=21)! The clone's pricing card is scaled where the live's isn't. Checking the card's scale classes.
**THE NINTH V4 TRAP**: the popular pricing card — live (v3) computes `matrix(1,0,0,1,0,20)` (translate only, NO scale), clone (v4) computes `scale: 1.05`! Reading the card's full classes.
卡片的类名在字节上完全一致（纯 `scale-105`，没有 translate 类），但线上环境计算出的结果是 `translateY(20px)` 且未进行缩放，而克隆版本的计算结果则是 `scale: 1.05`。正在通过新的 Playwright 上下文进行决定性的无鼠标探测。
v3 通过 `transform` 模板组合缩放；v4 使用独立的 `scale` 属性。但线上环境的卡片在 transform 中显示 `translateY(20)`，且没有缩放——有其他东西覆盖了它的变量。正在读取线上环境卡片的 computed transform 变量 + 匹配的运行时规则。
The live's vars say scale 1.05, but transform shows translateY(20) — suspecting a **fill-mode animation** overriding the static transform. Checking the live card's animation properties.
No animation on either. Testing whether the live's odd transform is a frozen transition — disabling all transitions and re-reading.
不是过渡动画 —— 一个静态状态。正在检查卡片的 **inline style** 属性（内联 transform 会覆盖所有样式表规则）。
**Root cause found**: the live's card carries an INLINE `opacity: 0; transform: translateY(20px)` — the Base44 **scroll-reveal system** pre-hides offscreen elements (overriding `.scale-105` while hidden). Verifying the reveal fires on actual scroll.
**Reveal fires but leaves `transform: none` inline — the live's popular card is PERMANENTLY unscaled** (the Base44 reveal system kills the v3 scale-105). The clone renders it scaled (523 vs 498px). Checking all `scale-105` usages to scope the pin.
Plain `scale-105` = only the 2 popular pricing cards (the 21 hover-variants are different classes, unaffected). Checking whether OTHER reveal-targeted elements on the live carry transform classes that the reveal's inline `transform: none` would also kill.
Only the / popular card has killed transforms. But /Pricing showed the same 16.8 gap drift — checking its popular card's state on the live.
Both live cards render unscaled post-reveal. Applying the ninth-trap pin — unlayered `.scale-105 { scale: none; }` (matches the reveal system's permanent inline override).
Scale pin verified (card 498 = live, gap 16 exact). Now the eighth-trap fix — the scoped v3-engine pin for the inline-label gap loss.
Gap 10 ✓, group 74 ✓, page 762 ✓. Running the final full verification sweeps.
**PERFECT: all 22 height measurements byte-exact.** Re-running the remaining standing surfaces (CourseDetail, class diffs, gap audit, focus ring, shadows, mobile battery).
**CourseDetail: all 9 byte-exact** (was +1/−25 bands)! Running class diffs + text + gaps.
**Gap audit: 20/20 at parity, zero drifts.** Running shadow sweep + focus ring + mobile battery.
所有现有外观检查均已通过。还有一项验证 —— 注册/重置视图的 `label` 间距（该 `pin` 也影响了它们）：
Signup view uses a different structure (no space-y-1.5 on either site — parity structurally). Comparing signup card metrics directly.
Sessions drifted to different pages. Navigating both to /login → signup view and comparing.
Signup form identical (306/306) but the card is −16px on the clone. Drilling the signup card interior.
**TENTH v4 trap**: the signup view's "Back to sign in" button carries its own `-mb` utility which **overrides v4's `:where()` space-y gap** (v3's follower-side gap survives) — the H2 sits 16px higher on the clone. Sweeping ALL login views' sibling gaps to find every instance.
Both drifts = the same button-first pattern. Reading the reset view's container children to nail the exact fix.
Reset confirmed: `space-y-4 sm:space-y-6` with followers carrying mt on the live. Checking the LoginForm source for all back-button view patterns.
The `-mb-2` back-button pattern affects reset/signup/verify views. Checking `-mb-2` uniqueness for a precise selector.
`-mb-2` is unique to the back-button. Applying the tenth-trap pin.
All login views at parity. Quick regression check on /login heights, then writing the remediation plan.
Now writing the comprehensive remediation plan document.
Plan written. Validating against the codebase — checking the spec file's structure for the insertion point.
Spec insertion point confirmed (append after line 1782). Starting the TDD flow — stashing the two fix files (the `.next/standalone` build is still the pre-fix baseline).
Pre-fix state restored on the dev server. Writing the session-14 RED specs.
Running the session-14 specs against the pre-fix build — expecting RED.
**RED 已验证：14 个失败 + 2 个 GUARD 通过**。正在抽检失败原因以确保其正确性。
完美匹配（`Expected 72px / Received 90px`）。恢复修复并重新构建以进行 GREEN 阶段。
14/16 green — 2 still failing. Investigating both.
Production CSS dropped 157KB→82KB (leak mostly fixed) but 1 canary remains. Identifying it.
**Spec itself re-leaks the canaries** — Tailwind v4's auto-detection scans `tests/` and `docs/` too (my new spec + plan doc contain the class strings)! Also `AGENTS.md`/SKILL docs at the root likely leak. Checking what else leaks + the `public/` folder, then extending the exclusion.
Root docs don't leak real utilities, but `tests/` + `docs/` do (my spec + plan). Extending the exclusion — the compiled CSS must come from app source only. Testing empirically on the dev server.
Extended exclusions verified (933 rules, zero canaries). Now checking the second failure — the label-gap spec on the production build.
`mt`=6px passes but groupH=78 on production (dev measured 74) — a **browser font-metric difference** (Playwright's Chromium vs agent-browser's). Measuring the LIVE in Playwright's browser for the true reference value.
**Parity confirmed in-browser** — the live ALSO measures 78 in Playwright's Chromium (my 74 was agent-browser's font metrics; the pin `mt:6px` matches). Fixing the brittle absolute assertion to be browser-independent.
Rebuilding with the extended exclusions and re-running the session-14 specs.
**GREEN — 16/16.** Running the full gate suite.
**ALL GATES GREEN: 171/171 e2e (155→171, zero regressions)** · lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓. Final visual re-verification (the CSS changed after the last sweep).
All 22 byte-exact — confirmed. Phase 4: screenshots. Checking the session-13 capture script as the template.
正在创建 session-14 截图捕获脚本。
正在检查跟踪的 open-menu 截图名称（session-13 已将其与跟踪的集合对齐）。
Re-capturing the open-menu shots to the tracked names and removing the duplicates.
The re-capture chain failed early — the tracked files still have old timestamps. Redoing step by step.
Both open-menu shots refreshed. Phase 4b — docs alignment. Checking README first.
正在更新整改计划，并得出实际的 TDD 结果。
Now creating the session log `docs/session_24.md`.
`.env.example` verified — covers all code references. Final gates + commit preparation.
已提交 `6273469`。现在正通过已记录的流程进行 SSH 包装推送。
Fingerprint matches the recorded operator key. Running the dry-run.
Dry-run clean (fast-forward `e0398ba..6273469`). Executing the real push.
**Session 14 complete — pushed to main (`6273469`, remote verified, operator key shredded).**

The session's headline find: the **reference ships no webfont at all** (`document.fonts` empty on every route — its Inter stack falls through to the system font), while the clone bundled next/font Inter. That single difference was the root cause of **all 13 sessions of documented "font-metric height bands"** — after the fix, every height measurement is **byte-exact for the first time** (11 routes × 2 viewports + all 9 CourseDetail pages).

Also closed, all with byte-identical classes:
- **Five more Tailwind v4 traps**: the button-cursor preflight drop, the line-height composition flip (hero H1 90→72px), the inline-label space-y gap loss, the `-mb-2` overridden-gap loss, and the reveal-killed `scale-105` (the live's scroll-reveal leaves `transform: none` inline forever)
- **The skills/ CSS leak**: 51% of the compiled stylesheet (1027 rules) was unused utilities generated from agent docs — now excluded via `@source not` (157KB → 82KB)

Gates: **202 tests green** (31 unit + 171 e2e, +16 TDD red-first, zero regressions), 22 fresh screenshots, all docs aligned (SKILL doc v3.2.0).

**Suggested next steps**: verify with `bun install && bun run test:e2e`, or review the byte-exact height tables in `docs/session_24.md`. For Session 15, remaining candidates include replicating the reveal ENTRY animation itself, or a forced-colors/accessibility rendering sweep.
