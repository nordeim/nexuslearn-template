I'll continue with the multi-stage task. Let me start by checking the current workspace state and refreshing the repository.
The workspace exists with both repos. Let me read the worklog first and check the git status.
Workspace is at session-51 state (2e44e55, pushed to main). The task references `session_118.md`, `remediation-plan-session51.md`, `session_119.md` — following the established pattern, the owner likely pushed a new session log commit. Let me pull to refresh.
Pulled `92c0358` — the owner's session_119 log. Now let me review the session docs first (they're small and define current context), then the core docs.
Session 119 confirms session 51 is complete and pushed (740 tests green). Now let me read the remediation plan and worklog tail.
Session-51 plan fully executed. Now let me review the core docs strategically — checking sizes first, then reading key sections.
SKILL at v3.39.0, 740 tests green. Now reading AGENTS.md and CLAUDE.md in full.
Gotchas 78-80 confirmed. Now let me check CLAUDE.md and README's current state sections.
All environment contracts verified. Now checking the skills/ exclusion configs and codebase structure.
所有工具链合约已验证。现在正在检查技能目录（根据任务要求）并运行基线检查。
Skills catalog reviewed — `tdd`, `tailwind-patterns`, `agent-browser`, `clone-app-pat-pro` identified. Now validating the s51 changeset and codebase state, then running baseline gates.
s51 changeset confirmed sound (pins + docs only). Now running the baseline gates in the required order: lint → typecheck → unit → build → e2e.
331/331 unit green. Now the production build.
Build green. Now the e2e split (378 main + 31 tail = 409).
**Baseline gates all green: 740 (331 unit + 378+31 e2e)** — matches the documented session-51 state. Now the standing parity battery. Let me check the persisted scripts.
Clone booted. Now resetting the demo state to live-matched (zero enrollments) per the battery demo-state rule.
Demo state reset (3 enrollments → 0, matching the live). Now creating the s52 battery script.
Running the standing parity battery (this takes several minutes).
**STANDING PARITY BATTERY: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical, **mobile menu byte-identical (NO Tailwind v4 bug)**, console 0 errors both sites. Now the fresh-eyes probes. Let me review the s51 probe structure.
I have the full probe pattern. Now writing the s52 fresh-eyes probe with the three session_118-suggested families: **(A) Speculation Rules/prerender**, **(B) Container Queries/Scroll-Driven Animations**, **(C) WebGPU/Web Locks** (the device-tier follow-up).
The probe found a **genuine discovery in Family B**: the live ships 36 `animation-timeline: auto` declarations (4/route) while the clone ships zero; and live `scroll-behavior` 9 vs clone 18. Let me attribute these findings precisely.
**The family-B discovery is fully attributed.** Now let me verify inertness — whether any element actually carries those animate-* classes, and confirm the clone's sheet state.
**INERTNESS PROVEN**: zero animate-class elements on any route on either site, zero running animations. The live's 4 `animation-timeline: auto` reads come from its platform's literal-shorthand emission (vs the clone's v4 var()-indirection which reads empty) — all dead CSS both sides. Now the source grep zero-stance validation for the new pin strings.
All pin strings grep-zero in src/. Now verifying the CSS-leak guard `@source not` set and the existing pin structure.
The audit surfaces are clear. Let me verify the remaining pin-string candidates are grep-zero, then write the remediation plan.
Pin strings finalized (the `prerender` comment hits excluded; `scroll-behavior` stays the documented family, not a pin). Now writing the session-52 remediation plan.
Plan written. Now Phase 1 — the unit source pins. Adding the session-52 block to `tests/platform-surface-source.test.ts`.
Unit pins added. Running the unit suite (expect 334).
334/334 GREEN. Now the honest RED verification — a temp offender file under src/.
Honest RED verified — exactly the 3 new pins fail, the 16 existing stay green. Deleting the offender and confirming.
Phase 1 complete. Now Phase 2 — the e2e census specs. Let me study the s51 pressure spec as the template.
Template absorbed. Now writing the session-52 e2e block — inserted between the s51 PiP block and the s33 burst spec (the position contract).
E2e block inserted. Now lint + typecheck the new specs.
One TS error — `activationStart` isn't in the lib types. Casting the nav entry.
Clean. Now running the three new e2e specs.
All 3 new specs GREEN. Now the GUARD phase — kill the battery server first (the s46 RAM lesson), then the full gate.
**GUARD: 746 GREEN (334 unit + 412 e2e)** — zero regressions. Now re-booting the standalone and re-verifying the standing battery.
Battery re-verified GREEN. Now the screenshot phase — reviewing the s51 capture script.
Creating the s52 capture script and preparing the dev-server screenshot phase.
Now: kill standalone → boot `next dev` → run the s52 dev-server captures.
All 13 captures done. Verifying the mobile-menu shot vs s51 (byte-identical expected: 89796).
**Mobile-menu shot byte-identical to s51 (89796 bytes)** — the panel verified open, no Tailwind v4 bug. Now the tracked dashboard pair from the standalone.
**Tracked pair pixel-identical (0/6220800 + 0/750375 RGB bytes)**. Now writing the proof matrix.
Proof matrix done. Now the docs alignment phase — starting with AGENTS.md counts + gotcha 81.
Now adding gotcha 81 to AGENTS.md.
Gotcha 81 added. Now CLAUDE.md pyramid counts.
The insertion may have landed mid-sentence in the wrong paragraph. Let me inspect and repair.
The unit paragraph ends with the s51 sentence. Inserting the s52 sentence at the paragraph end.
The earlier removal script never wrote the file — the bad insertion is still there alongside the good one. Removing the bad occurrence now (with write).
CLAUDE.md repaired and aligned. Now README badge + session-52 paragraph.
README done. Now the PAD [S52] row.
PAD done. Now the SKILL file version bump + description updates.
SKILL updated. Now the session logs — checking the session_117 transcript format.
Now writing the session logs — session_120.md (transcript) and session_121.md (final log).
Session logs written. Now the repo worklog entry.
Worklog appended. Now the final gate after doc writes — rebuild, CSS-leak spec LAST (gotcha-41 rule), then the full split.
**FINAL GATE: 746 FULLY GREEN after all doc writes.** Now the commit + push phase — reviewing the SSH wrapper instructions.
Shim + paramiko ready. Now deploying the operator key (outside the repo, 0600) and verifying it.
Clean changeset — 25 files, no key material. `.env.example` already tracked and verified matching. Committing with the house message convention.
Committed `0310e01`. Now the dry-run push via the wrapper.
The wrapper authenticated fine but targeted its default remote (task-management). Let me check its CLI options for the correct repo target.
Dry-run successful — fast-forward confirmed. Now the real push.
**Push verified: `main @ 0310e01` == local HEAD.** Now shredding the operator key and cleaning up.
Remote verified, key shredded, servers stopped. Now recording the session in the workspace worklog.
**Session 52 complete — pushed to `main` (`0310e01`) and remote-verified** ✅

**What ran:**
- **Baseline 740 green** re-verified (lint → typecheck → 331 unit → build → 409 e2e), then the live-parity battery in the live-matched demo state: heights **18/18 byte-exact**, innerText **5/5 identical**, **mobile menu byte-identical — no Tailwind v4 bug** (your key concern; the open-menu capture re-shot at exactly 89796 bytes).
- **Three fresh-eyes families** (session_118 directions): Speculation Rules/Prerender, Container Queries/Scroll-Driven Animations, WebGPU/Web Locks — all parity-clean, **zero source changes** (the pins are the deliverable).
- **One genuine discovery**: the **animation-timeline shorthand-serialization tier** (gotcha 81) — the live's literal-shorthand emission exposes 4-per-route `animation-timeline: auto` reads while the clone's v4 `var()`-indirection reads empty; inertness **proven** (zero animate-class elements, zero running animations on either site).
- **TDD: 746 green** (334 unit + 412 e2e, RED-verified honestly); 13 dev-server screenshots + pixel-identical tracked pair + proof matrix; all docs aligned; final gate re-run after doc writes; pushed via the SSH wrapper (dry-run → push → `ls-remote` verified, key shredded).

**Suggested next:** (a) Web MIDI + setAppBadge tier, (b) the Navigation API (`window.navigation` — the SPA-vs-SSR router family's newest member), or (c) Local Font Access + EyeDropper + Contact Picker census — or name any surface you'd like probed first.
