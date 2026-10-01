I'll start by executing this comprehensive workflow. Let me first check the current workspace state and set up the task plan.
The workspace has been reset. Let me clone the repository fresh.
Repository cloned successfully. Now let me review the root documentation files.
Let me read the full AGENTS.md and other root documents.
The lines in AGENTS.md are very long. Let me read the remaining parts strategically.
I have a solid understanding of AGENTS.md gotchas. Now let me read README.md and the architecture document.
Now the Project Architecture Document:
Now let me read the key session documents — session_50, remediation-plan-session27, worklog, and session_51.
Now let me review the nexuslearn-template_SKILL.md key sections and check the project state.
I now have a clear picture. Let me validate understanding against the codebase — checking the environment contract, test configs, and key files.
All contracts validated. Now let me install dependencies and run the baseline gates.
**所有基准测试均已通过** — lint ✓，typecheck ✓，41/41 unit ✓，build ✓，**266/266 e2e ✓** — 与记录的 session-27 结束状态完全匹配。让我更新进度并查看 scandihaven 参考仓库。
scandihaven patterns confirmed (same Next 16 + Tailwind v4 CSS-first invariants). Let me check the nexuslearn repo's own skills catalog and the Tailwind v4 / TDD skills.
Now let me set up the parity audit infrastructure. First, check the scripts folder and start the dev server.
Dev server is up. Now let me create the session-28 audit scripts — starting with the dual-login script.
Both sites logged in (both return to `/` — reference behavior). Now the standing parity audit script:
All standing surfaces GREEN — heights 22/22, text 11/11, tag drift 0. Let me examine the 12 class-diff lines to confirm they're in documented variance families.
All 12 class-diff lines are the documented dark-hero gradient notation variance (v3 gradient utilities vs v4 arbitrary-value form — identical rendering). Now the **mobile-menu battery — the Tailwind v4 watch**:
The CSS escaping is doubled. Let me fix the selector:
Mobile battery is nearly all GREEN — trigger byte-identical, panel **405/405**, geometry identical. The route-change probe returned undefined on both sites (probe issue). Let me verify route-change close with a focused probe:
Route-change close verified on both (live unmounts panel, clone collapses to 0 height — equivalent visible outcome). **No Tailwind v4 bug.** Now the console surface sweep:
**Standing parity re-audit fully GREEN.** Now for session 28's fresh-eyes probe families. The session-51 transcript suggested: Lighthouse CI budget, HTTP/2-or-3 protocol posture, and offline/PWA service-worker surface. Let me pre-probe these candidate directions:
PWA surface: identical on both sites (no SW, same offline failure). Now the form-validation constraint surface probe:
Form-validation surface: IDENTICAL across all routes. Now the HTTP/2-or-3 protocol posture quick probe:
HTTP protocol: live speaks h2+h3 (Cloudflare edge), clone is HTTP/1.1 — a proxy-layer gap like brotli. Before finalizing the session's probe families, let me check two more never-swept attribute surfaces — image loading attributes and live-region announcements:
**REAL FINDINGS!** Two drifts in the image surface:
1. The clone ships `loading="lazy"` on card images where the live ships none (eager)
2. The Advanced Python course image URL differs (live: `photo-1515879218367-8466d910auj7` vs clone: `photo-1526379095098-d400fd0bf935`)

Let me investigate both — checking the seed data, test pins, and whether the live's image URL actually loads:
The live's Advanced Python image URL returns **404**! Let me extract the exact src from the live DOM and find where the clone adds `loading="lazy"`:
Found the three `loading="lazy"` sources. Now let me verify the live's broken image renders broken in the browser and check whether the clone's different Advanced Python image is documented:
The Advanced Python cover was never pinned. Let me verify in a real browser whether the live's image actually renders broken:
**Confirmed: the live renders a BROKEN image** (naturalWidth=0, malformed Unsplash ID `auj7` → 404) for the Advanced Python course on both /Courses and the landing. The clone ships a working image. Let me do a complete attribute-inventory diff on images to be thorough:
The image surface inventory is complete. Now let me check the live's Advanced Python CourseDetail page and review the existing e2e spec structure for the new pins:
Confirmed — the live's broken image renders on its CourseDetail too. Now let me review the existing spec structure for house style:
House style understood. Let me check the seed-8 (Advanced Python) entry and verify the clone's image:
Complete picture confirmed. Let me extract the exact form-constraint values for the plan, then write the comprehensive remediation plan:
All data collected. Now let me write the comprehensive session-28 remediation plan:

仓库已处于 session-27 结束状态（我之前的 session-28 工作尚未提交——正如会话中断前预期）。让我来验证一下环境并查看关键文档。
`.env` 契约已到位（`DATABASE_URL="file:../db/custom.db"`，db/ 目录被 git 忽略并按需创建）。让我查看完整的文档列表 —— 用户引用了 session_50/51。
Session 文件编号最高到 session_51.md，最新的修复计划是 remediation-plan-session27.md —— 与用户的指令相匹配。让我查看 session_51.md（我上一个被中断的会话记录）以及 worklog 的末尾，以确切了解我上次停在了哪里。
`session_51.md` confirms the repo is at the session-27 end state (pushed `558065b` + transcript). My interrupted session-28 work (audit complete, findings collected, plan not yet written) needs to be re-established. Let me review the key docs to rebuild context.
The session-27 plan pattern is fully clear. Now let me check the codebase state — the key session-28 finding locations (loading="lazy" sources, seed-8 image), .gitignore, and the last worklog entry.
我已完全掌握上下文。现在让我安装依赖并运行基准测试门控，以确认已记录的 session-27 结束状态。
Prisma 客户端需要先生成。我来生成它，设置数据库，然后重新运行门控检查。
数据库位于仓库根目录，类型检查通过，41/41 个单元测试已通过。现在进行构建 + e2e 门禁。
**所有基线检查均通过** — lint ✓，类型检查 ✓，41/41 单元测试 ✓，构建 ✓，**266/266 e2e 测试 ✓** — 与记录的 session-27 结束状态完全匹配。现在让我检查一下代码中发现的这三个 lazy-loading，并重新验证它们与线上站点的一致性。
我可以看到所有 3 个 lazy 源。现在让我启动开发服务器，并重新创建图像表面探测，以重新验证针对线上站点的发现。首先，检查 e2e 认证模式。
现在让我启动开发服务器，并编写 session-28 image-surface 探针。
The login wait needs adjustment. Let me debug the live login flow directly.
Live login 正常运行（需要大约 8 秒）。问题在于 `waitForURL` 中的 `load` 事件。让我使用 `commit` + `polling` 使探测更具鲁棒性。
**两项发现均已重新确认并提供了更详尽的数据：**
- **线上环境：0/36 张图片使用了 `loading="lazy"`** —— 完全没有懒加载；**克隆环境：33/36 张有懒加载**（3 个源代码位置导致了这个问题）
- **线上环境的高级 Python 封面图片损坏**（`photo-1515879218367-8466d910auj7`，`natW=0` → 404），而克隆环境的图片可以正常工作（`natW=600`）

在制定计划之前，让我先检查一下 `lazy-loading` 是否曾被记录为一项有意为之的决定。
文档中完全没有提及懒加载 —— 这属于未记录的偏差（`session-18` 属性类别）。让我获取线上 Advanced Python 课程的 `id` 以及损坏的 URL 详情，以便用于制定计划。
循环匹配到了“Data Science with Python”。让我精确地定位到“Advanced Python Programming”。
**已端到端确认**：线上的 Advanced Python（id `...12a2`）在其所有三个页面上都携带了损坏的 URL `photo-1515879218367-8466d910auj7` (natW=0)。现在让我重新验证来自已中断审计的其他探针系列——form-validation 约束和 mobile-menu 电池（用户明确指出的）。
表单约束：**在所有 5 个路由上完全一致** ——已确认。移动端触发器选择器不正确；让我检查一下实际的 `Navbar` 触发器标记。
触发类在两个站点上**字节完全相同**。在两个站点上使用不同的选择器进行面板探测均失败了——让我检查一下实际的面板结构。
两个站点上的**移动端菜单组合完全相同** — 触发器字节完全一致，面板几何结构完全相同（NAV h=469 = 64px 导航栏 + 405px 面板；链接位于 y 81/129/177/225/273/321/369/417，高度为 44×7+36）。**未发现 Tailwind v4 错误。** 让我针对该记录快速重新验证一下剩下两个文档层面的发现（HTTP 协议态势 + PWA 表面）。
PWA 界面一致（0 个 SW，两者清单相同）。所有审计数据均已重新验证。现在让我研究一下 e2e 规范结尾处的规范风格（session-27 块）以及用于 source-guard 的单元测试清理模式。
seed-8 条目和 imagery-pin 块确认了缺口（从未固定 Advanced Python）。现在让我检查需要更新的文档版本（README 徽章、CLAUDE 金字塔、PAD、SKILL 版本、DEPLOYMENT §8）。
所有文档版本已映射。让我对所有路由（包括我 3 路由探测未涵盖的路由）上的图片进行一次快速普查，以确保规范覆盖完整。
完整图像统计已完成：lazy bearers 仅限于 `/`、`/Home`、`/Courses`（3 个源头）；所有其他路由已经是 eager/empty。现在我已经获取了所有数据 —— 正在撰写全面的 session-28 修复计划。
计划已编写完成。现在开始针对代码库验证该计划 —— 首先验证 `live` 的 `/About` 图片（我在 `spec` 路由集中声明的唯一未验证的表面）。
/About img **在两个站点上字节完全一致**（相同的 `src`，`alt="Team"`，`eager`）—— 计划中的每个条目现在都已对照代码库和线上环境进行了验证。开始执行 **阶段 1 [1a] — 红灯规格**。
现在进入 **RED 阶段** —— 针对基准构建运行 session-28 规格（预期会出现 eager-loading 失败）。
**红灯阶段已确认** —— eager spec 刚好在预测的地方失败了（33 张懒加载图片），3 个预设引脚（pins）按设计通过（绿色）。现在是 **[1b] 修复** —— 移除三个 `loading="lazy"` 属性。
MultiEdit 是原子性的 —— 第二次编辑的缩进不正确。让我用正确的缩进重试。
第一次修改已应用。让我检查一下 avatar img 部分。
Now the testimonial avatar in page.tsx:
3 项修复均已应用。现在验证源文件中不再包含 lazy 属性，然后编写 [1d] 单元守卫。
Now [1e] — the seed-8 pin in the imagery parity block:
Now [3c] — the variance comment on the seed-data entry itself, then rebuild and re-run the specs:
44 个单元测试已通过 (41 + 2 个 `img-attribute` 防护 + 1 个 `seed` pin —— 比计划中的 43 个多了一个，我将修正这个计算)。现在重新构建并重新运行 `session-28` 规范 —— 预期会变成 **绿色 (通过)**。
**绿色阶段已完成** —— 完整的 TDD 循环：RED（33 张延迟图片）→ FIX（3 个源码）→ GREEN（4/4）。现在进行完整的 e2e 回归测试（预期 270/270）。
**270/270 e2e GREEN** — 零回归。让我验证开发服务器（热重载）现在是否渲染了 eager contract，并且布局未受影响。
所有路由现在都已 **完全符合线上的约定**。现在进入第三阶段 —— 文档对齐。首先，修正计划中的算术计算（44 个单元，314 个总数）。
现在是 [3a] — AGENTS.md 注意事项 57 + 命令表格：
Now update the AGENTS.md commands table counts:
Now [3b] — DEPLOYMENT.md §8 protocol posture:
Now [3d] — README updates (badge, counts, session-28 paragraph):
I spotted line 134 still says 41 unit tests — updating it:
Now CLAUDE.md — the test pyramid + session-28 family:
CLAUDE.md done. Now the PAD — [S28] revision entry + §7.1 row:
[S28] entry added. Now the PAD §7.1 Test Distribution table:
PAD done. Now the SKILL doc — v3.15.0 → v3.16.0:
Surface 18o added. Now the version bump + project_state update:
SKILL doc complete (v3.16.0). Now [4a] — verify `.env.example`, then [4b] screenshots:
`.env.example` 已验证：字节完全相同，覆盖了每一个面向用户的 `process.env`。现在进行截图 —— 让我先检查一下标准配置：
完整的标准配置为 67 个 PNG + 3 个文本证明。由于捕获脚本随工作区一同丢失，我将重新创建它。让我检查一下 `LoginForm` 视图切换器以处理有状态的捕获：
现在我将编写全面的截图捕获脚本——标准集 + session-28 新增内容：
Interesting — the signup view's password input carries `minlength="8"` (a client-side view my form probe never inventoried). Let me verify the live's signup view matches, and fix the capture script:
**截图捕获过程中发现的新差异**：克隆的注册密码输入框带有 `minlength="8"`，而线上的则没有。让我检查一下这是否是一个有记录的慎重决定：
`minLength={8}` 是未记录的漂移。让我检查一下 git 历史记录，看看它是什么时候被引入的，以及线上环境是否附带 JS 端的长度检查：
**发现实际功能差异**：线上环境在 JS 中强制执行最小 8 个字符的长度限制，并显示页面内错误提示（“密码长度必须至少为 8 个字符”）；而克隆版本中的 `minlength` 属性则是通过浏览器原生 tooltip（无 DOM 错误提示）来拦截提交的。让我来探究这两个错误路径：
Mismatch errors are identical. The divergence is precisely: clone-only `minlength="8"` (native tooltip vs the live's in-DOM error) + slightly different JS error text. This extends finding 3 — fixing toward the live now:
现在扩展 session-28 的 e2e 代码块，加入 client-view 约束 + 错误文本固定：
所有 6 个 session-28 规格均已通过（GREEN）。现在修复捕获脚本中 `strict-mode` 的问题，并重新运行截图：
Newsletter is an idempotent upsert — re-running the full capture:
Delayed-route race after `unrouteAll` — let me make the route handlers tolerant:
已捕获完整的标准集。现在是会话-28的文本校对 —— 双服务器镜像清单：
Proof captured: **37 imgs, 0 lazy on both servers**. Now updating all docs with the extended finding 3b (login client-view constraint) and corrected counts (272 e2e / 44 unit / 316 total):
Now updating AGENTS.md gotcha 57 + commands table with the extended finding:
Now README, CLAUDE.md, PAD, and SKILL updates with the final counts:
All docs aligned. Now writing the session log `docs/session_52.md`:
Now the final gates in order — lint → typecheck → unit → build → e2e:
**所有测试均已通过** — lint ✓ typecheck ✓ 44/44 unit ✓ build ✓ **272/272 e2e ✓**。现在进行 CSS-leak 规范重跑（最后一项 — session-15 流程规则）：
CSS-leak 规范已清理。现在，在提交之前，追加仓库工作日志条目：
现在进行提交。让我检查一下完整的变更集：
The change set is complete. Committing to main:
已提交 (`83841b9`)。现在进行 SSH-wrapper 推送 —— 首先回顾一下操作流程：
已理解。正在检查 SSH 可用性并部署 shim（如有必要）：
paramiko 5.0.0 installed. No OpenSSH binary — deploying the paramiko shim outside the repo:
密钥已解析（ed25519，指纹已验证）。现在使用显式远程进行试运行：
Dry-run authenticated — fast-forward ready (`609eb39..83841b9`). Executing the real push:
**推送已验证** — 远程 `main @ 83841b9 == local HEAD`，密钥已销毁。最后一步 — 工作区工作日志：
**Session 28 complete — pushed and verified** (`83841b9` on `main`, remote confirmed, key shredded). 🎉

## What was done

**Continued the interrupted session from scratch** (workspace was reset):

- **Baseline re-verified** — re-cloned at the session-27 end state; all gates green (266/266 e2e)
- **Audit re-established** — image surface, form constraints, mobile battery (byte-identical trigger + 405px panel geometry — **no Tailwind v4 bug**), HTTP protocol (h2/h3 = proxy-layer), PWA (identical)
- **Two TDD source fixes**:
  1. **Eager loading** — removed undocumented `loading="lazy"` from 3 sources (the live ships 0/36; the clone had 33/36) via a genuine RED→GREEN cycle
  2. **Login client-view drift** (found during capture) — the signup password's session-5 `minLength={8}` vs the live's no-attribute in-DOM error UX; fixed + pinned with the live's exact error text
- **Pinned**: the working Advanced Python cover (the live's own URL is a malformed Unsplash id that 404s on every page), the eager contract + source-level guard, the form constraints
- **316 tests green** (44 unit + 272 e2e, zero regressions), 74 screenshots incl. the dual-server proof, docs aligned (gotcha 57, SKILL v3.16.0, PAD [S28], DEPLOYMENT §8, session_52)

**Suggested next steps**: review `docs/session_52.md` + `docs/remediation-plan-session28.md` for the evidence trail. Future directions: a Lighthouse CI budget pass, a print/PDF-stylesheet refresh, or a locale/timezone formatting probe.
