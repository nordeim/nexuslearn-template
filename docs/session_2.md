Now let me validate the actual codebase against the documented state. Checking env, DB paths, and configs:
Key finding: repo `.env` already has the right `DATABASE_URL`, but the dev `custom.db` lives **outside** the repo (`/home/z/my-project/db/custom.db`) — the sandbox parent `.env` absolute override was winning. Also, `.env` comments reference `src/lib/db-path.ts` which may not exist. Let me inspect the actual resolver and code files.
Found real issues already: `package.json` name is `activity-map` (scaffold leftover), `.env` comments reference non-existent `src/lib/db-path.ts`, and the dev DB lives outside the repo. Let me continue validating configs and tests.
Structure checks out. Note: `vitest.config.ts` header comment still references the old scaffold project's domains ("router, clarify questions, plan sanitizer, check-in mapping, db-path resolution") — another alignment issue. Let me run the baseline gate to confirm the current state.
Unit tests 5/5 pass. Now let me diagnose the DATABASE_URL resolution issue empirically — which .env wins when running from the repo:
**Root cause confirmed**: bun walks up and loads the parent `/home/z/my-project/.env`, whose absolute `DATABASE_URL` wins over the repo's `.env` — that's why the dev DB landed outside the repo. The repo's own convention is correct; the sandbox artifact is the problem.

Now let me scan for other scaffold leftovers and review the critical Navbar component:
Scaffold leftover map is now clear. Let me review the critical Navbar component and docs directory:
Navbar is properly hardened. Let me check the remaining config files and DEPLOYMENT.md:
`docs/DEPLOYMENT.md` is entirely about **ORBITAL** — the scaffold's previous project — full rewrite needed. Let me check the repo's `scripts/` leftovers and login route:
Confirmed more ORBITAL leftovers in `scripts/`. Let me review the remaining core configs:
Core configs are solid. Let me quickly verify globals.css critical tokens, then check the live site for parity drift:
`globals.css` 变更无误（`hsl()` 包装 + 固定的调色板完好无损）。在规划之前，让我先检查一下代码库的技能目录，以寻找规划辅助工具：
技能已确认。现在让我启动开发服务器，并对照线上站点运行一致性检查。首先检查是否存在残留的服务器进程：
A dev server from session 1 is still running on :3000 — I can use it for the parity check. Let me load the agent-browser skill for the comparison workflow:
Now let me run the parity comparison — live site vs clone, starting with the landing pages:
Structure is close (nav-link doubling is just the clone's always-in-DOM mobile panel — hidden via CSS). But sections differ: live 8 vs clone 9. Let me enumerate:
All 8 content sections match 1:1 — only difference is the clone wraps the hero in `<section>` while live uses another element. Let me check the live hero element and then compare the screenshots visually:
近乎完美的匹配 —— 标记中存在两处细微差别：线上环境的 hero 组件是 `DIV`（而克隆版本是 `SECTION`），线上环境的渐变使用了纯 sRGB 插值，而克隆版本（Tailwind v4）使用的是 `in oklab`。现在让我对比一下登录和仪表板：
实时仪表盘显示“Welcome back, sepnetflix2023”——名称通过邮箱前缀自动生成。让我登录到克隆版本并进行对比：
Both dashboards match (h1 + stats identical). But I spotted a functional difference: **live redirects to `/` after login, clone redirects to `/Dashboard`**. Let me verify the live redirect behavior:
Confirmed: live redirects to `/` after login — a real functional parity gap in the clone. Let me check the logged-out Dashboard behavior and navbar states on live:
Notable: live `/Dashboard` does **not** redirect when logged out — it renders with zeroed stats. Let me see what it shows:
The live app uses JWT-in-localStorage (base44 SDK) — my logout fetch did nothing; the session is still logged in. Let me clear storage to see the true logged-out Dashboard behavior:
**Key parity findings**: live `/Dashboard` renders when logged out (h1 "Welcome back", zeroed stats) — no redirect; the clone redirects to `/login`. Also login redirects to `/` on live. Let me check the sign-up button and Courses page:
Live 的注册按钮是一个失效的按钮（无操作）——克隆版本与之匹配。现在是 Courses 页面：
Courses pages match perfectly. Now the **critical mobile menu comparison** at 375×667:
The live hamburger (ref e21) has **no accessible name** — my clone added `aria-label` (an improvement worth keeping). Let me open the live mobile menu:
Live menu structure confirmed: no ARIA, no scroll lock, panel unmounts when closed. The clone's hardening (ARIA + scroll lock + inert) is deliberate best-practice improvement to keep. Let me verify the visual state and route-change close behavior on live:
Live menu closes on navigation (panel unmounts, 9 links again). Now the same test on the clone:
Clone mobile menu fully verified: ARIA wiring, scroll lock, icon swap, route-change close — all working. Now let me do a visual side-by-side comparison using VLM:
VLM 发现了潜在的偏差。让我直接查看屏幕截图来核实一下：
Confirmed: the clone has an extra illustration block and a wider description paragraph. Let me examine the live hero DOM precisely:
The live hero has an **inline SVG line-art illustration** (858×434, flowing gradient curves). Let me see what the clone has inside its hero:
The clone session is still on /Courses from the mobile test. Let me navigate back and re-inspect:
矛盾：DOM 显示克隆项目中没有插画，但 VLM 却识别到了卡片。让我裁剪克隆项目的屏幕截图来解决这个问题：
The clone definitely shows cards the live site lacks. But where are they in the DOM? Let me enumerate the clone's hero content fully:
The clone's illustration is at content child 1 (an SVG). Let me extract both SVGs and compare:
**确凿的发现**：线上的插图是绝对定位的抽象流畅线条（8 条渐变路径，opacity-60）；而克隆版本则凭空创造了一个显眼的卡片组合（19 个矩形 + 圆形）来代替。此外，克隆版本的描述中缺少了 `md:text-xl`。让我提取准确的线上 hero markup，以便进行精准重建：
I have the exact live SVG. Now let me read the clone's landing page hero implementation:
Now I have the full picture of the hero divergence. Let me extract the live hero's remaining details (badge, buttons, mobile SVG behavior) for an exact rebuild:
Full button classes captured — clone matches (minus harmless shadcn boilerplate). Now let me compare the full landing pages and remaining routes. Taking full-page screenshots of both:
VLM 在如此规模下不可靠（它混淆了顺序并漏掉了板块）。DOM 比对已确认所有 8 个内容板块在结构上完全一致。让我对两个页面进行分段裁剪，以便进行可靠的小块级比对：
具体已发现页脚差异。由于分频段裁剪导致页面错位，我将直接通过 DOM 进行核对——提取线上的页脚结构：
VLM 在这里是对的 —— 线上页脚具有图标背景（`bg-white/5 rounded-xl`）、“Privacy Policy”/“Terms of Service”链接、“Built for the future of education.” 标语以及一条分割线。让我读取一下克隆项目的 Footer：
已确认页脚差异。让我精确提取线上页脚的底部栏和列，以便进行准确重建：
Complete footer spec captured — multiple gaps found (grid responsive cols, logo size, social icon boxes, hover colors, bottom bar). Now let me spot-check the remaining pages:
Clone has an extra "What You'll Learn" h2. Let me compare the full page outlines:
Significant course-detail differences found. Let me extract the exact structures:
The course detail page has major structural parity gaps. Let me extract the live page's complete DOM structure:
The live course has **220 lessons** titled "Lesson N: Module Content" — auto-generated. Now let me examine the reference dashboard image for the populated-state target:
参考图像显示的是**空状态**的仪表板——这也是克隆版本已经匹配的状态。让我验证一下克隆版本的仪表板结构细节：
Dashboard matches. Now quick outline comparisons of the remaining pages:
Three pages need closer inspection: About (extra section), Contact (extra h2), BecomeInstructor (different title + hero copy). Let me extract details:
Login page diffs noted (order, "or" vs "OR", demo hint, title). Now let me test the live Enroll Now behavior — logged out and logged in:
The live Enroll button is non-functional (dead template button) — my working enrollment stays as the deliberate core feature. Let me check the second reference image for the populated dashboard design:
两个参考图像均确认了空状态。现在让我提取所有 9 个线上课程的数据 + 标签，以进行种子修复：
Catalog data matches 100%. Let me extract the tags for all 9 live courses (for the What You'll Learn parity):
所有标签已捕获。进行最后一次结构检查——Courses 页面的头部结构：
**Found another major gap**: the live Courses page has the dark cosmic hero; the clone uses white. Let me extract the live Courses page structure:
在开始重构之前，让我先检查一下线上课程的空搜索状态和筛选行细节：
已捕获线上空状态。需要核对的最后两个细节 —— 线上排序选项和 `/Home` 路由：
排序选项匹配，并且线上的 `/Home` 渲染了落地页（无重定向）。快速的 AI Assistant 视觉检查，然后我将编制该计划：
Clone 的 AIAssistant 缺少页面标题元数据，且有不同的输入样式。让我读取一下：
The AIAssistant page is a client component missing metadata. **The parity audit is complete.** Let me now formalize the comprehensive remediation plan:
Plan written. Now validating it against the codebase — reading all files to be modified:
Plan validated against the codebase. Executing **Phase 0a — DB placement fix**:
The env var is exported in the shell session itself (session-1 debugging leftover). Let me clear it:
Database now resolves to the repo's `db/custom.db`. Restarting the dev server to verify:
Dev server can't open the DB file. Let me debug the actual resolution inside the server context:
The `unset` doesn't persist across tool invocations — DATABASE_URL is exported somewhere in the parent environment. Let me find and neutralize it at the source:
Confirmed: the sandbox parent process injects a stale absolute `DATABASE_URL` into every shell (it points to the now-moved file). The repo code is correct — this is a sandbox artifact. Restarting the dev server with the repo convention pinned explicitly:
**Phase 0a complete** — DB lives at repo root, login works. Now **Phase 0b — hygiene fixes**:
Now fixing the `.env` / `.env.example` comments (wrong file references) and `vitest.config.ts`:
**Phase 0b complete.** Now **Phase 1 — schema + seed, TDD-first**. Writing the failing tests before implementing:
RED confirmed. Now implementing — first the pure modules:
Now the seed data module (extracted from seed.ts with tags added per the live extraction):
Now refactor `seed.ts` to use the data module, update the schema, and re-seed:
Seed complete (1,900 lessons). But the seed-data test file fails to load — let me check:
Path error — `tests/` is one level deep, so it's `../prisma/seed-data`:
**Phase 1 GREEN — 16/16 tests.** Now **Phase 2 — Footer rework** to the live spec:
**Phase 3a — Landing hero rework** with the exact live SVG illustration:
Landing hero done. Before the Courses rework, let me get the exact live filter-card classes (truncated earlier):
已捕获完整规范。正在将 CourseCatalog 重写为线上结构：
Now **Phase 3c — CourseDetail rework**. Reading EnrollButton first:
以下是采用线上结构的完整 CourseDetail 重构：
**阶段 3d — 仪表盘 + 登录一致性。** 首先提取实时登录卡片的准确结构：
Now the LoginForm — redirect to `/`, live button order, remove demo hint:
Now the Dashboard — render when logged out (no redirect), per live behavior:
**Phase 3e** — remaining pages. Reading About first:
Rewriting the About page with the live structure (4 values, story with image, no CTA):
现在是联系页面 —— 让我读取当前文件和线上联系表单的结构：
Rewriting Contact page and form with the live structure:
Now BecomeInstructor — reading the current page:
Now the AIAssistant split — server page with metadata + client chat component:
Now `/Home` — render the landing instead of redirecting:
All page reworks done. **Phase 4 — updating e2e tests** for the new parity behaviors:
Let me check the MyCourses component handles the new 220-lesson curriculum sanely:
MyCourses needs a correctness fix (order-dependent completed heuristic) and a render cap for 220-lesson lists. Let me check the progress API first:
Now updating MyCourses (completedLessonIds + capped checklist) and the Dashboard data flow:
Now update the Dashboard page to pass `completedLessonIds`:
All code changes complete. Running the fast verification gates:
All fast gates green. Quick visual verification of the reworked pages against live:
Courses verified. CourseDetail selectors returned empty — let me inspect what rendered:
`course.tags` is undefined — checking whether the column actually landed in the DB:
The `tags` column never landed — the parent-env strike again: `db:push`/`db:seed` ran with the stale absolute `DATABASE_URL`. Let me verify and redo with pinned env:
Repo DB now correct (tags + 1900 lessons). Let me remove the stale outside-repo DB and test whether an `export` persists across tool invocations:
Export doesn't persist (fresh subshell each time). I'll prefix every DB command this session. Verifying CourseDetail now renders:
The running dev server has the old Prisma client in memory (predates the schema change). Restarting it, plus making `parseTags` null-safe as defense:
CourseDetail now matches live exactly (220 lessons, tags card). Running the production build:
Next can't statically parse re-exported route config. Defining `dynamic` locally in `/Home`:
Build passes. Running the full e2e suite:
**ALL 25 E2E TESTS PASS** (incl. 6 mobile-nav guards). Now the visual parity sweep — capturing both sites fresh and comparing the reworked pages:
The VLM flagged credible items (mixed with below-fold hallucinations). Verifying each against the live DOM — the trustworthy source:
DOM verification found 4 real fixes needed. Applying them:
The live badge uses the Award icon — fixing the import:
Now the BecomeInstructor "How It Works" restructure (no cards, vivid gradient numbers) and the CTA button arrow removal:
The VALUES array still references `Target` — need both icons imported:
关于 MATCHES。最后的 BecomeInstructor 对比和全量重新运行：
**FULL GATE GREEN** (lint ✓ typecheck ✓ 16/16 unit ✓ build ✓ 25/25 e2e ✓). **Phase 6 — fresh screenshots** of the remediated codebase:
Signed-in dashboard captured. Continuing with the remaining pages + mobile set:
截图已保存到 daemon 的 `cwd` 中 — 正在定位并移动它们：
All 16 screenshots captured. Quick visual check of the key mobile-menu capture:
Mobile menu screenshot verified. Now **rewriting DEPLOYMENT.md** for NexusLearn:
Now updating the four core docs for alignment. AGENTS.md first:
AGENTS.md done. Now CLAUDE.md updates:
Now README.md updates:
Now the PAD updates — checking the relevant sections:
Docs aligned. **Phase 7 — creating `nexuslearn-template_SKILL.md`**. Reading both distill skills:
I have the full skill structure. Writing `nexuslearn-template_SKILL.md` (20 sections + appendices, built in chunks):
SKILL.md validated (717 lines, 48 sections, clean). Final gate sanity check and worklog update before committing:
All changes accounted for. Updating the worklog, then committing:
Committed. Now the SSH-wrapper push — checking the session-1 shim state first:
Shim ready. Reviewing the wrapper procedure from the skill:
The wrapper defaults to a different repo (`task-management`). Checking its arguments for the right target:
Dry-run clean (023bd47 → d2b006e, auth verified). Real push:
**PUSH SUCCESSFUL** — remote verified at `d2b006e`. Shredding the operator key and final verification:
All done — Session 2 is complete and pushed to `main` (`d2b006e`, remote verified, key shredded).

**What happened this session:**

1. **Refreshed & reviewed** — pulled `docs/session_1.md`, re-read all four architecture docs, validated against the codebase
2. **Full parity audit** — live site vs clone (DOM + computed styles + VLM band comparison) produced an 18-item gap inventory → `docs/remediation-plan-session2.md`
3. **Remediated everything with TDD** — reference hero SVG, dark Courses/CourseDetail heroes, 1,900-lesson "Lesson N: Module Content" curricula, `Course.tags`, sign-in→`/`, public Dashboard, `/Home` landing, About/Contact/BecomeInstructor/Footer alignment, DB moved into `repo/db/` (with the shell-export trap documented), ORBITAL leftovers purged
4. **Gates all green** — 16 unit + 25 e2e (mobile menu verified working both sites), build clean, all pages VLM-MATCH
5. **Shipped** — 16 fresh screenshots, aligned docs, `nexuslearn-template_SKILL.md` (717 lines), single commit on `main`

**Suggested next steps:** pull the repo and run `bun install && bun run db:push && bun run db:seed && bun run dev` to explore; if you'd like another iteration, I can wire real OAuth ("Continue with Google"), add user registration, or stream the AI assistant's responses.
