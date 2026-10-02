工作区已存在于 commit `4b2e9ef`。我先刷新并检查所引用的文档（session_79 / remediation-plan-session38 / session_80）。
已拉取新提交 `3591d65`（新增 `docs/session_80.md`）。我来制定任务计划并审查文档。
session_80.md 是刚刚完成的 session-38 的最终日志（推送为 `4b2e9ef` + 日志 `3591d65`）。现在让我来查看 remediation-plan-session38 和仓库工作日志。
Session 38 已完成（4b2e9ef 已推送，日志 3591d65）。这是 **session-39 检查点**。现在正在审查 5 份项目文档 —— 重点是关键的状态标记，因为我需要验证所有既定契约。
已确认会话 38 结束时的工作日志状态。让我验证这 5 个项目文档中的关键状态标记（测试数量、版本、陷阱）。
Doc 标记已全部对齐至 session-38 状态（202/328/530，SKILL v3.26.0，[S38] 行）。让我验证一下 gotchas 并检查 skills 目录。
Skills catalog 已确认（可用：tdd, code-review, agent-browser, tailwind-patterns, clone-app-pat-pro）。现在让我验证一下代码库结构以及 session-38 的修改是否已生效。
环境契约已验证。让我抽查一下 session-38 的实现，然后安装依赖并运行 baseline gates。
第 38 次会话的所有更改已就绪。现在正在安装依赖并运行基线检测。
数据库已初始化。正在按顺序运行基准门禁：lint → typecheck → unit。
单元测试 202/202 ✓。接下来进行构建和 e2e 测试套件（最长的一个门控）。
**所有基准检查均通过 — 530 个测试（202 个单元测试 + 328 个端到端测试），与记录的 session-38 状态完全匹配。** 现在让我启动开发服务器并检查上一会话的审计脚本。
s38 脚本依然保留。我来启动 dev server 并将审计脚本复制到 s39。
正在运行常态对齐审计（高度 + innerText ×9 路由 ×2 视口）。
17/18 — 桌面端 `/BecomeInstructor` 显示线上站点渲染了 0ch 文本（高度 = 视口本身：一个卡住的 CSR 外壳 —— 移动端是相同的，之前的会话中 18/18）。让我单独重新探测那一个路由，以确定是暂时性问题还是真正的漂移。
**已确认 —— 之前的差异只是线上环境短暂的 CSR 卡顿**：重试 1 次渲染结果为 `h=2477`，`1052ch` —— 与克隆版本字节完全一致。等效于 **18/18 parity**。接下来进行移动端适配测试（针对 Tailwind v4 检查）和控制台扫描。
**移动端测试：通过 —— 没有 Tailwind v4 bug**（面板 375×405 @ y=64，所有 8 个链接位置相同；唯一的差异 = 文档中记录的 ARIA 加固）。现在进行控制台扫描。
**Console 12/12 clean — all standing parity surfaces green.** Now the fresh-eyes audit of the session-38 changes (the newest, least-tested-by-time code).让我完整地阅读它们。
来自 session-38 的 AI-chat 接口看起来很稳健（`Promise.race` 附加了处理程序，因此较晚拒绝的失败者不会导致 unhandled rejection —— 但让我对照测试进行验证）。让我检查一下 session-38 的测试和布局推导。
布局很稳固。现在开始设计全新的审视视角——首先，根据布局中关于 `other` map 的注释进行关键检查：每个真实页面是否都设置了自己的 `twitter:url`（按 key 页面优先），还是某些页面继承了布局推导出的那个？
所有实际页面都重申了完整载荷（`other` map 泄漏不存在）。但我在第 38 次会话的缝隙中发现了一个潜在的边缘情况：`decodeURIComponent` **在遇到无效的百分号编码序列时会抛出异常**（例如 `/%zz`）。让我检查一下这个缝隙。
该接缝（seam）已经针对无效的百分比编码设置了 `try/catch` 保护（不错）。但计划中 probed-shapes 列表里**没有针对 TITLE（标题）的百分比编码/unicode/加号成员** —— 我需要探测线上环境的原始 404 head 以查找这些形状，以及 `og:image` 维度。现在开始编写探测脚本。
让我看看前几种形状（输出已被截断）。
**Rich findings!** Key discovery: `/enc%2Fslash` — the live titles it **"Slash | NexusLearn"** (it decodes the path BEFORE splitting on `/`), while the clone's seam decodes AFTER splitting (would give "Enc/slash"). Also `/%zz` gets infra-400'd by the live. Let me verify the clone's actual behavior on these shapes.
**CONFIRMED REAL DRIFT** — the fresh-eyes headline finding: on `%2F` (encoded-slash) shapes the live decodes the path **before** splitting (title "Slash"), the clone decodes after (title "Enc/slash"). Also `/a%2F` → clone "A/" vs live predicted "A". Let me pin the live's full `%2F` contract.
**线上 `%2F` 合约已完全锁定 —— 解码后拆分假设已确认**（7/7 种形状一致：`/x%2FmyPage` → “My Page”，`/a%2F` → “A” 等）。现在让我检查一下 `og:image` 维度（线上环境托管着一张 Supabase 图片）是否已经在之前的会话中被固定/记录。
og:image 的 supabase 托管是已记录的 CDN 与本地（CDN-vs-local）差异（s21 发现 4，e2e 已固定在本地）。现在让我来探究真路由的查询维度（queries on real routes）——即线上环境的规范链接（canonicals）在 `/`、`/Courses`、`/login` 上是否保留了查询参数（queries）？
**另一个真实的偏移家族（家族 C）：线上环境的真实路由规范 URL 包含查询参数** —— `utm_*` 已被剔除，其余参数按字母顺序排序（`/CourseDetail?id=X&extra=2` → `?extra=2&id=X`），而克隆版本的 `routeMetadata` 硬编码了不含查询参数的规范 URL。让我来确定具体的处理算法。
**Algorithm pinned — and it's shared by real routes AND 404s**: utm_* (case-insensitive), gclid, fbclid, ref, mc_cid, mc_eid are dropped; the rest alpha-sorted (dupes kept); empty query dropped. This means the s38 raw-pass-through 404 canonical also drifts for utm shapes. Let me complete the exclusion list + probe encoding/dupe edges.
**排除列表已完成**：utm_*（不区分大小写）、gclid、wbraid、fbclid、msclid、dclid、igshid、twclid、yclid、_ga、mc_cid、mc_eid、ref 被丢弃；source、gclsrc、ttclid、li_fat_id、si 等被保留。值通过 URLSearchParams 语义重新序列化（`%20` → `+`），重复项稳定，空查询被丢弃。**`og:url`/`twitter:url` 镜像了处理后的 canonical。** 让我评估一下修复范围 —— 检查每个页面的元数据导出。
所有路由已经是 ƒ（动态）了——`headers()` 调用没有增加新的动态性。让我验证一下线上环境的重置规范行为，并读取 `s38` e2e guard 规范的结构。
s38 guard 仅断言路径名——兼容。让我确定最后几个契约细节：不区分大小写/确切匹配项（`?GCLID`，`?REF`）、`ref` 前缀问题（`?referrer`，`?reference`）以及重置 `?token=` 的空值边缘情况。
**完整的契约已固定**：不区分大小写的精确匹配（`GCLID`、`REF`、`Ref` 均被丢弃），`ref` 是精确匹配（非前缀 —— `referrer`/`reference` 被保留），空的 `?token=` 被保留，重置遵循统一的算法。让我验证一下 s37 重置规范和 s6 canonical 规范，以确保它们与设计兼容。
所有现有规格均与设计兼容。我来检查一下 s37 `reset` canonical 引脚，然后编写补救计划。
s37 reset pin 兼容（token 保留在处理中）。现在让我完整阅读 `metadata.ts` 以设计精准的修改。
设计已完全确定。让我获取每个页面的精确 `routeMetadata` 调用，以对转换进行规模评估，并检查 `metadata` 单元测试的导入模式（`next/headers` 的导入风险）。
All sized. Writing the session-39 remediation plan now.
计划已编写并验证。现在进入 **RED 阶段** —— 首先是单元测试规范。让我检查一下内部测试风格。
现在是 metadata 测试的新增内容以及 page-metadata 源码 pin。
`layout-source` 测试的 `landing/Home` `pin` 需要进行预期的合同变更（就像 `s38` 先例一样）。让我重新编写不使用 `helper` 的 `page-metadata` 测试，并更新那个 `pin`。
现在进行 AI-chat 加固规范的添加。
单元测试规范已完成。现在开始 e2e 测试块——插入到 s33 突发测试规范（内部规则）之前。
Now verify the RED phase — checking the `Page` type import and running the unit tests.
**RED 已验证 — 27 个失败，均符合预期**（canonical-query 导入、%2F 电池、元数据搜索、页面转换、预期合约变更）。AI 加固规范已通过（该 pin 是修复 —— 不变性成立）。现在进入 **GREEN 阶段**。
Now the not-found seam updates (decode-then-split + processed canonical).
导入路径位置不合理（位于文件中间，在 const 之后）。正在修复。
Now the metadata.ts search param + the page-metadata helper.
现在是 page-metadata 辅助函数（读取 header 的那一部分）：
现在进行 11 个页面转换。首先检查每个页面的当前导入。
正在检查重复的 Metadata 导入并转换两个 generateMetadata 页面 (CourseDetail + reset-password)。
关键检查 —— 客户端组件无法导出 `generateMetadata`。正在验证没有任何页面包含 `"use client"`：
Now the two existing generateMetadata pages — CourseDetail and reset-password simplification:
All 12 conversions done. Running lint + unit tests for GREEN:
**单元测试通过：245/245 (+43)。** 在构建之前，让我先在开发服务器上实地验证一下修复效果。
**所有修复已实时验证 —— 全部符合线上已确定的规范。** 现在开始构建 + 完整的 e2e 测试套件。
336 个通过，2 个失败 —— 让我检查一下这两个。
**规格检查失败后的真实发现**：克隆版的 **proxy** 似乎对 `/cOurSes` → `/Courses` 进行了大小写重写（渲染的页面标题为 "Courses"），而线上的则是 404，并带有派生标题 "C Our Ses"。让我检查一下代理的大小写重写逻辑。
在基准测试中，s38 e2e camel-miss 测试用例 (camel-miss shape) 已通过——让我看看它实际断言了什么，并与我的新测试用例进行对比。
这两个错误都已理解：
1. **我的规范编写错误**：`/cOurSes`（不带 X）是代理（proxy）**已记录的故意重写大小写**的形式（渲染干净的目录 —— s16/s17 故意做得更好），而 s38 的测试用例（spec）刻意使用了 `/cOurSesX` 以绕过重写。
2. **s17 规范反映的是旧的行为**：克隆版本以前只丢弃重复的 id；而线上（live）保留两者（已探测：`?token=a&token=b` → 两者都保留，顺序稳定）。这是在渲染 `firstId` pin 保持不变的情况下，故意做出的契约更改。

正在修复这两个问题：
两个规范均已修复（应用代码未更改——构建版本仍是最新的）。正在隔离运行受影响的规范以进行验证：
两者均已通过。现在开始**完整的 e2e 测试套件**（防护阶段）：
**E2E GREEN：338/338 —— 总计 583（245 个单元测试 + 338 个 E2E 测试）。** 现在进入 GUARD 阶段 —— 标准的 re-seed + 完整的 standing parity battery 测试。
**GUARD GREEN：18/18 字节完全一致，移动端测试套件完全一致（无 Tailwind v4 错误），控制台 12/12 清洁。** 现在是证明矩阵：
标题 **16/16 完全匹配**，canonicals 匹配，除了两个 identical-URL 字节格式单元格（`/?x=1` 与 `?x=1` — 路径名 `/` + 相同的搜索，仅 origin 序列化器不同）。我来看看第 3–5 部分，然后修复对比以实现 URL 规范化。
脚本因管道收到 `SIGPIPE` 信号而终止。正在重新运行且不带 `head` 参数：
**证明矩阵已完成** — 16/16 个标题字节完全相同，29/31 个 canonicals（2 个“DIFF”单元格已证实是相同的 URL：路径 `/` + 相同的 query —— 属于源序列化字节形式系列）。让我为证明文件添加注解，然后截取屏幕截图。
截图已捕获（94 张 PNG，包括 4 张新增）。现在进行文档对齐——从 AGENTS.md 开始。
现在是 PAD（[S39] 修订行）和 SKILL（v3.27.0）：
现在是会话日志 (session_81 转录 + session_82 最终日志)：
现在来看 repo worklog 条目：
现在是 **final full gate**（gotcha-41 规则 —— 在所有文档写入之后）：
**最终完整检查通过 — 583 个测试（245 个单元测试 + 338 个端到端测试）。** 现在进行 commit + push。先检查一下变更集：
我的 capture 脚本复用了冲突的名称（即确切的 s38 陷阱）。让我检查一下 `git` 中的特定名称并进行修复：
截图已整理（差异 = 已记录的远程图像变体类别，尺寸相同）。现在提交并推送 —— 正在阅读 SSH wrapper 指令：
没有 `ssh` 二进制文件 — 附录 A 的情况（与之前的会话相同）。让我阅读一下 shim 源码：
已获取 shim。正在对其进行部署，物化操作员密钥，并提交更改集 (change set)：
密钥已验证 (ed25519)。现在开始提交：
Committed `8bcd322`. Now the dry-run, then the real push via the SSH wrapper:
Dry-run clean (fast-forward `3591d65..8bcd322`). Real push:
包装器的内部验证已通过 (`remote verified: main @ 8bcd322 == local HEAD`)。我的直接 `ls-remote` 需要 `GIT_SSH_COMMAND`。正在正确地重新验证，然后进行 shred：
**Remote `main @ 8bcd322 == local HEAD` — verified twice, key shredded.** Final housekeeping — the shared workspace worklog:
**Session 39 complete — pushed to `main` (`8bcd322`) and verified.** ✅

**What ran this session:**

1. **Baseline & parity (all green):** full gate re-verified at the session-38 state (530 tests) → heights ×9 routes ×2 viewports byte-exact **18/18**, mobile battery fully identical (**no Tailwind v4 bug**), console 12/12 clean.

2. **Three fresh-eyes families → three TDD fixes (583 tests, 245 unit + 338 e2e):**
   - **The canonical query-processing contract** (headline): the live processes *every* canonical's query through a pinned algorithm — tracking params dropped (`utm_*` + 12 exact keys), kept params alpha-sorted, dupes preserved. Fixed via a new pure seam + a header-reading helper + all 12 page conversions to `generateMetadata`.
   - **The %2F decode-order drift**: the live decodes the path *before* splitting (`/enc%2Fslash` → "Slash") — fixed in the s38 seam.
   - **The AI-chat loser invariant** pinned (no unhandled-rejection crash possible).

3. **GUARD + deliverables:** full standing battery re-verified, proof matrix (16/16 titles byte-exact vs live), screenshots, docs aligned (gotcha 68, SKILL v3.27.0, [S39] PAD row), remote verified twice, key shredded.

**Suggested next:** (a) the error-boundary surface (`error.tsx` — still unpinned), (b) a Lighthouse-style score budget, or (c) the deferred logout-everywhere UI.
