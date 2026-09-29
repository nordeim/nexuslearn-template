I'll start by reading the uploaded prompt file and checking my workspace state.
Both repos cloned successfully. Now let me review the core documentation files.
AGENTS.md gives excellent context. Let me continue reviewing the other core docs.
Now let me review the architecture document and SKILL doc (reading key sections).
Now let me review the session documents — session_14, session_15, remediation-plan-session9, and the worklog.
Now let me check the worklog tail and current repo state.
工作日志确认当前状态：Session 1–9 已完成（159 个测试通过，31 个单元测试 + 128 个端到端测试），仓库处于 Session-9 提交 `d0fcaff`。这是 **Session 10**。让我更新待办事项并验证代码库。
`.env` and `.env.example` are already correct. Let me validate the key codebase files and the skills exclusion config.
Configs verified. Let me check the environment for the documented stale-export trap and start installing dependencies.
The documented stale `DATABASE_URL` shell export is present — I'll neutralize it. Now installing dependencies and launching the scandihaven docs review in parallel.
Research complete. Now let me set up the database and run the baseline gates.
Unit tests green (31/31). Now building for e2e.
**All baseline gates green**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **128/128 e2e** ✓ — session-9 state confirmed. Now let me set up the parity audit. First, let me load the agent-browser skill and check for existing audit scripts.
agent-browser is ready. Let me start the clone dev server and set up both audit sessions.
Dev server running. Now setting up both agent-browser sessions with desktop viewport and logging in.
Live site logged in. Now the clone session.
Both sessions logged in and returned to `/` (reference behavior on both). Now let me write the audit scripts — desktop height sweep + class-set diffs.
Desktop heights mostly within documented bands. `/Courses` (−49) and `/About` (−29) need investigation. Let me run the class-set diffs across all routes.
Nearly all IDENTICAL. Two anomalies to investigate: `/Courses` clone-only tokens `(`, `)`, `_` and 404-page letter fragments. Also `/` shows IDENTICAL — but session 9 documented a gradient class-form variance. Let me dig into these.
The gradient class is one token — the standalone `(`, `)`, `_` tokens must come from another element. Let me find them.
Empty now — likely transient. Let me re-run the /Courses class diff to check reproducibility.
My audit script has a double-encoding bug (eval returns a JSON string of a JSON string — the python compared character sets). The `(`, `)`, `_` clone-only chars are likely the documented arbitrary-gradient variance. Let me fix the parser and re-run.
Class diffs now match the documented state (gradient class form + panel mechanism variances). Let me verify the 404 diff with the fixed parser and check documented height bands.
`/Courses` −49 and `/About` −29 are documented font bands. But the **404 page shows a real diff** — live renders none of the slate-404 classes. Let me inspect the live 404 structure.
The live 404 has NO `<main>` element — a bare centered card. Let me compare both 404 structures fully.
Both 404s lack nav/footer, but the wrapper differs (live: `div#root > div.min-h-screen...`; clone: `main > div.max-w-md`). Let me get the full structures.
**发现 1：404 wrapper 偏差** — live 在 `div#root` 下使用 `div.min-h-screen`；clone 使用 `main.min-h-dvh`。内部内容字节完全一致。现在进行关键的移动端导航测试和移动端高度扫描。
Live panel data captured — CTA `block mt-3` with computed 4px margin (v3 engine) and 404px inner panel ✓. But the route-change close check needs refinement — the panel CTA button still appears in DOM after navigation. Let me verify.
Live route-change close confirmed working (panel unmounts, icon resets). Now the clone battery.
**Potential new finding**: after navigating to `/Home`, live's trigger stays `text-white/80` (hero state) but clone's switches to `text-gray-700` (white-nav state). Let me verify the navbar visual state on `/Home` on both sites.
**Finding 2 (High): `/Home` navbar state drift** — live renders transparent hero-state navbar on `/Home`; clone renders the white-nav state. Let me check the Navbar source logic and verify `/` is correct on both.
Root cause found: `Navbar.tsx:59` — `overHero = pathname === "/" && !scrolled` misses `/Home`. Let me read the full Navbar component to scope the fix.
The fix is scoped. Now let me check whether the h1 offset difference (340 vs 315) also exists on `/`, and verify the live `/Home` scroll behavior.
Live `/Home` = full landing hero behavior (transparent at top → white when scrolled). The h1 offset (25px) is identical on `/` — pre-existing documented band. Now the mobile height sweep.
Mobile heights match most documented bands. Let me verify the remaining ones (−50, −45, −22, −58) against the session-8 documented band list.
All mobile deltas match documented bands exactly. Now the CourseDetail like-for-like sweep — extract live course ids first.
**Major drift detected**: CourseDetail heights are +1300 to +3300px taller on the clone — contradicting the documented +1px bands. Let me count curriculum lesson rows on both sites.
Same 380 rows. The height gap is elsewhere. Let me compare section-level layout heights.
Live hero = 577px, clone = 1011px (+434). Grid +2203. Let me drill into both.
Lesson rows identical. The hero grid: live 521 vs clone 955. Let me compare the hero grid columns.
Suspicious — possibly wrong element matched. Let me use precise selectors and dump both hero structures fully.
The clone's hero uses the arbitrary-gradient class (documented variance) — my selector missed it. Let me query the clone hero correctly.
**Critical discovery**: the clone's hero grid STACKS (425+490=955) at 1920px — `lg:grid-cols-3` appears not to apply! Let me check computed styles.
False alarm — my clone session was still at 375×667 from the mobile sweep (only live was reset to 1920). Let me redo the CourseDetail sweep with both viewports at 1920×1080.
CourseDetail heights now match documented bands exactly (7× +1px, WebDev/UIUX −25px). Let me complete the audit: space-y container sweep (trap-4 blast radius) and head metadata checks.
My regex matched padding (`p-6`) — false positives. Let me fix it to match only margin utilities.
space-y sweep clean. Now head metadata spot checks and the live site's CourseDetail not-found state.
Head metadata parity perfect. Now interactive flow spot checks + course data verification.
Prices + not-found state identical. Let me check the AI chat on both sites and signed-out Dashboard state.
AI chat works on the clone. Let me verify the signed-out Dashboard renders the zeroed state, then check the login card's Google button and footer links quickly.
Signed-out Dashboard + testimonials identical. Let me confirm the live `/Home` hero-state behavior at mobile viewport, then check existing spec coverage for `/Home`.
Confirmed: live `/Home` uses hero-state navbar (viewport-independent), and no spec pins it. Let me check 404 spec coverage, then write the remediation plan.
Before finalizing the 404 finding, let me check how the live page-shell root compares (the AGENTS.md `min-h-dvh` vs live's actual root classes).
Found another class-level variance: page shell root is `min-h-screen` (live) vs `min-h-dvh` (clone). Let me check the documented rationale.
The `min-h-dvh` root is **documented deliberate hardening** (session-4, SKILL.md "avoid mobile URL-bar warp"). Let me check not-found.tsx for its docblock rationale.
The 404 wrapper is consistent with the documented dvh hardening doctrine — needs documentation + spec pinning, not removal. Now let me check for other hero-detection references and then write the remediation plan.
Audit complete. Only `Navbar.tsx:59` needs the fix. Let me review the existing spec conventions before writing the plan.
I have full context. Let me verify .gitignore covers db/, then write the remediation plan.
Now writing the session-10 remediation plan.
Plan written. Now validating it against the codebase before execution — checking spec file tails and exact insertion points.
Before writing the 404 spec, let me verify how the root layout handles the 404 (my audit showed no nav/footer on the clone 404).
The root layout is bare — Navbar/Footer render per-page, so the 404 is chrome-less by design (matching live). Now writing the RED specs (Phase 1).
Now the mobile spec block:
Specs written (5 new total). Now verifying RED against the pre-fix build.
**RED confirmed** — 3 specs fail for exactly the pinned reasons (white-nav state on `/Home`), 2 pin-specs pass. Now Phase 2 — GREEN: the Navbar fix.
Now the 404 docblock documentation (finding 2):
GREEN fixes applied. Rebuilding and verifying the specs flip GREEN.
All 5 session-10 specs GREEN. Now the full e2e suite for regressions.
**133/133 e2e 通过**（128 → 133，零回归）。现在进入阶段 3b：针对线上环境进行开发服务器重新验证。
Desktop nav states all correct. Now mobile `/Home` + height band + chrome class diff verification.
All verifications green. Running the remaining gates (lint, typecheck, unit).
All gates green. Now Phase 4a — dev-server screenshots.
19 fresh screenshots captured. Now Phase 4b — documentation alignment. Starting with README.
Now AGENTS.md updates (gotchas 6/8 + spec counts):
Now CLAUDE.md (test pyramid + parity behaviors):
Now the PAD — [S10] revision block:
Let me check PAD §7.1 test distribution and §10 known issues for updates.
Now the SKILL doc (v2.8.0 bump + new findings):
Let me update the SKILL frontmatter description and add the synced-viewport rule to the Parity Workflow appendix.
SKILL doc updated. Now writing the session log (docs/session_16.md):
Now appending to the worklog:
Now verifying `.env.example` coverage against all code references:
`.env.example` fully covers all code references. Let me update the shared worklog and my todos, then commit.
Change set is clean (12 byte-identical screenshot re-captures, 4 refreshed, 3 new). Committing now.
Committed as `638ca5b`. Now the SSH-wrapper push. Setting up the key and checking the wrapper interface:
Wrapper ready (must pass `--remote` for this repo). Setting up the key and running the dry-run:
No `ssh` binary on PATH — the skill documents a paramiko-backed shim recipe. Let me read it.
paramiko missing — installing it and locating the Appendix A shim implementation:
Creating the paramiko ssh shim outside the repo:
The shim's python3 differs from pip's target. Let me find the right interpreter:
Dry-run clean — fast-forward `d0fcaff..638ca5b → main`. Executing the real push:
**Pushed to main — remote verified at `638ca5b`.** Now shredding the operator key per the security procedure:
Key shredded, main in sync with origin. Cleaning up sessions and finalizing the worklog:
**Session 10 complete and pushed to `main` (`638ca5b`, remote verified, key shredded).**

The fresh-eyes audit (agent-browser, live vs clone, desktop + mobile) found 2 issues, both fixed via TDD:

1. **`/Home` hero-state navbar (High)** — live renders `/Home` with the full landing treatment (transparent navbar, white logo, `text-white/80` trigger, white-nav after scroll); the clone shipped the white-nav state. One-line `overHero` fix in `Navbar.tsx`, pinned by 4 new specs.
2. **404 hardening pin (Low)** — the deliberate `main.min-h-dvh` variances are now documented + spec-pinned.

The mobile menu battery passed fully on both sites — **no Tailwind v4 bug** (space-y sweep clean on 12 routes; panel byte-exact at 405px). Gates: lint ✓ typecheck ✓ **31/31 unit ✓ build ✓ 133/133 e2e ✓** (128→133), plus 19 screenshots, docs aligned, `.env`/`db/` verified.

**Suggested next steps:** pull the repo and run `bun install && bun run test:e2e` to verify; for session 11, consider screenshot-diff CI, streaming AI responses, or `prefers-reduced-motion` support (PAD §10 open items).
