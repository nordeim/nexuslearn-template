# NexusLearn Remediation Plan — Session 18

**Source of truth**: live parity re-audit against `https://nexuslearn-template.base44.app/`
(the demo user; Playwright parity probes + agent-browser sessions with synced viewports at
1920×1080, the dev server on :3000, real form submits with network monitoring). The audit
re-verified every standing surface from sessions 1–17 and added THREE fresh-eyes surfaces
suggested by the session-17 transcript (`docs/session_31.md`): the **error/empty-state
sweep (API failure modes)**, the **keyboard-navigation/element-tag pass** and the
**data-mutation deep-dive (enrollment/progress)** — plus the **form-control attribute
surface** and the **semantic-token route map** discovered during the failure-UX probing.

**Rule**: `skills/` folder excluded from checking/testing/compilation (re-verified:
tsconfig `exclude`, eslint `ignores`, vitest `include` matches `src/**` + `tests/**`
only, playwright `testDir: ./tests/e2e`, the `@source not` set — the compiled CSS stays
app-source-only).

**Baseline before remediation**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ ·
214/214 e2e ✓ — the shipped session-17 tree is fully green. All standing visual surfaces
re-verified GREEN at the byte-exact state: desktop heights 11/11, mobile heights 11/11
(the one 667 reading on `/Home` mobile re-confirmed as the live's CSR loading-shell
artifact — it settles to 15150 with a longer wait), class diffs (documented variances
only), the space-y sweep (clean ×10), text diffs (IDENTICAL ×5), the FULL mobile-menu
battery on both sites (404px panel, 8 links, 4px pre-CTA gap, route-close, the
documented Escape/scroll-lock hardening — **no Tailwind v4 display or breakpoint
bug**), the computed shadow sweep (56 diff lines, every one in the three documented
form families), the session-13 focus-ring pin (the slate-400 4px slot byte-identical)
and the session-15 reveal inventory (COUNT-MATCH on all 10 routes).

**Session-18 focus**: sessions 1–17 closed every static, content, state,
computed-style, cascade, font, preflight, reveal-entry, navigation-transition and
deep-link surface. This session's fresh-eyes surfaces examined what renders **while
the network is pending or failing**, what the **element tags and attributes** are
(not just their classes), and whether the **mutation flows** (enrollment/progress)
behave alike — three surfaces no settled-DOM diff can see.

---

## A. Findings inventory (live vs clone)

| # | Finding | Severity |
|---|---------|----------|
| 1 | **The /Contact message textarea PLACEHOLDER differs.** The live renders `placeholder="Tell us how we can help..."`; the clone renders `placeholder="How can we help you?"` (ContactForm.tsx:142). The placeholder renders inside every empty textarea — visible on every page load — but is invisible to every previous audit surface: `innerText` diffs do not include placeholder ATTRIBUTES (only rendered text nodes), and class diffs do not read attributes at all. The name (`John Doe`) and email (`john@example.com`) placeholders match byte-exact; only the message placeholder drifted. | **High** |
| 2 | **The AI chat LOADING bubble differs — visible during every chat exchange.** The live renders a `px-5 py-3 flex items-center gap-2 text-gray-400` bubble containing a spinning `lucide-loader-circle h-4 w-4 animate-spin` svg + the text `Thinking...`. The clone renders a `px-4 py-3` bubble with three `w-2 h-2 rounded-full bg-gray-300 animate-bounce` dots (AIAssistantChat.tsx:233–245). The loading bubble is a TRANSIENT state — it only exists while the request is pending (~1.2s on the live) — so every settled-DOM audit (class diffs, text diffs, screenshots after networkidle) structurally cannot see it. Same blind-spot family as the session-11 per-view login diffs (default-state-only diffs miss transient states). | **High** |
| 3 | **The /Pricing card CTAs are double-focusable `<Link><button>` nests where the live ships single inert `<button>`s.** The clone wraps each pricing CTA in `next/link` (Pricing/page.tsx:162–171): `<a href="/login"><button>…</button></a>` — the anchor AND the nested button are both focusable, so each CTA consumes TWO tab stops (measured: clone stops #11/#12 = `a[Get Started]` then `button[Get Started]`; the live's #11/#12 = `button[Get Started]` then `button[Start Pro Trial]`). The live's three CTAs are bare `<button>` elements (shadcn base classes) and are INERT — a real Playwright click stays on `/Pricing`, fires no navigation, opens no dialog (verified on all three). The clone's anchor wrappers also navigate to `/login` (a behavior the live does not have). Tag names are invisible to class diffs — a `<button>` styled exactly like an `<a>` passes every class-set diff (a NEW structural-blind-spot family: element-TAG drift). NOTE: the `<Link><button>` pattern on the LANDING and other routes is reference-matched (the live nests there too — the / tab order and tag sweep are identical); /Pricing is the ONE divergent route. | **High** |
| 4 | **The newsletter PENDING button label differs — visible during every real subscribe.** The live's button, while the request is pending, renders `disabled` + the literal text `...` — the "Subscribe" label AND the Send icon are both REPLACED (measured outerHTML: `<button ... disabled="">...</button>`). The clone keeps "Subscribe" + the icon (merely disabled) during pending. The pending window is ~150–300ms on a real network — short but user-visible on every subscribe. The live's SUCCESS state ("You're subscribed! Welcome aboard." form swap) matches the clone byte-exact. | **Medium** |
| 5 | **The live's /login route alone carries the shadcn ZINC token theme; the clone is neutral everywhere.** The Base44 runtime injects a PER-PAGE token sheet — measured across all 11 routes: 10 routes carry the NEUTRAL theme (`--ring: 0 0% 3.9%`, `--input: 0 0% 89.8%`, `--muted-foreground: 0 0% 45.1%`, `--primary: 0 0% 9%`, `--secondary: 0 0% 96.1%` — all exactly the clone's values: `#0a0a0a`, `#e5e5e5`, `#737373`, `#171717`, `#f5f5f5` ✓) but **/login carries ZINC** (`--ring: 240 10% 3.9%`, `--input: 240 5.9% 90%`, `--muted-foreground: 240 3.8% 46.1%`, `--primary: 240 5.9% 10%`, `--secondary: 240 4.8% 95.9%`). The only token that renders visibly on /login is `--ring` (through `focus-visible:ring-ring` on the card's buttons): the Sign in button's keyboard-focus ring slot measures `rgb(9, 9, 11)` (zinc-950) on the live vs `rgb(10, 10, 10)` (neutral-950) on the clone — the same 1–3 sRGB-unit drift family as the gotcha-3 oklch palette pin. The login inputs are unaffected (their slate-400 cascade pin sets `--tw-ring-color` directly). | **Medium** |
| 6 | **The CourseDetail instructor portrait `alt` differs.** The live ships `alt=""` (decorative — the instructor name renders in the adjacent paragraph, so screen readers get it once); the clone ships `alt={course.instructorName}` (CourseDetail/page.tsx:165) — screen readers announce the name TWICE (image + text). The course hero img alt matches byte-exact ("Complete Web Development Bootcamp 2026" on both). Fixing to `alt=""` is both parity AND better a11y. | **Low** |
| 7 | **The /Courses search input carries `type="text"` where the live's input has NO type attribute.** A stale session-6 comment claims the live ships `type="text"` — the current live input is attribute-less (type=text is the UA default, so the rendering is identical; this is markup-level parity only). The clone's comment (CourseCatalog.tsx:123–125) needs the correction. | **Low** |
| 8 | **The live's "Enroll Now" button is INERT (verified with a real Playwright click + network monitoring).** Clicking it on the live's Web Dev course fires only `analytics/track/batch` + `log-user-in-app` requests — no enrollment call, no UI change, no persistence after reload (the CTA stays "Enroll Now", no lesson checkboxes ever appear). The live's dashboard demo user carries zero enrollments (matching the reference dashboard image — VLM-verified: 0/0/0/0% stats + the "No courses yet" empty state). The clone's enrollment + progress flows are fully functional (e2e-pinned since session 2: enroll → "You're enrolled" → Continue Learning → dashboard stats). **Decision**: the clone keeps its functional flows — the README's core promise ("real progress semantics, not a static mock") — and the live's inertness joins the documented reference-behavior family (the inert pricing CTAs, the unmanaged router). | **Low** (document) |
| 9 | **The live's FAILURE states are permanently-stuck loading states; the clone's recover.** (a) AI chat: aborting the live's InvokeLLM request leaves the "Thinking..." bubble forever (verified at +12s); the clone renders an explicit "Network error — please try again." assistant bubble. (b) Newsletter: aborting the live's subscribe leaves the button stuck at "..." forever (verified at +15s, disabled, no retry possible); the clone resets to "Subscribe" (retryable). **Decision**: keep the clone's recoverable behavior (the session-16 deliberate-better precedent — replicating unrecoverable states ships the reference's defects); document + spec-pin. | **Low** (document) |

### Verified matching (no action)

**Error/empty-state sweep**: login wrong-credentials renders "Invalid email or password"
on both (byte-identical error text); the login server-dead handling on the clone renders
"Something went wrong. Please try again." (the live's endpoint was never reached by the
block pattern — its Base44 auth API kept the login working, a probe artifact); the
Contact empty-submit is native HTML5 validation on both (identical "Please fill out
this field." messages, no custom UI on either); the newsletter invalid-email is native
type=email validation on both (no custom UI, no request fired); the Contact
server-dead stays silently on the form on both (no error UI on either — the reference
has no error state); the newsletter SUCCESS state matches byte-exact ("You're
subscribed! Welcome aboard." + the form swap); the select dropdowns' rendered token
values match (popover bg/border/item colors identical — the live's dropdown doesn't
even consume its own --border token); the catalog no-results DOM (session 17).

**Keyboard/tag/attribute sweep**: tab order IDENTICAL on /, /Courses (modulo the
documented aria-label hardening), /Contact, /AIAssistant, /Dashboard (12 stops each);
the element-TAG + text + href surface FULLY IDENTICAL on /, /About, /Contact,
/BecomeInstructor, /AIAssistant, /Dashboard, /login (the only href diffs are the
documented per-site-id CourseDetail links); the placeholder/aria-label/alt surface
identical on /, /Courses, /AIAssistant, /login modulo the documented clone-only
aria-label hardening family; the AI textarea placeholder ("Ask a question...") + its
::placeholder color (rgb(115,115,115)) + font (14px/400) identical; the login logo
alt ("NexusLearn logo") identical; the Google button + nav links render no visible
focus-ring slots on either site.

**Data mutation**: the live's demo dashboard is in the empty state (VLM-verified
against `docs/nexuslearn-template-dashboard.png`: Enrolled 0 / In Progress 0 /
Completed 0 / Avg. Progress 0% + "No courses yet" + "Browse Courses") — matching the
clone's fresh-seed state exactly; the live's Enroll Now is inert (finding 8); the
clone's mutation flows are e2e-covered (enroll → dashboard, progress recompute).

### Accepted variances (documented, no action)

- The clone's aria-label hardening (menu trigger, search input, selects, social links,
  AI textarea + send button, newsletter email input) — the documented a11y family.
- The `/login` tab-order `nextjs-portal` stop — the Next 16 DEV overlay (dev-server
  only; absent from the production build the e2e suite runs).
- The live's `section[aria-label="Notifications alt+T"]` — the Base44 platform toast
  region (platform-level, not app UI).
- Everything previously documented (oklab color forms, infinity-radius forms,
  empty-slot shadow forms, the gradient class form, the panel mechanism, the ARIA/
  scroll-lock/Escape hardening, the reveal WAAPI-vs-framer implementation, the
  per-site-id hrefs, the supabase-hosted logo, mount-time latency, the CSR/SSR
  structural differences, the raw-path titles on case-variant routes).

---

## B. Remediation plan (execution order — TDD: specs RED first, then GREEN)

### Phase 1 — RED: pin the reference state in specs

- [1a] `tests/e2e/nexuslearn.spec.ts` — new `session-18 parity` describe blocks:
  - **Block 1 — the /Contact message placeholder (finding 1)**: the message
    textarea's `placeholder` attribute is `Tell us how we can help...` (RED now:
    `How can we help you?`); GUARD: the name input keeps `John Doe` and the email
    input `john@example.com`.
  - **Block 2 — the AI chat loading bubble (finding 2)**: with `page.route` delaying
    `/api/ai/chat`, sending a message renders the loading bubble with EXACTLY the
    reference structure — the `px-5 py-3 flex items-center gap-2 text-gray-400`
    bubble, a `lucide-loader-circle` svg with `animate-spin`, and the text
    `Thinking...`; and NO `animate-bounce` dots exist in the chat (RED now: dots,
    no "Thinking...").
  - **Block 3 — the pricing CTAs (finding 3)**: the three card CTAs are `button`
    elements (NOT anchors — `getByRole("button")` counts 3, no `a[href="/login"]`
    exists on /Pricing); each CTA is a SINGLE tab stop (focusable count over the
    cards grid = 3, not 6); clicking "Get Started" stays on `/Pricing` (RED now:
    anchor + nested button pairs → navigates to /login).
  - **Block 4 — the newsletter pending label (finding 4)**: with `/api/newsletter`
    delayed, after submit the button is disabled with the exact text `...` (RED
    now: `Subscribe`); GUARD (green by design): the idle label is `Subscribe` and
    the success swap still renders "You're subscribed! Welcome aboard.".
  - **Block 5 — the /login zinc theme (finding 5)**: the Sign in button's
    keyboard-focus ring slot is `rgb(9, 9, 11)` on /login (RED now: `rgb(10, 10, 10)`);
    `--ring` reads `hsl(240 10% 3.9%)` on /login (RED now: `#0a0a0a`); GUARD: on
    /Courses `--ring` stays `#0a0a0a` and the Contact "Send Message" button's ring
    slot stays `rgb(10, 10, 10)` (the neutral theme everywhere else).
  - **Block 6 — the instructor alt (finding 6)**: the CourseDetail instructor
    portrait's `alt` is `""` (RED now: the instructor name); GUARD: the course hero
    img keeps the course-title alt.
  - **Block 7 — the search input type (finding 7)**: the catalog search input has
    NO `type` attribute (RED now: `type="text"`).
  - **Block 8 — the deliberate-better failure states (findings 8–9; GREEN by
    design)**: aborting `/api/ai/chat` renders the "Network error — please try
    again." bubble (NOT a stuck "Thinking..."); aborting `/api/newsletter` returns
    the button to `Subscribe` (NOT stuck at "..."); the enroll flow stays
    functional (Enroll Now → "You're enrolled" — the existing session-2 spec
    already pins it; this block documents the decision alongside).

### Phase 2 — GREEN (implementation)

- [2a] **`src/components/ContactForm.tsx`**: the message textarea placeholder →
  `Tell us how we can help...` (one string).
- [2b] **`src/components/AIAssistantChat.tsx`**: the loading bubble → the reference
  structure: the bot avatar column stays; the bubble becomes
  `bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-2
  text-gray-400` containing `<LoaderCircle className="h-4 w-4 animate-spin" />` +
  `Thinking...` (the lucide `LoaderCircle` import — the live's svg is the
  loader-circle path `M21 12a9 9 0 1 1-6.219-8.56` with `lucide-loader-circle
  h-4 w-4 animate-spin`).
- [2c] **`src/app/Pricing/page.tsx`**: unwrap the three `<Link href="/login">`
  wrappers — the `<button>`s stay with their byte-identical classes, now bare
  (inert, matching the live). The `Link` import stays only if still used elsewhere
  in the file (otherwise removed).
- [2d] **`src/components/NewsletterForm.tsx`**: while `status === "loading"`, the
  button's children become the literal `...` (replacing "Subscribe" + the Send
  icon, exactly like the live's pending outerHTML).
- [2e] **`src/app/login/page.tsx` + `src/app/globals.css`**: the login page's
  `<main>` gains `data-login-theme=""`; globals.css gains the scoped block
  `body:has(main[data-login-theme]) { --background: hsl(0 0% 100%); --foreground:
  hsl(240 10% 3.9%); --card: hsl(0 0% 100%); --card-foreground: hsl(240 10% 3.9%);
  --popover: hsl(0 0% 100%); --popover-foreground: hsl(240 10% 3.9%); --primary:
  hsl(240 5.9% 10%); --primary-foreground: hsl(0 0% 98%); --secondary: hsl(240
  4.8% 95.9%); --secondary-foreground: hsl(240 5.9% 10%); --muted: hsl(240 4.8%
  95.9%); --muted-foreground: hsl(240 3.8% 46.1%); --accent: hsl(240 4.8% 95.9%);
  --accent-foreground: hsl(240 5.9% 10%); --destructive: hsl(0 84.2% 60.2%);
  --border: hsl(240 5.9% 90%); --input: hsl(240 5.9% 90%); --ring: hsl(240 10%
  3.9%); }` — the FULL measured zinc block (only `--ring` renders visibly today;
  the rest is pinned for future-proofing). The `body:has()` scope covers the
  navbar + footer too (the live's runtime sheet is document-level — its /login
  navbar buttons also render the zinc ring).
- [2f] **`src/app/CourseDetail/page.tsx`**: the instructor portrait `alt={course.
  instructorName}` → `alt=""` (with the comment explaining the reference's
  decorative choice — the name is in the adjacent paragraph).
- [2g] **`src/components/CourseCatalog.tsx`**: remove `type="text"` from the search
  input; correct the session-6 comment (the live's input carries no type attribute).
- [2h] **Docs**: README (badge + the session-18 row), AGENTS.md (the new gotchas —
  the attribute-surface blind spot + the transient-state blind spot + the
  element-tag blind spot + the per-route token-theme discovery + the inert
  reference flows), CLAUDE.md (pyramid), PAD ([S18] + §7.1),
  `nexuslearn-template_SKILL.md` (v3.6.0 — the new surfaces + the tag/attribute
  audit rules), this plan (results), `docs/session_32.md`, the repo worklog.

### Phase 3 — VERIFY (gates + live re-audit)

- [3a] Full gate suite: lint → typecheck → 31/31 unit → build → e2e (214 + the new
  session-18 specs, zero regressions).
- [3b] Live-vs-clone re-verification on the dev server: the placeholder, the chat
  loading bubble (side-by-side during a delayed request), the pricing CTAs (tab
  stops + click behavior), the newsletter pending label, the /login ring slot +
  the token reads, the instructor alt, the search input attributes — plus the
  standing surfaces (heights ×11 ×2, class diffs, the mobile battery, the shadow
  sweep, the focus pin, the reveal inventory).
- [3c] **The leak spec re-runs LAST** after every doc write (the session-15 process
  rule).
- [3d] Screenshots: the standard set under `docs/screenshots/` + the NEW session-18
  captures (the chat "Thinking..." bubble, the newsletter "..." pending state, the
  contact form with the corrected placeholder, the /login focused Sign-in ring).
- [3e] `.env.example` re-verified (the session changes no environment surface).
- [3f] Commit to main + SSH-wrapper push (`docs/ssh_git_wrapper_v3.py`).

---

## C. Risk register

| Risk | Mitigation |
|---|---|
| The `body:has(main[data-login-theme])` selector breaks in older browsers | `:has()` is supported in every current Chromium/Firefox/Safari (Chromium 105+); the e2e suite runs Chromium; the token is a progressive enhancement of an already-rendered ring (the neutral fallback is the status quo — no layout or content depends on it). |
| The zinc block's non-ring tokens alter /login rendering unexpectedly | Every login-card element with token consumers was enumerated: the inputs override with slate utilities, the buttons' only token consumer is the focus ring, the card shell uses explicit slate/white classes. The specs pin the ring + GUARD the inputs' slate-400 pin (session-13) stays intact. |
| Unwrapping the pricing Links removes navigation users expect | The live's CTAs are inert (verified) — the clone was MORE functional, but through a broken (double-focusable) structure. Parity wins; the landing/AI/instructor CTAs keep their reference-matched Link nests. The specs pin all three CTAs as single buttons. |
| The "Thinking..." bubble's timing makes the spec flaky | The spec delays `/api/ai/chat` via `page.route(...)` with a deferred fulfill — the loading state persists deterministically until the spec releases it. |
| The newsletter "..." label breaks the existing subscribe specs | The existing specs assert the idle label + the success swap — both untouched; the new spec only reads the pending window under a delayed route. |
| The `alt=""` change breaks the seed-data tests | The seed tests pin `instructorAvatar` URLs + names (data), not the rendered alt attribute; the e2e CourseDetail specs assert text content, not the portrait's alt. |
| Removing `type="text"` changes the search input's behavior | `type=text` is the UA default; React renders `<input>` without type identically. No spec selects the input by `[type=text]` (verified by grep). |
| The deliberate-better failure pins freeze a UX the team may want to change | The spec comments record the reference's measured behavior (stuck "Thinking..." / stuck "...") and the decision rationale — same pattern as the session-16 navigation pins. |

---

## D. Phase 3 results (executed — recorded after GREEN)

- **RED verified**: 11/17 specs failed against the pre-fix production build
  for exactly the pinned reasons — the /Contact message placeholder, the
  bare form ids, the AI chat loading bubble (the dots + no "Thinking..."),
  the two /Pricing CTA specs (the anchor wrappers + the /login navigation),
  the newsletter "..." pending label, the contact "Sending..." pending
  label, the two /login zinc specs (the rgb(10,10,10) ring + the #0a0a0a
  token), the instructor alt, and the search-input type. The 6
  green-by-design guards passed (the name/email placeholders, the
  newsletter idle+success, the neutral-ring GUARD, the hero alt, and the
  two deliberate-better failure pins).
- **RED-phase spec corrections** (3 GUARDs initially failed on selector
  bugs, not findings): the /Contact name input carries NO type attribute
  on either site (select form controls by placeholder or id — never
  [type=text]); the Contact Send button's ring is ring-1 (a 1px slot, not
  the login inputs' ring-2 4px); the first img in main on CourseDetail is
  the INSTRUCTOR portrait (the hero img needs a structural selector).
  A fourth correction surfaced in the full-suite run: the session-6
  search-input spec pinned the stale `type="text"` note — updated to the
  attribute-less reference markup.
- **GREEN-phase additions** (findings discovered DURING the RED phase):
  (a) the contact form's bare reference ids (`name`/`email`/`message` +
  the label[for] wiring — the clone's `contact-*` prefixes were markup
  drift invisible to every rendered surface, and the bare names are the
  stronger autofill hints); (b) the contact PENDING label — the live's
  button replaces its whole content with `Sending...` (three ASCII
  periods, charCodes 46,46,46, no Send icon — byte-verified), and its
  contact endpoint NEVER COMPLETES (stuck at "Sending..." on every real
  submit, +15s verified); the clone had the right idea but shipped the
  U+2026 ellipsis glyph + kept the icon.
- **The session-13 GUARD refinement**: the "Sign in button's ring stays
  the --ring near-black" guard now expects `#09090b` (the zinc block) —
  the guard's intent (the buttons never flip to slate-400) is unchanged.
- **Gates**: lint ✓ · typecheck ✓ · 31/31 unit ✓ · build ✓ · **231/231
  e2e ✓** (214 → 231: +17 session-18 specs, zero regressions — every
  session-4 through session-17 spec green through the ContactForm/
  AIAssistantChat/Pricing/NewsletterForm/login-page/globals.css/
  CourseDetail/CourseCatalog changes).
- **Visual re-verification (dev server, live vs clone)**: every fixed
  surface byte-identical — the /Contact placeholder + ids, the /Pricing
  CTA tags (3 BUTTONs, 0 anchors), the type-less search input, the
  instructor alt "", the login ring slot `rgb(9, 9, 11) 0px 0px 0px 4px`
  on both sites (the token reads differ only in form: the live's bare
  triplet `240 10% 3.9%` vs the clone's `#09090b` — the documented
  convention variance), the chat loading bubble (text + class string +
  spinner + 0 dots), the newsletter "..." (disabled, 0 svgs) and the
  contact "Sending..." (disabled, 0 svgs). Every standing surface
  re-swept GREEN: heights byte-exact ×11 ×2 (mobile /Home matched
  directly this run), class diffs (documented variances only), the
  mobile battery (404px panel, 8 links, the documented CTA form), the
  space-y sweep clean, the shadow sweep (56 lines, all in the three
  documented form families), the focus pin (the slate-400 slot
  byte-identical), the reveal inventory COUNT-MATCH ×10.
- **Screenshots**: 52 files in `docs/screenshots/` — the standard 47-set
  re-captured on the remediated dev server + the FIVE new session-18
  captures (aiassistant-thinking-bubble, newsletter-pending-dots,
  contact-placeholder, contact-sending-pending, login-signin-zinc-ring —
  the transient states frozen under delayed routes, VLM-verified).
- `.env.example` re-verified (DATABASE_URL/AUTH_SECRET/
  NEXT_PUBLIC_SITE_URL cover every process.env reference; the session
  changed no environment surface). The leak spec re-ran LAST, after
  every doc write.
