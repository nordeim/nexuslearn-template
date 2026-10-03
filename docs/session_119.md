I'll continue this multi-stage task. The session numbers have been updated again (now session_115/116, remediation-plan-session50). Let me set up a todo list and start by checking the workspace state.
The workspace already has both repos. Let me check git status and pull the latest changes.
Workspace refreshed — `docs/session_116.md` is the newest addition (commit ddb8dc3). Now let me review the core documentation.
The docs are large. Let me read the persisted outputs in full.
Let me read the files directly in chunks using offset/limit.
The nested persistence is unhelpful. Let me split the file into smaller readable chunks.
AGENTS.md fully reviewed — 79 documented gotchas, extremely thorough parity work through session 50. Now let me read CLAUDE.md, README.md, and the SKILL file.
Now let me read README.md and the architecture document.
Now the Project_Architecture_Document.md — let me read key sections.
The PAD structure is clear. Now let me read the session docs — session_115, session_116, remediation-plan-session50, and the worklog tail.
Session 50 is complete and pushed. Now let me read remediation-plan-session50.md and the worklog tail to complete the picture.
Now the worklog tail to see the latest entries.
I now have the complete picture. This is **session 51** following the house pattern, with the suggested directions: (a) WebTransport/WebCodecs, (b) Compute Pressure/Priority Hints, (c) View Transitions/Document PiP. Let me update my plan and validate the codebase contracts.
Environment contracts verified. Now let me check the skills/ exclusions and test configs.
s50 changeset confirmed sound (test pins + docs only, no source changes). Now let me check the skills catalog.
All contracts validated. Now let me run the baseline gates. First check node_modules state and run install if needed.
Lint ✓, typecheck ✓, 328/328 unit ✓. Now the production build.
Main sweep: 378 passed. Now the session-44–50 tail.
**Baseline gates all green: 734 (328 unit + 406 e2e)** — matches documented session-50 state exactly. Now the parity battery. Let me review the s50 battery script to adapt it.
The battery script is reusable. Let me check the demo-state scripts, then boot the standalone server.
No servers running. Let me boot the standalone clone server and check the demo state.
The clone carries the s50 screenshot-phase canonical state (3 enrollments) while the live has zero. Per the battery demo-state rule (gotcha 79(e)), I must reset to the live-matched state before the battery.
Demo state reset. Now let me create the s51 battery script and run it.
**Standing parity battery: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical, **mobile battery fully identical — NO Tailwind v4 bug** (the user's key concern verified), console clean on both sites. Now let me review the s50 probe script and build the s51 fresh-eyes probes.
Now let me write the session-51 fresh-eyes probe for the three new families: WebTransport/WebCodecs, Compute Pressure/Priority Hints, and View Transitions/Document PiP.
All three API families are parity-clean (identical presence, zero calls, zero UI, zero listeners). But there's a genuine finding: **the DOM/head Priority-Hints tier — the clone ships 9 fetchpriority preload links, the live ships zero**. Let me investigate whether this is a raw-HTML tier or framework-injected, and check what s29 already pinned.
s29 documented the preload family (SSR-hoisting variance, deliberate-better) and s28 pinned the img fetchpriority tier. My finding is the next tier — the LINK fetchpriority attribute. Let me examine the exact link the clone emits.
The raw HTML shows 0 fetchpriority but the rendered DOM has one script preload with `fetchpriority="low"`. Let me determine if it's runtime-injected or an SSR attribute.
The clone's SSR HTML ships exactly ONE `<link rel="preload" as="script" fetchPriority="low" nonce=...>` per route — Next 16's own bootstrap-chunk preload (my first regex missed the camelCase `fetchPriority`). Let me complete the census: check the live's auth routes and the `@view-transition` at-rule tier.
**Genuine discovery!** The live's AUTH-route platform sheets carry 16 `::view-transition-*` rules (the Base44 hub/product-switch navigation machinery) — the s47 auth-shell platform-kit family, never censused before. Let me verify inertness and check for the `@view-transition` at-rule.
Inertness proven (html class empty everywhere, no @view-transition at-rule). The vt-rules live in the platform sheet — let me verify which routes load that sheet.
The discovery is complete — the auth-route platform bundle (`static/index-*.css`, 10,293 rules) carries the 16 inert vt-rules; app routes load the user's SPA sheet (1,022 rules, zero vt). Now let me verify the source zero-stance for the new family pin strings.
One comment hit in CourseCard.tsx. Let me check how the existing img-attributes test handles that comment.
The prop-form regex skips comments — clean. Now let me study the platform-surface-source test structure for the s51 block.
Now let me study the e2e insertion point — the s50 block before the s33 burst spec.
All pin strings verified zero in src/. Let me check the globals.css `@source not` set (the CSS-leak guard) before writing the plan.
All docs excluded from source detection. Now let me write the session-51 remediation plan.
Plan written and pre-validated. Now Phase 1 — the unit source pins. Let me add the session-51 block to tests/platform-surface-source.test.ts.
Now let me run the unit tests to verify the new pins are GREEN.
331/331 GREEN. Now the honest RED verification — a temp offender file with each pinned literal.
Honest RED verified — exactly the 3 new pins fail, the existing 13 stay green. Delete the offender and confirm.
Phase 1 complete (331 unit, RED-verified). Now Phase 2 — the e2e census specs. Let me insert the session-51 block before the s33 burst spec.
The block is inserted. Let me check how existing specs type the CSSOM walk to fix my `IterableLike` placeholder.
Let me fix my vt census walk to use the established pattern.
Now lint and typecheck the new specs, then run them.
Typecheck errors in my `instrumentCodec` — TS narrows to `never`. Let me fix using the s50 cast pattern.
All 3 new e2e specs GREEN. Now the GUARD phase — kill the battery server first (the s46 RAM lesson), then the full gate.
**GUARD: 740 GREEN (331 unit + 409 e2e)** — zero regressions. Now the standing parity battery re-run.
Battery re-verified GREEN. Now the screenshot phase. Let me review the s50 capture scripts.
The tracked pair is `dashboard--desktop.png` / `dashboard--mobile.png`. Let me create the s51 capture script and run the screenshot phase.
All 13 captures done with the canonical state restored. Let me verify the mobile menu panel is open and compare with the s50 capture.
The open mobile-menu shot is **byte-identical to s50** (89796 bytes) — panel verified open. Now the tracked pair from the standalone.
**Tracked pair byte-identical (0/6220800 + 0/750375).** Now let me write the proof matrix.
Proof matrix written. Now the docs alignment phase — starting with AGENTS.md.
Now let me add gotcha 80 to AGENTS.md.
Now CLAUDE.md — the pyramid counts and tails.
Now README.md — the badge and session-51 paragraph.
Now the PAD — [S51] row and stamp.
Now the SKILL file — version bump and description update.
The regex didn't match (no trailing quote at end-of-file). Let me use a line-based replacement.
Now let me check the SKILL description tail to append the s51 census family.
Now the session logs — session_118.md (final log) and session_117.md (transcript).
Now the repo worklog entry.
Docs aligned. Let me check for stale count references in the README testing section (the s48 stale-count precedent).
The testing-section counts (279/360) are stale since session 41 — the s48 stale-count precedent. Let me fix them (the historical session-41 paragraph stays untouched).
Docs aligned. Now the final gate after all doc writes — first find the CSS-leak spec, then rebuild and re-run it LAST (the gotcha-41 rule).
Found it. Now the final gate — kill the battery server, rebuild with all docs present, run the leak spec LAST.
Leak spec passes. Per the house convention (full gate after all doc writes), let me re-run the complete e2e split.
**FINAL GATE: 740 FULLY GREEN after all doc writes.** Now the commit + push phase — let me review the SSH wrapper instructions.
No ssh binary but paramiko 5.0.0 is present. Let me deploy the Appendix A shim outside the repo.
Now write the operator key to a 0600 file outside the repo and verify it.
Key verified. Now review the changeset and prepare the commit.
Clean changeset — 25 files, no key material. Now commit with the house message convention.
Committed `2e44e55`. Now the dry-run with the wrapper.
Dry-run successful — auth verified, fast-forward confirmed. Now the real push.
**Push verified: `main @ 2e44e55` == local HEAD.** Now shred the operator key and clean up.
All clean. Let me record the session in the workspace worklog.
**Session 51 complete — pushed to `main` (`2e44e55`) and remote-verified** ✅

**What ran:**
- **Baseline 734 green** re-verified (lint → typecheck → 328 unit → build → 406 e2e), then the live-parity battery in the live-matched demo state: heights **18/18 byte-exact**, innerText **5/5 identical**, **mobile menu byte-identical — no Tailwind v4 bug** (your key concern), console clean on both sites.
- **Three fresh-eyes families** (session_115 directions): WebTransport/WebCodecs, Compute Pressure/Priority Hints, View Transitions/Document PiP — all parity-clean, **zero source changes** (the house precedent: the pins are the deliverable).
- **Two genuine discoveries**: the **fetchPriority attribute tier** (the clone's one framework-emitted preload link vs the live's zero — pinned as a containment contract) and the **auth-route view-transition CSS tier** (16 inert `::view-transition` rules in the live's platform auth-shell bundle — gotcha 80).
- **TDD: +3 unit + 3 e2e = 740 green** (RED-verified honestly); 13 dev-server screenshots (open mobile-menu byte-identical to s50) + tracked pair byte-identical; all docs aligned; final gate re-run after doc writes; pushed via the SSH wrapper (dry-run → push → remote verified, key shredded).

**Suggested next:** (a) Speculation Rules / prerender surface, (b) Container Queries / Scroll-Driven Animations CSS census, or (c) Web Bluetooth in a non-headless context — or tell me any surface you'd like probed first.
