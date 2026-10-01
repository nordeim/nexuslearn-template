The workspace exists with both repos. Let me refresh the local workspace first.
工作区已更新至最新的 commit `4576c00`。现在我来审查核心项目文档。
文件很大。让我使用 offset/limit 分块读取它们。
Now let me read CLAUDE.md and the session documents.
Session 56/57 review complete — the repo is at session-30 end state (337 tests green). Now let me read the worklog and remediation plan.
I now have a full picture. This is **Session 31** of the standing parity workflow. Let me set up the task plan and validate the codebase state.
Env contract verified. Now let me check the test configs and skills exclusion rule.
All configs verified — skills/ excluded everywhere. Now let me check dependencies and run the baseline gates.
Lint ✓. Now typecheck + unit tests.
54/54 unit ✓. Now the build gate.
Build ✓. Now the e2e gate (~5 min) — running in foreground with a long timeout.
**Baseline FULLY GREEN — 283/283 e2e (5.3m), matching the documented session-30 end state.** Now let me set up the parity audit. First, check the persisted audit scripts from session 30.
Session-30 scripts are available for reuse. Let me examine the key ones.
让我检查一下移动端审计脚本，然后创建 session-31 版本并运行常规的一致性审计。
All scripts understood. Let me create the session-31 versions and run the standing parity audit.
17/18 byte-exact; `/Dashboard` shows a diff — likely the known enrollment-state dependency. Let me examine the details.
This is the **known enrollment-state artifact**: the clone's `db/custom.db` carries leftover enrollment data from session-30 dev-tier probes, while the live demo user currently has zero enrollments. Let me re-seed the dev DB and re-probe.
Dashboard MATCH after re-seed — heights 18/18, innerText 18/18, tag drift 0. Now the mobile battery (the Tailwind v4 watch).
Mobile battery fully GREEN — trigger byte-identical, 375×469 panels, link geometry byte-identical (y 81/129/177/225/273/321/369/417). The clone's `overflow:hidden` + `aria-expanded:true` are the documented deliberate hardening. **No Tailwind v4 bug.** Now the console sweep.
**Standing parity audit ALL GREEN.** Now the two fresh-eyes families. Let me first review the current API route implementations to design the probes.
Now let me check the signup route and proxy for existing guards, then write the two-family probe.
Now I understand the full API surface. Let me write the two fresh-eyes probe scripts — **Family 1: the rate-limiting/throttle surface** and **Family 2: the request-size/payload-depth guard surface**.
Fascinating results — two anomalies on the live: its `newsletter`/`contact` APIs return **405** to JSON fetches, and its login-nonexistent returns **400** (clone: 401). Let me dig deeper into both.
The live's platform layer 405s its own newsletter/contact/AI POST routes externally, and login demands "Security verification" (a platform anti-bot token). Let me check what session 26 already pinned about this family.
Let me check the session-26 remediation plan for what it found about the live's API POST behavior.
Session 26 covered page-route verbs but not the live's API-POST behavior — this is genuinely new surface. Now let me run family 2 (payload size/depth).
**Major findings on the clone**: newsletter accepted a **1MB email** (persisted!), contact accepted a **2MB message**, signup accepted a **1MB email** (user row created with a 1MB name) — all with `200 {"ok":true}`. Plus no throttling anywhere. Let me examine the remaining routes to scope the fix.
The AI route already caps content (4000/turn, 12 turns). Now let me measure the e2e suite's actual API request rates to size safe throttle thresholds.
Let me check how many real AI-chat POSTs the e2e suite makes, and look at the AI specs' interception patterns.
The AI specs intercept the route (no real POSTs). The e2e suite's real POST load is tiny — generous throttle thresholds have ample headroom. Let me check the session-file numbering convention before planning docs.
Numbering confirmed: session 31 → `session_58.md` (retrospective) + `session_59.md` (transcript). Now let me check the DB pollution my probes created, then write the remediation plan.
**RED-state evidence complete**: 1MB subscriber email, 2MB contact message, and a 1MB User row (with a 1MB derived name) all persisted. Let me clean the probe junk, then write the remediation plan.
DB cleaned. Now let me examine the session-30 e2e spec block (for the house patterns: spec-side Prisma reads + the file-tail insertion point) before writing the remediation plan.
I have all the patterns. Now let me write the remediation plan.
Plan written. Now validating it against the codebase before execution (the house rule).
Plan validated. Now **TDD Phase 1a/2a — the RED unit specs** (the lib modules don't exist yet — the specs must fail).
Now the source-wiring guard unit spec, then run the RED phase.
RED confirmed — but my source-pin spec has a path-resolution bug (doubled path). Let me check the established pattern in the existing source-pin specs.
The house pattern uses `import.meta.dirname`. Let me fix my spec.
**Unit RED confirmed** — 7 specs failing exactly as designed (54 existing still green). Now **TDD Phase 1b/2b — the RED e2e specs**, appended at the file tail.
Fixing the type error in the burst spec (the module errors are the expected RED).
Only the expected RED module errors remain. Now the **e2e RED phase** — running the session-31 specs against the current (unfixed) build.
**E2E RED confirmed — 7 failed + 1 green-by-design**, exactly as planned. Let me verify the failure reasons are the right ones, then clean the RED-run junk.
RED phase verified. Now **the GREEN phase — the fixes**. First the two lib modules.
现在将这两个守卫接入到六个公开的 POST 路由中。
I introduced a typo — a double negation `!!` that would invert the email validation. Fixing immediately.
Now the forgot-password route.
Now the contact route.
现在是 newsletter 和 ai/chat 路由。
All six routes wired. Now the GREEN phase gates: lint → typecheck → unit.
The path doubling persists in the walk spec. Let me read the actual file state.
Found it — line 49 passes an already-absolute path into `source()` which joins REPO again. Fixing.
The "me" substring matches `/home/` — my assertion needle is too loose. Let me fix it to compare the exact guarded set.
**Unit GREEN — 77/77** (+23 new). Now the build, then the session-31 e2e specs.
**8/8 session-31 specs GREEN.** Let me verify stability with a second run, then the full e2e gate.
**FULL GATE GREEN — 291/291 e2e** (283 + 8, zero regressions). Total 368 (77 unit + 291 e2e). Now the dev-tier verification: the guard responses + the parity spot-sweep + the mobile battery.
Dev-tier verification ALL GREEN — guards work (400/413/429 with the house shapes), happy paths intact, heights byte-identical to baseline. Now the mobile battery + console sweep on the remediated code.
Mobile battery + console sweep GREEN — no regressions. Now the screenshot capture. Let me examine the session-30 capture script.
Let me create the session-31 capture script with a new guard-proof section.
Capture completed (82 files) with the known delayed-route teardown noise. Let me verify the state shots were captured correctly.
The proof shows the login-300KB response body as empty — let me verify with curl directly.
The actual response body is correct — the empty display was a capture-script artifact. Let me correct the proof artifact.
Now the `.env.example` verification and the docs-alignment phase.
Now the docs alignment. Starting with AGENTS.md — gotcha 60 + the counts.
Now adding gotcha 60 to AGENTS.md.
Now updating the "Where things live" section + CLAUDE.md.
Now CLAUDE.md — the test pyramid counts and the session-31 family.
Now README.md — badge + session-31 paragraph.
Now the PAD revision history + SKILL doc version + DEPLOYMENT.md §9.
PAD row added. Now the SKILL doc version bump.
Now DEPLOYMENT.md §9 — the limiter's per-instance scope note.
Now the session log `docs/session_58.md`.
Now the worklog entry (appended to the repo's worklog.md).
Now the gotcha-41 rule — the CSS-leak spec re-runs LAST after every doc write.
Leak spec clean. Now the final pre-commit review of the complete change set.
Change set is surgical. Final sanity check before commit (lint + typecheck + unit are cheap; e2e already green on this exact code).
All green. Now the commit — following the house convention (feat commit + the transcript's update commit).
Now the transcript `docs/session_59.md` + the update commit.
Both commits created. The gotcha-41 rule requires the leak spec re-run after session_59.md was written — running it now.
Clean. Now the SSH wrapper push. Let me check the wrapper's usage instructions first.
The wrapper procedure is clear. Let me check the environment (ssh binary, paramiko, the shim from previous sessions).
The paramiko shim is already deployed at `/home/z/my-project/bin/ssh` and paramiko 5.0.0 is available. Let me materialize the operator key and run the fingerprint sanity check.
Dry-run clean — remote at `4576c00`, will update to `dfc9f14`. Now the real push.
**Session 31 complete — pushed to `main` and verified** (remote `dfc9f14` == local HEAD, operator key shredded, working tree clean).

**What this session delivered:**
- 🔍 **Standing parity re-audit: fully GREEN** — heights 18/18 byte-exact, innerText 18/18, tag drift 0, mobile battery identical (no Tailwind v4 bug), console clean
- 🧪 **Two fresh-eyes families, two real source fixes (genuine RED→GREEN TDD):**
  1. **Request-size guards** — the writing routes were persisting unbounded strings (1MB newsletter emails, 2MB contact messages, 1MB-signup users); now capped with a 413 body pre-check + field caps
  2. **Per-IP rate limiting** — the API was wide open (the live hides behind a platform 405/"Security verification" wall we can't and shouldn't mirror); now throttled with 429 + Retry-After on all six public POST routes
- ✅ **368 tests green** (77 unit + 291 e2e, zero regressions), screenshots + proof artifacts captured, `.env`/`.env.example` verified, all docs aligned

**Suggested next steps:** review `docs/remediation-plan-session31.md` + `docs/session_58.md` for the evidence trail; future directions include a dependency-audit pass (npm audit + Next patch drift), auth-session-lifetime/cookie hardening, or an aria-live politeness family on the AI chat.
