我将恢复执行这个多阶段任务。我先设置好任务追踪并检查当前的工作区状态。
The workspace already exists with substantial prior work. Let me check the git state and my worklog before pulling.
我的 Agent 工作日志显示 session 40–42 已完成（repo 在 session-42 结束状态：659 个测试通过，commit 5f4f1ac）。这是 session 43 的处理流程。本地树是干净的；现在让我拉取 owner 的最新更改（根据提示，应包含 `docs/session_92.md`）。
Pull 成功了 — 所有者的 `docs/session_92.md` 已落地。现在让我审查一下会话历史文档。
会话历史非常清晰——这是第 43 轮会话。现在让我来查看补救计划和仓库工作日志。
第 42 阶段的情况已完整。现在让我审查一下核心文档——AGENTS.md、CLAUDE.md、SKILL.md 以及技能目录。
AGENTS.md 和 CLAUDE.md 是包含长行的密集文件。让我从持久化输出中完整读取它们。
让我换个方法试试——将密集的文件折行成易于阅读的格式。
The output limit keeps truncating. Let me read in chunks.
已掌握所有 71 条注意事项。现在开始处理 CLAUDE.md。
Now the README and skills catalog.
目录很大。让我查找本次会话的相关技能（Tailwind v4、TDD、agent-browser、clone-app-pat-pro、code review）。
已确定相关技能（agent-browser 方法论、tdd、tailwind-patterns、code-review 准则 — 与之前会话的使用方式相同）。现在让我对照文档状态验证代码库。
Env contract 已验证。接下来检查 tool configs 和 package.json。
配置已全部验证。现在正按既定顺序启动基准测试门控：lint → typecheck → unit。
Lint ✓, typecheck ✓, 290/290 unit ✓. 现在开始构建，并在其运行时检查 PAD 修订行。
构建 ✓。PAD 修订行已确认。现在开始 e2e 基准测试——这是一次耗时约 7.5 分钟且无重叠（non-overlapping）的前台运行（遵循 RAM 争用经验教训）。
**基准门限：659/659 —— 已确认记录的 session-42 状态** (lint ✓，typecheck ✓，290/290 unit ✓，build ✓，369/369 e2e ✓)。现在让我更新进度，并检查现有的审计脚本，以运行常规的 parity battery。
让我检查一下移动端和 console 审计脚本。
现在我将启动开发服务器，并在单次链式调用中运行完整的常设一致性测试套件（parity battery）（受限于后台任务清理器的限制）。
**Standing parity battery: ALL GREEN** — heights 18/18 byte-exact, mobile battery IDENTICAL (no Tailwind v4 bug), console 13/13 clean. Exactly the documented session-42 end state.

Now for the fresh-eyes phase. The session-91/92 suggested directions: (a) the `global-error.tsx` tier, (b) the dynamic `opengraph-image.tsx` renderer, (c) the color-scheme/no-dark-mode contract. Let me study the codebase surfaces relevant to this session's probe families.
让我研究一下 error.tsx、ScrollRestoreNormalizer，以及 Navbar 挂载在何处 —— 这就是 global-error 探测将针对的 root-crash 表面。
已理解架构：Navbar 是按页面渲染的（其崩溃会被 `error.tsx` 捕获）；根布局唯一的客户端组件是 `ScrollRestoreNormalizer` —— 其 `popstate` 监听器注册是根层级崩溃注入点。不存在 `global-error.tsx` —— 确实存在实际漏洞。

让我检查一下 Playwright 配置的 webServer env（这是手动进行生产环境启动所必需的），然后编写本会话的探测脚本。
现在我将编写本会话的四个全新探针系列（按照内部脚本规范）。首先是标题系列——根本布局崩溃层级。
已编写全部四个探测脚本。现在首先启动生产环境独立环境并运行 root-crash 探测。
**系列 A 已确认 —— 存在实际漏洞**：在没有 `global-error.tsx` 的情况下，根路径崩溃会显示 Next 16 的默认 Chrome 浏览器（“此页面无法加载 / 重新加载 / 返回”），这还会**清除 `<html lang>` 属性和 body 的设计类**（htmlAttrs: 仅为 "id"）。生产环境的根路径层级 = 冻结的 shell/空白，无恢复 UI。控制组确认该崩溃是由蓄意破坏引起的。

现在针对生产服务器运行颜色层级探测。
Family B 提供了详实的发现：深色高度 9/9 字节完全一致，`forced-colors` 在所有采样颜色上完全一致，但人口普查显示**该克隆版本自带 1 条 `prefers-color-scheme` 规则，而正式版本中为 0 条**——很可能是 s18 zinc 块的 `light-scheme` 封装容器，这会导致深色模式访问者在与正式版本对比时禁用 `/login` 的 `zinc` 主题。让我来确认一下。
Confirmed — the zinc block is wrapped in `@media (prefers-color-scheme: light)` while the live's runtime zinc sheet is unconditional. Let me verify the actual dark-tier drift empirically on both sites before planning the fix.
**Drift confirmed with precision**: under dark scheme the live keeps zinc `rgb(9,9,11)` on `/login` (its runtime sheet has no media wrapper) while the clone deactivates the zinc block → neutral `rgb(10,10,10)`. The light tier matches (the s18 pin working). The fix is clear: unwrap the block.

Now the intermediate-viewport probe (family C).
**类别 C：45/45 字节完全一致**（涵盖所有五个中间层级），且横屏移动端菜单完全一致——所有者要求的移动端导航比较已在一个全新的视口层级上通过。现在进行长周期稳定性探测。
Probe 4 存在一个脚本 bug —— `MEASURE` 字符串缺少末尾的 `()`（导致返回了箭头函数本身，即 `undefined`），而且线上环境限流了快节奏的导航（出现 7 次 429 错误 —— 这是探测伪影，需要更慢的节奏）。我来把这两个问题都修复一下。
**系列 D：稳定** —— 两个站点均无节点漂移，确定性导航轮次计数，控制台零错误。所有四个探测系列均已完成。现在，在编写补救计划之前，让我先验证一下规范结构：s42 崩溃规范（进行镜像）、zinc 引脚（以确认 unwrap 是安全的）以及插入点。
这些模式非常清晰。让我检查一下用于镜像的单元源规范模式。
现在让我查看 `globals.css` 中的完整 zinc 代码块，以规划解包（unwrap）编辑。
所有结构已映射。让我运行剩余的计划时间验证：目录网格类（断点引脚）、e2e 是否涉及 live，以及 `emulateMedia` 对 `forcedColors` 的支持。
All plan-time validations pass (grid: `md:grid-cols-2 lg:grid-cols-3`; e2e is clone-only; `emulateMedia` supports `forcedColors`). Now writing the remediation plan.
计划已编写并验证。现在执行 TDD —— 首先是 RED 阶段：单元测试规范。让我先检查一下中性 root ring 值和 e2e 规范的尾部结构。
已理解 Spec 结构。现在正在编写 RED 单元规范。
让我来修复那个规范中的一行乱码。
现在是 zinc 源码规范。
在编写 `e2e` 区块之前，让我先确认一下 `Navbar` 桌面行和 `catalog` 卡片的具体 `selector`。
选择器已确认。现在开始编写 session-43 的 e2e 测试块。
已插入 E2E 测试块。现在开始验证 RED 状态 —— 先进行 `typecheck` 和 `lint`，然后预期必须失败的单元测试规范（unit specs）。
Unit RED 已验证（15 个失败，符合预期）。但存在两个 TS 错误 —— `querySelector("nav")` 的空值处理问题。正在修复这两处。
**E2E RED 已完美验证**：3 个修复规范失败，6 个钉住/固定规范通过。`typecheck` 中还有两个 TS 错误需要修复（Element 上的 `offsetParent`）。
TS 已修复。现在进入 GREEN 阶段 —— 首先实现 `global-error.tsx`（文档注释需避开 `pins` 匹配的禁止字面量 —— 这是 `s42` 的教训）。
现在开始进行 zinc unwrap —— 移除 `globals.css` 中的 media wrapper 并更新对应的文档注释。
两处 GREEN 修改已完成。正在验证：typecheck + lint + full unit suite。
Unit GREEN: 307/307 (+17)。现在进行构建 + 针对性的 E2E GREEN 运行。
Zinc 测试规范已通过（共 7 个），但两个 `global-error` 测试规范仍然失败。让我检查一下失败详情。
h1 "500" 没有渲染出来。让我看看 Playwright 在失败时捕捉到的内容。
快照显示仍然是 Next 的默认边界——构建产物可能已过时，或者服务器未正确重启。让我来诊断一下。
The build contains global-error but the hydration-time root error still hits Next's built-in fatal page. Let me study how Next 16 actually wires the global-error boundary.
关键的架构洞察 —— 外层边界使用的是内置组件（框架级故障）。让我找一下用户的 `global-error` 在 `segment tree` 中的位置。
现在我明白了其连接方式：用户的 `global-error` 仅包裹 **RootLayoutBoundary**（根布局树），而路由自身的组件（HistoryUpdater —— 也用于注册 popstate）则位于其上方，在外置的内置边界下方。我的破坏行为击中了路由的注册逻辑。让我探查一下实际的注册顺序。
仅存在两处注册——且在第 2 处抛出异常会触发内置默认值，而在第 3 处抛出异常则毫无影响。让我确认一下分别由哪个 chunk 拥有。
**确凿证据已确认**：chunk 29risk = ScrollRestoreNormalizer（注册 #1，用户的 root-layout 树）；chunk 0542 = 路由（注册 #2）。破坏操作必须**仅在第 1 次注册时触发**——即用户树内部的错误，这是用户的 `global-error` 边界（boundary）能够捕获的唯一错误。正在更新 `e2e` 破坏操作。
让我清理掉第一段 spec 中残留的重复注释块。
First spec passes — the boundary renders and `reset()` recovers. The second fails because `addInitScript` re-arms on the anchor's full reload (a persistent defect would crash every reload). The spec must model the transient defect being cleared — via a spec-side disarm flag that survives the reload.
**全局错误规格均为 GREEN。** 现在进行 GUARD 阶段 —— 完整的 e2e 套件（预期 378）。
The combined call exceeded the time limit. Splitting into separate calls — unit + build first.
**已通过：总计 685** — 307 个单元测试 + 378 个 e2e 测试，零回归。现在开始进行常规的一致性测试套件重新运行（取消 zinc 的包裹操作影响了 globals.css — 这是没有任何变动过的证明）。
**GUARD 已完全通过** — 18/18 字节级精确一致，移动端完全相同，控制台 13/13 无报错，`zinc light-tier` 控制 intact。现在进入证据阶段。让我研究一下 `s42 proof-matrix` 和 `capture` 规范。
现在正在编写 session-43 的 proof-matrix 生成器和 capture 脚本。
capture 脚本需要修复 —— `global-error` 捕获缺少了 `addInitScript` 的蓄意破坏，并且必须在后续导航中保留。
现在正在运行 proof matrix（需要同时用到 prod 和 dev 服务器）。
证明矩阵已写入。让我验证一下该文件中的 Part 1–3 判定结果。
All verdicts PASS. Now the screenshot capture matrix.
已捕获 39 张截图。现在进入文档对齐阶段。让我验证文件命名并检查当前的 AGENTS.md 计数行。
现在进行文档对齐。首先是 AGENTS.md —— 包含统计结果、gotcha 72 以及“内容位置”（Where things live）。
第 18 行仍然显示为 “369 个 specs incl.” —— 正在修复。
现在记录陷阱 72 和“内容位置”更新。
现在处理 CLAUDE.md。
接下来处理 README —— 徽章和 session-43 段落。
现在处理 PAD [S43] 修订行。
我错误地合并了 S42 行 —— 我的 `old_str` 占用了它的头部。正在修复连接处。
PAD 已修复。现在进行 SKILL.md 的版本更新。
SKILL 描述内部的一个计数需要更新。
现在是会话日志 —— `session_93.md`（对话记录）和 `session_94.md`（最终日志）。
现在是 Repo 工作日志条目。
所有文档已对齐。现在进行最后的全量门禁检查（`gotcha-41` 规则：在写入所有文档后重新构建，确保 `CSS-leak` 规范验证最终的树状态）。首先查看变更集。
变更集正确（请注意，31 个重新捕获的画面中有 30 个字节完全一致——这是渲染未改变的证明）。现在进入最后一关：lint → typecheck → unit → 全新构建。
**最终关卡完全通过：685**（包括 `CSS-leak` 规范在内的 378/378 e2e）。现在进行提交 + 推送。让我来查看 SSH 封装技能文档。
已理解 wrapper 程序。现在提交变更集，然后通过 wrapper 进行推送。首先是提交：
试运行（Dry-run）成功。现在进行正式推送。
**推送已验证：`main` @ `b2966b0` == 本地 HEAD** —— 封装器已验证远程引用，跟踪引用已同步，操作员密钥已销毁。（包裹自身的临时密钥被销毁后，手动执行的 `ls-remote` 失败是预期内的 —— 封装器自身的验证已经证实了此次推送。）

最后的收尾工作：清理残留的服务器，并追加我的 Agent 工作日志记录。
**会话 43 已完成 — 已推送至 `main` (`b2966b0`) 并通过验证。** ✅

**本期运行内容：**

1. **基准测试与一致性对齐 (Baseline & parity, 全部通过)：** 在 session-42 状态下重新验证了 659 个测试 → 高度 18/18 字节级一致，移动端电池测试一致（未发现 Tailwind v4 Bug），控制台 13/13 无报错，环境协定完好。

2. **四个全新的探测系列 → TDD 修复与固定（当前共计 685 个测试：307 个单元测试 + 378 个 e2e 测试）：**
   - **根崩溃层级 (Root-crash tier) (核心重点)：** 缺失 `global-error.tsx` 导致 Next 16 的默认配置剥离了整个文档（没有 `lang`，也没有类名）。通过 Next 的接线 (wiring) 发现了双层架构，并交付了带有保留文档结构 + 纯锚点恢复功能的显式边界。
   - **色彩方案层级：** zinc 块的深色模式去激活在深色访客模式下与线上环境产生偏差 — 已取消包裹；强制色彩 (forced-colors)、深色高度以及声明计数均已固定。
   - **中间视口：** 45/45 字节级一致（包括 md-768 精确边界到横屏 667），横屏移动端菜单完全相同。
   - **长期稳定性：** 两个站点在 30 个过滤器循环中均无节点漂移。

3. **交付物：** 证明矩阵、39 张截图、`.env.example` 已验证、所有文档已对齐（已记录 gotcha 72，SKILL v3.31.0）。建议的动态 og-image 渲染器已评估并**拒绝**，理由涉及三个合约。

**建议后续步骤：** (a) 错误边界升级层级 (error-boundary escalation tier)，(b) 页面可见性/生命周期 (page-visibility/lifecycle) 表面，或 (c) 针对会话窗口的 ITP cookie 截断探测。
