I'll start by reviewing this complex task. This is a fullstack development task on an existing codebase with very explicit instructions, so I'll proceed directly with a structured plan.
The workspace has been reset (no nexuslearn-template directory). Let me read the uploaded instructions fully and then clone the repo.
I've internalized the operating instructions (production-grade coding standards, TDD, evidence-based verification, root-cause discipline). Now let me clone the repo since the workspace has been reset.
Repo cloned successfully. Now let me review the key documentation files. I'll start with the structure and main docs.
The repo is mature (41 sessions logged). Now let me review the key documentation. Given the large sizes, I'll read them strategically.
README reviewed. Now let me read the session docs the user specified — session_40.md, session_41.md, and remediation-plan-session22.md.
session_41.md is the transcript of the previous session (Session 22). Now let me read remediation-plan-session22.md and the worklog tail.
Now let me check the worklog tail and key sections of AGENTS.md and CLAUDE.md.
现在让我审阅一下 AGENTS.md 和 CLAUDE.md，以了解操作规范。
Let me read AGENTS.md more efficiently using bash with specific sections.
Now let me review CLAUDE.md key sections.
Let me check the PAD and SKILL doc structures, plus the SSH wrapper instructions.
Now let me validate understanding against the codebase — checking .env, db location, configs, and the SSH wrapper instructions.
Configs validated. Now let me read the SSH wrapper skill instructions.
Now let me check the environment tooling, skills catalog, and previous session scripts.
The skills are in place. Now let me set up the project environment — install dependencies and set up the database.
Database created at repo root `db/`. Now let me run baseline gates.
All baseline gates GREEN (lint ✓, typecheck ✓, 41/41 unit ✓) — matches the documented session-22 end state. Now let me start the dev server and verify the live reference site.
Both sites are up. Let me run the build and check the e2e specs while it builds.
Let me check build status and prepare the live-parity probe scripts.
While e2e runs, let me check the parity workflow methodology in the SKILL doc.
Let me check e2e progress and write the live-parity probe scripts.
Both sites authenticated (clone cookie verified via /api/auth/me). Let me verify the login redirect behavior — the clone stayed on /login which needs checking.
The redirect is client-side (`router.push("/")`) — my probe caught it mid-flight; the cookie is set correctly. Now let me write the main parity audit script for the standing surfaces.
While e2e runs, let me inspect the key source files — Navbar (mobile nav) and globals.css.
Navbar is solid. Let me monitor e2e progress.
**244/244 e2e GREEN** on the production build — all repo parity pins hold. Now let me run the live-vs-clone parity probes.
Core surfaces GREEN (heights 22/22, innerText 11/11, tag drift 0). The class diff count (121) needs analysis vs the documented 78 — let me examine the actual diff lines.
Let me analyze the potentially-undocumented variance lines more closely.
All class-diff lines fall into documented variance families (toast portal, dvh hardening, gradient pin, font-sans, panel, selectOrder) — no new undocumented drift. Now the mobile-menu battery against the live site (the user's key focus).
The script needs defensive handling — the live unmounts its panel when closed. Let me fix it.
Trigger classes byte-identical and all clone geometry matches the documented reference values. The live's synthetic click failed — let me fix the selector to use Playwright's real tap.
The pre-CTA gap shows a DIFF (live=0px vs clone=4px) — but panel heights match (405/405). Let me investigate the live's actual panel DOM to see where the gap lives now.
The live's panel structure differs (no grid wrapper) — my selector grabbed the wrong level. Let me re-dump the live's inner list.
The mobile battery is fully GREEN — identical geometry (y=417 CTA on both, 405px panels, identical link positions). The gap carrier differs (v3 margin-top vs v4 margin-bottom — the documented session-9 engine variance). **No Tailwind v4 bug.**

Let me now check the console surface and probe the security-headers + axe-core a11y surfaces as this session's fresh-eyes probes.
Console clean. Now the security-headers surface — comparing live vs clone HTTP response headers.
Key finding: the live ships platform security headers (HSTS, referrer-policy, nosniff) while the clone ships none — a deliberate-better hardening opportunity. Let me also run an axe-core a11y scan as this session's second fresh-eyes probe.
Violations found on the clone — but this is a parity project, so I must compare against the live reference before classifying. Let me scan the live.
CourseDetail shows 373 color-contrast nodes on the clone vs 0 on the live — needs investigation. Let me get the node details.
**AXE PARITY CONFIRMED**: CourseDetail shows identical 373 nodes on both sites (the earlier live=0 was the documented progressive-render race). The live's link-name/button-name violations are exactly what the clone's aria-label hardening fixes — the clone is WCAG-better. 

Let me check the next.config.ts for the security-headers remediation.
Let me verify the `@source not` set in globals.css before writing the plan.
All exclusions verified. Now let me update my task list and write the comprehensive remediation plan.
Let me correct Section D to reflect pending status (results recorded after execution, per the TDD discipline).
Plan written. Now let me validate it against the codebase — checking the e2e spec structure and conventions.
Spec conventions confirmed. Now Phase 1a — writing the RED security-headers spec first (TDD).
**RED confirmed** — spec fails on the baseline tree as expected. Now Phase 1b — implement the headers (GREEN).
Now let me restart the dev server (config change) and rebuild for e2e verification.
**GREEN** — security headers ship on both dev and standalone builds. Now Phase 2 — the axe-core WCAG parity pins.
The first axe test has a bug (reads a non-existent page global). Let me fix it to use AxeBuilder directly.
All 3 axe specs pass (4 new specs total: 244 → 248). Let me verify lint + typecheck on the new code.
Now Phase 1c/2 verification — re-run the standing parity surfaces to confirm nothing moved.
All surfaces GREEN post-remediation. Now Phase 3 — screenshots. Let me check the existing capture set.
Now let me write the screenshot capture script — the standard set re-captured + session-23 additions.
All screenshots captured (the header check failed only due to raw-script URL handling — already verified via curl). Let me check if the AI chat works to re-capture the answer screenshot.
AI chat works end-to-end. Let me re-capture the AI answer screenshot with the wait-for-answer condition.
Let me VLM-verify the key session-23 captures.
The AI answer capture caught "Thinking..." — my wait selector matched the user's question text. Let me fix the wait condition and re-capture.
All captures VLM-verified. Now Phase 3c — docs alignment. Starting with README.
Now let me add the session-23 paragraph to README after the session-22 one.
Now AGENTS.md — the commands table and gotcha 52.
Now CLAUDE.md — the pyramid counts and session-23 spec family.
Now the PAD — [S23] revision entry and §7.1 row. Let me check the structure.
Now the SKILL doc — v3.11.0. Let me check its version header and structure.
Now let me record the results in the remediation plan Section D.
Let me fix the spec-count arithmetic in the risk register, then create the session log.
Now the repo worklog entry.
Now the final gate in order: lint → typecheck → test → build → test:e2e.
**248/248 e2e GREEN.** Now the CSS-leak spec re-run LAST (the session-15 process rule).
ALL FINAL GATES GREEN. Now the commit + SSH-wrapper push. Let me set up the SSH infrastructure first.
Paramiko installed. Now let me deploy the SSH shim and verify the key parses.
Shim ready. Now let me review the full change set and commit.
Dry-run clean — authentication verified, fast-forward ready. Executing the real push.
**Push verified** — remote `refs/heads/main @ da73d0c == local HEAD`, working tree clean, operator key shredded. Let me complete the workspace worklog and wrap up.
All tasks complete. Let me do a final verification of the pushed remote state.
**Session 23 complete — pushed and verified.** The `ls-remote` error is expected (the key was shredded after the wrapper's own authoritative verification: `refs/heads/main @ da73d0c == local HEAD`).

## Summary

**Session 23 — the security-headers + axe-WCAG pass** (commit `da73d0c` on `main`, pushed via the SSH wrapper, key shredded):

🔍 **Parity re-audit — every surface GREEN**: heights ×11 routes ×2 viewports byte-exact, innerText 11/11 identical, tag drift 0, class diffs all in documented variance families. **Mobile menu verified working — no Tailwind v4 bug**: 405px panels on both sites with byte-identical link geometry (y-positions 81→417), the 4px pre-CTA gap present on both (v3/v4 engine variance, property-verified).

🔧 **TDD remediation** (2 new probe families): the live's platform ships security headers the clone lacked → baseline set now ships via `headers()` in `next.config.ts` (spec ran RED first); axe-core WCAG scan proved the clone *better* than the live (0 vs 4+1 accessible-name violations) → pinned by 3 new specs.

✅ **289 tests green** (41 unit + 248 e2e), 64 VLM-verified screenshots, docs aligned (SKILL v3.11.0, gotcha 52, session_42), `.env.example` verified, all gates passed.

**Suggested next steps**: review `docs/remediation-plan-session23.md` + `docs/session_42.md` for the evidence trail; future directions include the CSP nonce pattern (documented as future work) or a performance budget pass.
