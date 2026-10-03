I'll continue the task from where we left off. Let me first check the current workspace state and set up the task plan.

工作区已包含 nexuslearn-template 仓库（session-50 完成后）。现在让我从远程刷新仓库并查看更新后的会话文档 (115/116/50)。
Workspace refreshed to `ddb8dc3` (the owner's session-log doc commit on top of `9a18f9d` — `docs/session_116.md` is the only new file). Now reviewing the five core docs (Todo 2):

核心文档篇幅较大（AGENTS.md 149 行但 119KB — 单行超长）。用 awk 截断行宽分块阅读：

AGENTS.md: 79 gotchas internalized (Tailwind v4 CSS-first、palette pin、prisma/db-url.ts resolver、the mobile-menu guard stack、the s44-s50 pins-are-the-deliverable precedent). CLAUDE.md: the six-phase workflow + the house gate order. README: badge 734, the session logs. PAD: the [S50] row. SKILL v3.38.0.
Now the session docs (session_115 final log, session_116 transcript, remediation-plan-session50, the worklog tail):

Session 50 is complete and pushed. This session (51) follows the house pattern with the session_115 suggested directions: WebTransport/WebCodecs, Compute Pressure/Priority Hints, View Transitions/Document PiP.
Validating understanding against the codebase (Todo 4):

.env == .env.example byte-identical ✓ · DATABASE_URL="file:../db/custom.db" ✓ · db/ at the repo root (custom.db + e2e.db) ✓ · skills/ excluded from all four tool configs ✓ · the s50 scripts persisted under /home/z/my-project/scripts/ (the battery/probe/capture/tracked-pair set).
Auditing the s50 changeset (Todo 5): 25 files — 3 unit pins + 3 e2e census pins + docs; NO source changes (sound, matching the documented precedent).
Now the baseline gates (Todo 6): lint ✓, typecheck ✓, 328/328 unit ✓, build ✓, then the e2e with the documented split:

378 main + 28 tail = 406 e2e — **baseline 734 GREEN**, matching the documented session-50 state exactly.
Now the standing parity battery — boot the standalone (explicit AUTH_SECRET, the s46 lesson), reset the demo state (the s50 battery demo-state rule: the s50 screenshot phase left the canonical 3 enrollments; the live carries zero):

State reset confirmed (live 0 / clone 0). Battery run (s51-battery.mjs, the s50 pattern):

**Standing parity battery: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical, mobile battery byte-identical (NO Tailwind v4 bug — the owner's mobile-menu concern verified), console 0 errors on both sites.
Now the fresh-eyes probes for the session-51 families (s51-probe.mjs — the three suggested directions):

Families A/C parity-clean (identical presence, zero calls). The DOM census shows a fetchpriority delta — clone 9 (1/route), live 0. Let me examine the tier (raw HTML vs rendered DOM):

The clone's SSR HTML ships ONE `<link rel="preload" as="script" fetchPriority="low" nonce=…>` per route (Next 16's own emission — the first regex missed the camelCase). The live ships zero preload links. The auth routes: live 37 modulepreloads (the platform kit), clone the same 1 framework preload. The s29 family documented the preload links; the fetchPriority ATTRIBUTE tier is genuinely new — the family-B finding.
The CSSOM census on the auth routes shows 16 ::view-transition-* rules on the live (the vt-hub-enter/vt-hub-exit/vt-product-switch machinery). Let me verify inertness + the sheet ownership:

**THE GENUINE DISCOVERY**: the live's AUTH routes load a different platform bundle (10,293 rules) carrying 16 INERT ::view-transition rules (the Base44 hub/product-switch kit — the html element never carries the vt-* class gates); the app routes (1,022-rule user sheet) and the clone ship zero. The s47 auth-route platform-chrome family's third member. Zero @view-transition at-rules anywhere.
Source zero-stance verified (all 331 pin strings grep-zero in src/; the CourseCard comment's bare lowercase `fetchpriority` is not the prop form — the s28 test's `\sfetchpriority\s*=` pattern guards that). Now writing the session-51 remediation plan with plan-time validation:

Plan written. Phase 1 — the unit source pins (the s51 block in tests/platform-surface-source.test.ts):

331/331 unit ✓. Now the RED verification — a temp offender file quoting each pinned literal:

Exactly the 3 new pins fail (13 existing stay green) — honest RED. Delete the offender, confirm 331/331 GREEN.
Phase 2 — the e2e census singles (the s51 block before the s33 burst spec):

Two typecheck iterations (the `never`-narrowing on the codec cast → the s50 constructor-cast pattern; the CSSOM walk → the established CSSRuleList pattern). All 3 new specs GREEN (41.4s).
GUARD: kill the battery server (the s46 RAM lesson), then the full gate:

**GUARD: 740 GREEN** (331 unit + 409 e2e — the split extension: 378 main + 31 tail). The standing battery re-verified GREEN (18/18 + 5/5 + mobile byte-identical + console clean, the live-matched state).
The screenshot phase — restore the canonical state via the REAL API, kill the standalone, boot the dev server, capture 13 shots:

All 13 captures done. The open-mobile-menu shot is BYTE-IDENTICAL to the s50 capture (89796 bytes — the panel verified open). Now the tracked pair from the standalone:

**Tracked pair byte-identical (0/6220800 + 0/750375).** The proof matrix written (api-session-s51.txt).
Docs alignment: AGENTS.md (counts 331/409 + gotcha 80), CLAUDE.md (the pyramid + both tails), README (badge 740 + the session-51 paragraph), the PAD ([S51] row + the stamp), SKILL v3.39.0 (the description tail + the project_state), session_117 (transcript) + session_118 (final log).
Now the final full gate after all doc writes (the gotcha-41 rule — the CSS-leak spec re-runs LAST), then the commit + push phase.
