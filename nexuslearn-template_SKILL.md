---
name: nexuslearn-template
description: "NexusLearn — e-learning platform (Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS v4 CSS-first + Prisma 6/SQLite + first-party cookie auth). Complete engineering reference distilled from a 35-session build: pixel-parity clone methodology (computed-style gates + VLM band comparisons + normalized text-content diffs + line-level innerText comparisons + console-error monitoring + a11y-tree snapshots + link/image value inventories + pseudo-element sweeps + SVG class histograms + tag-of-shared-class maps + per-view state diffs + computed box-shadow/border-radius sweeps + hover-state computed-style diffs + focus-ring parity sweeps + scroll-behavior/scroll-reveal comparisons + print-stylesheet comparisons + ::selection/cursor/caret sweeps + computed font/line-height probes + per-element space-y sibling-gap audits + deep-link/query-parameter matrices + form-state persistence sweeps + print-to-PDF page-count comparisons + transient pending-state probes under delayed routes + form-control attribute sweeps + element-tag sweeps + per-route token-theme maps + environment-pollution guards + image loading-attribute inventories + form-validation constraint inventories), the TEN Tailwind v4 migration traps (bare-HSL transparent theme, oklch palette drift, in-oklab gradients, the space-y/space-x selector rewrite — v4's :where() zero-specificity engine lets a child's mt-3 win where v3 overrode it — the shadow-scale shift: v4 renamed v3's shadow-sm to shadow-xs and moved shadow-sm up to v3's bare-shadow geometry, so byte-identical shadow-sm classes render one notch heavier (pin --shadow-sm in @theme inline); the button-cursor preflight drop (v4 removed v3's `button, [role="button"] { cursor: pointer }` — restore it in @layer base); the line-height composition flip (v3's variant-order emission makes a responsive text-* utility's OWN line-height beat a plain leading-*; v4's --tw-leading composition flips the winner — pin the reference winners unlayered and media-scoped); the inline-child space-y gap loss (v4's :where() engine assigns gaps to NON-LAST children as margin-block-end, INERT on inline labels — restore v3's follower-side gap); the overridden-gap loss (a child's own margin utility replaces the :where() gap carrier — the -mb-2 back-button case); and the reveal-killed scale (the reference's scroll-reveal system leaves inline transform: none on every revealed element, permanently killing transform utilities — replicate the RESTING state, not the class), the hardened mobile navigation pattern, the hover-audit methodology rules (v4 gates hover: variants behind @media (hover: hover) — touch-emulating headless browsers produce false parity failures; v4 renders translate-y/scale/rotate via the standalone CSS properties, not transform: matrix — read the right property per stack), the runtime-cascade pin pattern (the reference's Base44 runtime injects a page-level utility sheet AFTER its static build — cascade-ORDER variances flip utility winners with byte-identical classes; the third structural blind spot after token values and DOM nesting; fix with an UNLAYERED rule that beats every @layer rule), the focus-audit methodology (UA-default outline: auto computes dynamic contrast-adaptive values — never probe it for parity; transition-all elements render rings mid-transition — wait 2x the duration; v4's ring composition prefixes empty zero-alpha slots — full-string reads required), the universal scroll-behavior pin (the reference's runtime ships * { scroll-behavior: smooth } — pin the universal rule, not just html), the Next 16 allowedDevOrigins dev-hydration trap, multi-surface SQLite path resolution (CLI vs runtime vs standalone chdir trap), the reference page-shell pattern (main.pt-20 + gray wrapper under the fixed navbar), the reference-behavior parity decisions (sign-in to /, public dashboard, /Home landing WITH its hero-state navbar, 2-col AI section, dark popular pricing card, FAQ stack, expandable About This Course, light-slate 404, in-page CourseDetail not-found, simulated-delivery signup + verify, the login card's 5-view state machine owning the WHOLE card interior), the head-metadata parity layer (root description, OG/Twitter cards, canonicals, logo favicon, manifest, per-route OG identity via a routeMetadata() helper), the CourseDetail sidebar level row + tags-only What-You'll-Learn list, the idempotent seed (Prisma update skips undefined keys — restate optional fields as null), the pricing -mt-8 overlap, the h-9+py-6 input collapse pattern, the chrome-subtree audit pattern (the Navbar lives outside <main> — a main*-scoped class diff never catches its drift), the route-STATE audit pattern (/Home renders the landing CONTENT but its navbar state escaped every audit that only checked content + height), the synced-viewport audit rule (set BOTH browser sessions' viewports in the same command — a live@1920 vs clone@375 comparison produces false 4-digit px drifts), the text-content audit surface (normalized innerText diffs catch copy + glyph drift — U+201C vs U+0022 — that height and class sweeps structurally cannot), and the font-parity principle (a font-family STRING match means nothing if one side loads the webfont and the other falls through — probe document.fonts + a measured probe-string width; the reference ships NO webfont, so every height band was a font-metric artifact until the bundle was removed), the skills/docs/tests CSS-leak exclusion (Tailwind v4's automatic source detection scans EVERY non-gitignored file — 51% of the compiled sheet was unused utilities generated from agent documentation; close it with @source not directives, canary-pinned), the navigation-transition surface (scroll restoration: a CSR SPA's popstate restore is the browser-native instant snap while a scrollTo-based framework restore reads the scroll-behavior CSS — a universal smooth pin turns it into a ~1s glide + a mid-smooth-scroll-click race; suppress smooth for the popstate window ONLY with a scoped unlayered rule; the unmanaged-SPA-router family — scroll carryover clamped by the CSR loading shell, stale document.title, stale focus — is kept deliberately better, spec-pinned; CLS must measure 0 on both), the deep-link/query-parameter surface (Next.js delivers repeated search params as string[] — normalize to the first value or Prisma renders the error boundary; slug-form fidelity in hrefs — the reference's underscore slugs; unknown-param semantics — the reference's raw no-match state, not a defensive fallback; route-casing — the Base44 router matches content routes case-insensitively with /login exact-match, replicated by the Next 16 proxy-convention REWRITE with canonical titles kept deliberately better), the transient-pending-state surface (loading bubbles + pending labels only exist in flight — freeze them with page.route delays; the reference's failure UX is a PERMANENTLY-STUCK pending state its platform never recovers), the form-control attribute surface (placeholders/ids/alts are attributes — invisible to innerText AND class diffs; the bare reference ids name/email/message are also the stronger autofill hints), the element-tag surface (an <a> styled exactly like a <button> passes every class diff but double-focuses and navigates differently — sweep a[href]/button tags + tab order per route; the reference nests <Link><button> on some routes and ships bare inert buttons on others), the element-tag DRIFT surface (identical class strings can ride DIFFERENT tags — a <p> and a <span> sharing one class string in the same flex row are indistinguishable to every class diff, height sweep and screenshot because flex blockifies both; Chrome's innerText gives <p> DOUBLE line breaks, so the line-by-line innerText comparison exposes the drift as blank lines, and the tag-of-shared-class map (compare the tag set for each class string present on BOTH sites) catches the rest — the /Courses span count and the /AIAssistant div composer are the pinned cases), the per-route token-theme discovery (the Base44 runtime injects PER-PAGE token sheets — 10 of 11 routes NEUTRAL, /login alone ZINC; scope the override with body:has() so it covers the whole document), plus the session-21 console/a11y/attribute-VALUE probes (listen to the CONSOLE — kebab-case SVG props render perfectly but log React Invalid-DOM-property errors; snapshot the full A11Y TREE; diff href/src VALUES; count the SVG class histogram), the session-22 interaction-modality/persistence probes (the keyboard Tab-order inventory — the REAL Tab walk is ground truth, the accessible-name hardening family, the invisible-focus guard on the collapsed mobile panel, the no-storage pin, the network-request surface, the media-emulation sweep and the text-scaling surface), the session-23 security-headers + axe-core WCAG probes (the HTTP security-header inventory — a platform-fronted reference ships HSTS/referrer-policy/nosniff that a bare framework app lacks; ship the baseline IN the app and pin it; the axe-core rules-engine scan — color-contrast/heading-order counts are the reference's own DESIGN (parity contract), while link-name/button-name violations quantify the aria-label hardening; settle >=2500ms before scanning a progressively-rendered page), the session-24 performance/web-vitals + response-status probes (the resource-inventory surface — TTFB/FCP/LCP + transfer-weight buckets per route, the cache posture on the static asset classes; the URL-canonicalization surface — an SPA platform returns HTTP 200 for EVERY path while a canonical-URL app ships 308 trailing-slash redirects and real 404 statuses, the SEO-correct deliberate-better family; plus the CSP nonce recipe — the proxy generates a per-request nonce, exposes it on the REQUEST headers so the framework auto-nonces its bootstrap scripts, ships script-src 'self' 'nonce-X' 'strict-dynamic', and REQUIRES per-request rendering: static-prerendered pages bake nonce-less HTML at build time and their scripts BLOCK under strict-dynamic, leaving the pages unhydrated — force dynamic rendering in the ROOT layout so the nonce reaches every script incl. the not-found route), the session-25 CSSOM-inventory + crawler/SEO-file probes (the stylesheet STRUCTURE diff — the full custom-property map, the @media census, the @keyframes census across every sheet; raw-token "value drift" in a sheet census is NOTATION, not color — only COMPUTED values render; the MEDIA-QUERY REM RULE: CSS media queries evaluate rem against the INITIAL font size, not the document root's, so v4's rem-based breakpoints are structurally immune to page-level text scaling exactly like v3's px breakpoints — probed identical at 700-1300px x 16/20px roots; the crawler-FILE bodies — robots.txt/sitemap.xml/manifest.json are their own surface beyond the <head> tags: the manifest's scope was missing (now added in the relative portable form), and the remaining serialization deltas are the Next.js builder's canonical output vs the platform generator's artifact forms — semantically identical to every parser, pinned), the session-26 verb-matrix + form-metadata probes (the METHOD dimension of the response contract — GET-only audits missed that App Router pages render full HTML with 200 for POST/PUT/DELETE, OPTIONS 400s, and the static file handler 500s on non-GET public assets; a platform-fronted reference 405s every non-GET/HEAD on non-API paths — restore it with a proxy method guard (405 + Allow: GET, HEAD + the first-party {error} body) that runs BEFORE path resolution (method beats path: POST on unknown paths 405s while GET keeps its 404 pin) and keeps /api/* handler-owned (405 wrong-verb, 204 auto-OPTIONS); extend the proxy matcher to the static public files so the guard covers the 500 class; the form-control METADATA family — autocomplete/inputMode, the never-swept extension of the attribute surface: the password-manager hardening (signin email/current-password, verify one-time-code + numeric inputmode, signup email/new-password/new-password) is login-card-scoped deliberate-better, GUARD-pinned so it neither gets "fixed" toward the live's bare inputs nor spreads beyond the login card), the session-27 compression + validator/Range probes (the ENCODING and VALIDATOR dimensions of the response contract — browser fetch CANNOT set Accept-Encoding (a forbidden header), so probe via raw Node HTTP: the gzip tier on dynamic pages + API JSON + /_next/static chunks each Vary: Accept-Encoding-guarded (a compressed response without that Vary is a CDN cache-poisoning vector), the public/-statics identity tier, the statics' full ETag/Last-Modified/304/206 validator contract, and the dynamic pages' deliberate no-validator/no-store companion of the per-request CSP nonce; brotli + public/-static compression are proxy-layer capabilities a standalone Node server cannot carry — document them in the deployment guide with the reverse-proxy recommendation, pin compress: true explicitly), and the full test pyramid (106 Vitest unit + 300 Playwright e2e incl. 12 mobile-nav specs)."
version: 3.25.0
last_updated: "2026-10-02"
project_state: "493 tests green (171 unit + 322 e2e); lint/typecheck/build clean; parity verified vs live reference (session-37 /reset-password-parity + reset-token-lifecycle + mailer-timeout pass: THREE fresh-eyes probe families — the session_72-suggested direction (a) (the forgot-password reset token — the drill's step 6, then believed the only remaining stub) plus one independent discovery that REFRAMED it (a REAL functional parity drift) plus one hardening find + one budget pin, each validated against the codebase before the plan — with THREE fixes: (1) THE /reset-password ROUTE SURFACE — a REAL functional parity drift found by probing the live's SPA reset-path guesses (the platform 200s every GET, so the RENDERED view is the only truth — the 404 fingerprint was probed first, then the guesses): the reference SHIPS a password-reset page the clone 404'd. The full reference contract mapped by driving the live's own UI: the bare route (or a non-token query param — probed t/code/key all render the same) shows the 'Invalid Reset Link' state (red circle-alert w-20 h-20 bg-red-100, 'This password reset link is invalid or has expired.', the Back to Login button -> /login); ANY non-empty ?token= renders the 'Set new password' form OPTIMISTICALLY (the validation happens at submit: the two lock-icon inputs pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-400, the 'Must be at least 8 characters' helper under the first only, the Reset password submit + the Back to login text button); the client-side validation renders the live's EXACT messages ('Passwords do not match' / 'Password must be at least 8 characters long') in a shadcn-style [role=alert] (bg-red-50/50 border-red-200 + text-red-800 text-sm inner — a DIRECT form child between the fields div.space-y-5 and the buttons div.space-y-3, the captured position); an invalid token at submit 400s with 'Invalid or expired reset token' (the live's alert text verbatim — the platform API 400 observed); the metadata is the plain 'NexusLearn' title + the canonical/og:url INCLUDING the ?token= query (the CourseDetail ?id= pattern, captured on the live); the page shell is the landmark-less div.min-h-screen flex items-center justify-center bg-gray-50 p-4 (NOT the /login gradient main family); the route is EXACT-MATCH (case variants 404 — the /login family, probed /RESET-PASSWORD + /Reset-Password) and NOT in the sitemap (probed). FIXED via a genuine RED→GREEN TDD cycle: src/app/reset-password/page.tsx (the server page — generateMetadata reading searchParams for the token-bearing canonical; Suspense-wrapped client leaf per Next 16's useSearchParams requirement) + src/components/ResetPasswordForm.tsx (the two view states with the reference classes byte-copied + the client validation + the API error rendering + the success router.push('/login') — the live's success state is unobservable without a valid token, the natural completion documented as the deliberate choice) + the FULL backend round trip: prisma User.resetTokenHash + User.resetTokenExpiresAt (the s35 persistence pattern), src/lib/verification.ts extended with the reset-token family (generateResetToken = 32-byte hex — a BEARER credential's entropy budget vs the 6-digit code; hashResetTokenForStorage = HMAC-SHA256 over the r1: domain prefix — a v1: code hash can never cross-replay; resetTokenMatches timing-safe; resetExpiryFromNow 10-minute); POST /api/auth/forgot-password REWRITTEN from the stub: for an EXISTING user it mints + persists + delivers the reset link through the mailer seam (sendPasswordResetEmail — the simulated log line '[auth] password reset link for <email>: <url> (simulated delivery)' by default, Resend HTTP delivery under the smtp gate), with the mint + hash running BEFORE the user lookup (the shared-cost timing equalizer — both paths pay the same crypto, the s33 precedent) and a MailerError SWALLOWED into the always-ok response (the no-enumeration override: a 502-for-existing-emails-only would BE the enumeration oracle the always-ok shape exists to hide — the signup 502 stays because its caller has already proven the email exists); POST /api/auth/reset-password (the EIGHTH public POST route — the api-guard exact-set pin moved 7→8 deliberately, the gotcha-62 discipline, with the s35 revoke-sessions pin updated in lockstep) consumes the token with the full guard stack (throttle 10/min + the 413 pre-check + the resetToken:128/password field caps): the hash lookup + the timing-safe re-assertion + the fail-closed expiry check (absent expiry = expired) all render the SAME 400 'Invalid or expired reset token'; the success path is ONE atomic update — the new passwordHash + BOTH cleared token fields (single-use) + the sessionVersion bump (a reset kills every outstanding session — the s34 epoch lever re-used) — and the caller's cookie cleared attribute-symmetrically; the .focus:ring-gray-400:focus UNLAYERED cascade pin added to globals.css (the s13 slate-400 family: the live computes gray-400 rgb(156 163 175) on keyboard focus — probed — while the v4 sheet's later-emitted focus-visible:ring-ring would flip the winner); pinned by 28 unit specs + 10 e2e pins (the view states + the back-button navigation + the client validation messages + the invalid-token alert + the forgot-password persistence/always-ok + the FULL mint→consume round trip on a throwaway user — the new-password login 200, the old-password 401, the replayed token dead, the epoch bumped — + the expired-token rejection + the TBT budget); verified by the NEW route's own parity battery (both states × both viewports heights + innerText byte-identical vs the live + all 8 class spot checks identical: shell/h2/input/submit/back/accent/body/alert); (2) THE MAILER TIMEOUT (an independent hardening find): sendVerificationEmail's Resend fetch carried NO signal — a hung/slow Resend endpoint (or a black-hole RESEND_BASE_URL self-host) would pin POST /api/auth/signup indefinitely (the route awaits the delivery inline; requests pile up; the throttle bucket fills with zombies); FIXED: the shared postToResend helper carries a 10s AbortController on every real-delivery fetch (the timeoutMs option exists for the unit battery), the AbortError maps to the typed MailerError -> the existing 502 degrade; pinned by the timeout unit battery (a never-resolving fetch that honors init.signal + a 25ms override) + the source pin; (3) THE TBT BUDGET SPEC (the session_72 direction (c)): the s33 bundle → s34 JS → s35 TTFB → s36 FCP/LCP family extended to interaction latency — per-route main-thread blocking < 500ms on the e2e standalone (measured 0-51ms across the 11-route standing set via the longtask PerformanceObserver, blocking = max(0, duration-50ms) summed — 10x+ headroom); every standing surface re-verified GREEN after the changes (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 10/11 clean, the 11th the by-design 404); the proof matrix docs/screenshots/api-session-s37.txt runs the complete round trip on the dev server (the signup+verify throwaway, the always-ok forgot-password, the log line with the reset LINK, the link's rendered view + the token-bearing canonical, the 200 consumption, the dead replayed token, the new-password login 200 + the old-password 401, the garbage-token 400 with the exact reference message, the identical always-ok for a non-existent email, the UI reset-sent view); 4 new screenshots (the route's two states × both viewports) + the standard matrix recaptured (the three byte-diffs all in the documented families: the remote-image variance + the probe-email timestamp); the fresh-eyes families now number forty-six; the audit scripts persisted at /home/z/my-project/scripts/ s37-*; LESSON: an SPA's catch-all GET means a route's EXISTENCE is only provable through its RENDERED view — probe the 404 fingerprint first, then compare; PREVIOUS STATE (455 tests green (143 unit + 312 e2e); lint/typecheck/build clean; parity verified vs live reference (session-36 unverified-login-gate + mailer-transport + web-vitals-budget pass: THREE fresh-eyes probe families — two of the session_70-suggested directions (the SMTP transport module — the drill's step 1 — and the web-vitals budget family) plus one independent discovery (the unverified-login surface — a REAL functional parity drift), each validated against the codebase before the plan — with THREE fixes: (1) the UNVERIFIED-LOGIN surface: found by driving each site's OWN UI (the live's raw API sits behind the documented platform wall — its raw login POST returns 400 Security verification is required, so the UI error is the observable contract): the reference BLOCKS signing in with an unverified account (the exact message 'Please verify your email before logging in. Check your email for the verification code.' — zero cookies minted) while the clone minted a full session — the entire verification flow was decorative for login purposes; FIXED via a genuine RED→GREEN TDD cycle: the login route checks user.emailVerified AFTER the password-compare 401 gate (the ORDER kills the new-enumeration risk — a wrong password still gets the indistinguishable 401, so the state is only revealed to a caller who already holds the correct password) and returns 403 with the exact message (401 stays the bad-credentials family; the LoginForm renders data.error in the card's [role=alert] with zero client changes); pinned by 3 unit source pins + 4 e2e specs (the 403 + no-cookie, the UI error card staying on /login, the verified-path control, the wrong-password uniform-401); (2) the MAILER TRANSPORT (the DEPLOYMENT-13 drill's step 1 — its ONLY remaining step — now SHIPPED): src/lib/mailer.ts, a zero-new-dependency transport seam (the Resend HTTP API is a plain fetch POST — the session-32 hygiene precedent) with three modes behind the same AUTH_DELIVERY gate the s35 comparison reads: simulated (the default — the EXACT s35 console.info line, so the s35 log-grep proofs keep working), resend (AUTH_DELIVERY=smtp + RESEND_API_KEY + the optional EMAIL_FROM/RESEND_BASE_URL knobs), and misconfigured (smtp without a key — FAILS LOUD: the typed MailerError degrades the signup route to a 502; the account row persists so the verify-view's Resend button recovers); the signup route delegates BOTH branches (create + unverified-resend) to the seam; the end-to-end proof (docs/screenshots/api-session-s36.txt) runs a smtp-mode standalone against a local mock endpoint: the wire POST (Bearer + from/to/subject + the code in text AND html), the wrong code 400, the DELIVERED code 200 — the complete delivery+comparison loop; pinned by 14 unit specs (the seam battery incl. the wiring + 502 source pins) + one deliberate s35 pin update (the signup-delivery source pin now asserts the transport-seam delegation); (3) the WEB-VITALS BUDGET (the s33 bundle → s34 JS → s35 TTFB family extended to paint): per-route FCP < 2000ms + LCP < 5000ms on the e2e standalone (measured FCP 136-468ms, LCP 164-1432ms — 4x+/3.5x+ headroom; the FCP uses a POLL because the /login paint entry can postdate the load event, measured 224ms there); every standing surface re-verified GREEN after the changes (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 10/11 clean, the 11th the by-design 404); the fresh-eyes families now number forty-three; the audit scripts persisted at /home/z/my-project/scripts/ s36-*; PREVIOUS STATE (session-35 433 tests green (126 unit + 307 e2e); lint/typecheck/build clean; parity verified vs live reference (session-35 verification-code-persistence + self-service-revocation + TTFB-budget pass: THREE fresh-eyes probe families — the session-68 suggested directions, each validated against the codebase before the plan — with THREE fixes: (1) the VERIFICATION-CODE PERSISTENCE surface (the DEPLOYMENT-13 SMTP drill's first half): the signup route generated a 6-digit code, logged it via console.info, and DISCARDED it while POST /api/auth/verify accepted ANY complete 6-digit code (probed end-to-end: the wrong code 000000 verified the account, minted the session, and flipped emailVerified — the verified badge was decorative; anyone could claim an email they do not own); FIXED via a genuine RED-GREEN TDD cycle: User.verificationCode (an HMAC-SHA256 hash of the code keyed by AUTH_SECRET — never the raw digits, so a DB leak does not expose live codes; the v1: prefix keeps the HMAC domain-separated from session tokens) + User.codeExpiresAt (a 10-minute TTL, fail-closed when absent), the pure seam src/lib/verification.ts (generateVerificationCode / hashCodeForStorage / codeMatches timing-safe / codeExpiryFromNow / isCodeExpired / codeComparisonEnabled), the signup route persisting hash + expiry in BOTH branches (create + unverified-resend, keeping the console.info log as the simulated delivery channel), and the verify route comparing for real under the AUTH_DELIVERY=smtp gate (the drill's step 5: the simulated any-code contract stays the dev/test default because without a transport the legitimate user cannot receive the code either — the e2e suite runs with the gate unset and stays green with zero edits; proven end-to-end on a dedicated smtp-mode standalone :3500 — the wrong code 400s, the real code grepped from the server log 200s — docs/screenshots/api-session-s35.txt); BOTH fields clear on every successful verify (either mode — a consumed code is dead); pinned by 13 unit specs (the seam battery + the persistence/wiring source pins) + 2 e2e pins (the row carries the hash + the ~10-minute expiry after signup; both fields cleared after the any-code verify); (2) the REVOKE-SESSIONS lever (the self-service revocation surface): the session-34 epoch existed ONLY as raw SQL in DEPLOYMENT-12 — an account owner who suspected a leaked cookie had no first-party way to revoke their own sessions; FIXED with POST /api/auth/revoke-sessions (authed; deliberately unthrottled like every authed route — an attacker WITH the cookie wants to revoke, an attacker WITHOUT it gains nothing): ONE indexed sessionVersion increment kills every outstanding token for the caller + the attribute-symmetric cookie deletion; the account survives (a fresh login re-mints at the bumped epoch); the UI affordance DELIBERATELY DEFERRED (any Dashboard/login surface addition would break the byte-exact height parity — the live has no such surface; the route is the zero-visual-footprint form); pinned by the source pin (tests/revoke-sessions-source.test.ts) + 1 e2e pin (401 anon -> 200 authed -> old token dead -> fresh login works; uses a THROWAWAY user because the seed's upsert preserves a bumped sessionVersion across runs — the cross-run-state trap that would have broken the s32 control's ver-less mint for the demo user); LESSON: probe an authed route's anonymous contract BEFORE any call that stores a cookie in the shared request jar — the playwright request fixture accumulates cookies within one test, so a later 'anonymous' post silently carries the session; (3) the PER-ROUTE TTFB BUDGET surface (the s34 bundle-budget precedent applied to server latency): measured per-route TTFB on the production standalone (raw Node http, 3 rounds, medians): / 24ms, /Home 31ms, /Courses 24ms, /Pricing 14ms, /About 8ms, /Contact 15ms, /BecomeInstructor 13ms, /AIAssistant 7ms, /Dashboard 12ms, /login 12ms, /CourseDetail 12ms — every route fast but nothing pinned it (an N+1 storm, a missing index, or a synchronous external call in a render path would silently ship); PINNED by the budget spec (median-of-3 < 500ms per route on the e2e standalone — 16-70x headroom over the measurements, effectively unflakeable while still catching the pathological regressions); every standing surface re-verified GREEN after the changes (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 10/11 clean, the 11th the by-design 404); the fresh-eyes families now number forty; the audit scripts persisted at /home/z/my-project/scripts/ s35-*; PREVIOUS STATE (session-34 416 tests green (113 unit + 303 e2e); lint/typecheck/build clean; parity verified vs live reference (session-34 revocation-epoch + bundle-budget + SMTP-drill pass: THREE fresh-eyes probe families — the SESSION-REVOCATION/DELETED-USER dimension of the session contract, the PER-ROUTE-DELIVERED-JS-BUDGET dimension of the footprint contract (recorded as a spec), and the SMTP-TRANSPORT-DRILL dimension (docs) — with ONE source fix + two pins: (1) the session-revocation / deleted-user surface (the session-33 suggested direction): getSession() verified the HMAC + the session-32 iat bounds but NEVER re-validated the user against the database — a DELETED user's token authenticated until its 7-day iat bound (verified end-to-end on the dev server via the ghost-token probe: signup + verify a throwaway to mint a real cookie, DELETE the user row via the side-channel Prisma client, re-present the SAME cookie to /api/auth/me → 200 + the full user object; only the schema's FK stopped ghost WRITES, with zero orphan rows persisted); FIXED via a genuine RED→GREEN TDD cycle: the per-user epoch — User.sessionVersion Int @default(0) (the schema column), embedded in the SIGNED payload at mint (ver — createSessionToken(user, sessionVersion); the two minting routes login + verify pass the user's current sessionVersion) and re-compared on every getSession() read (ONE indexed db.user.findUnique in the src/lib/auth.ts adapter selecting email/name/sessionVersion; the pure session.ts stays DB-free for the unit layer); null when the user is gone (the ghost case), null when user.sessionVersion !== token.ver (the epoch bump); the session's email/name also refresh from the row (a renamed user's token cannot serve stale claims); pre-34 tokens carry no ver → read as 0 → match the schema default → stay valid (no forced re-login wave); the operator levers: UPDATE User SET sessionVersion = sessionVersion + 1 kills that user's outstanding tokens WITHOUT rotating the global AUTH_SECRET, deleting the user kills them too (documented in DEPLOYMENT.md); the session-32 e2e control had PINNED the ghost behavior (it minted a token for a NONEXISTENT userId and asserted 200 — the pin codified the blind spot, the session-33 lesson exactly) — UPDATED to mint for the real seeded demo user looked up via the spec-side PrismaClient; pinned by 7 unit specs (tests/session-revocation.test.ts: the ver embed/return battery + the pre-34 graceful-compat contract + three source pins — the getSession DB re-validation, the minting routes' sessionVersion pass, the schema column) + 2 e2e pins (the ghost probe with the spec-side delete; the epoch bump with the fresh-login control proving the mechanism is the epoch, not a broken account); LESSON: a stateless token's claims are a CACHE of the user, not the user — re-validate the row on every read or deletion is not revocation; (2) the per-route delivered-JS budget surface (the s33-suggested direction, the recorded baseline converted into a spec): measured per-route delivered JS on the production standalone across 10 routes — /Courses 662.3 KB (91% of the live's 727 KB SPA monolith), /Contact 657.0, /AIAssistant 578.3, /Dashboard 573.0, /CourseDetail 569.6, / 569.0, /Pricing + /About + /BecomeInstructor 566.6, /login 536.8 — every route UNDER the live ceiling; PINNED by the budget spec (every route's same-origin .js response-body sum < 727 KB — the semantic ceiling: the clone must never deliver more JS per route than the reference's monolith; a heavy shared-chunk import trips RED); (3) the SMTP-transport drill (the s33-suggested direction, docs): the concrete swap-in drill for the simulated verify-code + reset deliveries — the seam (the console.info code log + the any-code-verifies contract), the swap (a transport module + real code comparison), the test impact (the e2e signup/verify specs rely on the simulated contract) — now in DEPLOYMENT.md §12 with the PAD §10 known issue pointing at it; every standing surface re-verified GREEN after the changes (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 9/10 clean); the fresh-eyes families now number thirty-seven; the audit scripts persisted at /home/z/my-project/scripts/ s34-*; PREVIOUS STATE (session-33 verify-guard-net + timing-equalizer + enforced-secret pass: 406 tests green (106 unit + 300 e2e); lint/typecheck/build clean; parity verified vs live reference (session-33 verify-guard-net + timing-equalizer + enforced-secret pass: FOUR fresh-eyes probe families — the SEVENTH-PUBLIC-POST-ROUTE dimension of the guard contract, the TIMING-ENUMERATION dimension of the auth contract, the FORGEABLE-FALLBACK dimension of the secret contract, and the BUNDLE-SIZE dimension (recorded) — with THREE fixes: (1) the verify-route guard surface: POST /api/auth/verify — the signup-verification route that MINTS the session cookie — had escaped the session-31 guard net entirely (verified on the production standalone: a 14x burst returned 14x 200 with every request verifying the account AND minting a cookie, zero 429s; a >1MB body was PARSED — 400 not the guarded 413; a 100KB email passed the regex and reached the DB lookup un-capped; the same burst against /api/auth/login on the SAME server tripped the throttle — the machinery existed, the route was simply never wired); FIXED via a genuine RED→GREEN TDD cycle: the full guard stack wired (limiter-first + the 413 pre-check + the email field cap; RATE_LIMITS.verify = 10, signup's sibling — the UI sends one verify per signup, the e2e suite exactly one per run: 10x headroom); the source pin re-pinned to the exact SEVEN-route set; LESSON: enumerate every route that both accepts public POSTs AND mints/changes auth state — the exact-set pin is the discipline that catches the next escapee; (2) the login-timing enumeration surface: the login 401 path leaked user existence through RESPONSE TIMING (the user-not-found path short-circuited in ~6ms while the user-exists path burned scryptSync ~35ms — a 29ms oracle, 12/12 interleaved probe pairs cleanly separated ~5x; the reference's login is platform-walled so no parity dimension — the clone's own first-party auth hygiene, the same family as the no-enumeration forgot-password design); FIXED via a genuine RED→GREEN TDD cycle: user?.passwordHash ?? timingEqualizerHash() — the lazily-cached dummy scrypt hash that makes BOTH paths pay the same compare (post-fix drift measured 0ms: 37ms vs 38ms medians); pinned by 5 unit specs (the equalizer battery + the login-route source pin) + 1 e2e floor spec (median of 7 no-user 401s >= 12ms — the floor sits between the measured pre-fix ~6ms and post-fix ~30ms with 2x margin both sides; scrypt's default params are memory-hard so the post-fix cost cannot realistically fall below it); LESSON: a timing measurement is VOID on a poisoned throttle bucket (the 429 short-circuit returns in ~2ms and silently flattens the oracle) — always measure on a fresh server; (3) the forgeable-fallback surface: a production deployment without AUTH_SECRET signed and verified tokens with the PUBLIC repo fallback constant (verified end-to-end on a deliberately secretless production standalone: a token forged with nothing but the source code was ACCEPTED by /api/auth/me — 200 + the seeded demo user — complete authentication forgery; the only signal was a console.warn trivially missed in deployment logs; the control twin with a real secret correctly rejected the same token); FIXED via a genuine RED→GREEN TDD cycle: resolveSessionSecret(env) — the PURE resolver that throws the typed SessionSecretError when NODE_ENV=production and the secret is unset/short/empty (the message carries the actionable fix: openssl rand -hex 32); getSecret() delegates to it; the two MINTING routes (login + verify) RETHROW the typed error past their catch-alls so the misconfigured deployment fails LOUD (500) instead of being muted into a generic 400; dev/test keep the zero-config fallback; anonymous public pages keep rendering (the null-cookie path returns BEFORE the secret is read — only cookie-bearing/auth-using requests fail fast, exactly where a smoke test looks); pinned by 7 unit specs (the resolveSessionSecret battery); LESSON: a documented REQUIRED is not an enforcement — a log line is not a failure; enforce the contract at the seam where it is consumed; (4) the bundle-size surface RECORDED (the live delivers 727 KB of JS on every route — one SPA app bundle, measured via response bodies on 4 routes; the clone's standalone client chunk pool is 22 files / 766 KB total with routes loading only their needed subset via RSC code-splitting — per-route delivery strictly lower; no action, the baseline for any future budget pass); every standing surface re-verified GREEN after the changes (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 9/10 clean); the fresh-eyes families now number thirty-four; the audit scripts persisted at /home/z/my-project/scripts/ s33-*; the session-62 suggested directions executed (the verify-guard escape found by fresh-eyes enumeration, the timing oracle, the enforced secret) plus the bundle baseline; PREVIOUS STATE (session-32 auth-session-lifetime + dependency-hygiene pass: auth-session-lifetime + dependency-hygiene pass: THREE new fresh-eyes probe families — the AUTH-SESSION-LIFETIME/COOKIE-HARDENING dimension of the session contract, the DEPENDENCY-AUDIT dimension (bun audit + lockfile consistency), and the ARIA-LIVE POLITENESS dimension of the a11y contract — with FIVE fixes: (1) the auth-session-lifetime surface: the server NEVER enforced the advertised 7-day session window (verifySessionToken decoded the token iat but never bounded it — the promise lived ONLY in the browser cookie jar maxAge; a restored/backed-up/exported nexus_session authenticated FOREVER; verified: a token re-signed with the same secret but iat shifted 30d past returned the user from /api/auth/me; the live reference stores its JWT in localStorage with no server-visible expiry either — deliberate-better hardening of the clone first-party-cookie contract, NOT a parity gap); FIXED via a genuine RED→GREEN TDD cycle: the iat bounds in src/lib/session.ts (missing/malformed → reject; future beyond SESSION_CLOCK_SKEW_MS = 60s → reject; older than SESSION_MAX_AGE_MS = 7d → reject) with the constants hoisted to the single source of truth (SESSION_MAX_AGE / SESSION_MAX_AGE_MS / SESSION_CLOCK_SKEW_MS — the cookie maxAge and the verify window are the same number by construction; src/lib/auth.ts re-exports); the same sweep fixed the logout deletion-cookie attribute asymmetry ({ ...sessionCookieOptions, maxAge: 0 } — HttpOnly/SameSite/Secure/Path present on the clearing header); pinned by 11 unit specs (the boundary battery) + 3 e2e pins (stale 30d token → user null, future+2min token → user null, the fresh-token control proving the mint is faithful); LESSON: the browser cookie jar maxAge is not an enforcement — the SERVER must re-validate every claim inside the token; (2) the dependency-audit surface: bun audit flagged ONE HIGH (GHSA-ggr8-5vv4-36mx — deepmerge-ts < 8.0.0 stack exhaustion via prisma → @prisma/config → deepmerge-ts@7.1.5 exact-pin; CLI-time config path only, never reachable over HTTP); FIXED with the bun overrides field (deepmerge-ts@^8.0.2 — the same deepmerge named export; db:push + db:seed round-trip + full gate verified; bun audit clean) + the removal of the scaffold-era stale package-lock.json (silently drifted from package.json; bun.lock is the single authoritative lockfile) — pinned by tests/dependency-pin.test.ts; LESSON: audit the dependency tree AND the lockfile CONSISTENCY, not just the code; (3) the aria-live politeness surface: NEITHER site exposes any aria-live/role=status surface on /AIAssistant (a blind learner gets zero feedback after pressing Enter); FIXED deliberate-better (the aria-label family of sessions 18/22): aria-live=polite on the chat messages region + role=status on the Thinking bubble — attributes invisible to the class/height/innerText/tag parity surfaces (re-verified 18/18/18 after the change); pinned by 1 e2e pin incl. the real answer flow; every standing surface re-verified GREEN (heights x9 routes x2 viewports byte-exact 18/18; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 9/10 clean); the fresh-eyes families now number thirty-one (the auth-session-lifetime/cookie-hardening + the dependency-audit + the aria-live-politeness surfaces); the audit scripts persisted at /home/z/my-project/scripts/ s32-*; the session-60 suggested directions executed exactly (the auth-session-lifetime/cookie-hardening probe + the aria-live politeness family + the dependency-audit pass); PREVIOUS STATE (session-31 request-size + rate-limit pass: TWO new fresh-eyes probe families — the REQUEST-SIZE/PAYLOAD-DEPTH dimension of the writing-API contract and the RATE-LIMITING/ABUSE-THROTTLE dimension of the public API contract — with TWO source fixes, both in the deliberate-better hardening family: (1) the request-size/payload-depth surface: the clone's public writing routes accepted and PERSISTED unbounded strings — POST /api/newsletter with a 1MB email returned 200 + the row, POST /api/contact with a 2MB message likewise, and POST /api/auth/signup with a 1MB email created a User whose derived name was also ~1MB (one curl per row could bloat the SQLite file without limit; the junk rows inspected in the dev database then cleaned); the deep-JSON probes (5k/50k nesting, 10k-item arrays, non-object JSON) all fail cleanly into the existing 400 catch — only the persisted-STRING LENGTH needed guarding; the live reference offers no contract for these shapes (its platform layer 405s every external POST to the writing APIs and demands Security-verification on login — its SPA submits through the Base44 internal channel, so the clone owns this surface entirely, the keep-our-own-forms family); FIXED via a genuine RED→GREEN TDD cycle: the two-layer guard src/lib/request-guard.ts — the Content-Length pre-check (strictly > 1MB → 413 before any parse; the largest legitimate request is the ai-chat history at ~48KB) + the field caps after extraction (400 with the specific message; email 254 = RFC 5321 max, password 1024, name/subject 200, message 10,000, ai-chat turns 100 — every cap >= 40x the seeded catalog's longest field), wired into all six public POST routes; pinned by 6 e2e specs (the newsletter/contact/signup/login field caps incl. the zero-persistence assertion via the spec-side PrismaClient, the 413 body pre-check, the ai-chat turn cap, the contact happy-path guard) + 4 unit specs (the boundaries + the FIELD_LIMITS table pin); LESSON: bound WHAT a route persists, not just the references it accepts (the session-30 lesson's string-field complement), and probe the live's API protection before believing any contract — its 405 wall is platform code, not app code; (2) the rate-limiting/abuse-throttle surface: NEITHER site throttles (12-request rapid bursts x4 sequences produced zero 429s, zero Retry-After, zero x-ratelimit headers on both sites) — but the live is protected by its platform wall while the clone's first-party API was wide open (any script could hammer /api/auth/login — a scrypt CPU burn per attempt — plus the newsletter/contact DB bloat and the ai-chat LLM cost with no ceiling); FIXED via a genuine RED→GREEN TDD cycle: the in-memory fixed-window per-IP throttle src/lib/rate-limit.ts (429 + Retry-After + the house {error} body; login 30/min, signup + forgot-password 10, newsletter + contact 15, ai-chat 30 — thresholds sized >= 4x the MEASURED e2e load; clientIp() = x-forwarded-for first value → x-real-ip → the local sentinel; the expired-bucket sweep bounds the tracked-key map at 5,000 against spoofed x-forwarded-for; the authed routes — enrollments, progress, logout, me — deliberately unthrottled, documented; the store is per-process — one instance per deployment, DEPLOYMENT.md §9), wired as the FIRST statement of each of the six handlers (a 429 must not pay the parse cost); pinned by 2 e2e specs (the happy-path guard + the 20-request burst tripping 429 + Retry-After — the burst spec is deliberately the suite's LAST API-touching spec; its bucket stays poisoned for the window's remainder and every full-suite run boots a fresh server process) + 12 unit specs (the verdicts/rollover/isolation/sweep/clientIp-precedence battery) + the api-guard source pin (all six public POST routes wire BOTH guards, limiter-first); every standing surface re-verified GREEN (heights x9 routes x2 viewports byte-exact 18/18 — the one first-run /Dashboard diff was the known enrollment-state artifact, re-seeded and re-probed byte-exact; innerText 18/18 identical; tag-of-shared-class drift 0; the mobile battery fully identical — trigger byte-identical md:hidden p-2 rounded-lg text-white/80, panels 375x469, link geometry byte-identical, NO Tailwind v4 bug; console sweep 9/10 clean); the fresh-eyes families now number twenty-eight (the request-size/payload-depth + the rate-limiting/abuse-throttle surfaces); the audit scripts persisted at /home/z/my-project/scripts/ s31-*; the session-56 suggested directions executed exactly (the rate-limiting probe + the request-size guard sweep))"
---

# NexusLearn — Complete Engineering Skill

> Single Next.js application (no monorepo) that clones a production e-learning
> reference app to pixel and behavioral parity: marketing site, course catalog,
> enrollment with per-lesson progress, learner dashboard, AI study assistant.
> Runtime is **bun**; database is SQLite via Prisma; auth is first-party
> (HMAC cookie + scrypt) — no external providers.

---

## Table of Contents

1. [Project Identity & Design Philosophy](#1-project-identity--design-philosophy)
2. [Tech Stack & Environment](#2-tech-stack--environment)
3. [Bootstrapping & Configuration](#3-bootstrapping--configuration)
4. [The Design System (Code-First)](#4-the-design-system-code-first)
5. [Component Architecture & Patterns](#5-component-architecture--patterns)
6. [Client/Server Boundary Patterns](#6-clientserver-boundary-patterns)
7. [Data Model & Seed Parity](#7-data-model--seed-parity)
8. [Accessibility Implementation](#8-accessibility-implementation)
9. [Anti-Patterns & Common Bugs](#9-anti-patterns--common-bugs)
10. [Debugging Guide](#10-debugging-guide)
11. [Pre-Ship Checklist](#11-pre-ship-checklist)
12. [Lessons Learnt & How to Avoid Them](#12-lessons-learnt--how-to-avoid-them)
13. [Pitfalls to Avoid](#13-pitfalls-to-avoid)
14. [Best Practices](#14-best-practices)
15. [Coding Patterns](#15-coding-patterns)
16. [Coding Anti-Patterns](#16-coding-anti-patterns)
17. [Responsive Breakpoint Reference](#17-responsive-breakpoint-reference)
18. [Z-Index Layer Map](#18-z-index-layer-map)
19. [Color Reference (Complete)](#19-color-reference-complete)
20. [TypeScript Interface Reference](#20-typescript-interface-reference)
21. [Appendix A — The Parity Workflow](#appendix-a--the-parity-workflow)
22. [Appendix B — Quick Reference Card](#appendix-b--quick-reference-card)

---

## 1. Project Identity & Design Philosophy

**What it is:** a faithful clone of `nexuslearn-template.base44.app` — an
e-learning product loop: browse → sign in → enroll → track progress → ask the
AI assistant. Everything runs from ONE Next.js app with a zero-config SQLite
database and first-party cookie sessions.

**The three pillars:**

1. **Parity is a requirement, not a nicety.** Shared chrome (buttons, cards,
   nav, footer) uses class strings copied verbatim from the reference DOM; the
   v3-era color palette is pinned so computed styles match byte-for-byte;
   behavioral quirks of the reference (sign-in returns to `/`, dashboard
   renders for signed-out visitors, `/Home` renders the landing) are
   replicated deliberately and pinned by e2e specs.
2. **Improvements are allowed where the reference is broken.** The reference's
   enroll button and "Continue with Google" are dead template buttons; this
   clone implements REAL enrollment + progress + AI chat. The reference has no
   ARIA and no scroll lock on its mobile menu; the clone adds both. Document
   every such decision (PAD §10) so future agents don't "fix" them backwards.
3. **The local gate is the only gate.** No hosted CI — the required sequence
   is `lint → typecheck → test → build → test:e2e`, all green before push.

**Project layout:** single app, routes mirror the reference casing
(`/Courses`, `/AIAssistant`, `/CourseDetail?id=…`, `/BecomeInstructor`,
`/Dashboard`, `/login`), `skills/` folder ships as reference material and is
excluded from tsconfig/eslint/vitest/playwright.

---

## 2. Tech Stack & Environment

| Layer | Technology | Locked version | Why |
|---|---|---|---|
| Framework | Next.js (App Router, `output: "standalone"`) | 16.3.6 | Server components + route handlers |
| UI runtime | React (function components only, no forwardRef) | 19.3 | Reference stack |
| Language | TypeScript strict (noImplicitAny off) | 5.9 | Reference stack |
| Styling | Tailwind CSS **CSS-first** (no config JS) | 4.3.3 | Reference stack parity |
| Components | shadcn/ui-style + Radix primitives + CVA | latest | Reference markup uses shadcn buttons |
| ORM | Prisma (SQLite provider) | 6.19 | Zero-config local dev |
| Auth | first-party `node:crypto` (HMAC-SHA256 + scrypt) | — | No provider lock-in |
| AI | z-ai-web-dev-sdk (server-only) | 0.0.18 | Study assistant |
| Unit tests | Vitest (node env) | 5.0 | Pure seam testing |
| E2E | Playwright (Chromium) | 1.63 | Production-fidelity flows |
| Runtime/PM | **bun** (`bun.lock` the ONLY lockfile — session 32 removed the stale `package-lock.json`; never re-add it) | 1.3.x | Fast installs |

**Environment variables** (`.env.example` is canonical):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:../db/custom.db` — schema-relative (resolves against `prisma/`); absolute path in production |
| `AUTH_SECRET` | production | HMAC session secret (`openssl rand -hex 32`); insecure dev fallback warns |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin for metadata/robots |

**Test inventory (verified green):** 106 unit tests across 19 files
(`auth.test.ts` 5, `course-tags.test.ts` 3, `course-eyebrow.test.ts` 3,
`seed-data.test.ts` 16 — incl. the reference imagery/avatar map,
lesson-count pins, display-order pins, the longDescription presence matrix
and the metadata helper, the request-size guard, the per-IP throttle, the
seven-route api-guard source pin, the session-lifetime boundary battery,
the logout-cookie + dependency pins, the session-33 login timing-equalizer
battery + the secret-enforcement battery) +
300 e2e specs across 2 files (`mobile-navigation.spec.ts` 12,
`nexuslearn.spec.ts` 288 — incl. the 9
session-3 parity specs, the 16 session-4 specs (page shells, About-Course,
AI chat shell, 404, robots/sitemap), the 18 session-5 specs (head
metadata incl. manifest, the login 5-view state machine (reset, reset-sent,
signup, 6-digit verify, duplicate-email + password-mismatch errors), the
in-place newsletter success state, the CourseDetail not-found state, the EQ
eyebrow short label, Home-active-on-/ nav state and the BI/Pricing/About
class parity pins), the session-6/7 blocks, the 15 session-8 specs (the
About-presence matrix across all 9 courses — the seed-idempotency guard,
the tags-only WYL list + single divider level row, and the Dashboard class
parity: bare stats grid, lucide stat icons, empty-state button bases), the
6 session-9 specs (the Tailwind v4 space-y engine trap — the mobile
panel CTA's 4px reference gap + the 405px open panel + the panel button
base; the bare trigger string on both nav states; the desktop My Dashboard
button base trio; the logo span byte order), the 5 session-10 specs
(the /Home hero-state navbar on desktop + mobile incl. the scroll flip and
the 404 wrapper hardening pin), the 8 session-11 specs (the landing copy
+ glyph pins — the Digital Marketing Pro path description + the ASCII
testimonial quotes; the login card-interior ownership — the reset /
reset-sent / signup / verify views replace the whole card body with no
logo/h1/Google/OR, the reset input's text-base variant, and the chrome
restored on the round trip back to sign-in) and the 6 session-12 specs
(the Tailwind v4 shadow-scale shift — COMPUTED box-shadow pins for the
white navbar, the login Sign in button, the hero secondary CTA and the
lesson-row hover at the v3 `0 1px 2px/0.05` geometry, plus the md/lg/xl/2xl
GUARD specs proving the rest of the scale was never shifted) and the 8
session-13 specs (the login focus-ring cascade pin — the signin/signup/
reset inputs' keyboard-focus ring reads slate-400 with GUARD specs proving
the /Contact input + the Sign in button keep the `--ring` near-black; the
signin-view reference nesting — the OR divider + form are the space-y-3's
siblings inside the `div.w-full`, the space-y-3 wraps ONLY the Google
button, the 24px gaps pinned; the universal scroll-behavior — body + main
sections compute smooth).

---

## 3. Bootstrapping & Configuration

```bash
bun install
bun run db:push     # create db/custom.db from prisma/schema.prisma
bun run db:seed     # 9-course reference catalog + 1,904 lessons + demo user
bun run dev         # http://localhost:3000
```

**Scripts that matter** (package.json):

| Script | What it does |
|---|---|
| `dev` | `next dev -p 3000` (tees to dev.log) |
| `build` | `next build` + copies `static/` and `public/` into `.next/standalone/` |
| `start` | `NODE_ENV=production bun .next/standalone/server.js` |
| `test` / `test:e2e` | Vitest / Playwright (e2e REQUIRES `build` first — boots :3100 with `db/e2e.db`) |
| `db:push` / `db:seed` | Prisma schema push + idempotent seed |

**Configuration files and their invariants:**

- `next.config.ts` — `output: "standalone"`, `reactStrictMode: true`,
  `images.remotePatterns` allowlists `images.unsplash.com` +
  `qtrypzzcjebvfcihiynt.supabase.co`.
- `tsconfig.json` — strict, `@/*` → `./src/*`, **excludes `skills`**.
- `eslint.config.mjs` — flat config, extends next core-web-vitals + TS;
  `no-img-element` deliberately off (reference parity uses `<img>`); ignores
  include `skills`.
- `vitest.config.ts` — node env, `include: ["src/**/*.test.ts", "tests/**/*.test.ts"]`
  (never matches `tests/e2e/*.spec.ts`), `@` alias.
- `playwright.config.ts` — 1 worker (shared seeded SQLite), `globalSetup`
  pushes+seeds+resets `db/e2e.db`, `webServer` boots the standalone build on
  :3100 with explicit `DATABASE_URL=file:../db/e2e.db` +
  `AUTH_SECRET=playwright-e2e-session-secret`.
- `postcss.config.mjs` — `@tailwindcss/postcss` only.

---

## 4. The Design System (Code-First)

Everything lives in `src/app/globals.css`. **There is no `tailwind.config.js`
and there must never be one** (Tailwind v4 is CSS-first).

### 4.1 Token architecture

```
@theme inline  — maps --color-* to the :root vars (shadcn bridge)
:root           — shadcn HSL base, MUST be hsl()-wrapped full values
@theme          — pinned v3-era utility palette + brand tokens
```

### 4.2 The two non-negotiable palette rules

1. **`hsl()` wrapping:** `--background: hsl(0 0% 100%)` — never the v3-style
   bare triplet `0 0% 100%`. Under `@theme inline` a bare triplet computes to
   **transparent**. This bug produced an all-transparent theme and was found
   via `getComputedStyle(document.body).backgroundColor`.
2. **Pinned v3 hexes:** `--color-gray-900: #111827` etc. for gray/slate/
   cyan/purple/pink/…. Tailwind v4's default oklch palette drifts 1–3 sRGB
   units per channel from the v3 hexes the reference renders, breaking
   computed-style parity AND changing rendered `rgb()` strings.

### 4.3 Brand tokens (measured from the reference `:root`)

| Token | Value | Usage |
|---|---|---|
| `--color-brand-cyan` | `#18ccfc` | gradient start |
| `--color-brand-purple` | `#6344f5` | gradient end |
| `--color-brand-pink` | `#ae48ff` | gradient text end |
| `--color-cosmic-950` | `#0a0a1a` | dark section gradient edge |
| `--color-cosmic-900` | `#0d0d2b` | dark section gradient middle |

### 4.4 Gradients — the `in oklab` trap

Tailwind v4's `bg-gradient-to-br` emits `linear-gradient(to bottom right in
oklab, …)`; the reference (v3) emits plain sRGB interpolation. For dark hero
sections this is visually negligible but breaks computed-style equality. The
parity solution is the arbitrary-value class:

```tsx
<div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]">
```

This renders `linear-gradient(to right bottom, rgb(10,10,26), rgb(13,13,43),
rgb(10,10,26))` — byte-identical to the reference. Content pages keep the
utility form (`bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]`)
where the hero is not parity-gated.

### 4.4b The shadow-scale shift — the FIFTH v4 trap (session 12)

Tailwind v4 renamed v3's `shadow-sm` (`0 1px 2px rgb(0 0 0/0.05)`) to
`shadow-xs` and moved `shadow-sm` up to v3's bare-`shadow` geometry
(`0 1px 3px/0.1 + 0 1px 2px -1px/0.1`) — every byte-identical `shadow-sm`
class renders ONE NOTCH heavier on v4 (the white navbar, the login buttons,
the shadcn ui primitives, 21 usages + every `hover:shadow-sm` incl. the
380-per-course lesson rows). md/lg/xl/2xl are UNCHANGED. Class diffs are
structurally blind to it (same classes, different token value) — only a
computed box-shadow sweep can see it. The fix is the token pin in
`globals.css` `@theme inline` (the ADR-005 palette-pin precedent — one line,
zero class changes):

```css
/* Tailwind v3-era SHADOW scale, pinned for parity with the original app */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
```

Pinned by the session-12 specs (computed box-shadow assertions with v4's
empty composition slots stripped, plus GUARD specs on shadow-lg/2xl). When
diffing computed shadows, split components parens-aware and drop the
`rgba(0, 0, 0, 0) 0px 0px 0px 0px` slots v4's var-composition emits.

### 4.4c The runtime-cascade pin — cascade-ORDER variances (session 13)

The reference app (Tailwind v3 + the Base44 runtime) injects a page-level
utility `<style>` sheet AFTER its static build. On `/login` that runtime
sheet re-asserts `.focus:ring-slate-400:focus` at a later cascade position,
which wins `--tw-ring-color` over the static
`.focus-visible:ring-ring:focus-visible` whenever BOTH pseudos match
(keyboard focus — the norm for text inputs): the reference's login inputs
render a SLATE-400 focus ring, not the `--ring` near-black. A single
compiled v4 sheet emits the focus-visible variant later (alphabetical
variant order), so the winner flips on the clone. **This is the third
structural blind spot with byte-identical classes** — after the shadow-scale
shift (token VALUES, session 12) and DOM nesting (session 13): class diffs,
text diffs, height sweeps and computed-shadow buckets are ALL blind to it.
Only a per-pseudo computed-property probe (`--tw-ring-color` under real
focus) can see it. The fix is the UNLAYERED rule (unlayered beats every
`@layer` rule in the cascade — the cascade-layers spec does the work):

```css
/* globals.css, AFTER the @layer blocks */
.focus\:ring-slate-400:focus {
  --tw-ring-color: var(--color-slate-400);
}
```

### 4.4d The session-14 trap family — preflight deltas, composition flips and dead utilities (session 14)

Five more v4 traps, all with byte-identical class strings, all found by
computed-value probes (the structural-blind-spot family now numbers FOUR
classes: token values, DOM nesting, cascade order, and PREFLIGHT deltas):

1. **The button-cursor preflight drop.** v4 removed v3's
   `button, [role="button"] { cursor: pointer }`. Every button on the clone
   rendered the UA-default arrow cursor (42 default-cursor elements on the
   landing page) while the reference rendered the hand cursor everywhere.
   Restore the exact v3 rule in `@layer base` — element-level `cursor-*`
   utilities still win (utilities layer > base layer), and GUARD specs pin
   the labels default + the inputs text so the rule can never over-apply.
2. **The line-height composition flip.** On elements carrying BOTH a
   responsive `text-*` and a plain `leading-*`, v3's variant-block emission
   (media blocks come AFTER every base utility) makes the SIZE utility's own
   line-height win; v4's `--tw-leading` custom-property composition makes
   `leading-*` win regardless of order. Pin the reference winners UNLAYERED
   and MEDIA-SCOPED — the pins must live inside the same breakpoints as the
   variants they pin (below the breakpoint both engines agree):
   `.sm:text-5xl.leading-tight`, `.md:text-5xl.leading-tight`,
   `.md:text-7xl.leading-tight` → `line-height: 1`;
   `.md:text-xl.leading-relaxed` → `line-height: 1.75rem` (v3's text-xl
   line-height is REM-BASED, not a ratio — read the reference's own rule for
   the exact value).
3. **The inline-child space-y gap loss.** v4's `:where()` engine assigns
   the gap to NON-LAST children as `margin-block-end` — vertically INERT
   when the child is inline (the login form's `<label>`s): the whole gap
   vanishes. v3's follower-side `margin-top` landed on the block input
   wrapper and always worked. Restore the follower gap for the exact
   pattern: `.space-y-1\.5 > label + * { margin-block-start: ... }`.
4. **The overridden-gap loss.** A child's OWN margin utility replaces the
   `:where()` gap carrier (zero specificity loses to every utility): the
   login card's `-mb-2` back-button replaced the 16/24px header gap with
   −8px, pulling the view heading up into the button. Scope the pin to the
   distinctive utility (`.space-y-4 > .\-mb-2 + *`) — the follower's gap
   comes back without touching any other container.
5. **The reveal-killed scale.** The reference's scroll-reveal system leaves
   INLINE `opacity: 1; transform: none` on every revealed element FOREVER —
   inline styles beat every stylesheet rule, permanently killing transform
   utilities (the popular pricing card's `scale-105` is dead on the
   reference; it renders unscaled). Replicate the RESTING state, not the
   class: `.scale-105 { scale: none }` unlayered. The `hover:`/`group-hover:`
   scale variants are different CLASS NAMES — untouched, GUARD-pinned.

**The font-parity principle (the session's root-cause find):** a
font-family STRING match means nothing if one side loads the webfont and the
other falls through. The reference declares
`Inter, system-ui, -apple-system, sans-serif` but ships NO @font-face —
`document.fonts` is empty on every route and every visitor renders their
system font. A clone that bundles the named font renders different glyphs
(the tell: every "font-metric height band" in the project was this
difference). Probe `document.fonts` + the computed stack + a measured
probe-string width; match the declared stack WITHOUT bundling the font, and
every environment renders identically to the reference.

**The skills/docs/tests CSS-leak exclusion:** Tailwind v4's automatic
source detection scans EVERY non-gitignored file in the repo — agent
documentation (skills/), session logs (docs/), and even the parity SPECS
themselves (tests/) quote utility class names, and every quoted name that
isn't used by src/ leaks an unused rule into the production CSS (measured:
1027 of 2014 rules — 51%). Close it with `@source not` directives for every
non-app-source path, and pin the exclusion with canary selectors (utilities
that exist ONLY in the excluded folders).

The selector matches ONLY the login inputs' class strings (the three CLS
constants in `LoginForm.tsx` are the only `focus:ring-slate-400` usages) —
every other control keeps the `--ring` ring, pinned by GUARD specs.

Focus-audit methodology (same session): (a) the UA-default `outline: auto`
computes DYNAMIC values (contrast-adaptive colors, animation-dependent
widths/alphas) that differ run-to-run — never probe it for parity; read the
site-CSS-controlled properties (`--tw-ring-*`, explicit outlines). (b)
Elements carrying `transition-all` render their focus ring MID-TRANSITION
on an immediate computed read (the ring slots read zero-alpha) — wait
≥ 2× the transition duration. (c) v4's ring composition prefixes every
box-shadow with empty zero-alpha slots — full-string reads or parens-aware
slot filtering required; truncation hides the ring entirely.

### 4.4e The scroll-reveal ENTRY animation — replicating motion systems without the library (session 15)

The reference's framer-motion reveal system (confirmed in its bundle) is a
RENDERED surface, not just an end state: 103 targets across 9 routes pre-hide
with inline `opacity: 0; transform: translate…` at mount, reveal ONCE on
scroll (any-pixel intersection; sibling cards stagger ~100ms; only in-view
targets reveal at mount), and leave `opacity: 1; transform: none;` inline
forever. **34 of the targets are classless motion-wrapper divs** — a nesting
variance class-set diffs structurally cannot see (the wrapper has no
classes); find them by dumping the live's styled elements with their children
(the wrapper's child carries the familiar classes). The families, measured at
frame resolution: A "snappy" (op ~310ms ease-out + transform spring zeta=0.561,
wn=27.1 — 12% overshoot, settle ~280ms), B "floaty" (op ~310ms + a slow
back-loaded transform ~728ms), HERO (coupled ~770ms from y=30), FAQ (slower
coupled from y=10), X (±30px springs). Replicate with SSR pre-hide styles +
a WAAPI controller whose keyframe tables are baked from the measured curves —
zero dependencies, byte-identical DOM states. Two implementation traps: the
controller must mount on EVERY render branch of a page (a branch without it
ships permanently-hidden content), and transforms/opacity never affect layout
(the height sweeps must stay byte-exact through any wrapper additions —
GUARD-pin it).

### 4.5 The cosmic section recipe

Dark sections (landing hero, Courses/CourseDetail/Dashboard/About/Contact/
BecomeInstructor heroes, AI section, CTA) share:

- cosmic gradient background (see 4.4)
- landing hero: radial purple glow
  `bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]`
  + corner blurs (`bg-purple-600/10` / `bg-cyan-500/8`, `rounded-full blur-3xl`)
- AI section (session-3 parity): quarter-position blurs — `top-0 left-1/4
  w-96 h-96 bg-purple-600/10` + `bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10`
- newsletter CTA (session-3 parity): one centered 600px blur — `top-1/2 left-1/2
  -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10`
- white headline, `text-gray-400` body, cyan→purple CTA buttons

---

## 5. Component Architecture & Patterns

### 5.1 Layer model (the golden import rule)

```
app routes (server)  →  components (server)  →  leaf client components
        ↘ lib (db/session) ↗
```

- Server components fetch via Prisma directly and pass plain serializable
  props across the `"use client"` boundary.
- Client components are leaf interactive widgets only (catalog filters, chat,
  forms, navbar, progress cards) — they never import `db` or `session`.
- `z-ai-web-dev-sdk` is imported ONLY inside `src/app/api/ai/chat/route.ts`.

### 5.2 Component inventory

| Component | Type | Purpose |
|---|---|---|
| `Navbar` | client | 2 visual states (transparent over hero / white-blurred) + hardened mobile dropdown |
| `Footer` | server | 4-col grid, boxed socials (Twitter/LinkedIn/YouTube/Instagram), tagline bottom bar |
| `CourseCard` | server | verbatim reference card markup |
| `CourseCatalog` | client | dark hero search + floating filter card + grid |
| `LoginForm` | client | 5-view state machine: signin → reset → reset-sent → signup → verify (6-digit code inputs); slate Sign-in button + shadcn alerts, classes verbatim from the reference |
| `NewsletterForm` / `ContactForm` | client | fetch POST + in-place success states (never native form POST) |
| `AIAssistantChat` | client | chat UI + dependency-free markdown renderer |
| `dashboard/MyCourses` | client | progress cards, capped checklist, mark-done |
| `course-detail/EnrollButton` | client | enroll → API → Continue Learning |
| `ui/*` | mixed | shadcn-style primitives (button/badge/card/input/label/select/textarea/skeleton) with `data-slot` attrs + CVA |

### 5.3 The Navbar contract (highest-regression chrome)

- **Symmetric breakpoints:** desktop row `hidden md:flex`; trigger AND panel
  `md:hidden`. Never mix `sm`/`lg` into this pair (Display-Mismatch bug).
- Page roots use `min-h-dvh` (not `min-h-screen`) to avoid mobile URL-bar warp.
- Body scroll lock while the menu is open; released on route change.
- Real `<button>` trigger with `aria-expanded` + `aria-controls` + `aria-label`.
- Panel animates with CSS grid-rows `0fr→1fr` — no ref measurement, no height
  math, no setState-in-effect (React 19 + eslint clean).
- Open state derives from pathname (`openFor === pathname`) so navigation
  closes the menu without an effect; Escape closes via keydown listener.
- Closed panel must not leak a `border-t` artifact (border only while open).
- The reference has NONE of these hardenings (no ARIA, no lock, unmounts the
  panel). The clone's version is deliberately better — do not "simplify" it.

### 5.4 Server/client metadata split

Client pages can't export metadata. Pattern (AIAssistant): thin server
`page.tsx` exporting `metadata` + rendering the client component
(`AIAssistantChat`). Login page uses the layout default (`title` omitted →
"NexusLearn", matching the reference's untitled login tab).

---

## 6. Client/Server Boundary Patterns

### 6.1 Session handling

`src/lib/session.ts` (pure, vitest-tested): HMAC-SHA256 token sign/verify +
scrypt hash/verify — zero Next imports so tests run in node env.
`src/lib/auth.ts`: `getSession()` via `cookies()` + `SESSION_COOKIE` +
`sessionCookieOptions`.

### 6.2 Reference parity behaviors (deliberate — pinned by e2e)

| Behavior | Reference | Clone |
|---|---|---|
| After sign-in | returns to `/` | `router.push("/")` in LoginForm |
| `/Dashboard` signed out | renders "Welcome back" (no name), zeroed stats, empty state | session optional in the server component; no redirect |
| `/Home` | renders the landing (footer logo target) | re-exports the landing page (`export const dynamic = "force-dynamic"; export { default } from "../page";`) |
| Login tab title | "NexusLearn" (no prefix) | metadata `title` omitted → layout default |
| Enroll / Google buttons | Enroll is REAL (core feature); Google stays presentational (the reference's IS wired to real Google OAuth via the base44 platform — not transferable without the operator's own OAuth client) |
| Signup + verification | in-card signup → 6-digit code → signed in | REAL (signup/verify routes; delivery simulated — code logged server-side, any 6 digits verify; `User.emailVerified`, seeded users skip) |
| Forgot password | reset view → "Check your email" state | REAL (forgot-password route always ok — no user enumeration; no reset link without SMTP, documented) |
| CourseDetail bad id | in-page "Course not found" + Browse Courses (never the 404) | rendered inside the gray shell for missing/unknown ids |
| Newsletter submit | fetch + in-place green success row | client island (never native action= POST — that navigates to raw JSON) |

### 6.3 Progress flow (the one computed aggregate)

`POST /api/enrollments/progress` upserts a LessonProgress row, recomputes
`progress = completedCount / totalLessons * 100`, updates `completedAt`, and
returns `completedLessonIds` (the actual IDs, not a count) so the dashboard
checklist reflects out-of-order completion. The client updates its Set from
that array and calls `router.refresh()` so server stat cards update live.

---

## 7. Data Model & Seed Parity

### 7.1 Models (`prisma/schema.prisma`)

- `User` (email unique, scrypt passwordHash)
- `Course` — display aggregates (`rating`, `students`, `hours`,
  `lessonsCount`) exactly as the reference reports them, plus **`tags`**:
  comma-separated What-You'll-Learn topics (SQLite has no scalar lists).
- `Lesson` (courseId, title, sortOrder) — seeded as `lessonsCount` rows per
  course titled `Lesson N: Module Content` (the reference's auto-generated
  curriculum: 220 for AWS, 380 for the bootcamp, 1,904 total — re-captured
  in session 4 after live drift). `Course.longDescription` (nullable) feeds
  the expandable "About This Course" block on 4 of the 9 courses.
- `Enrollment` — unique `[userId, courseId]` (idempotent upsert), derived
  `progress` 0–100, `completedAt`.
- `LessonProgress` — unique `[enrollmentId, lessonId]`, `completed`,
  `completedAt`.
- `ContactMessage`, `Subscriber` (email unique).

### 7.2 Seed architecture (pure + test-pinned)

`prisma/seed-data.ts` exports `COURSES` (the 9-course reference catalog with
tags) and `buildLessons(lessonsCount)` — pure, no side effects, imported by
both `prisma/seed.ts` and `tests/seed-data.test.ts`. The seed is idempotent
(upsert courses, replace lesson sets, upsert demo user
`sepnetflix2023@outlook.com` / `$Abcd1234`) — and it CLEARS optional fields:
the upsert's `update` payload restates `longDescription: c.longDescription ??
null` because Prisma skips undefined keys (session 8's stale-row bug: the
session-7 reorder left the pre-reorder texts on seed-3/4/5, rendering
phantom About sections the live app does not have).

### 7.3 Tag parsing (`src/lib/course-tags.ts`)

```ts
parseTags(tags)                  // "AWS, Cloud" → ["AWS", "Cloud"] (null-safe)
```

The reference's What-You'll-Learn card shows the course tags ONLY — the
level renders once, in the separate Award-icon divider row (`mt-6 pt-6
border-t`). `parseTags` is unit-tested. (Session 8 removed the old
`whatYouLearnTopics()` tags+level helper — the live check list carries no
level row.)

### 7.4 SQLite path resolution (the hard-won seam)

Relative `file:` URLs resolve differently per Prisma surface: **CLI** →
against `prisma/schema.prisma`; **runtime** → against process CWD; the
**standalone server** `chdir()`s into `.next/standalone/` which contains its
own traced `prisma/schema.prisma` (a FALSE anchor — "nearest anchor" is
wrong). `prisma/db-url.ts` walks ancestors from CWD, collects every anchor,
and prefers the **furthest anchor whose resolved DB file exists** (fallback:
furthest anchor). Every PrismaClient goes through
`datasourceUrl: resolveDatabaseUrl()` (`src/lib/db.ts`, `prisma/seed.ts`).
Prisma 6 **ignores** the older `datasources: { db: { url } }` option.

**The shell-export trap:** a `DATABASE_URL` already exported in the shell
wins over the repo `.env` (standard precedence). A stale absolute export
silently retargets `db:push`/`db:seed`/`dev` to another file — the failure
mode is "Error code 14: Unable to open the database file" or data landing in
the wrong place. Detect with `printenv DATABASE_URL`; fix by unsetting it or
pinning per command: `DATABASE_URL="file:../db/custom.db" bun run db:seed`.

---

## 8. Accessibility Implementation

- Mobile menu: full ARIA wiring (see §5.3) — beyond the reference.
- Icon-only buttons carry `aria-label` (footer socials, chat send, hamburger).
- Decorative SVGs/emoji icons carry `aria-hidden="true"`.
- Forms use real `<label htmlFor>` (login, contact).
- Focus-visible rings retained on all interactive primitives (shadcn base).
- `min-h-dvh` page roots for mobile viewport correctness.
- Images have alt text (course/instructor images use meaningful titles).
- Known gap (documented, open): no `prefers-reduced-motion` handling yet.

---

## 9. Anti-Patterns & Common Bugs

| # | Anti-pattern | Symptom | Fix |
|---|---|---|---|
| 1 | Bare HSL triplet in `:root` under `@theme inline` | whole theme renders transparent | wrap: `hsl(0 0% 100%)` |
| 2 | Removing the pinned v3 palette | colors drift 1–3 units vs reference; parity assertions fail | keep `@theme` hex pins |
| 3 | Creating `tailwind.config.js` | v4 ignores/duplicates tokens; confusion | CSS-first only |
| 4 | PrismaClient without `resolveDatabaseUrl()` | wrong/missing DB file per surface (dev vs CLI vs standalone) | always `datasourceUrl: resolveDatabaseUrl()` |
| 5 | `datasources: { db: { url } }` | silently ignored by Prisma 6 | use `datasourceUrl` |
| 6 | Mixed `sm`/`md`/`lg` in the mobile nav pair | menu and trigger out of sync at some widths | symmetric `md:hidden` / `hidden md:flex` |
| 7 | Accessing refs during render for panel height | React 19 violation, lint error | CSS grid-rows 0fr→1fr animation |
| 8 | setState synchronously in effect body | `react-hooks/set-state-in-effect` lint error | wrap initial sync in `requestAnimationFrame` |
| 9 | Stale standalone bundle for e2e | tests fail on removed/changed code paths | always `bun run build` before `test:e2e` |
| 10 | Persisted enrollments in the e2e DB | "Enroll Now" became "Continue Learning", specs break | global-setup resets enrollments every run |
| 11 | Importing `z-ai-web-dev-sdk` in a client component | bundle/secret leak | server-only in `api/ai/chat/route.ts` |
| 12 | Reading `course.tags` before regenerating Prisma client + restarting dev server | `undefined.split` crash | `bunx prisma generate`, restart dev, and parseTags is null-safe |
| 13 | Re-exporting `dynamic` config from another page (`export { dynamic } from "../page"`) | Next build error: route segment config must be statically parseable | define `export const dynamic` locally |
| 14 | Client page exporting metadata | title silently missing | thin server page + client component |
| 15 | Deriving completed lessons by count (`slice(0, n)`) | wrong rows checked when lessons completed out of order | return + store `completedLessonIds` |
| 16 | Trusting VLM full-page comparisons | below-fold sections "missing" hallucinations | band-crop sections + verify every claim against the DOM |

---

## 10. Debugging Guide

| Symptom | Root cause | Procedure |
|---|---|---|
| Everything transparent / no theme colors | bare HSL triplets | inspect `getComputedStyle(document.body).backgroundColor`; fix globals.css |
| "Unable to open the database file" (Error 14) | wrong path per surface OR stale shell export | `printenv DATABASE_URL`; verify `db/custom.db` at repo root; re-run push/seed with pinned env |
| Dev data missing after schema change | dev server has old Prisma client in memory | `bunx prisma generate` + restart dev server |
| e2e login fails on standalone | stale build | `bun run build` then `test:e2e` |
| Login works but sessions don't verify | `AUTH_SECRET` changed between restarts | keep stable; e2e pins it in playwright.config |
| Mobile menu won't open | display-mismatch classes | run `tests/e2e/mobile-navigation.spec.ts`; check symmetric md pair |
| 1px line under transparent nav when menu closed | closed-panel border artifact | border only in the open state |
| Page 500s on `/CourseDetail` after seed | tags column missing from the DB (push ran against wrong file) | re-push with pinned DATABASE_URL, re-seed |
| Colors slightly off vs reference | oklch drift or `in oklab` gradient | pinned palette; arbitrary-value gradient class |
| VLM reports missing sections | full-page downscale hallucination | crop bands; verify in DOM |

---

## 11. Pre-Ship Checklist

```bash
bun run lint         # eslint clean
bun run typecheck    # tsc --noEmit clean
bun run test         # 106/106 unit
bun run build        # standalone compiles
bun run test:e2e     # 300/300 incl. 12 mobile-nav
```

- [ ] Mobile menu manually eyeballed at 375×667 (screenshot vs `docs/screenshots/`)
- [ ] No new `tailwind.config.js`
- [ ] No SDK/secret imports in client components
- [ ] `.env` contains no real secrets; `.env.example` matches the code
- [ ] Parity spot-check if shared chrome changed (colors/radii vs reference)
- [ ] New behaviors pinned by e2e specs (not just manually verified)
- [ ] Push via SSH wrapper (`docs/how-to-git-push-using-ssh-wrapper_SKILL.md`); keys stay outside the repo; `main` only

---

## 12. Lessons Learnt & How to Avoid Them

1. **Extraction beats eyeballing.** Every class string in this codebase came
   from DOM/computed-style extraction of the reference, never from memory.
   When in doubt, re-extract (`agent-browser eval` + `getComputedStyle`).
2. **The reference IS the spec — including its quirks.** Sign-in to `/`,
   public dashboard, dead Google button: replicate deliberately, pin with
   specs, document in PAD §10 so nobody "fixes" parity backwards.
3. **Tailwind v4 migration has exactly three visual traps** (bare HSL →
   transparent; oklch drift; `in oklab` gradients). All three were found via
   computed-style comparison, not visual inspection.
4. **VLM comparisons must be band-cropped.** Full-page screenshots get
   downscaled past reliability; sections below the fold "disappear".
   Always cross-check VLM claims against the DOM.
5. **Env precedence bites in sandboxes.** A stale exported `DATABASE_URL`
   silently redirected schema pushes away from the repo DB. `printenv`
   before any DB command; pin per command when in doubt.
6. **Route segment config must be locally defined.** Next.js statically
   parses `dynamic`/`revalidate` — re-exports break the build.
7. **Return IDs, not counts, for completion state.** Count-based slicing
   breaks under out-of-order completion; `completedLessonIds` is the truth.
8. **Prisma client generation is process-cached.** After schema changes,
   regenerate AND restart the dev server, or fields read as `undefined`.
9. **Bound the DOM for generated content.** 375-lesson curricula render fine
   as data, but checklists need a preview cap + expander.
10. **Session-1 debugging artifacts pollute session-2 environments.** Files
    created outside the repo (`../db/`, shell exports) outlive their purpose;
    audit the sandbox between sessions.

---

## 13. Pitfalls to Avoid

- Do NOT remove the pinned palette, the `hsl()` wrapping, or the arbitrary
  cosmic gradient classes.
- Do NOT add `tailwind.config.js`, `forwardRef`, or class components.
- Do NOT construct PrismaClient anywhere without the resolver.
- Do NOT change route casing (`/Courses` etc.) — parity + tests depend on it.
- Do NOT redirect `/Dashboard` to `/login` or sign-in to `/Dashboard` —
  both are pinned reference behaviors now.
- Do NOT "fix" the mobile menu to match the reference's unhardened version.
- Do NOT run e2e without a fresh `bun run build`.
- Do NOT commit `db/*.db`, `.env` with secrets, or SSH keys (gitignore
  already rejects `*.key`, `ssh-key.txt`).
- Do NOT trust full-page VLM verdicts (see lesson 4).

---

## 14. Best Practices

- Extract, then build: pull exact class strings and computed styles from the
  reference before writing markup.
- Keep pure seams pure: crypto, tag parsing, and seed data have zero Next
  imports so vitest covers them in node env.
- Pin every deliberate behavior with a spec (parity behaviors, mobile nav,
  curriculum shape, footer content).
- One DB everywhere: the resolver + explicit e2e env make CLI/dev/seed/
  standalone/e2e all hit `<repo>/db/*.db`.
- Document decisions in the PAD (ADRs, §10 known issues) — the docs are the
  diff between "looks right" and "is right".
- Run the gate in order; the build output feeds e2e.
- Keep client components as leaves; server components own data + metadata.
- Write the failing test first for pure logic (tags, seed shape), and
  update e2e expectations BEFORE reworking pages (TDD at the UI layer).

---

## 15. Coding Patterns

### 15.1 The parity hero (dark section)

```tsx
<div className="bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]">
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]" />
  </div>
  <div className="relative z-10">{/* content */}</div>
</div>
```

### 15.2 Floating filter card over a hero

```tsx
<div className="min-h-screen bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 -mt-6">
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 flex flex-wrap items-center gap-4">
      {/* selects + Clear Filters (ml-auto) + count (ml-auto when idle) */}
    </div>
    <div className="mt-10 pb-24">{/* grid */}</div>
  </div>
</div>
```

### 15.3 Measurement-free height animation (mobile panel)

```tsx
<div className={cn(
  "md:hidden bg-white grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
  open ? "grid-rows-[1fr] opacity-100 border-t border-gray-100" : "grid-rows-[0fr] opacity-0 border-t-0"
)}>
  <div className="min-h-0 overflow-hidden">{/* links */}</div>
</div>
```

### 15.4 Reference curriculum rendering

```tsx
{course.lessons.map((lesson, i) => (
  <div key={lesson.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-sm transition-all">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">{i + 1}</div>
    <span className="text-gray-700 font-medium">{lesson.title}</span>
    <CirclePlay className="h-5 w-5 text-gray-400 ml-auto" aria-hidden="true" />
  </div>
))}
```

### 15.5 What-You'll-Learn topics

```tsx
const topics = parseTags(course.tags);
// ["AWS","Cloud","DevOps","Serverless","Microservices"]
// The level renders ONCE — in the Award-icon divider row (session 8).
```

---

## 16. Coding Anti-Patterns

```tsx
// ❌ bare triplet (transparent under @theme inline)
--background: 0 0% 100%;
// ✅
--background: hsl(0 0% 100%);

// ❌ ignored by Prisma 6
new PrismaClient({ datasources: { db: { url } } });
// ✅
new PrismaClient({ datasourceUrl: resolveDatabaseUrl() });

// ❌ ref measurement for panel height
const ref = useRef<HTMLDivElement>(null);
useEffect(() => { ref.current.style.height = open ? `${ref.current.scrollHeight}px` : "0"; });
// ✅ CSS grid-rows 0fr→1fr (see 15.3)

// ❌ count-derived completion
setCompleted(new Set(lessons.slice(0, data.completedLessons).map(l => l.id)));
// ✅ id-derived completion
setCompleted(new Set(data.completedLessonIds));

// ❌ re-exported route config
export { default, dynamic } from "../page";
// ✅
export const dynamic = "force-dynamic";
export { default } from "../page";
```

---

## 17. Responsive Breakpoint Reference

| Breakpoint | Tailwind | Used for |
|---|---|---|
| 640px | `sm` | hero h1 step (`text-4xl sm:text-5xl`), CTA row stacking, contact form 2-col |
| 768px | `md` | **the** nav breakpoint (symmetric pair), `md:grid-cols-2`/`3`/`4` grids, `md:text-xl` hero copy, About badge visibility (`hidden md:block`) |
| 1024px | `lg` | 3-col layouts (CourseDetail `lg:grid-cols-3`, footer `lg:grid-cols-4`), sticky sidebars (`sticky top-24`) |

Mobile testing viewport: **375×667** (what the e2e mobile suite pins).

---

## 18. Z-Index Layer Map

| Layer | z | Where |
|---|---|---|
| Page content | auto | everything |
| Sticky filter/stats | `z-30` | Courses filter card (historically), overlapping cards |
| Fixed Navbar | `z-50` | all pages |
| Radix portals (selects, dialogs) | `z-50+` | shadcn primitives |
| Hero illustration | none (absolute, BELOW `z-10` content) | landing flowing-lines SVG |

Rule: hero decorative layers are `absolute inset-0` WITHOUT z-index; content
sits in `relative z-10`; the fixed nav owns `z-50`.

---

## 19. Color Reference (Complete)

### 19.1 Brand + cosmic (from the reference `:root`)

| Token | Hex |
|---|---|
| brand cyan | `#18CCFC` |
| brand purple | `#6344F5` |
| brand pink | `#AE48FF` |
| cosmic-950 | `#0a0a1a` |
| cosmic-900 | `#0d0d2b` |

### 19.2 Pinned v3 utility palette (globals.css `@theme`)

gray-50 `#f9fafb` · gray-100 `#f3f4f6` · gray-200 `#e5e7eb` · gray-300 `#d1d5db`
· gray-400 `#9ca3af` · gray-500 `#6b7280` · gray-600 `#4b5563` · gray-700
`#374151` · gray-800 `#1f2937` · gray-900 `#111827`; slate-50 `#f8fafc` …
slate-900 `#0f172a`; cyan-400 `#22d3ee` · cyan-500 `#06b6d4`; purple-50
`#faf5ff` … purple-600 `#9333ea`; pink-500 `#ec4899`; green-500 `#22c55e`;
amber-400 `#fbbf24`; yellow-400 `#eab308`; red-600 `#dc2626`; indigo-600
`#4f46e5`; orange-500 `#f97316` · orange-600 `#ea580c`; blue-500 `#3b82f6`
· blue-600 `#2563eb`.

### 19.3 shadcn HSL base (selected)

`--background hsl(0 0% 100%)` · `--foreground hsl(240 10% 3.9%)` ·
`--primary hsl(240 5.9% 10%)` · `--muted-foreground hsl(240 3.8% 46.1%)` ·
`--border hsl(240 5.9% 90%)` · `--radius .5rem` (buttons override to
`rounded-xl` = 12px; cards `rounded-2xl` = 16px).

---

## 20. TypeScript Interface Reference

```ts
// src/lib/session.ts
interface SessionPayload { userId: string; email: string; name: string; iat: number; }
function createSessionToken(payload: SessionPayload): string;
function verifySessionToken(token: string): SessionPayload | null;
function hashPassword(password: string): string;   // "salt:hash" scrypt
function verifyPassword(password: string, stored: string): boolean;

// src/lib/course-tags.ts
function parseTags(tags: string | null | undefined): string[];

// prisma/db-url.ts
function resolveDatabaseUrl(url?: string): string | undefined;

// src/components/CourseCard.tsx
interface CourseCardData {
  id: string; title: string; description: string; category: string;
  level: string; rating: number; students: number; hours: number;
  instructorName: string; image: string; price: number; originalPrice: number;
}

// src/components/dashboard/MyCourses.tsx
interface EnrollmentView {
  id: string; progress: number; completedLessonIds: string[];
  course: { id: string; title: string; image: string; instructorName: string; hours: number; lessonsCount: number };
  lessons: { id: string; title: string }[];
}

// prisma/seed-data.ts
interface SeedCourse { /* 17 fields incl. tags: string */ }
function buildLessons(lessonsCount: number): { title: string; sortOrder: number }[];

// API shapes
POST /api/auth/login  → { user: { id, email, name } } + Set-Cookie nexus_session
POST /api/enrollments/progress → { enrollment, completedLessons, totalLessons, completedLessonIds }
POST /api/ai/chat      → { reply } | { error } (502 degrade)
GET  /api/health       → { ok: true, service: "nexuslearn" }
```

---

### 4.4f The navigation-transition surface — scroll restoration, titles, focus (session 16)

The NAVIGATION layer is its own parity surface (nothing static ever moves,
yet every route change behaves differently): scroll restoration, scroll
reset semantics, `document.title`, and focus management.

**Back/forward restoration**: a CSR SPA's popstate restoration is the
BROWSER-NATIVE instant snap (its router never calls scrollTo); a framework
that restores via `window.scrollTo` (Next.js App Router) reads the
`scroll-behavior` CSS — a universal smooth pin (correct parity for the
reference's own `*` rule) turns every restoration into a ~1s glide, and on
slower builds into a restore-to-0 race when the nav click fired mid-smooth-
scroll. The fix pattern: suppress smooth for the popstate window ONLY (a
client listener sets a data attribute on <html>; a scoped UNLAYERED rule
`html[data-scroll-restore], html[data-scroll-restore] * { scroll-behavior:
auto }` beats the @layer-base universal pin for exactly that window). The
listener registers AFTER the framework's own popstate listener, but the
framework issues its scrollTo only in a post-render-commit effect — always
after every synchronous listener — so the suppression is always in place
first. Do NOT remove the universal pin instead: the pin IS reference parity
(the Radix Select viewport + every programmatic scroll depend on it).

**The unmanaged-SPA-router family (deliberate-better decisions)**: a
reference SPA router with no scroll management (a) carries the scroll
position over on in-app navigation, clamped by the new page's CSR LOADING
SHELL height (not the settled height — `/`@2000 -> /Courses lands 493
because the shell is ~1573px tall at swap time), (b) never updates
`document.title` on soft navigation, and (c) leaves focus on the clicked
link. Replicating any of these means shipping the reference's defects, and
(a) is impossible to replicate exactly without faking the loading shell —
keep the framework's managed behavior, PIN it by spec so a future audit
cannot "fix" it backwards, and document the reference's measured behavior
in the plan (the same family as the ARIA/scroll-lock/Escape hardening).

**The audit methodology**: navigate programmatically (not by URL — hard
navigations never exercise the router), sample `scrollY` on a trajectory
(100ms cadence — a single end-state read cannot distinguish an instant
snap from a 1s glide), test EVERY nav path (nav links, footer links, card
links, the mobile menu), test the mid-smooth-scroll click (a
`locator.click()` on a below-fold link fires the scroll-into-view AND
lands the click mid-animation), and compare back/forward/reload
separately (they have different mechanisms on both stacks). The
performance surface that pairs with it: CLS via a buffered layout-shift
PerformanceObserver (both sites should measure 0.0000 — a nonzero value
on either side is a real bug), LCP/FCP from buffered entries, and the
resource mix by initiatorType (structural CSR-vs-SSR differences are
documentation, not defects — measure the clone's PRODUCTION build; the
dev server's on-demand compilation inflates TTFB 5-15x).

### 4.4g The deep-link / query-parameter surface (session 17)

The URL layer is its own parity surface — invisible to every class/DOM/
height sweep because the divergence only appears when a user ARRIVES at a
path the app never links to internally.

**Repeated search params**: Next.js App Router delivers `?k=a&k=b` as
`{ k: ["a", "b"] }` (an ARRAY), while the reference's `URLSearchParams.get`
takes the FIRST value. The naive `const { id } = await searchParams` passes
the array straight to Prisma and renders the PRODUCTION ERROR BOUNDARY —
a hard 500-class failure that every static diff is structurally blind to.
Normalize explicitly (`Array.isArray(v) ? v[0] : v`) in BOTH the page and
`generateMetadata`, and type the searchParams as `string | string[]` to
match what actually arrives. Probe both orders (`real&x` renders the
course; `x&real` renders the not-found state).

**Slug-form fidelity**: hrefs that carry filter slugs are DATA, not markup
— a class-verbatim card can still deep-link with the wrong slug form. The
reference's category cards use UNDERSCORE slugs for two categories
(`personal_development`, `ai_innovation`) where a natural hyphen
transliteration would produce `personal-development` — enumerate the
reference's actual hrefs and byte-diff them per card.

**Unknown-param semantics**: a defensive `knownMap[x] || default` fallback
is NOT what a reference that sets its state straight from the URL does —
the unmapped value produces the NO-MATCH state (an empty Radix Select
trigger via the placeholder state with an EMPTY placeholder, 0 results,
the no-results copy), while the fallback silently shows everything. Map
the param through the same lookup the reference uses and let unknown
values fall through to the no-match state; treat an EMPTY value as ABSENT
(both behaviors observable on the reference: `?category=` = "all",
`?category=bogus` = 0 cards).

**Route-casing**: a Base44-style CSR router matches page routes
CASE-INSENSITIVELY (its titles derive from the RAW path — "C Our Ses |
NexusLearn" — artifact-grade output worth keeping deliberately better),
while platform-level routes (/login) are exact-match. Next.js is
case-sensitive by default; replicate the FUNCTIONAL behavior with the
Next 16 `proxy` convention (`src/proxy.ts` — `middleware.ts` is deprecated
in 16.3 and warns at build): a case-insensitive REWRITE (URL preserved —
never a redirect; the reference keeps the typed URL), the platform route
EXCLUDED from the list, unknown paths passing through to the 404. The nav
active-state must compare case-insensitively too (the rewrite preserves
the raw path, so `usePathname()` reports the typed casing).

**The audit methodology**: probe a matrix of valid / unknown / missing /
empty / duplicated / case-variant keys and values, hash fragments,
trailing slashes and lowercase/uppercase paths — per-site real ids where
the two apps' ids differ (a shared `?id=seed-1` probes the CLONE's id
space, not the reference's — the session-14 per-site-id lesson). Compare
the trigger text of every filter control, the rendered card COUNT, and
the no-results copy — not just the h1.

## Appendix A — The Parity Workflow

The repeatable loop used to reach (and re-verify) parity:

1. **Recon both sides** — two browser sessions (`live` + `clone`), same
   viewport; `eval` extracts DOM structure, class strings, computed styles.
   **Set BOTH sessions' viewports in the same command** — a live@1920 vs
   clone@375 comparison silently produces false 4-digit px height drifts
   (the session-10 lesson: the initial CourseDetail sweep reported
   +1300…+3300px that vanished once the viewports were synced).
2. **Trust the DOM, not the VLM** — VLM verdicts on full-page screenshots
   hallucinate below the fold; use them only on cropped bands, then confirm
   every claim via `querySelector` + `getComputedStyle`.
3. **Rework page → verify structure** — check tag names, class lists,
   computed backgrounds against the extraction.
4. **Pin with specs** — every fixed gap gets an e2e assertion (footer
   tagline, curriculum shape, redirect targets, titles). Route-STATE chrome
   (navbar visual states, per-route) needs its own comparisons — a route
   that renders the right CONTENT at the right HEIGHT can still ship the
   wrong CHROME state (the session-10 /Home case: content + height band
   were green for 9 sessions while the navbar rendered the white-nav state
   over the dark hero). COMPONENT-STATE views need their own diffs too —
   the session-11 login case: a default-state-only class diff was green
   for 6 sessions while the four non-signin views rendered inside the
   signin chrome the live app removes (diff every view of a stateful
   component: the login card's 5, the mobile panel open/closed, the
   navbar's 2 states).
5. **Text content is its own audit surface** — height sweeps absorb
   single-line copy changes (same layout) and class/computed-style gates
   never see glyph choice (U+201C vs U+0022 renders at identical metrics).
   The session-11 finds (the path-card description drift + the testimonial
   curly quotes) survived ten height/class/computed audits. Diff the
   normalized `innerText` of `main` per route (collapse whitespace →
   split lines → SequenceMatcher), plus the footer and every
   component-state view.
6. **Sweep the breakpoint zone** — 375 and 1920 alone never exercise the
   md/lg boundaries. Sweep 640/767/768/1024/1279/1280 (both sessions,
   synced viewports): the mobile-trigger ↔ desktop-row flip must happen at
   exactly 768px on both sites, and every responsive grid's column count
   must flip at the same widths (session-11: all green — no Tailwind v4
   breakpoint bug anywhere in the zone).
7. **Computed box-shadow + border-radius sweeps** — token-value changes
   are invisible to class diffs (byte-identical classes, different
   values). Walk every visible element per route, bucket the computed
   `boxShadow` (parens-aware split; strip v4's empty
   `rgba(0, 0, 0, 0) 0px 0px 0px 0px` composition slots) and
   `borderRadius`, diff live vs clone. This is the surface that caught the
   FIFTH v4 trap (the shadow-scale shift) after 11 sessions of green
   class diffs. Expected FORM variances (computed-identical, no action):
   oklab() strings for alpha-modified colors (`bg-white/10` →
   `oklab(0.999994 … / 0.1)`), `calc(infinity * 1px)` → `3.35544e+07px`
   for rounded-full, the 4-property v4 `transition-transform` list, the
   preflight default border-color (2/255 per channel on zero-width
   borders).
8. **Hover-state diffs run in a hover-capable context** — v4 gates every
   `hover:` variant behind `@media (hover: hover)`; a touch-emulating
   headless session (the agent-browser daemon) matches `:hover` but never
   applies the rules (FALSE parity failure). Probe hovers in Playwright
   (its Chromium reports `hover: hover` true) and read the RIGHT property
   per stack: v3 renders `transform: matrix(...)`, v4 renders the
   standalone `translate`/`scale`/`rotate` properties. Wait out the
   transition (up to 700ms) before reading computed styles. Real-world
   variance (an improvement, documented): v4 kills v3's sticky-hover on
   touch devices.
9. **Focus-ring diffs read the site CSS, post-transition** — keyboard-focus
   each interactive element type (real Tab or `locator.focus()`; text inputs
   match `:focus-visible` either way) and read `--tw-ring-color` + the
   visible box-shadow slots. NEVER compare the UA-default `outline: auto`
   (dynamic computed values); wait ≥ 2× the element's `transition-all`
   duration before reading (immediate reads show mid-transition zero-alpha
   rings); strip v4's empty composition slots (or read the full string —
   truncation hides the ring). Diff the ring COLOR and GEOMETRY per element
   type (inputs vs selects vs buttons vs bare links).
10. **Scroll-behavior / scroll-reveal comparison** — read the computed
    `scroll-behavior` on html AND body AND arbitrary sections (the
    reference's runtime ships the UNIVERSAL `*` rule — pin it, not just
    html; the universal form also smooths programmatic scrolls inside inner
    scrollers, e.g. Radix SelectContent keyboard nav). Probe scroll-reveal
    by counting elements with INLINE `opacity: 0` / `transform:
    translateY(20px)` styles BEFORE scrolling, then re-read after scrolling
    into view. SESSION-14 CORRECTION: the reference DOES ship a working
    reveal system (35 pre-hidden elements on / — the session-13 "zero
    offscreen-hidden elements" probe read the wrong property and missed
    them). After reveal the system leaves INLINE `transform: none`
    FOREVER, which kills transform utilities on revealed elements — probe
    the POST-REVEAL resting state (item 15) for any revealed element that
    carries a transform/scale class. The reveal ENTRY animation itself is a
    documented variance (the end states match).
11. **Print-stylesheet comparison** — enumerate `@media print` rules in
   every sheet on both sides (usually zero on both — record it), then
   emulate print media (`page.emulateMedia({ media: "print" })`) and diff
   the display histogram + page height + nav visibility. Always probe
   CourseDetail with PER-SITE ids (the live's `?id=seed-1` renders its
   not-found state — a 32,648px false delta if you reuse the clone's id).
12. **::selection / cursor / caret sweep** — ::selection is CSSOM-only
   (enumerate rules whose selector contains `::selection` across ALL
   sheets incl. runtime-injected inline sheets; check whether ANY element
   actually carries `selection:` classes — inert preset rules are an
   accepted variance). Cursor: build per-element computed-cursor
   histograms (the v4 button-cursor preflight drop shows up as clone-only
   `default` counts) and diff the non-auto/default/pointer specials.
   caret-color: diff per input (watch the documented `--ring` micro-delta
   family). This sweep is also how the skills/ CSS leak was found (the
   `.selection:bg-red-200` canary came from a skills/ demo file).
13. **Computed font + line-height probe** — a font-family STRING match
   means nothing if one side loads the webfont: read `document.fonts`
   (registered faces), the computed body/h1/button/input stacks, and
   MEASURE a probe string under the element font vs `Inter` vs `system-ui`
   (the rendered winner is whichever width matches). Then diff the
   computed line-height on every text-size class × leading-class
   combination (the v3↔v4 composition flip — §4.4d item 2).
14. **Per-element space-y sibling-gap audit** — for every space-y container
   on every route × viewport, measure the gap between each consecutive
   child pair (bounding rects) and diff live vs clone. This catches the
   engine traps class diffs cannot (inline children, children with their
   own margin utilities). Run it PER VIEW on stateful components (the
   login card's 5 views — the default-view-only standing sweep missed the
   signup/reset header drift for 13 sessions because the desktop page
   height is viewport-clamped and the sweep only measures the signin
   view).
15. **CSS-source leak audit** — after any Tailwind build, check the
   compiled sheet for utilities that exist ONLY in non-app-source files
   (agent docs, session logs, specs). Canary selectors + a rule count
   before/after the `@source not` exclusions. The specs themselves quote
   class names — every quoted name re-leaks unless tests/ is excluded.
16. **Scroll-reveal characterization** — to replicate a motion system:
   dump every styled element per route (target inventory + variants), sample
   the animation curves at frame resolution (opacity AND transform are
   separate tracks with different durations — read both), measure the
   stagger (instant scrolls; per-element first-change times), the mount
   behavior (which targets are in view), the remount behavior (filter the
   live's catalog and watch a fresh card), and the exact pre-hide/end style
   STRINGS. Then verify the clone side-by-side: same inventory counts, same
   pre-hide distribution at the same sample time, curves within tolerance.
   A post-gate doc write can invalidate the CSS-leak gate — re-run the leak
   spec LAST, after every doc write (the session-14 worklog entry re-leaked
   the canary that way; session 15 closed it).
17. **Navigation-transition sweep** — scroll restoration (sample the
   scrollY trajectory at ~100ms after goBack/goForward — a single end-state
   read cannot distinguish an instant snap from a 1s glide), scroll-reset
   semantics per nav path (nav links, footer links, card links, the mobile
   menu; a below-fold `locator.click()` fires a smooth scroll-into-view and
   lands the click mid-animation — the race probe), `document.title` on
   soft-nav vs fresh-load, focus after nav, reload restoration, and the CLS
   guard (buffered layout-shift observer; both sites must measure 0). The
   reference's CSR loading-shell clamp values (493 etc.) are shell-timing
   artifacts, not design — record them, do not replicate them.
18. **Deep-link / query-parameter matrix** — probe valid / unknown /
   missing / empty / duplicated / case-variant keys and values (per-site
   real ids — a shared `?id=` probes only one app's id space), hash
   fragments, trailing slashes and lowercase/uppercase ROUTE paths; compare
   the filter controls' trigger text, the card count and the no-results
   copy — not just the h1. Pairs with the form-state persistence sweep
   (type → navigate away → back → compare the retained state) and the
   print-to-PDF comparison (page counts in fresh vs fully-revealed states —
   the reveal system's IO does not fire during print on either site).
18b. **Transient pending states (the settled-DOM blind spot)** — the
   loading bubbles and pending labels only exist while a request is in
   flight (the AI chat's `loader-circle` + "Thinking..." bubble; the
   newsletter "..." and contact "Sending..." labels — the ENTIRE button
   content replaced by THREE ASCII PERIODS, charCodes 46,46,46, never the
   U+2026 glyph, no icon). Every audit that samples after `networkidle`
   or takes a settled screenshot structurally cannot see them: freeze
   the state with a `page.route` DELAYED/aborted response, then read the
   DOM byte-exactly (text, class string, svg count, disabled state).
   Pairs with the FAILURE-state comparison: block the real endpoint
   (discover it first — the Base44 apps post to `entities/…` URLs, not
   the clone's `/api/…` routes; a wrong block pattern silently lets the
   request through and corrupts the comparison) and record whether the
   reference RECOVERS (the live's failures stick forever: "Thinking..."
   at +12s, "..." at +15s, "Sending..." on EVERY submit — its contact
   endpoint never completes) — then decide deliberately-better vs
   replicate and SPEC-PIN the decision.
18c. **Form-control attribute surface** — placeholders, ids, names and
   alts are ATTRIBUTES: `innerText` diffs read rendered text nodes only
   and class diffs read `class` only, so placeholder copy, bare form ids
   (the reference's `name`/`email`/`message` — also the stronger autofill
   hints) and decorative `alt=""` choices drift invisibly for many
   sessions. Sweep every input/textarea/select/button/img per route for
   placeholder + aria-label + title + alt + id, both sites, and diff.
18d. **Element-tag surface** — tag NAMES are invisible to class diffs (an
   `<a>` styled exactly like a `<button>` passes every class-set diff but
   double-focuses — anchor + nested button = two tab stops — and
   navigates differently). Sweep `a[href]`/`button`/`[role=button]` with
   text + href per route; a tab-order probe catches the double-focusable
   cases. The reference may nest `<Link><button>` on SOME routes and ship
   bare inert buttons on others (the live: nested on the landing, bare on
   /Pricing — verify per route, never assume a global pattern).
18e. **Per-route token-theme map** — a runtime-injected-styles platform
   (Base44) may carry DIFFERENT token sheets per page: read the semantic
   custom properties (`--ring`, `--input`, `--border`,
   `--muted-foreground`, `--primary`, `--secondary`) on EVERY route, both
   sites, and map which theme each route carries (the live: NEUTRAL on 10
   of 11 routes, ZINC on /login alone — rendering its card buttons' focus
   rings rgb(9,9,11) vs rgb(10,10,10); the fix is a
   `body:has(main[data-login-theme])` scoped token block — body-level
   custom properties cover the whole document like the runtime sheet).
18f. **Environment-pollution surface (session 19)** — the WORKSPACE can
   lie to the app: a shell (sandbox harness, CI image, a previous project
   export) may inject an ABSOLUTE `DATABASE_URL` that wins over the repo
   `.env` under standard precedence — `db:push` creates the database
   OUTSIDE the repo and `dev`/`standalone` fail with `Error code 14`
   while every tool agrees on the same wrong file (so the test suite
   stays green — the audit must probe the FILE LOCATION, not just app
   behavior). Fix pattern: make the repo `.env` the ENFORCED source of
   truth in the resolver (a RELATIVE `.env` declaration beats an ABSOLUTE
   shell value; relative shell values like an isolated e2e db still win;
   a `.env`-declared absolute URL — the production setup — always
   passes) + wrap the CLI scripts with a loader that re-exports the
   `.env` value over the shell. Pin it with unit specs on the resolver
   seam. Same family: dev-origin allowlists need the preview-proxy
   wildcard (`*.space-z.ai`) or the preview renders unhydrated. Also:
   VERIFY probes with explicit exit-code discipline — a `grep | head`
   pipeline masks grep's exit code and manufactures false-positive
   "verified" claims (caught red-handed in this session's standalone
   verification).
18g. **Element-tag DRIFT surface (session 20)** — the element-tag surface
   (18e) one level deeper: IDENTICAL class strings can ride DIFFERENT
   tags. A `<p>` and a `<span>` carrying the same class string in the
   same flex row are indistinguishable to every class-set diff, height
   sweep and screenshot — flex blockifies both, computed styles match,
   margins match. Two probes see through it: (a) the LINE-BY-LINE
   `innerText` comparison (Chrome's innerText algorithm gives `<p>`
   elements DOUBLE line breaks — a blank line where the reference renders
   consecutive lines is the drift signature; compare `main.innerText`
   split by newlines, not just normalized text presence); (b) the
   TAG-OF-SHARED-CLASS map (for each class string present on BOTH sites,
   compare the tag set — a one-tag-vs-one-tag mismatch is drift; run it
   over main + nav + footer per route). Pinned cases: the /Courses course
   count (`<span class="ml-auto text-sm text-gray-500">` on the live vs
   the clone's old `<p>`) and the /AIAssistant composer wrapper (`<div
   class="flex gap-3">` on the live vs the clone's old `<form>` — whose
   onSubmit was dead code anyway because the textarea's own keydown
   handler drove Enter with preventDefault; when removing a form, move
   the action to the button's onClick and drop the `type="submit"`).
18h. **Console + a11y-exposure + attribute-VALUE surfaces (session 21)** —
   five probes that see what no settled-DOM diff can: (a) the
   **console-error surface** — attach `page.on("console")` +
   `page.on("pageerror")` listeners and navigate every route + the
   interaction flows on BOTH sites; kebab-case SVG props (`stroke-width`
   as a JSX prop) render PERFECTLY but log React "Invalid DOM property"
   errors — rendering-neutral defects are invisible to every DOM diff
   and only the console hears them (guard with a source-level unit sweep
   because production React strips the warning); (b) the **full a11y-tree
   snapshot** (`page.locator("body").ariaSnapshot()`) — the a11y tree
   exposes per-icon exposure, accessible names and framework announcers
   (the live's exposed nameless svg icons split text nodes and turn named
   buttons into unnamed containers — the aria-hidden root cause); (c) the
   **link/image inventory** — diff the href/src/alt/target/rel VALUES,
   not just classes (the /login logo's Supabase-CDN src vs the clone's
   self-hosted /logo.png is a byte-identical-asset hosting variance);
   (d) the **pseudo-element sweep** — read `getComputedStyle(el,
   "::before"/"::after")` content + backgrounds on every element (0 on
   both sites here, but a real decorative-icon channel elsewhere); (e)
   the **SVG class-histogram diff** — count svgs per class string per
   route to prove the icon INVENTORY is identical, isolating any
   attribute-level difference (here: the lucide-react aria-hidden
   default — the deliberate hardening, never "fix" it into drift).
   CAUTION: the live's big pages render PROGRESSIVELY — poll a DOM
   signature (scrollHeight + svg/a counts) until stable before
   snapshotting, or every comparison races a half-rendered page.
18i. **Interaction-modality + persistence surfaces (session 22)** — five
   probe families that see what no settled-DOM diff can: (a) the
   **keyboard Tab-order inventory** — extract the DOM-order focusable
   list AND walk the REAL Tab key; the REAL walk is ground truth (a
   checkVisibility({checkOpacity})-filtered inventory FALSELY drops the
   live's pre-reveal opacity-0 below-fold controls — Chrome tabs INTO
   opacity-0 elements — while an unfiltered one FALSELY includes
   display:none subtree members, +9 phantom mobile-panel focusables);
   compare the sequences to surface accessible-NAME variances (the
   clone's stable aria-labels on the search/selects/AI composer vs the
   live's placeholder/value naming — the WCAG-robust deliberate
   hardening, PINNED, never "fix" toward the fragile naming); (b) the
   **invisible-focus test** — with the mobile panel collapsed (grid-rows
   0fr + overflow-hidden + opacity-0), verify Tab SKIPS the mounted-but-
   clipped links (empirically true in Chromium; a child's
   getBoundingClientRect().height still reads >0 inside the collapsed
   container — measure the CONTAINER, not the child); (c) the **storage
   surface** — inventory localStorage/sessionStorage/cookies per route
   (the clone: ZERO client-side storage, the session exclusively in the
   HttpOnly cookie — the privacy-cleanliness guard; the live: platform
   keys, accepted-by-nature); (d) the **network-request surface** —
   listen to request events per route (the live's SPA fires 3–6 entities/
   analytics XHRs per page; the clone fires ZERO on load — SSR through
   Prisma); (e) the **media-emulation sweep** — emulate
   prefers-reduced-motion / prefers-color-scheme / print and re-read the
   computed styles (NEITHER site adapts — the parity contract is frozen
   by spec; a future dark mode is a deliberate beyond-reference
   decision). Plus the **text-scaling surface**: set the root font-size
   to 20px/24px and compare body heights + ratios (byte-identical at
   125% proves the rem system scales identically; a 1px flip at 150% is
   sub-pixel rounding, not drift). Escape-key behavior is part of the
   keyboard surface: the live does NOT close its panel on Escape; the
   clone does (deliberate hardening, spec-pinned). The `nextjs-portal`
   element appears in the DEV Tab order only (Next.js DevTools) — absent
   from the production standalone build, same accepted family as the
   route announcer.
18l. **CSSOM-inventory + crawler/SEO-file surfaces (session 25)** — two
   probe families that see the layers BETWEEN class strings and rendered
   pixels: (a) the **stylesheet STRUCTURE diff** — enumerate the FULL
   custom-property map (every `--var` declaration across every sheet incl.
   runtime-injected ones — extends a six-token semantic probe to the
   complete token surface), the `@media` rule census (every condition text
   + count) and the `@keyframes` census, per route, both sites. Reading
   rules: raw-token VALUE "drift" in a sheet census is NOTATION, not color
   (the reference declares bare HSL triplets + a `.dark` block; the clone
   full values + hex — only COMPUTED values render, and those are what the
   parity gates pin); one-side-only var families are ENGINE ARCHITECTURE
   (v4's `@theme` emits every theme value as a CSS var — `--color-*`,
   `--animate-*`, `--blur-*`; v3 shipped the `--tw-*-opacity` engine vars)
   or UNUSED LIBRARY payload (the reference platform's full shadcn bundle —
   `--sidebar-*`, `accordion-*` keyframes — and its /login platform sheets:
   786 vars, 43 keyframes, 29 media queries of Base44 login chrome); (b)
   the **media-query rem rule** — CSS media queries evaluate `rem` against
   the INITIAL font size, not the document root's computed size, so a
   page-level `html { font-size: 20px }` override shifts layout rems but
   NEVER breakpoint rems: v4's rem-based breakpoints (`min-width: 48rem`)
   are structurally immune to page-level text scaling exactly like v3's
   px-based ones (probe the mid-zone viewports at scaled roots to verify —
   the nav flip + body heights stay identical); (c) the **crawler-FILE
   bodies** — `robots.txt`, `sitemap.xml`, `manifest.json` are fetched by
   crawlers and install-prompts; the `<head>`-tag pins do not cover them.
   Body-compare status + content-type + every field: expect engine
   serialization deltas (builder casing, indentation, `1` vs `1.0`
   priority, trailing slashes — semantically identical to every
   spec-compliant parser) and treat them as the canonical-form
   deliberate-better family (PIN them); a MISSING field (the manifest
   `scope`) is a real gap — fix it in the portable relative form when the
   reference's is origin-absolute.

19. **Gate** — lint → typecheck → unit → build → e2e; then re-screenshot
   `docs/screenshots/` (full-page captures need an incremental reveal sweep
   first — an instant jump to bottom leaves the jumped-past sections hidden,
   on both sites).

Key extractions worth keeping (from the live reference): the hero
flowing-lines SVG (8 paths, 4 userSpaceOnUse gradients `#18CCFC → #6344F5 →
#AE48FF`, opacity-60, 858×434, absolutely centered); the 220-lesson
"Lesson N: Module Content" curricula; the What-You'll-Learn tag lists per
course (seed-data.ts); the footer social order (Twitter, LinkedIn, YouTube,
Instagram) and "Built for the future of education." tagline.

18j. **HTTP security-headers + axe-core WCAG surfaces (session 23)** — two
   probe families: (a) the **security-headers inventory** — `curl -I` (or a
   Playwright `request.get`) both sites and diff the response headers as a
   SECURITY surface: a platform-fronted reference (Cloudflare + Caddy) ships
   HSTS / referrer-policy / nosniff that a bare framework app lacks, and the
   delta is actionable template hardening (ship the baseline IN the app via
   `headers()` — the standalone deployment may run without a proxy); (b) the
   **axe-core rules-engine scan** (`@axe-core/playwright`, both sites) —
   diff the violation RULES and node counts: rules that fire on BOTH sites
   with identical counts are the reference's own design (the parity
   contract — the gray lesson icons, the reference heading structure); rules
   that fire ONLY on the reference (link-name, button-name) quantify the
   clone's aria-label hardening; rules that fire ONLY on the clone are new
   regressions. Settle >=2500ms on progressively-rendered pages (the live's
   CourseDetail renders its curriculum after networkidle — a 1000ms scan
   reports 0 vs 373 nodes, a phantom finding; extends the session-21
   settle-wait rule).

18k. **Performance/web-vitals + response-status surfaces (session 24)** — two
   probe families: (a) the **performance / resource-inventory surface** —
   measure TTFB / FCP / LCP (`PerformanceNavigationTiming` + the
   `largest-contentful-paint` observer) and the per-bucket resource inventory
   (script/css/img/font counts + transfer weights) per route on both sites,
   and compare the CACHE posture on the static asset classes
   (`/_next/static` immutable vs `public/` revalidate): an SSR app and an SPA
   behind a CDN have structurally different loading profiles (document, do
   not "fix"); heavy shared assets (the 1.1MB favicon/logo) may be the
   reference's OWN design — the byte-identical asset is the parity contract;
   (b) the **response-status / URL-canonicalization surface** — compare HTTP
   STATUS CODES per route family (trailing slashes, unknown routes, case
   variants): an SPA platform returns 200 for every path (its in-app 404
   view + raw-path titles are artifact-grade output), while a canonical-URL
   app ships 308 redirects and real 404s — the SEO-correct deliberate-better
   family, PIN the statuses so a future audit cannot "fix" them backwards.
   The session's remediation recipe — the **CSP nonce pattern**: the proxy
   generates a per-request nonce, exposes it on the REQUEST headers (the
   framework auto-nonces its bootstrap scripts from `x-nonce` + the CSP
   header) and ships `script-src 'self' 'nonce-X' 'strict-dynamic'`
   (per-request nonces are the only script trust root; host allowlists are
   inert under strict-dynamic). The critical companion: **per-request
   rendering on every route** — static-prerendered pages bake nonce-less
   HTML at build time where no nonce exists, and their scripts BLOCK under
   strict-dynamic, leaving the pages UNHYDRATED (forms fall back to native
   GET submits — the classic `/login?` symptom). Force dynamic rendering in
   the ROOT layout (`export const dynamic = "force-dynamic"`) so the nonce
   reaches every script including the not-found route. Verify with the
   full-route battery: 100% nonced scripts + zero CSP console violations on
   every route + the hydration-dependent flows (login, client islands,
   client-router buttons).

18m. **HTTP verb-matrix + form-control-metadata surfaces (session 26)** —
   two probe families: (a) the **verb/method matrix** — the METHOD dimension
   of the response contract is invisible to every GET-only audit (the
   sessions-23/24/25 response probes all issued GETs): probe
   POST/PUT/DELETE/OPTIONS/HEAD against pages, unknown paths, static public
   files AND the API surface on both sites. A platform-fronted reference
   405s every non-GET/HEAD on non-API paths; a bare App Router renders full
   HTML with 200 for ANY method on pages, answers OPTIONS with 400, and its
   static file handler 500s on non-GET public assets (a crash class, worse
   than a deliberate 405). The remediation recipe — the **proxy method
   guard**: non-GET/HEAD outside `/api/` returns 405 + `Allow: GET, HEAD` +
   the first-party `{error}` JSON body, placed BEFORE the canonical
   rewrites (**method beats path resolution** — POST on unknown paths 405s
   while GET keeps its 404 pin); `/api/*` stays handler-owned (405
   wrong-verb, 204 auto-OPTIONS preflight); extend the proxy matcher to the
   static public files so the guard covers the 500 class. Safety check
   before shipping: every mutating flow must go through `/api/*` fetch
   calls (zero non-API fetches in src/, zero page-POSTs in the e2e suite).
   (b) the **form-control metadata surface** — autocomplete / inputMode /
   autocapitalize / spellcheck / enterkeyhint are the password-manager +
   virtual-keyboard contract, a never-swept extension of the attribute
   surface (placeholders/ids/alts): sweep every form control on every route
   both sites. The platform reference ships NO metadata; the clone's
   login-card hardening (signin `email`/`current-password`, verify
   `one-time-code` + `inputMode="numeric"`, signup
   `email`/`new-password`/`new-password`) is deliberate-better — PIN it
   with GUARD specs proving the OTHER forms stay reference-faithful bare
   (the hardening's scope is the login card only: neither "fix" it toward
   the bare reference nor spread it beyond the login card — both are
   drift). Dead-end records: the session-cookie attribute probe is inert
   when the reference persists no cookie at all (localStorage platform
   auth), and the auto-requested well-known files (/favicon.ico,
   /apple-touch-icon.png, /site.webmanifest) are platform-fallback
   artifacts when both sites ship an explicit `<link rel="icon">`.


18n. **Compression/content-encoding + cache-revalidation/Range surfaces
   (session 27)** — two probe families completing the response-contract
   thread (the ENCODING and VALIDATOR dimensions after the sessions-23–26
   header/status/crawler/verb layers): (a) **the compression surface** —
   browser fetch CANNOT set `Accept-Encoding` (a forbidden header), so every
   in-browser probe is structurally blind to the encoding tier; probe via
   raw Node HTTP (`http.request` with full header control). Read three
   things per route: the negotiated `Content-Encoding` per offered encoding
   (identity/gzip/br/zstd), the `Vary: Accept-Encoding` guard on every
   COMPRESSED response (its absence is a CDN cache-poisoning vector — a
   cache can serve the gzipped variant to an identity-only client), and the
   static-vs-dynamic tier split (Node's compress middleware gzips dynamic
   pages + API JSON + `/_next/static` chunks but never public/ static
   files; a platform-fronted reference compresses everything incl. brotli —
   capabilities that live in the edge proxy, NOT the app; document the gap
   in the deployment guide with the reverse-proxy recommendation instead of
   "fixing" it in-app: a route-handler rewrite for the statics would strip
   their validator contract). Pin `compress: true` explicitly so a
   perf-tuning snippet cannot silently disable the tier, and expect the
   tiny-response quirk (gzip grows sub-100B responses — no minimum-size
   threshold; harmless). (b) **the validator/Range surface** — probe the
   `ETag`/`Last-Modified` presence, the 304 answers to `If-None-Match` and
   `If-Modified-Since` (replaying the validators the server just sent), and
   the 206 answer to a `Range: bytes=0-99` request (status + Content-Range
   shape + the exact partial-body length + `Accept-Ranges`). The
   production-grade static contract (weak ETag + LM + 304 both ways + 206
   with the exact body) is what Next's static handlers ship — PIN it, plus
   the dynamic pages' deliberate NO-validator state (`no-store` — the
   per-request CSP-nonce companion: nonced HTML can never be cache-shared;
   a "performance fix" that caches it is a security regression). Watch for
   the platform artifacts that look like findings but aren't: a
   platform-fronted reference's unknown static paths serve the SPA HTML
   fallback (its true favicon/manifest assets live on a CDN — compare the
   ASSET bytes, not the fallback path bodies), and its fallback statics
   carry LM-only validators and a 206-with-empty-body quirk.

18o. **Image attribute/loading + form-validation constraint surfaces
   (session 28)** — two probe families completing the ATTRIBUTE thread (the
   LOADING dimension of the rendered-image contract after the session-18
   placeholder/id/alt, session-21 href/src-value and session-26
   autocomplete/inputMode sweeps; the CONSTRAINT dimension of the form
   contract): (a) **the image attribute/loading surface** — inventory every
   `<img>` on every img-bearing route for the loading family
   (`loading`/`decoding`/`fetchpriority`) plus the src/alt VALUES. The
   reference shipped ZERO loading-family attributes (0/36 — plain EAGER
   images, the browser default) while the clone had drifted to
   `loading="lazy"` on 33/36 — a real FINDING, not the invisible-metadata
   hardening family: `loading` changes the FETCH BEHAVIOR itself (the
   reference fetches every image at page load; lazy defers below-fold
   images until scroll — a behavioral divergence invisible to every
   innerText/class/height diff). Fix toward the reference (remove the
   attributes), pin the eager contract with an e2e spec AND a SOURCE-LEVEL
   unit sweep (the svg-props pattern — which also catches an accidental
   `next/image` migration: its default `loading="lazy"` would drift the
   whole surface silently). Inside the same inventory, diff every src
   VALUE: a reference's BROKEN seed URL (a malformed Unsplash id — non-hex
   chars in the 12-char suffix — that 404s with `naturalWidth === 0` on
   every page it renders) is a DATA TYPO, not a contract: keep the working
   image and pin it as the deliberate-better variance (the asset-re-host
   family — replicate the app's INTENT, not its data typos). (b) **the
   form-validation constraint surface** — inventory `type`/`required`/
   `maxLength`/`minLength`/`pattern`/`min`/`max`/`step` on every
   input/textarea/select (the native validation semantics — the companion
   to the session-26 metadata sweep; `getAttribute()` reads, not IDL
   properties). Expect the constrained set (login email/password
   type+required, contact name/email/message required) to coexist with
   deliberately BARE controls (search inputs, chat composers — the
   type-less session-18 family) and constraint-free CTA pages; pin the
   exact contract so neither a removal (parity break) nor a "hardening)"
   addition (beyond-reference drift) can land silently. CRITICAL LESSON
   (the session's companion find): CLIENT-SIDE VIEW MACHINES (a login
   card's signin/reset/signup/verify state switches) need per-VIEW
   attribute inventories — the default render reads only view #1, so a
   constraint or metadata sweep that stops at the default view is
   structurally blind to every other view's inputs. The clone's signup
   password had shipped `minLength={8}` for 23 sessions while the live
   ships NO minlength anywhere — and the drift was functional (the
   attribute swaps the JS in-DOM error UX for the browser's native
   validation tooltip, which blocks the submit event and makes the JS
   check dead code). Probe every view by CLICKING through the state
   machine, and pin the error-message TEXTS with the reference's exact
   strings. ALSO this family:
   the HTTP protocol posture (reference h2+h3 via its CDN edge vs the
   standalone server's HTTP/1.1 — the same proxy-layer family as brotli,
   documented with the reverse-proxy recommendation) and the PWA surface
   (service-worker registrations + standalone display + manifest link —
   a reference with zero registrations on both sides is a documented
   non-feature; an offline-first PWA is beyond-reference work requiring
   the documentation gate).

## Appendix B — Quick Reference Card

| Need | File |
|---|---|
| Theme tokens / palette | `src/app/globals.css` |
| SQLite resolver | `prisma/db-url.ts` (+ `src/lib/db.ts`, `prisma/seed.ts`) |
| Reference catalog | `prisma/seed-data.ts` (test-pinned) |
| Mobile nav guard | `tests/e2e/mobile-navigation.spec.ts` |
| Parity + journey specs | `tests/e2e/nexuslearn.spec.ts` |
| Session crypto | `src/lib/session.ts` / `src/lib/auth.ts` |
| Tag topics | `src/lib/course-tags.ts` |
| E2E env pinning | `playwright.config.ts` + `tests/e2e/global-setup.ts` |
| Deploy contract | `docs/DEPLOYMENT.md` |
| Architecture/ADRs | `Project_Architecture_Document.md` |
| Agent gotchas | `AGENTS.md` |
| QA captures | `docs/screenshots/` |
| Push workflow | `docs/how-to-git-push-using-ssh-wrapper_SKILL.md` |
