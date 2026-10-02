I'll continue the task from where we left off. Let me start by refreshing the local workspace and reviewing the project documentation.
工作空间已存在。让我刷新 nexuslearn-template 仓库并检查其状态。
已拉取最新更改（新的 `docs/session_74.md`）。现在让我制定任务计划并查看项目文档。
Let me read the full AGENTS.md content and other key docs.
The files are large. Let me read them directly in chunks using bash.
这些文件行非常长。让我使用 bash 来查看它们并进行换行处理。
AGENTS.md 评审完成 —— 一个通过 36 次以上会话实现同等优化的克隆。现在让我来评审 CLAUDE.md 和 session 文档。
现在让我查看一下最新的会话文档。
我现在已经深入了解了 session-36 的状态。让我确认一下剩下的文档（README、PAD、SKILL）以及当前的 git 状态。
所有文档已审阅完毕——项目目前处于 session-36 的结束状态（455 个测试）。现在让我对照代码库验证我的理解。
Environment contract verified. Now let me check the skills catalog and test configuration.
Let me check the Tailwind v4 and clone-app-pat-pro skills referenced by the user.
现在让我检查现有的审计脚本和测试配置，然后运行基线检查。
Test configs verified. Now let me run the baseline gates in the required order: lint → typecheck → unit tests → build → e2e.
Lint and typecheck clean. Now the unit tests.
143/143 unit tests green — matches the documented state. Now the build.
**BASELINE GATES ALL GREEN — 455 tests (143 unit + 312 e2e)**, matching the documented session-36 end state exactly. Now let me run the standing parity audit against the live reference. Let me review the existing audit scripts first.
现在让我为本次会话 (s37) 调整审计脚本，然后重新注入数据并启动开发服务器。
Dev server 已启动。现在正在运行一致性审计（高度 + innerText 对比 live）。
**PARITY 18/18 byte-exact.** Now the mobile battery — the user-directed Tailwind v4 watch.
**移动端功能全面通过 — 无 Tailwind v4 bug**（这 3 处 diff 是文档中记录的、故意进行的克隆加固）。现在开始进行控制台扫描。
**所有现有的一致性检查均已通过。** 现在进行针对 session-36 更改的 open-eyed 审计以及被遗忘的密码占位符（建议方向）。让我来读取 session-36 的代码变更。
session-36 的代码阅读起来很扎实。现在让我对 live 的忘记密码流程进行一次全新的审视探测（建议的方向 a —— 即该演练中仅剩的 stub），并检查注册路由。
The signup wiring is solid. Let me check the DEPLOYMENT.md §13 drill and the LoginForm's reset views to scope the fresh-eyes probe.
The drill's step 6 is the only remaining stub. Now let me probe with fresh eyes: the rate-limiter sweep, the AI route's timeout pattern (vs the mailer's fetch), and the live's reset flow.
**Fresh-eyes finding 1: the mailer fetch has NO timeout** — a hung Resend endpoint would hang the signup route indefinitely. Let me now probe the live's forgot-password flow (direction a) and measure INP/TBT (direction c).
Key findings: the reset views are structurally identical (only the documented `aria-hidden` hardening + a lucide-version icon-path artifact differ), both sites return always-ok, and **the live's SPA returns 200 for any route** (client-side routing). Let me verify what the live actually *renders* at those reset-path guesses.
**重大新发现 —— 一个真实的功能对齐差异：** 线上环境有一个 `/reset-password` 路由，用于渲染 “Invalid Reset Link” 状态，而克隆版本返回 404。让我捕获该线上页面的完整 DOM，以映射参考结构。
**完整的契约已映射**：线上环境会为任何 `?token=` 参数渲染设置密码表单，并针对缺失/错误命名的 token 渲染“无效重置链接”。该 token 参数为 `token`。现在让我捕获设置密码表单的 DOM。
**完整的线上合约已映射** —— 包含两种视图的重置路由、表单结构、错误状态以及 400 API 合约。让我来捕获剩余的细节（页面标题、导航行为、元数据）并测量 TBT/INP 系列。
Complete contract captured. Let me probe the form's client-side validation behavior (mismatch/short passwords), then measure the TBT/INP family.
所有验证消息已捕获。现在让我来测量生产环境独立版本（方向 c）上的 TBT/INP 性能指标系列。
TBT 正常（每条路由 0–51ms）。在编写计划之前，让我先确定错误提示（error alert）在表单中的确切 DOM 位置（客户端不匹配状态）。
**警告位置已固定** — `form.space-y-6` 的直接子元素，介于 `fields` 和 `buttons` 之间。完整的参考协议已捕获。现在让我审查即将更改的文件，以验证该计划。
现在让我检查一下 metadata helper 和 login route 的现有页面结构（作为 reset-password 页面的参考实现）。
Let me check the Prisma schema and the e2e spec patterns for the DB access approach.
已理解 E2E 模式。让我检查一下 `s34SpecDb` 辅助函数以及 spec 文件的末尾。
我来检查一下代理路由和 Navbar/Footer，看看是否有对 reset-password 的引用。
The proxy passes lowercase routes through directly. Let me verify whether the live's /reset-password is case-insensitive (like content routes) or exact-match (like /login).
**大小写契约已确认**：/reset-password 是精确匹配（像 /login 一样）—— 无需更改代理。让我检查一下 sitemap 合约，然后编写补救计划。
所有契约已验证。现在让我编写会话 37 的整改计划。
计划已编写并对照代码库进行了验证。现在进入 RED 阶段 —— 我先读取现有的 `mailer` 测试以进行一致的扩展。
Now the RED phase. Writing the unit batteries first.
Now the mailer test additions (reset email + timeout battery):
让我清理一下超时测试中遗留的无用代码：
Now the route source-pin test:
现在请更新 api-guard 测试为 8 个路由的集合（这是审慎的调整——这是其自身的 RED→GREEN 步骤）：
现在让我来验证 RED 阶段 —— 新测试必须按预期失败。
RED 已验证 — 26 个测试因预期的原因而失败。让我检查一下 revoke-sessions 失败的情况（一个附带影响）：
S35 pin 检测到了特意进行的 eight-route 更新——正如设计的那样。让我更新它以匹配新的 contract：
现在进行 RED e2e 模块。让我找一下 s33 burst spec（必须保持在最后）之前的插入点。
现在正在 s33 burst spec 之前编写 session-37 的 e2e 代码块：
RED phase complete. Now GREEN — starting with the schema columns:
Now the verification.ts extension:
Now appending the reset-token functions to verification.ts:
现在进行 mailer 添加 + 超时处理：
现在重写 `forgot-password` 路由（使用 token 生命周期）：
现在让我先检查一下 rate-limit 和 request-guard 配置，然后再编写 reset-password 路由：
Individual assertions — safe to extend. Now updating the guards and adding their pins:
现在正在为新的限制条目添加 pin：
Now the reset-password route itself:
让我检查一下 logout route 的 cookie 清除模式，然后重写该 route：
现在是页面部分。让我快速检查一下 LoginForm 的客户端模式：
在编写组件之前，让我先探测一下线上重置输入框的键盘焦点环颜色（即 session-13 级联相关问题）：
这个焦点环是 `rgb(59 130 246 / 0.5)`（蓝色）——出乎意料。让我对比一下线上的登录输入框（s13 基准）：
The reset page computes blue-500/50 while login computes slate-400 — different winners. Let me find the actual winning CSS rule:
**已确认**：线上重置输入框在获得焦点时计算出 **gray-400**（继承的默认值是 runtime blue —— 此前因读取错误导致误判）。这与 s13 slate-400 pin 的级联结构相同。我来检查一下现有的 pin 模式：
Now writing the client form component with the reference classes verbatim:
Now the server page with the metadata contract:
The page needs restructuring — a single file can't mix server and client. Let me fix both files:
现在将 gray-400 级联 pin 添加到 globals.css（与 slate-400 相同的模式）：
CourseDetail 模式已匹配。现在是 gray-400 级联 pin：
Now pushing the schema and running the unit tests:
该 pin 比 fix 更字面化——实现将 mint 共享在查找之前（这是更好的 equalizer 形式）。正在更新 pin：
**UNIT GREEN: 171/171** (+28). Now lint + typecheck + build:
LoginForm 使用了 `router.push` —— 正在修复我的组件以匹配：
现在修复 mailer 测试中的 TS 错误：
All clean. Now the build:
Build passes with both new routes. Now the full e2e suite:
往返测试 spec 的 in-spec hash 使用了错误的 secret。让我检查一下 playwright config 的 webServer env：
现有的 `specs` 使用了 `E2E_AUTH_SECRET` 常量。正在修复我的 `specs`：
Now let me check the three view-state failures — likely a selector or metadata issue:
Spec locator ambiguity ("New Password" matches "Confirm New Password" too). Fixing with exact matching:
Next 的路由通告器也会匹配 `role=alert`。正在修复定位器（locator）以定位表单范围内的警报：
**所有 10 个 session-37 测试规范均已通过。** 现在运行完整的 e2e 测试套件以确认无回归问题：
上一次运行全绿（322/322）——第4次运行中的2个失败是瞬时的。让我检查一下 `test-results` 以找出根本原因：
Let me verify a potential flake source — the signup throttle count across the suite:
完整的测试套件已通过（322/322）—— run-2 的失败是由于连续运行导致的环境瞬态问题（共享了 `db/e2e.db`）。现在进入 GUARD 阶段：重新验证所有一致性（parity）表面，包括对照线上环境（live）测试新路由。让我干净地重启开发服务器：
所有既定表面均已通过。现在开始针对线上环境对新的 `/reset-password` 路由进行一致性测试：
**新路由与线上版本字节级一致 —— 4/4 高度、文本内容、标题及所有类抽查结果完全相同。** 现在展示 dev server 上的证据矩阵：
**PROOF MATRIX FULLY GREEN.** Saving it and capturing the screenshot matrix:
Let me verify the byte-stability of the modified captures against HEAD (the house convention):
Let me redo that comparison properly (the stash made it circular):
All 3 diffs are in the documented families (remote-image byte-variance + the probe-email timestamp). Now the docs alignment phase. Starting with AGENTS.md:
Now updating AGENTS.md — commands table, gotcha 66, and Where-things-live:
现在添加陷阱 66（第 65 个陷阱在 `## Where things live` 之前结束）：
Now CLAUDE.md — the counts, API surface, and pyramid:
Now README.md — badge, testing lines, and the session-37 paragraph:
The paragraph landed. Fixing the API table row (its text differed):
Now the PAD — the [S37] revision row + section updates:
Now the SKILL.md version bump and .env/.env.example:
现在进行 SKILL.md 的更新——升级版本，并使用 session-37 记录封装 `project_state`：
Now the .env/.env.example update (the reset-link note in the delivery block):
Now let me check the session-log file naming pattern from the recent commits:
遵循既定模式。让我阅读一下 session_72.md 的格式，然后编写 session_75.md（即 session-37 的最终日志）：
Now the worklog entry:
现在进入最终的完整把关阶段，在所有文档写入完成后（关于 CSS-leak 的 gotcha-41 规则）：
**FULL FINAL GATE GREEN — 493 tests (171 unit + 322 e2e).** Now reviewing the change set and committing:
已创建提交 `dcc821e`。现在进行 SSH wrapper 推送 —— 让我查看一下 wrapper 说明：
正在从附录 A 部署 paramiko shim，并提供操作员密钥：
Dry-run clean — fast-forward `d19b4ff..dcc821e`. Now the real push:
**推送已验证 — 远程 `main @ dcc821e == HEAD`。** 现在进入最终交付阶段：session-37 转录（后续的 “update session log” 提交）：
**SESSION 37 COMPLETE** — both commits pushed and verified. Let me clean up the dev server and finalize:
**Session 37 complete — pushed to `main` (`dcc821e` + `4bba1a1`) and verified.** ✅

## What ran this session

**Baseline & standing parity (all green):** the full gate re-verified at the documented session-36 state (455 tests) → heights ×9 routes ×2 viewports **byte-exact 18/18**, innerText identical, **mobile battery fully identical — NO Tailwind v4 bug**, console clean.

**The headline fresh-eyes find — a REAL functional parity drift:** probing the live's SPA reset-path guesses revealed **the live ships a `/reset-password` page the clone 404'd**. I mapped the full reference contract through the live's own UI (both view states, the exact validation messages, the token-bearing canonical, the exact-match case contract) and shipped the **complete round trip**:

1. **The `/reset-password` route** — both reference states byte-exact (verified by the new route's own parity battery: 4/4 heights + all 8 class spot checks identical vs the live), plus the full token lifecycle: forgot-password mints a single-use 32-byte token (HMAC-stored, `r1:` domain-separated), delivers the link through the mailer seam, and the new eighth guarded POST route consumes it atomically with a `sessionVersion` bump (a reset kills every outstanding session)
2. **The mailer timeout** — a 10s `AbortController` on every delivery fetch (a hung Resend endpoint previously pinned signup indefinitely)
3. **The TBT budget spec** — per-route main-thread blocking < 500ms (measured 0–51ms)

**Deliverables:** 493 tests green (171 unit + 322 e2e, zero regressions) · the ten-part proof matrix (`docs/screenshots/api-session-s37.txt`) · 4 new route screenshots · all docs aligned (gotcha 66, SKILL v3.25.0, DEPLOYMENT step 6 SHIPPED) · remote verified, key shredded.

**Suggested next:** the logout-everywhere UI (`/Settings` route), an INP field-data budget, or a Lighthouse-style score budget family.
