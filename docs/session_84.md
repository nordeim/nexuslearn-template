工作区已被重置（无 nexuslearn-template 目录），因此我重新克隆了仓库至 session-39 的结束状态（`83b4600`）。首先来审查这五份项目文档。
已完整阅读 AGENTS.md（69 条注意事项 — 此前为 68 条）、CLAUDE.md、README.md、PAD 和 SKILL v3.27.0。现在来审查 session_82/session_83 + remediation-plan-session39 + worklog 尾部。
Session 39 的结束状态已确认：583 个测试（245 个单元测试 + 338 个 e2e），SKILL v3.27.0，所有持平面（parity surfaces）均为绿色。这是 **session-40 检查点**。现在来验证环境契约并安装依赖。
`.env` 与 `.env.example` 字节完全一致，`DATABASE_URL` 为 `file:../db/custom.db`；`db/` 文件夹已被 git 忽略，将通过 `db:push` 重新创建。`bun install` 已完成（480 个包），数据库已初始化。
基准测试关卡（Baseline gates）按顺序运行：lint ✓，typecheck ✓，245/245 unit ✓，build ✓，338/338 e2e（7.1 分钟，零 flakes）— 583 个测试，与文档记录完全一致。
标准持平审计（Standing parity audit）：高度 ×9 条路由 ×2 个视口 **字节精确 18/18**，innerText 18/18 完全一致，**移动端电池测试完全相同 — 无 Tailwind v4 错误**（触发器 `md:hidden p-2 rounded-lg text-white/80` 字节完全一致，面板 375×405 @ y=64，9 个成员几何结构完全相同），控制台 **13/13 无报错**。
已审查技能目录 — 使用了 tdd、tailwind-patterns、agent-browser（方法：Playwright 脚本，遵循既定惯例）、code-review 和 clone-app-pat-pro。已克隆 Scandihaven 仓库以获取技术栈模式（其 Next 16/Tailwind v4/proxy.ts 规范与当前堆栈一致）。
全新的视角系列 A — **尾部斜杠（trailing-slash）维度**（此前从未探测过：标准固定配置仅追踪重定向）。探测线上环境：`/Courses/` **渲染**（URL 保留），`/courses/` 渲染，`/CourseDetail/?id=` 渲染 — 但 `/login/`、`/reset-password/`、`/nope/` 渲染的是 **Base44 平台的 404 页面**，带有派生的头部（"The page "login/" could not be found in this application"）。克隆版本则对每一个形状都进行了 308 重定向 — 包括在实时 404 的 URL 上提供 **已找到（FOUND）** 的页面。确实存在偏差。
**临时标志（flag）实验**：`skipTrailingSlashRedirect: true` 会使单斜杠形状流向代理，但前导 `//` 和多斜杠形状仍会在 **代理前（pre-proxy）被规范化**（无法控制 — 已记录）。验证了代理日志以确认哪些形状可以到达应用层。
**设计已根据 s24 固定验证**：s24 临时（pin）特意保留了 308 规范化（SEO 刻意做得更好） — 我的修复将其 **保留** 为代理发出的 308（相对 Location 形式），而 s17 合同保留了大小写变体的渲染。计划时发现：`NextResponse.redirect` 需要绝对 URL；适配器会对同主机进行相对化处理。
已编写整改计划（remediation-plan-session40.md） — 6 项发现，分阶段 TDD，已根据代码库验证风险说明。
**RED（红灯）**：22 个单元规范（`slash-resolution` 接口 + 源固定）+ 14 个 e2e 规范 — 验证失败（4 个修复规范在基线上失败；固定规范如预期通过）。
**GREEN（绿灯）**：`src/lib/slash-resolution.ts`（纯接口）+ 代理适配器 + 配置标志。首次尝试（手动相对 Location）导致适配器 **崩溃**（NextURL 需要绝对路径 — 已通过开发日志凭经验验证）。通过绝对目标 + 适配器相对化修复。
**陈旧构建（stale-build）陷阱**：在旧的 `.next` 上运行第一次完整的 e2e 导致 3 个失败（生产环境 500） — 编译后的分块中仍包含手动相对版本。重新构建 → 所有形状在生产环境中验证通过（`Location: /Courses` 相对格式，`/courses/` 200，`/login/` 404）。
**完整 e2e 测试通过（GREEN）：352/352（+14）。GUARD（防护）：重新运行标准持平电池测试 — 高度 18/18 字节精确，移动端电池测试完全相同，控制台 13/13 无报错。** 总计 619 个（267 个单元测试 + 352 个 e2e）。
**重大验证**：线上环境的 `/nope/`、`/login/` 404 正文在两个站点上 **字节完全相同**（"The page X could not be found in this application | Go Home"） — 克隆版的 not-found.tsx 镜像了线上环境的 404 屏幕；修复后的渲染几乎达到了像素级持平（状态码除外：实际 404 对比线上环境的 SPA 200 — 固定的 s24 刻意做得更好原则）。
全新的视角系列 B — **s17×s39 交叉乘积**（大小写变体 × 查询）：在两个站点上均验证匹配（utm-drop + 字母排序完全相同；差异部分属于已记录的 s17 刻意做得更好范围）。已固定（此前从未一起进行过规范编写）。
全新的视角系列 C — **LCP/FCP/CLS 预算**（session_82 建议的方向 (b)）：测量生产环境 — LCP 196-1396ms，FCP 136-436ms，CLS **0.00000**（包括全滚动扫描 — 显示动画设计上无 CLS）。已固定在 CWV 的“良好”阈值。
证明矩阵已写入（`api-session-s40.txt`）：斜杠矩阵 6/8 字节完全相同（2 个已记录的差异单元格已注释），组合、vitals（核心网页指标）、差异系列、环境契约。
已捕获屏幕截图：24 个标准矩阵 + 登录 × 2 个视口 + 5 个新形状捕获（`courses-slash-render`，`login-slash-404`，`reset-password-slash-404`，`nope-slash-404`）。
文档已对齐：AGENTS.md（注意事项 69 + 267/352 + Where-things-live），CLAUDE.md（金字塔计数 + 接口），README（徽章 583→619 + session-40 段落），PAD（[S40] 行），SKILL v3.28.0 + project_state，本次转录 + session_85 最终日志 + worklog 条目。
在所有文档写入后进行最终完整关卡测试（注意事项-41 规则）：lint ✓，typecheck ✓，267/267 unit ✓，build ✓，352/352 e2e ✓ — 619 个测试。正在通过 SSH 包装器进行 commit + push。
