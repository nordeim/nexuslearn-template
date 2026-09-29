我将系统地开始执行这个任务链。首先检查工作区当前状态，然后刷新仓库。
The workspace exists with previous session history. Let me check the full worklog, current git status, and refresh with `git pull`.
本地仓库在 commit `7cbd26a` (session 12)。现在执行 `git pull` 刷新工作区以获取最新文档（session_20、session_21、remediation-plan-session12）。
工作区已刷新（`7cbd26a..2291105`，新增 `docs/session_21.md`）。现在建立任务清单并开始审阅文档。
已读 AGENTS.md 和 CLAUDE.md。继续读 README.md 和 Project_Architecture_Document.md。
PAD 太大，读取关键部分（修订记录和最新 session 条目）：
PAD 已理解。现在读取 nexuslearn-template_SKILL.md 和会话文档：
现在读取 worklog.md 和刚拉取的 docs/session_21.md：
会话文档已审阅完毕。当前状态：Session 12 已完成（`7cbd26a`，147 e2e + 31 unit = 178 tests），session_21.md 是 Session 12 的原始转录，建议 Session 13 关注 **scroll-behavior/scroll-reveal 对比或 focus-ring parity sweep**。现在读取 SKILL 文档关键部分并检查 repo worklog 尾部：
文档审阅完成。现在验证代码库状态：`.env`、`db/`、skills 排除配置、测试套件，并刷新 scandihaven 参考仓库：
验证确认：`.env`/`.env.example` 正确、`db/` 在根目录、skills/ 四处排除齐全。注意到已知的 stale shell export（`file:/home/z/my-project/db/custom.db`）需按命令中和。现在检查 package.json、审计脚本和 scandihaven 参考：
检查 nexuslearn 仓库自带的 skills 目录（按任务要求参考）：
代码库验证完成，与文档描述完全一致。现在运行基线门禁（lint → typecheck → unit → build → e2e），注意按文档中和 stale shell export：
Lint ✓ · Typecheck ✓ · 31/31 unit ✓。现在 build + e2e：
**基线门禁全绿**：lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **147/147 e2e ✓**。Session-12 状态确认。

现在进入实时审计阶段。加载 agent-browser 技能并启动 dev server：
开发服务器（Dev server）已在运行（守护进程，健康检查 200；pull 只新增了 docs 文件不影响代码）。现在设置双会话审计环境（实时（live）+ 克隆（clone），同步视口规则）：
需要确认 live 会话登录状态。检查 Dashboard 状态判断：
Live 已登录（"Welcome back, sepnetflix2023"）。检查 clone 会话：
双会话均已登录。现在检查既有审计脚本接口，运行 standing surfaces：
桌面端高度：全部在已记录的区间（/, /Home −30；/Courses −49；/About −29；其余完全一致）✓。移动端高度：
移动端高度需对照已记录的 session-8 区间。查询文档记录：
移动端高度与已记录区间**完全一致**（/−299、/Courses−121、/Pricing−46、/About−45、/Contact−22、/BI−58、/Dashboard−22、/login−44、/AIAssistant−50）✓。

现在运行 CourseDetail 逐项对照扫描（9 门课程）：
CourseDetail 扫描：7× +1px、WebDev/UIUX −25px —— 与已记录区间完全一致 ✓。现在运行 class-set diffs 和 space-y 扫描：
类差异（Class diffs）：仅有已记录的变体（gradient 类形式 + 面板机制类），/login 完全一致 ✓。运行 space-y 陷阱扫描（12 条路由）：
/login 有一个 space-y 命中（`space-y-3` 容器 + 子元素 `my-6`）。对照 live 验证是否为参考行为：
Live 的 /login 没有该陷阱模式。深入对比两者的登录卡片结构：
发现 /login 登录卡片结构差异：clone 的 `space-y-3` 包含 3 个子元素（Google 按钮 + OR 分隔线 + 表单），live 的只有 1 个子元素。深入对比完整卡片内部 DOM 结构：
关键发现！Live 的 `div.w-full > div.space-y-3` 只包含 Google 按钮，OR 分隔线和表单是外层 space-y-6/8 列的**兄弟节点**。现在 dump clone 的完整结构确认差异：
**确认真实结构漂移**：clone 把 OR 分隔线和表单放进了 `div.space-y-3` 内部，而 live 中它们是外层 `space-y-6/8` 列的直接子节点。测量两站实际视觉间距：
实测间距竟然相同（24/24）！但 live 的 form.marginTop=0 与 DOM 结构推断矛盾。直接查询 form 的父元素链：
两站的 form/OR 父链不同。精确 dump live 外层列的直接子节点结构：
两站外层列结构已明确。但 clone 实测 gap=24 与 v4 space-y-3 引擎预测的 36 矛盾。直接测量三个子元素的 computed margins：
矛盾出现：clone 的 Google.mb=12 + OR.mt=24 应为 36px，但实测 gap=24。同一 eval 中重新测量 bounding rect + margins：
**视觉结论**：两侧都是 block 容器 → 相邻 margin 折叠（collapse），实际间距完全一致（24/24）。DOM 嵌套不同但视觉无差异。但需检查其他 4 个视图是否有同样模式。检查 reset 视图：
Reset 视图结构**完全一致**。差异仅在 signin 视图。检查剩余视图（signup、verify、reset-sent）：
Signup 视图一致。差异仅限 signin 视图。查看 LoginForm.tsx 代码定位结构：
Clone 的结构在代码中确认：`space-y-3` 包含全部三个元素，live 则只有 Google 按钮。这是一个真实的 DOM 结构漂移（视觉上被 margin 折叠掩盖 + 潜在 v4 space-y 陷阱）—— 记录为发现 #1。

继续运行 standing surfaces。现在执行用户重点关注的**移动端菜单全量测试**（live + clone）：
**移动端菜单全量测试：GREEN** — panelH 404 字节级一致、8 links、4px pre-CTA gap（引擎变体形式）、route-close 正常、**无 Tailwind v4 display/breakpoint bug**。差异仅为已记录的变体（scroll-lock/ARIA 加固、grid-rows 面板机制）。

现在运行 text diffs + shadow sweep（验证 session-12 pin 是否保持）：
Text diffs 全部一致 ✓。运行 shadow sweep 验证 session-12 的 token pin 是否保持：
脚本对两站使用相同路由（CourseDetail 会用错误的 seed-1）。修补为 per-site 路由后运行：
Shadow sweep: **session-12 pin 保持**（无 shadow-sm 桶漂移；剩余 diff 全部为已记录的 oklab/rounded-full 形式变体）✓

现在开始 **Session 13 新审计面**。先做 focus-ring parity sweep（Tailwind v4 曾改变 ring 默认宽度 3px→1px，是重点排查项）：
**重大发现** — focus-ring sweep 揭示系统性差异：live 按钮聚焦时显示 `outline: solid 3px rgba(10,10,10,0.5)` + ring box-shadow，clone 显示 `outline: none` + **空 ring 组合**（focus ring 类未生效）。写探针脚本深挖根因：
关键线索浮现：clone 的 ring 存在但颜色是 `--ring`（近黑）而非 slate-400 —— 疑似 **v3↔v4 的 focus/focus-visible 变体顺序翻转**。直接 grep 两站已保存的 CSS 验证规则顺序：
v3 CSS 中 focus: 在 focus-visible: **之前**，但 live 实测 ring 颜色是 slate-400（focus: 的值）——矛盾。获取两站 login input 完整 class 串 + 查找 live 的 3px outline 规则来源：
Class 串字节级一致。检查 clone 的 dev CSS 中这两个规则的顺序：
顺序相同但行为相反 —— 检查两个规则在 LIVE CSS 中的 @media/@layer 包裹上下文：
检查 live-css.css 是否过期 —— 重新获取 live 当前的 CSS 文件：
Live 有 4 个 inline stylesheet（可能在 link 之后注入了覆盖规则）。检查它们的内容：
SHEET 1 是 live 的 Tailwind v3 运行时注入！继续提取 inline sheets 中的完整 focus 规则：
**根因确认**：Live 的 Base44 运行时在静态 stylesheet **之后**注入了 S1 inline sheet（含 `focus:ring-slate-400` 但**不含** `focus-visible:ring-ring`）—— 级联位置使 slate-400 获胜。现在追查 live 按钮 `3px rgba(10,10,10,0.5)` outline 的来源：
需要直接枚举 live 聚焦按钮的匹配规则。修正探针逻辑，针对 Sign in 按钮逐条列出：
程序化 focus 的伪类启发式不可靠。用真实键盘 Tab 重新做精确 sweep（完整 shadow 读取，不截断）：
输入框 ring 颜色差异已定性。还需查明 live Sign in 按钮的 `solid 3px white` outline 来源。Dump S3（9 条规则的小 sheet）：
S3 是 react-hot-toast（无关）。直接枚举 live 全部 outline 相关规则找 3px white 来源：
疑点：live 的 Sign in 按钮上 focus-visible 工具类**全部未生效** —— 可能 class 串本身不同！对比两站 Sign in 按钮的实际 className：
Class 串一致。新假设：**Base44 运行时通过 inline style 注入对比度自适应 focus outline**。Tab 聚焦后检查 inline style：
新线索：`transition-all duration-200` 使此前的按钮 ring 读取处于过渡中间态（假象）。带等待的最终探测：
**最终数据定性**：(1) login 输入框 ring 颜色真实漂移（live slate-400 vs clone 近黑）；(2) `--ring` token 有 1 单位色差 rgb(9,9,11) vs rgb(10,10,10)；(3) 按钮 ring 两端都正常触发。现在验证 /Courses、/Contact 的输入控件聚焦状态（带等待）：
两站的导航按钮 ring 一致（rgb(10,10,10) 1px）✓。但表单输入框还没被 Tab 到（nav 占了前 10 个停靠点）。扩展 Tab 范围直接聚焦表单控件：
**/Courses 与 /Contact 表单控件 focus ring：完全一致**（两端都为 rgb(10,10,10) 1px ring）✓

**focus-ring sweep 最终结论**：唯一真实漂移在 **/login 输入框**（live=slate-400 vs clone=近黑）。确认 `focus:ring-slate-400` 在代码库中的使用范围：
修复方案已明确（finding #2 HIGH）。现在进行 Session 13 的第二个新审计面：**scroll-behavior / scroll-reveal 对比**：
**Scroll 审计结论**：html scroll-behavior 两端 smooth ✓、scroll-reveal 两端无隐藏内容（parity）✓、平滑滚动动画一致 ✓。唯一差异：live 的 **body** scroll-behavior=smooth vs clone=auto（惰性差异，html 才是滚动容器）。

审计完成。共 3 个可行动发现 + 3 个方法论记录。现在验证修复计划的代码落点。先看 globals.css 结构：
globals.css 结构明确。查 live 的 body scroll-behavior 来源，并查看 e2e spec 文件的插入点结构：
Live 连 `<head>` 都是 smooth —— 检查是否所有元素都继承了这个值：
**发现 scroll 规则根因**：live 的运行时 sheet 里有 `* { scroll-behavior: smooth }`（通用选择器）——所以 body/head/所有元素都是 smooth。clone 只有 `html` 规则。可复现为一条单行修复。

现在按 session-12 的先例做**修复机制验证**（先应用候选修复 → 实测 → stash → 写计划）。应用三个候选修复：
简化为与 live 完全一致的单条通用规则：
现在是 `LoginForm.tsx` 中的发现 #1（DOM 嵌套）—— 重新组织 signin 分支，使得 OR 分隔线和表单成为 `div.w-full` 内部 `div.space-y-3` 的兄弟节点：
现在需要修正 form 结束标签处的闭合链（原结构多一层 div）。查看当前闭合区域：
验证修改后的 JSX 嵌套正确性（typecheck）：
Typecheck 通过。在 dev server 上验证三个修复机制：
Ring 修复（#94a3b8 = slate-400 ✓）和 scroll 修复（body smooth ✓）已验证。验证 DOM 结构修复和视觉间距：
**三个修复机制全部验证通过**（结构=live 完全一致、间距 24/24、高度不变）。

现在 stash 修复，保留 pre-fix build 用于 RED 阶段：
现在创建综合修复计划文档：
修复计划已创建。现在**对照代码库复审计划**——检查 e2e 文件结尾结构和现有 login spec 模式以确保对齐：
Spec 模式已明确。复审完成——计划与代码库完全对齐。现在编写 session-13 spec 块（6 RED + 2 GUARD = 8 specs）：
**RED 阶段**：对 pre-fix build 运行新 specs（修复已 stash，.next 是 session-12 基线）：
**RED 验证完成**：5 failed（3 ring + 1 nesting + 1 scroll）+ 2 passed（GUARD specs）—— 完全符合预期。检查一个失败详情确认失败原因正确，并补充第 8 个 spec（Sign in 按钮 ring 保持 near-black 的 GUARD）：
失败原因精确匹配（`#0a0a0a` vs 期望 `rgb(148, 163, 184)`）。添加第 8 个 spec（Sign in 按钮 GUARD，使用 post-transition 读取）：
**GREEN 阶段**：恢复修复，rebuild，运行 session-13 specs：
5 个通过但 3 个 ring specs 仍失败 —— 生产构建中修复未生效（dev 有效但 standalone 无效）。检查失败详情：
修复实际**已生效**！失败只是断言形式问题：生产构建解析为字面值 `#94a3b8`（= slate-400），而我断言的是 `rgb(148, 163, 184)` 形式（颜色形式变体家族）。修正断言：
**GREEN — 8/8 session-13 specs 通过**。现在运行完整门禁套件（155 specs 全量回归）：
**全部门禁通过**：lint ✓ · typecheck ✓ · 31/31 unit ✓ · **155/155 e2e ✓**（零回归）。

**阶段 3b 视觉复验**：先确认 space-y 扫描的 /login 命中已消失：
Space-y 命中消失 ✓、/login class diff 完全一致 ✓。复验 login 高度和 5 视图结构：
**Ring 像素级对等达成**：computed box-shadow slots 字节级一致（`rgb(148, 163, 184) 0px 0px 0px 4px` 两端相同）✓。Login 高度 1080/1080 字节级 ✓、移动端 −44 在已记录区间 ✓。

**Phase 4a — 截图**。查看 s12 截图脚本并创建 session-13 版本：
编写 session-13 截图脚本（含新增的 focus-ring 特写）：
23 张截图完成。验证截图文件并开始 **阶段 4b 文档对齐**：
截图验证完成。现在更新 README.md（badge 186 + session-13 描述）：
README 完成。更新 AGENTS.md（gotchas 33-34 + e2e 计数）：
AGENTS.md 完成。更新 CLAUDE.md（pyramid 31+155 + session-13 描述）：
CLAUDE.md 完成。更新 PAD（[S13] 修订 + §7.1 计数）：
补充 PAD §10 的 session-13 解决记录：
PAD 完成。更新 SKILL doc 至 v3.1.0（frontmatter + 陷阱清单 + 附录 A + 测试清单）：
Frontmatter 完成。添加 §4.4c（runtime-cascade pin 章节）并更新附录 A：
检查 SKILL doc 正文中其余需要更新的计数和会话描述：
SKILL doc 完成。更新修复计划的实际 RED 结果，然后创建 session log：
现在创建会话日志 `docs/session_22.md`：
Session log 完成。验证 .env.example 并更新 repo worklog：
.env.example 覆盖所有代码引用（NODE_ENV 为 Next.js 内建，按惯例排除）✓。更新 repo worklog：
更新共享 worklog 并检查最终变更集：
截图命名与已跟踪集合不对齐（s12 用 `mobile-menu-open--mobile.png` 等）。对齐到已跟踪名称并重新捕获：
修正：将两个 open-menu 截图重新捕获到已跟踪名称，删除重复命名文件：
截图集对齐完成（7 个就地刷新 + 1 个新增）。更新共享 worklog：
最终验证 + 提交。先快速复验 lint/typecheck 确认代码状态未变：
提交完成（`639b081`）。现在准备 SSH wrapper 推送。查看 wrapper 使用说明：
按 field-tested 流程执行 SSH 推送。写入密钥（repo 外，0600）、验证指纹、检查 shim：
Shim 就绪、paramiko 已装。验证密钥指纹并执行 dry-run：
指纹匹配记录的 operator key（`SHA256:4rAzu5gC41giPSWmIojTc1isH0FGoGiSgYJkDcMp54g`）✓。执行 dry-run：
Dry-run 干净（fast-forward `2291105..639b081`）。执行真实推送：
**推送确认**：`remote verified: refs/heads/main @ 639b081 == local HEAD`，密钥已销毁。更新 worklog 收尾并完成任务清单：
**Session 13 完成 — 已推送到 main（`639b081`，远端已验证，密钥已销毁）**

**本次核心发现**（2 个新审计面：focus-ring + scroll）：
1. **HIGH — 登录输入框 focus ring 级联翻转**：参考应用的 Base44 运行时在静态 CSS *之后*注入页面级 utility sheet，使 `focus:ring-slate-400` 在级联中获胜（slate-400 ring）；而 clone 的单一 v4 编译产物让 `focus-visible:ring-ring` 获胜（近黑色）。这是**第三类结构性盲区**（类名完全相同却无法被 class diff 察觉）。修复：globals.css 中的 UNLAYERED 级联 pin
2. **MEDIUM — signin 视图 DOM 嵌套漂移**：OR 分隔线+表单嵌在 space-y-3 内（间距仅靠 margin 折叠巧合一致）—— 潜在 v4 space-y 陷阱，已重构为参考结构
3. **LOW — 通用 scroll-behavior**：参考端用 `* { scroll-behavior: smooth }`，已 pin

**门禁**：186 tests 全绿（31 unit + **155 e2e**，+8 TDD specs，零回归）· lint/typecheck/build 干净 · 移动端菜单全量测试无 Tailwind v4 bug · 截图 8 张（含 focus-ring 特写）· 全部文档对齐（SKILL doc v3.1.0）。

**建议下一步**：可运行 `bun install && bun run test:e2e` 复验；Session 14 可考虑 print 样式表对比或 `::selection`/光标样式 sweep。
