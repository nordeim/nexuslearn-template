---
name: nexuslearn-template
description: "NexusLearn — e-learning platform (Next.js 16 App Router + React 19 + TypeScript strict + Tailwind CSS v4 CSS-first + Prisma 6/SQLite + first-party cookie auth). Complete engineering reference distilled from a 20-session build: pixel-parity clone methodology (computed-style gates + VLM band comparisons + normalized text-content diffs + line-level innerText comparisons + console-error monitoring + a11y-tree snapshots + link/image value inventories + pseudo-element sweeps + SVG class histograms + tag-of-shared-class maps + per-view state diffs + computed box-shadow/border-radius sweeps + hover-state computed-style diffs + focus-ring parity sweeps + scroll-behavior/scroll-reveal comparisons + print-stylesheet comparisons + ::selection/cursor/caret sweeps + computed font/line-height probes + per-element space-y sibling-gap audits + deep-link/query-parameter matrices + form-state persistence sweeps + print-to-PDF page-count comparisons + transient pending-state probes under delayed routes + form-control attribute sweeps + element-tag sweeps + per-route token-theme maps + environment-pollution guards), the TEN Tailwind v4 migration traps (bare-HSL transparent theme, oklch palette drift, in-oklab gradients, the space-y/space-x selector rewrite — v4's :where() zero-specificity engine lets a child's mt-3 win where v3 overrode it — the shadow-scale shift: v4 renamed v3's shadow-sm to shadow-xs and moved shadow-sm up to v3's bare-shadow geometry, so byte-identical shadow-sm classes render one notch heavier (pin --shadow-sm in @theme inline); the button-cursor preflight drop (v4 removed v3's `button, [role="button"] { cursor: pointer }` — restore it in @layer base); the line-height composition flip (v3's variant-order emission makes a responsive text-* utility's OWN line-height beat a plain leading-*; v4's --tw-leading composition flips the winner — pin the reference winners unlayered and media-scoped); the inline-child space-y gap loss (v4's :where() engine assigns gaps to NON-LAST children as margin-block-end, INERT on inline labels — restore v3's follower-side gap); the overridden-gap loss (a child's own margin utility replaces the :where() gap carrier — the -mb-2 back-button case); and the reveal-killed scale (the reference's scroll-reveal system leaves inline transform: none on every revealed element, permanently killing transform utilities — replicate the RESTING state, not the class), the hardened mobile navigation pattern, the hover-audit methodology rules (v4 gates hover: variants behind @media (hover: hover) — touch-emulating headless browsers produce false parity failures; v4 renders translate-y/scale/rotate via the standalone CSS properties, not transform: matrix — read the right property per stack), the runtime-cascade pin pattern (the reference's Base44 runtime injects a page-level utility sheet AFTER its static build — cascade-ORDER variances flip utility winners with byte-identical classes; the third structural blind spot after token values and DOM nesting; fix with an UNLAYERED rule that beats every @layer rule), the focus-audit methodology (UA-default outline: auto computes dynamic contrast-adaptive values — never probe it for parity; transition-all elements render rings mid-transition — wait 2x the duration; v4's ring composition prefixes empty zero-alpha slots — full-string reads required), the universal scroll-behavior pin (the reference's runtime ships * { scroll-behavior: smooth } — pin the universal rule, not just html), the Next 16 allowedDevOrigins dev-hydration trap, multi-surface SQLite path resolution (CLI vs runtime vs standalone chdir trap), the reference page-shell pattern (main.pt-20 + gray wrapper under the fixed navbar), the reference-behavior parity decisions (sign-in to /, public dashboard, /Home landing WITH its hero-state navbar, 2-col AI section, dark popular pricing card, FAQ stack, expandable About This Course, light-slate 404, in-page CourseDetail not-found, simulated-delivery signup + verify, the login card's 5-view state machine owning the WHOLE card interior), the head-metadata parity layer (root description, OG/Twitter cards, canonicals, logo favicon, manifest, per-route OG identity via a routeMetadata() helper), the CourseDetail sidebar level row + tags-only What-You'll-Learn list, the idempotent seed (Prisma update skips undefined keys — restate optional fields as null), the pricing -mt-8 overlap, the h-9+py-6 input collapse pattern, the chrome-subtree audit pattern (the Navbar lives outside <main> — a main*-scoped class diff never catches its drift), the route-STATE audit pattern (/Home renders the landing CONTENT but its navbar state escaped every audit that only checked content + height), the synced-viewport audit rule (set BOTH browser sessions' viewports in the same command — a live@1920 vs clone@375 comparison produces false 4-digit px drifts), the text-content audit surface (normalized innerText diffs catch copy + glyph drift — U+201C vs U+0022 — that height and class sweeps structurally cannot), and the font-parity principle (a font-family STRING match means nothing if one side loads the webfont and the other falls through — probe document.fonts + a measured probe-string width; the reference ships NO webfont, so every height band was a font-metric artifact until the bundle was removed), the skills/docs/tests CSS-leak exclusion (Tailwind v4's automatic source detection scans EVERY non-gitignored file — 51% of the compiled sheet was unused utilities generated from agent documentation; close it with @source not directives, canary-pinned), the navigation-transition surface (scroll restoration: a CSR SPA's popstate restore is the browser-native instant snap while a scrollTo-based framework restore reads the scroll-behavior CSS — a universal smooth pin turns it into a ~1s glide + a mid-smooth-scroll-click race; suppress smooth for the popstate window ONLY with a scoped unlayered rule; the unmanaged-SPA-router family — scroll carryover clamped by the CSR loading shell, stale document.title, stale focus — is kept deliberately better, spec-pinned; CLS must measure 0 on both), the deep-link/query-parameter surface (Next.js delivers repeated search params as string[] — normalize to the first value or Prisma renders the error boundary; slug-form fidelity in hrefs — the reference's underscore slugs; unknown-param semantics — the reference's raw no-match state, not a defensive fallback; route-casing — the Base44 router matches content routes case-insensitively with /login exact-match, replicated by the Next 16 proxy-convention REWRITE with canonical titles kept deliberately better), the transient-pending-state surface (loading bubbles + pending labels only exist in flight — freeze them with page.route delays; the reference's failure UX is a PERMANENTLY-STUCK pending state its platform never recovers), the form-control attribute surface (placeholders/ids/alts are attributes — invisible to innerText AND class diffs; the bare reference ids name/email/message are also the stronger autofill hints), the element-tag surface (an <a> styled exactly like a <button> passes every class diff but double-focuses and navigates differently — sweep a[href]/button tags + tab order per route; the reference nests <Link><button> on some routes and ships bare inert buttons on others), the element-tag DRIFT surface (identical class strings can ride DIFFERENT tags — a <p> and a <span> sharing one class string in the same flex row are indistinguishable to every class diff, height sweep and screenshot because flex blockifies both; Chrome's innerText gives <p> DOUBLE line breaks, so the line-by-line innerText comparison exposes the drift as blank lines, and the tag-of-shared-class map (compare the tag set for each class string present on BOTH sites) catches the rest — the /Courses span count and the /AIAssistant div composer are the pinned cases), the per-route token-theme discovery (the Base44 runtime injects PER-PAGE token sheets — 10 of 11 routes NEUTRAL, /login alone ZINC; scope the override with body:has() so it covers the whole document), plus the session-21 console/a11y/attribute-VALUE probes (listen to the CONSOLE — kebab-case SVG props render perfectly but log React Invalid-DOM-property errors; snapshot the full A11Y TREE; diff href/src VALUES; count the SVG class histogram), the session-22 interaction-modality/persistence probes (the keyboard Tab-order inventory — the REAL Tab walk is ground truth, the accessible-name hardening family, the invisible-focus guard on the collapsed mobile panel, the no-storage pin, the network-request surface, the media-emulation sweep and the text-scaling surface), the session-23 security-headers + axe-core WCAG probes (the HTTP security-header inventory — a platform-fronted reference ships HSTS/referrer-policy/nosniff that a bare framework app lacks; ship the baseline IN the app and pin it; the axe-core rules-engine scan — color-contrast/heading-order counts are the reference's own DESIGN (parity contract), while link-name/button-name violations quantify the aria-label hardening; settle >=2500ms before scanning a progressively-rendered page), the session-24 performance/web-vitals + response-status probes (the resource-inventory surface — TTFB/FCP/LCP + transfer-weight buckets per route, the cache posture on the static asset classes; the URL-canonicalization surface — an SPA platform returns HTTP 200 for EVERY path while a canonical-URL app ships 308 trailing-slash redirects and real 404 statuses, the SEO-correct deliberate-better family; plus the CSP nonce recipe — the proxy generates a per-request nonce, exposes it on the REQUEST headers so the framework auto-nonces its bootstrap scripts, ships script-src 'self' 'nonce-X' 'strict-dynamic', and REQUIRES per-request rendering: static-prerendered pages bake nonce-less HTML at build time and their scripts BLOCK under strict-dynamic, leaving the pages unhydrated — force dynamic rendering in the ROOT layout so the nonce reaches every script incl. the not-found route), the session-25 CSSOM-inventory + crawler/SEO-file probes (the stylesheet STRUCTURE diff — the full custom-property map, the @media census, the @keyframes census across every sheet; raw-token "value drift" in a sheet census is NOTATION, not color — only COMPUTED values render; the MEDIA-QUERY REM RULE: CSS media queries evaluate rem against the INITIAL font size, not the document root's, so v4's rem-based breakpoints are structurally immune to page-level text scaling exactly like v3's px breakpoints — probed identical at 700-1300px x 16/20px roots; the crawler-FILE bodies — robots.txt/sitemap.xml/manifest.json are their own surface beyond the <head> tags: the manifest's scope was missing (now added in the relative portable form), and the remaining serialization deltas are the Next.js builder's canonical output vs the platform generator's artifact forms — semantically identical to every parser, pinned), and the full test pyramid (41 Vitest unit + 257 Playwright e2e incl. 12 mobile-nav guards)."
version: 3.13.0
last_updated: "2026-10-01"
project_state: "298 tests green (41 unit + 257 e2e); lint/typecheck/build clean; parity verified vs live reference (session-25 CSSOM-inventory + crawler/SEO-file pass: TWO new fresh-eyes probe families — the CSSOM inventory surface (the complete stylesheet STRUCTURE diff: the FULL custom-property map extending the session-18 six-token probe to every declared var, the @media census, the @keyframes census, across every sheet incl. runtime-injected ones) found ZERO rendered drift — every delta is engine architecture (v4 @theme emits EVERY theme value as a CSS custom property: 113 clone-only vars —color-amber-500/--animate-pulse/--blur-xl; the live's v3 --tw-*-opacity engine vars; its unused shadcn library tokens --sidebar-*/--chart-* + accordion-* keyframes) or platform chrome (its /login loads THREE platform sheets: 786 platform vars, 43 platform keyframes, 29 platform media queries — the Base44 login UI kit, not app design); raw-token value drift in a sheet census is NOTATION not color (the live declares bare HSL triplets + a .dark block, the clone full values per ADR-004 + the session-18 zinc block in hex; only COMPUTED values render and those are byte-pinned); the probe's one actionable lead — v4's rem-based media queries vs the live's px-based — PROVEN INERT: CSS media queries evaluate rem against the INITIAL font size, not the document root's computed size, so page-level text scaling (html{font-size:20px}) shifts layout rems but NEVER breakpoint rems on either engine — probed identical at 700-1300px x 16/20px roots with byte-identical mid-zone heights (one 1px rounding at 700px/125%, the documented session-22 family) — and the crawler/SEO-file surface (the FILE bodies crawlers fetch — robots.txt, sitemap.xml, manifest.json — body-compared for the first time; the sessions-4/5 specs pinned the <head> tags): ONE real gap — the manifest's scope field missing (the live's ninth field), added in the relative portable form \"/\" (the same deliberate-better family as the relative start_url; the live's are origin-absolute; the field set now matches 9/9 with everything else identical modulo the documented families: icons src hosting — the session-21 byte-identical-asset variance — and start_url/scope portability); the remaining file deltas (robots User-agent casing vs the Next builder's User-Agent, the sitemap's flat 1 vs the live's 1.0 priority serialization, 4-space-vs-flat indentation, the landing-loc trailing slash) are the canonical Next.js builder output vs the live platform generator's artifact forms — semantically identical to every spec-compliant parser, PINNED by two e2e specs so a future audit cannot fix them toward the live; also documented: the live's icon link declares type=image/svg+xml on a PNG asset (the platform generator's own mislabel; the clone's untyped link is correct) and its /manifest.json is a platform 302; every standing surface re-verified GREEN: heights x11 routes x2 viewports byte-exact, innerText 11/11 identical, tag drift 0, class diffs byte-identical to the session-24 baseline report (a scripted set-comparison, 121 lines all in the documented variance families), the FULL mobile battery (open panel 405px BOTH sites, per-link geometry byte-identical y 81/129/177/225/273/321/369/417 heights 44x7+36, the 4px pre-CTA gap on both via the documented session-9 engine variance — NO Tailwind v4 bug), console clean, the AI chat end-to-end (SDK answer, DOM-probe-verified capture); session-24 CSP-nonce + performance/canonicalization pass: TWO new fresh-eyes probe families — the performance/web-vitals + resource-inventory surface (the session-23 suggested direction: the clone dramatically faster on every metric — TTFB 5-61ms vs the live's 209-575ms, FCP 132-288ms vs 856-1752ms, LCP 544-1292ms vs 876-2128ms, the SSR-vs-SPA architecture difference; the 1.1MB logo ships as favicon + login logo on BOTH sites as the byte-identical md5-pinned asset — the reference's own design, do not compress; /_next/static chunks immutable-cached, now spec-pinned) and the response-status/URL-canonicalization surface (the live's SPA platform returns HTTP 200 for EVERY path — trailing-slash variants render directly, unknown routes + /login case variants render the in-app 404 view with raw-path title artifacts; the clone ships the canonical forms — 308 trailing-slash redirects + REAL 404 statuses, the SEO-correct deliberate-better family pinned by three e2e specs); the session's ONE remediation — the CSP NONCE PATTERN (the session-23 documented future work): neither site shipped a CSP; src/proxy.ts generates a per-request nonce, exposes it on the request headers (Next.js auto-nonces its bootstrap scripts) and ships script-src 'self' 'nonce-X' 'strict-dynamic' with the conservative directive set (object-src 'none', base-uri/form-action 'self', frame-ancestors 'self' mirroring XFO SAMEORIGIN, img-src allowlisting images.unsplash.com, style-src 'self' 'unsafe-inline' for the inline style ATTRIBUTES (the reveal pre-hide + the Navbar grid animation), font-src 'self' (no webfonts), connect-src 'self' (zero client-side data calls), dev-only 'unsafe-eval' + ws: (HMR), deliberately NO upgrade-insecure-requests (the standalone template runs plain HTTP locally — the directive upgrades same-origin subresource URLs to https and breaks them; HSTS handles the deployment layer)); the companion fix — export const dynamic = 'force-dynamic' in the ROOT layout: static-prerendered pages (the former circle routes /login /AIAssistant /Pricing /About /Contact /BecomeInstructor) bake nonce-less HTML at build time and their scripts BLOCK under strict-dynamic (the spike-verified unhydrated /login? native-submit failure); per-request rendering on every route (incl. /_not-found) lets the nonce reach every script — verified by the full-route battery (100% nonced scripts + ZERO CSP violations on all 11 routes incl. the 404, the login flow end-to-end, the client islands, the 404's client-router Go Home) + three e2e pins; TTFB cost measured negligible (11-56ms post-change); every standing surface re-verified byte-exact through the change (heights x11x2, innerText 11/11, tag drift 0, class diffs byte-identical to the session-23 baseline, the FULL mobile battery — 405/405 panels, identical link geometry, NO Tailwind v4 bug — and the console clean); session-23 security-headers + axe-WCAG pass: TWO new fresh-eyes probe families — the HTTP security-headers surface (the session's ONE remediation: the live's Cloudflare+Caddy platform layer ships strict-transport-security/referrer-policy/nosniff on every response; the baseline set now ships IN the app via headers() in next.config.ts — + x-frame-options SAMEORIGIN + a permissions-policy deny-list; HSTS inert over plain HTTP, active behind TLS; NO CSP (nonce pattern = documented future work); pinned by the session-23 e2e spec) and the axe-core WCAG rules engine (the sixth a11y family: color-contrast + heading-order are the REFERENCE'S OWN DESIGN with identical node counts on every route — 371 gray lesson-row icons + the line-through $149.99 on CourseDetail, 373/373 once the live's progressive render settles >=2500ms; the live fires link-name (4 footer social links) + button-name (icon-only AI send) — ZERO on the clone, the aria-label hardening quantified; pinned by the accessible-name guard + the reference-design rule-set contract + the clean-/login scan); every standing surface re-verified GREEN: heights x11 routes x2 viewports byte-exact, innerText 11/11 identical, tag drift 0, class diffs documented-variance-only, the FULL mobile battery (open panel 405px BOTH sites, identical link positions 81/129/177/225/273/321/369/417, the 4px pre-CTA gap on both via the v3-margin-top vs v4-margin-block-end engines — the documented session-9 engine variance — NO Tailwind v4 bug), console clean, the AI chat end-to-end (SDK answer re-captured); session-22 interaction-modality + persistence pass: FIVE fresh-eyes probe families — the keyboard Tab-order inventory (static + REAL Tab-key walks), the storage surface, the network-request surface, the media-emulation sweep and the text-scaling surface — found ZERO source defects and closed the last never-probed interaction surfaces: the keyboard Tab order is IDENTICAL on every probed surface (desktop + mobile, open + closed panel; the collapsed panel's links are empirically NOT tabbable — no invisible-focus bug; focus-after-close returns to the trigger on both sites); the clone persists ZERO client-side storage (session exclusively in the HttpOnly cookie — pinned) and fires ZERO client-side data calls on load (SSR-only; the live fires 3-6 entities/analytics XHRs per route); neither site adapts to reduced-motion/dark-scheme/print (parity frozen by spec); text scaling byte-identical at 125% with one 1px rounding flip at 150% on the landing; NEW accepted variances documented + pinned: the form-control accessible-name hardening (stable aria-labels on the /Courses search + three selects, the AI composer, the newsletter input vs the live's placeholder/value naming — never to be "fixed" toward the fragile naming), Escape-to-close on the mobile menu (the live keeps it open), the dev-only nextjs-portal Tab stop (absent in production, verified) and the live's empty animation-duration slot; session-21 console-hygiene + a11y-exposure pass: FIVE fresh-eyes probes — the console-error surface, the full a11y-tree snapshot, the link/image inventory, the pseudo-element sweep and the SVG class-histogram diff — closed ONE real defect and documented four accepted variances: the /Pricing FAQ icons' kebab-case SVG props (stroke-width etc.) rendered perfectly but logged three React Invalid-DOM-property console errors on every dev-server load (invisible to every DOM/class/height diff for 20 sessions; fixed to the camelCase forms — DOM byte-identical, dev console now clean, pinned by tests/svg-props.test.ts + the session-21 e2e FAQ-attribute spec); lucide-react 0.525's aria-hidden=\"true\" default on every icon vs the live's ~405 nameless EXPOSED img nodes per page (the clone's hidden form is the deliberate WCAG-correct hardening, same family as the mobile-trigger ARIA + footer-social aria-labels — pinned by the session-21 e2e sweep so it is never \"fixed\" into drift; the SVG inventory itself is proven identical via per-class histograms — the attribute is the sole svg difference); the <next-route-announcer> framework element (the - alert a11y node the Base44 live lacks); and the /login logo's CDN-vs-local hosting (byte-identical asset, md5-verified); ALSO: the live's CourseDetail renders its curriculum PROGRESSIVELY — probes must poll a DOM signature to settle before diffing; session-20 element-tag drift pass: TWO fresh-eyes probes — the line-by-line innerText comparison and the tag-of-shared-class map — closed the last two tag-level drifts: the /Courses course count now renders on a <span> like the live (the old <p> produced Chrome-innerText DOUBLE line breaks — blank lines the live's main.innerText does not carry) and the /AIAssistant composer wrapper is a <div> like the live (no <form> element, the send button carries no type attribute; the textarea's own keydown handler drives Enter-to-send — the old form's onSubmit was dead code); every standing surface re-verified at the byte-exact state — heights x11 routes x2 viewports incl. CourseDetail 34246.25/38745, innerText 11/11 identical, tag drift 0 on shared classes, class diffs documented-variance-only (all 78 diff lines in the four documented families — the panel-CTA family re-verified down to the byte-identical CTA button strings), the FULL mobile-menu battery (405/404px panel, 8 links, 4px pre-CTA gap, toggle + route-change close, scroll lock, ARIA — no Tailwind v4 bug), the landmark/roles structure, the AI chat end-to-end through the Enter-key path (SDK answer), the dashboard; the session-19 environment-integrity guarantees hold under the still-polluted shell: db/custom.db + db/e2e.db both at the repo root, no outside-repo database — the database-location contract is ENFORCED IN CODE (tests/db-url.test.ts pins that .env's DATABASE_URL=file:../db/custom.db always resolves to <repo>/db/custom.db and that an absolute shell export pointing elsewhere is IGNORED; prisma/db-cli.ts extends the guarantee to the Prisma CLI through every db:* script; allowedDevOrigins carries the *.space-z.ai preview-proxy wildcard); the documented accepted variance stands: the /Contact subject select trigger's class ORDER vs the live — token sets identical, rendering identical, the live's own /Courses triggers use the appended form; sessions 1-19 previously closed every static, content, state, computed-style, cascade, font, preflight, reveal-entry, navigation-transition, deep-link, pending-state/attribute/tag/token and environment-pollution surface)"
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
| Runtime/PM | **bun** (`bun.lock` authoritative) | 1.3.x | Fast installs; `npm` works with package-lock.json |

**Environment variables** (`.env.example` is canonical):

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | `file:../db/custom.db` — schema-relative (resolves against `prisma/`); absolute path in production |
| `AUTH_SECRET` | production | HMAC session secret (`openssl rand -hex 32`); insecure dev fallback warns |
| `NEXT_PUBLIC_SITE_URL` | optional | Canonical origin for metadata/robots |

**Test inventory (verified green):** 31 unit tests across 5 files
(`auth.test.ts` 5, `course-tags.test.ts` 3, `course-eyebrow.test.ts` 3,
`seed-data.test.ts` 15 — incl. the reference imagery/avatar map,
lesson-count pins, display-order pins, the longDescription presence matrix
and the metadata helper) + 155 e2e specs across 2 files
(`mobile-navigation.spec.ts` 12, `nexuslearn.spec.ts` 143 — incl. the 9
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
bun run test         # 32/32 unit
bun run build        # standalone compiles
bun run test:e2e     # 68/68 incl. 6 mobile-nav
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
