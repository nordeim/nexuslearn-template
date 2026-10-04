I'll continue the multi-stage task. The session numbers updated again (now session_121/122, remediation-plan-session52). Let me set up the todo list and refresh the workspace.
Workspace already has both repos. `git pull` brings `a753609` — the owner's session-log doc commit (`docs/session_122.md`, the session-52 transcript, 73 lines) on top of `0310e01`.
Now reviewing the five core docs (AGENTS/CLAUDE/README/PAD/SKILL) + the session docs (session_121 final log, session_122 transcript, remediation-plan-session52, the worklog tail):

AGENTS.md: 81 gotchas internalized (the mobile-menu guard stack, the pins-are-the-deliverable s44–s52 precedent, the battery demo-state rule, the animation-timeline serialization tier). CLAUDE.md: the six-phase workflow + the gate order. README: badge 746. PAD: [S52]. SKILL v3.40.0 — 746 green (334 unit + 412 e2e). Session 52 complete and pushed; session_122's tail suggests: (a) Web MIDI + setAppBadge tier, (b) the Navigation API (window.navigation — the SPA-vs-SSR router family's newest member), (c) Local Font Access + EyeDropper + Contact Picker census.
This is **session 53** following the house pattern. Validating the codebase contracts:

.env == .env.example byte-identical ✓ · DATABASE_URL="file:../db/custom.db" ✓ · db/ at the repo root ✓ · skills/ excluded from all four tool configs (tsconfig/eslint/vitest/playwright) ✓ · the s122 changeset audited: 1 file, docs-only (session_122.md), NO source changes (sound). The skills catalog reviewed — tdd, tailwind-patterns, agent-browser, clone-app-pat-pro all in place.
Now the baseline gates in the house order (lint → typecheck → unit → build → e2e split):

lint ✓ · typecheck ✓ · 334/334 unit ✓ · build ✓ · 378 main + 34 tail = 412 e2e — **baseline 746 GREEN**, the documented session-52 state exactly.
Now the standing parity battery — boot the standalone on :3000 with the explicit AUTH_SECRET. First boot attempt: the battery showed heights 18/18 + mobile byte-identical but a 1-line /Dashboard innerText diff — my boot had OMITTED the AUTH_SECRET (the standalone is production mode; the session-33 enforcement refused to sign the token → the clone login failed → the signed-out dashboard text). The s52 boot convention documented in the battery header. Rebooting with the env var: both logins succeed, but now the clone shows 23-line /Dashboard + 778-line /CourseDetail diffs — the demo state! The s52 screenshot phase had left 3 enrollments in custom.db while the live user has zero. Resetting via the s50 reset script (seed-1/3/5 → 0):

**Standing parity battery: FULLY GREEN** — heights 18/18 byte-exact, innerText 5/5 identical (0 diffs on 214/96/789/15/9 lines), **mobile battery byte-identical — NO Tailwind v4 bug** (trigger BUTTON `md:hidden p-2 rounded-lg text-white/80` 40×40 @(319,12); panel 375×405 @(0,64); all 9 members identical), console 0 errors both sites.
Now the s53 fresh-eyes probe (s53-probe.mjs) for the three session_122 directions:

Family A (Web MIDI + Badge): requestMIDIAccess + MIDIAccess + MIDIMessageEvent + setAppBadge + clearAppBadge ALL present with identical shape, zero calls, zero labeled UI, zero statechange listeners. Parity-clean.
Family B (Navigation API): Navigation + navigation + NavigateEvent + NavigationHistoryEntry present identically; ZERO navigate-family listeners on both sites (app AND auth routes — the live's SPA router and Next.js both leave the API untouched; popstate 2-on-2, framework-internal). The entries census grows identically (2→10). Parity-clean.
Family C (Local Fonts + EyeDropper + Contacts): queryLocalFonts + FontData + EyeDropper present identically; contacts/ContactsManager absent on both (the gotcha-78 mirror); zero calls, zero color inputs. Parity-clean.
**But the UI-label sweep shows a persistent delta on EVERY route: live 2 vs clone 3 "Contact" hits.** Let me attribute this (s53-contact-attribution.mjs):

The live's 2 Contact links: the navbar desktop row + the footer. The clone's 3: the same two + a THIRD inside the mobile panel — display:none, 0×0 rect. The live's mobile panel DOESN'T EXIST in the desktop DOM at all (button[aria-controls] absent — and the live's trigger carries NO aria attributes, the s24 unhardened family; the class-based selector is the right census tool).
Wait — the live's trigger IS always in the DOM (1 md:hidden element at desktop, hidden). Only the PANEL CONTENT is conditional. Let me trace the mount modality at all three paths (s53-resize2.mjs + s53-click-after-resize.mjs + s53-fresh375-closed.mjs):

**THE GENUINE DISCOVERY — the mobile-panel MOUNT-MODALITY tier (gotcha 82):** the live's panel content is MOUNT-ON-OPEN — fresh-375 CLOSED shows 9 nav links + 0 panel members (the desktop row + trigger only); after a desktop→mobile resize STILL 0 (the panel does NOT mount on resize); clicking the trigger MOUNTS the byte-identical 9 members at identical geometry (y81/129/…/417 — reproduced at the resize path too). The clone's panel is ALWAYS-MOUNTED: 17 nav links at 375-closed (the members clipped in the collapsed grid-template-rows 0fr track — container offsetHeight 0 + opacity 0, inner min-h-0 overflow-hidden), display:none at desktop, resize-live. Every OBSERVABLE surface is parity-clean; the only difference is the inert closed-nav DOM census (live 9 vs clone 17 links; live 2 vs clone 3 desktop Contact-text links — the clone's third is the display:none panel member, tabIndex -1, absent from the a11y tree). The s22 one-liner ("the live unmounts its closed panel") extended into the systematic tier.
Now the pin-string validation (19 strings all grep-zero in src/) and the remediation plan (docs/remediation-plan-session53.md) with the plan-time design validation — the mount-modality census pins the CLONE'S OWN always-mounted design (the s51 fetchPriority containment's design mirror), never the live's DOM shape.

Phase 1 — the unit source pins (the s53 block in tests/platform-surface-source.test.ts: MIDI_BADGE_APIS / NAVIGATION_API_APIS / LOCAL_FONT_EYEDROPPER_CONTACTS_APIS):
337/337 GREEN. Now the honest RED verification — a temp offender file under src/ quoting each pinned literal fails exactly the 3 new sweeps (19 existing stay green). Deleted; 337/337 confirmed.
Phase 2 — the e2e census pins (the s53 block in nexuslearn.spec.ts, before the s33 burst spec — the position contract):

First run: 3 census singles green, the mount-modality spec failed — contactTotal expected 3 but received 5. The href-only census counts the footer's "Help Center" + "FAQ" links (they also target /Contact). Fixing to the TEXT census (the probe methodology: exact "Contact" text). All 4 GREEN.
One TS iteration on the EyeDropper cast (the constructor-typed shape). lint + typecheck clean.
GUARD: kill the servers (the s46 RAM lesson) → lint ✓ → typecheck ✓ → 337/337 unit ✓ → build ✓ → 378 main + 38 tail = 416 e2e — **753 FULLY GREEN, zero regressions**. The standing battery re-verified GREEN post-pins.
Now the screenshot phase — the canonical demo state restored via the REAL API (login → enroll seed-1/3/5 → seed-5 progress), `next dev` on :3000, 13 captures under docs/screenshots/s53-dev-*:

**The open-mobile-menu shot BYTE-IDENTICAL to s52 (89796 bytes)** — the panel verified open, NO Tailwind v4 bug. The tracked dashboard pair re-shot from the standalone: **pixel-identical (0/2073600 + 0/250125 pixels)**. The proof matrix written (api-session-s53.txt).
Docs aligned. Now the final gate after all doc writes — the CSS-leak spec re-runs LAST per the house rule (gotcha 41): rebuild with all docs present, run the leak spec, then the full e2e split.

**FINAL GATE: 753 FULLY GREEN after all doc writes.** Now the commit + push phase — deploy the SSH key, review the changeset, commit with the house message convention, push via the wrapper (dry-run → real push → remote verified), then shred the key.
**Session 53 complete — pushed to `main` and remote-verified** ✅
