# Session 44 — Transcript Log

我将恢复执行这个多阶段任务。工作区已存在，先检查 git 状态和我的 agent worklog，然后 git pull。
Pull 成功 — 所有者的 `docs/session_95.md` 已落地（2745d48，session-43 的会话记录）。这是第 44 轮会话。现在审查会话历史文档（session_94 + remediation-plan-session43 + repo worklog 尾部 + session_95）。
会话历史清晰：session_94 建议的三个方向 = (a) 错误边界升级层级（error.tsx 自身失败 → global-error）、(b) 页面生命周期/Tab 可见性表面、(c) Safari 式 7 天 ITP 截断下的 web-storage 配额/逐出表面。现在审查五个核心文档（AGENTS.md 72 条注意事项、CLAUDE.md、README、PAD、SKILL v3.31.0）——AGENTS.md 行很长，用 fold 分段读取。
核心文档已掌握。现在对照代码库验证理解：env contract（.env == .env.example、DATABASE_URL="file:../db/custom.db"、db/ 在仓库根目录）、四个工具配置的 skills/ 排除、package.json。
环境契约全部验证。按既定顺序跑基准门禁：lint → typecheck → unit（307/307）→ build → e2e（8.9m 前台运行）。
**基准门禁：685/685 全绿** —— 与记录的 session-43 结束状态完全一致。现在跑常设一致性电池（heights ×9 ×2 + 移动端 + 控制台）——注意后台进程收割器：dev 服务器必须在同一条链式调用里启动、审计、停止。
**常设电池全绿**：heights 18/18 字节级一致；移动端电池完全一致（无 Tailwind v4 bug —— 触发器字节一致、面板 389×405 @ y=64、9 成员同几何）；控制台 13/13 干净。
现在是 fresh-eyes 阶段。四个探针系列（session_94 的三个建议方向 + 第四个新表面）。先研究代码库相关表面：error.tsx 的渲染路径里唯一一个调用时查找的调用 —— `console.error("route render error", error)` —— 这就是升级探针的第二接缝。
四个探针脚本编写完成（s44-probe-escalation / lifecycle / storage / offline）。生产独立服务器在 :3100 启动（与 e2e 同环境），逐个运行。
**系列 A 确认 —— 升级层级完全按 s43 的双层接线工作**：error.tsx 自身的渲染失败（键控 console.error 毒药）升级到用户的 global-error —— Navbar + Footer 消失（根布局被替换 —— 区别于 error.tsx 的决定性证据）、文档形状保留、reset() 完整恢复（navCount 1 + 真实内容 + URL /Courses）。控制组干净。
**系列 B —— 页面生命周期普查**：live 的平台注册 pagehide + offline×2 + visibilitychange×2 + online×1（Base44 遥测 —— 平台家族）；clone 零应用级生命周期监听器（只有 Next 框架自身的 pagehide/pageshow + 应用的 scroll/keydown/popstate 家族）。CDP freeze/resume 在 headless 探针上下文里接受但不暂停 JS（探针上下文注记，两站相同）。
**系列 C —— 存储/cookie/ITP 普查（真实结构性发现）**：live 的登录后认证是 localStorage-token 式 —— 全程零 cookie（JWT 走可脚本写入存储，~90 天 exp + 5 个平台键 + mixpanel IDB 73,728B）；clone 是 HttpOnly nexus_session（secure、Lax、604,796s ≈ s32 的 7 天 maxAge、document.cookie 空、零客户端存储）。ITP 判定：live 的 token 会被 Safari 的 7 天可脚本写入存储上限清除 —— 与 clone 的 7 天 maxAge 相同的有效窗口、相反的方向；clone 的 HttpOnly 免受 ITP 且脚本不可见。
**系列 D —— 离线层级**：live 的 SPA 离线下软导航成功（包内路由；陈旧标题 —— s16 家族再现）；clone 的 RSC 通道死亡 → s42 的浏览器导航回退撞上离线墙（浏览器自己的错误页 —— s16/s24 架构家族，beyond-reference）。API 层：clone 的 newsletter 瞬时失败进 catch（待处理 "..." 只在请求真正在途时可见 —— 第一次探针的合成输入注册到了 clone 表单但没注册到 live 的受控输入，改用原生输入 page.fill 重测）；live = 永久 "..."（平台无 catch 家族）。
编写补救计划 docs/remediation-plan-session44.md（4 项发现、计划时验证全部通过：键控字符串唯一性 grep 验证、生命周期家族 grep 零匹配、e2e 插入点、期望计数）。
TDD 执行：单元 RED（tests/lifecycle-source.test.ts 的 4 个源码 pin —— 一个阈值修正后 4/4 绿）+ e2e 升级对（2 个 spec 一次通过 —— pin-spec 按设计绿，探针已证明契约）。GUARD：完整门禁重跑 —— 311/311 单元 + 380/380 e2e = **691**；常设电池整体重跑绿（18/18、移动端一致、13/13）。
证据阶段：证明矩阵（api-session-s44.txt —— 升级矩阵、生命周期普查、存储/ITP 普查、离线矩阵、env 契约 + 门禁摘要）+ 41 张截图（标准矩阵 + s40-s43 形状重拍 + 新 escalation-boundary ×2 + landscape 对）。重拍的 4 张像素差异已定性（Unsplash CDN 变体 + 抗锯齿尘埃 —— 结构表面字节级一致，电池是证明）。
文档对齐：AGENTS.md（注意事项 73 + 计数 311/380）、CLAUDE.md、README（徽章 691 + session-44 段落 —— 一处编辑滑手重复行已修复）、PAD（[S44] 行）、SKILL v3.32.0（含 SKILL.md 损坏的前 Appendix A 残片清理 + frontmatter 收尾 `---` 修复）、session_96/97 日志、repo worklog 条目。
最后完整门禁（注意事项 41 规则 —— 文档写入后重跑 CSS-leak 规范），然后 commit + 通过 SSH wrapper 推送到 main。
