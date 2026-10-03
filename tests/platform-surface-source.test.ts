import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Session 47 — the platform-surface source pins (fresh-eyes families A/B/C:
 * the new CSS media tiers, the Web-Share census, the idle-tier census —
 * the session_104 suggested directions, all three probed parity-clean on
 * both sites).
 *
 * The censuses (run on BOTH sites, all 9 app routes signed in + the two
 * auth routes signed out, layer-aware CSSOM walking):
 *
 * - THE NEW MEDIA TIERS: zero prefers-contrast + zero
 *   prefers-reduced-transparency rules on EITHER site's app routes, and
 *   emulating either tier (plus both at once) changes NOTHING on either
 *   site — no heights, no computed styles (the s22 no-adaptation contract
 *   extended to the two newer media features). The LIVE's AUTH routes
 *   carry platform-sheet rules the clone does not: 2 prefers-contrast
 *   rules that are the GOOGLE IDENTITY SERVICES button chrome (the
 *   injected googleidentityservice_button_styles sheet — s43 counted
 *   them, s47 identified the owner) + 8 prefers-reduced-motion rules
 *   (the auth-shell bundle's motion-safe/motion-reduce view-transition
 *   and toast utilities) — ALL INERT (the render tier is byte-identical
 *   under contrast:more and reduced-motion:reduce; the platform-chrome
 *   documentation family, like the s43 43-keyframes + the s46 message
 *   listener).
 *
 * - THE CENSUS-METHODOLOGY CORRECTION: the s43 media-census walker never
 *   recursed into @layer blocks, so it only saw UNLAYERED rules — and
 *   Tailwind v4 emits ALL utilities inside @layer. The layer-aware walk
 *   finds the clone ships 1 forced-colors rule per route: Tailwind v4's
 *   own .outline-hidden accessibility helper (a transparent outline —
 *   renders nothing; select.tsx's shadcn class has carried outline-hidden
 *   since commit 1; Tailwind v3 has no such utility, so the live ships 0).
 *   The s43 NUMBERS were the under-count; the s43 RENDER conclusion
 *   (forced-colors = the UA forced palette, unchanged layout) re-verified
 *   correct.
 *
 * - THE WEB-SHARE CENSUS: the ZERO-share surface on BOTH sites — the API
 *   absent in the shared context, zero instrumented calls, zero
 *   share-labeled UI, no share_target in either manifest.
 *
 * - THE IDLE CENSUS: the ZERO-idle surface on BOTH sites — the APIs exist
 *   in the shared context (requestIdleCallback, IdleDetector) but zero
 *   registrations fire anywhere (instrumented, 3s settle).
 *
 * These pins freeze the clone's zero-stance posture at the SOURCE tier
 * (the s44 lifecycle pattern): any future client code adding a Web-Share
 * button, an idle-scheduled task, or a prefers-* adaptation must pass
 * through the documentation gate instead of drifting silently.
 */

const SRC_ROOT = "src";

function listSources(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      listSources(full, acc);
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const SOURCES = listSources(SRC_ROOT);
const ALL_SOURCE_TEXT = SOURCES.map((f) => ({ file: f, text: readFileSync(f, "utf8") }));

/** The Web-Share API surface (the s47 family B census definition). */
const WEB_SHARE_APIS = [
  "navigator.share",
  "navigator.canShare",
  "share_target",
] as const;

/** The idle-API surface (the s47 family C census definition). */
const IDLE_APIS = [
  "requestIdleCallback",
  "cancelIdleCallback",
  "IdleDetector",
] as const;

/** The prefers-* media families (the s47 family A census definition — the
 * two NEW tiers + the s41/s43 no-adaptation contracts they extend). */
const PREFERS_FAMILIES = [
  "prefers-contrast",
  "prefers-reduced-transparency",
  "prefers-reduced-motion",
  "prefers-color-scheme",
] as const;

/** The clipboard-API surface (the s48 family A census definition — the
 * async API + the legacy execCommand path). */
const CLIPBOARD_APIS = [
  "navigator.clipboard",
  "execCommand",
] as const;

/** The fullscreen / Picture-in-Picture surface (the s48 family B census
 * definition — both the request/exit calls and the video attributes). */
const FULLSCREEN_PIP_APIS = [
  "requestFullscreen",
  "exitFullscreen",
  "fullscreenElement",
  "requestPictureInPicture",
  "disablePictureInPicture",
] as const;

/** The gamepad / WebHID surface (the s48 family C census definition). */
const GAMEPAD_HID_APIS = [
  "getGamepads",
  "gamepadconnected",
  "navigator.hid",
] as const;

/** The credentials / WebAuthn surface (the s49 family A census definition —
 * the password-adjacent API family: the Credential Management API + the
 * WebAuthn statics). */
const CREDENTIALS_WEBAUTHN_APIS = [
  "navigator.credentials",
  "PublicKeyCredential",
  "isUserVerifyingPlatformAuthenticatorAvailable",
  "isConditionalMediationAvailable",
] as const;

/** The Web-Speech surface (the s49 family B census definition — the
 * synthesis + recognition halves of the tier). */
const WEB_SPEECH_APIS = [
  "speechSynthesis",
  "SpeechRecognition",
  "getVoices",
] as const;

/** The Bluetooth / Serial / USB surface (the s49 family C census
 * definition — the niche connectivity tier). */
const CONNECTIVITY_APIS = [
  "navigator.bluetooth",
  "navigator.serial",
  "navigator.usb",
  "requestDevice",
] as const;

/** The WebXR / immersive-VR surface (the s50 family A census definition —
 * the last unprobed major device tier: the XR system + session seam). */
const WEBXR_APIS = [
  "navigator.xr",
  "isSessionSupported",
  "requestSession",
  "XRSession",
] as const;

/** The File System Access surface (the s50 family B census definition —
 * the picker tier + the handle constructors). */
const FILE_SYSTEM_ACCESS_APIS = [
  "showOpenFilePicker",
  "showSaveFilePicker",
  "showDirectoryPicker",
  "FileSystemHandle",
] as const;

/** The Web NFC / Web SMS surface (the s50 family C census definition — the
 * NDEF tier + the drag-data consumption seam; the one-time-code
 * autocomplete hardening is the s26-pinned intentional divergence, not a
 * family-C API reference). */
const WEB_NFC_SMS_APIS = [
  "NDEFReader",
  "NDEFMessage",
  "dataTransfer",
] as const;

/** The WebTransport / WebCodecs surface (the s51 family A census
 * definition — the transport/codec tier: the WebTransport constructors +
 * the codec constructor family). */
const WEBTRANSPORT_CODEC_APIS = [
  "WebTransport",
  "WebCodecs",
  "VideoEncoder",
  "VideoDecoder",
  "ImageDecoder",
] as const;

/** The Compute Pressure / Priority Hints surface (the s51 family B census
 * definition — the PressureObserver tier + the fetchPriority React prop
 * form; the s28 img-attributes test already guards the lowercase
 * `fetchpriority=` prop pattern, and the CourseCard comment's bare-word
 * mention is not a prop). */
const PRESSURE_PRIORITY_APIS = [
  "PressureObserver",
  "PressureRecord",
  "computePressure",
  "fetchPriority",
] as const;

/** The View Transitions / Document Picture-in-Picture surface (the s51
 * family C census definition — the same-document ViewTransition seam +
 * the document PiP window seam). */
const VIEW_TRANSITIONS_PIP_APIS = [
  "startViewTransition",
  "documentPictureInPicture",
  "requestWindow",
  "ViewTransition",
] as const;

describe("session-51: the platform-surface source census", () => {
  it("ZERO WebTransport / WebCodecs references anywhere in src/ (the family A zero-stance)", () => {
    // The pin: the clone ships no transport/codec surface — no WebTransport
    // construction, no VideoEncoder/VideoDecoder configure/decode call, no
    // ImageDecoder render path. The probed parity: WebTransport +
    // WebTransportError are PRESENT with IDENTICAL shape on BOTH sites
    // (WebTransportCongestionControl the only absent entry, on both) + the
    // codec constructor family (VideoEncoder/VideoDecoder/AudioEncoder/
    // AudioDecoder/ImageDecoder/EncodedVideoChunk/EncodedAudioChunk) all
    // present on both, but ZERO instrumented calls, ZERO transport/codec-
    // labeled UI, ZERO transport/codec CSSOM rules.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEBTRANSPORT_CODEC_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO Compute Pressure / Priority Hints references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no pressure surface — no PressureObserver
    // construction, no observe/unobserve registration, no computePressure
    // read, no fetchPriority prop on any element. The probed parity:
    // PressureObserver + PressureRecord are PRESENT with IDENTICAL shape
    // on BOTH sites but ZERO instrumented calls and ZERO pressurechange
    // registrations; the fetchPriority ATTRIBUTE tier ships only on the
    // framework's own one-per-route bootstrap preload link (Next 16's
    // emission, CSP-nonce'd — the s29 first-party preload family's
    // attribute-level extension, the documented deliberate-better SSR
    // family; the live ships ZERO preload links on its app routes) —
    // never on an app-authored element.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of PRESSURE_PRIORITY_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO View Transitions / Document Picture-in-Picture references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone ships no view-transition surface — no
    // document.startViewTransition call, no documentPictureInPicture
    // requestWindow, no ViewTransition consumer. The probed parity: the
    // API tier is PRESENT with IDENTICAL shape on BOTH sites
    // (startViewTransition + ViewTransition + documentPictureInPicture
    // with requestWindow) with ZERO calls; the CSS tier is the zero
    // stance on every clone route + every live APP route — the live's 16
    // ::view-transition-* rules live ONLY in its AUTH-route platform
    // bundle (static/index-*.css, the Base44 auth-shell sheet), ALL INERT
    // (the html element never carries the vt-hub-enter/vt-hub-exit/
    // vt-product-switch class gates; zero @view-transition at-rules on
    // either site) — the s47 auth-route platform-chrome family's third
    // member (the Google-Identity-Services + motion-utilities siblings),
    // documented, never replicated.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of VIEW_TRANSITIONS_PIP_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("session-50: the platform-surface source census", () => {
  it("ZERO WebXR / immersive-VR references anywhere in src/ (the family A zero-stance)", () => {
    // The pin: the clone ships no XR surface — no navigator.xr
    // isSessionSupported probe, no requestSession construction, no XRSession
    // event wiring. The probed parity: navigator.xr is PRESENT with IDENTICAL
    // shape on BOTH sites (isSessionSupported + requestSession functions;
    // XRSession + XRSystem constructors; XRDevice absent on both) but ZERO
    // instrumented calls, ZERO vr/headset/immersive-labeled UI, ZERO
    // sessionstart/sessionend registrations.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEBXR_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO File System Access references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no file-picker surface — no showOpenFilePicker
    // / showSaveFilePicker / showDirectoryPicker call, no FileSystemHandle
    // consumption. The probed parity: the full picker tier is PRESENT with
    // IDENTICAL shape on BOTH sites (three picker functions + the four
    // FileSystem constructors) but ZERO instrumented calls, ZERO
    // input[type=file] elements, ZERO upload/import/export-labeled UI.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of FILE_SYSTEM_ACCESS_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO Web NFC / Web SMS references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone ships no NFC surface — no NDEFReader construction,
    // no scan/write, no dataTransfer drag consumption. The probed parity:
    // NDEFReader + NDEFMessage are ABSENT in the shared headless context on
    // BOTH sites (the s47/s49 ABSENT case's mirror — the headless flag);
    // ZERO nfc-labeled UI; the Web OTP consumption tier is zero on both
    // sites' public routes (the one-time-code autocomplete hit in
    // LoginForm.tsx is the s26-pinned intentional hardening, e2e-pinned at
    // the password-manager contract spec — not a family-C API reference).
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEB_NFC_SMS_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("session-49: the platform-surface source census", () => {
  it("ZERO credentials / WebAuthn references anywhere in src/ (the family A zero-stance)", () => {
    // The pin: the clone ships no passkey surface — no navigator.credentials
    // create/get/store call (the Credential Management API), no
    // PublicKeyCredential creation (WebAuthn), no platform-authenticator
    // availability probe, no conditional-mediation opt-in. The probed
    // parity: the API family is FULLY PRESENT in the shared context on BOTH
    // sites (navigator.credentials with create/get/store/
    // preventSilentAccess + PublicKeyCredential with both statics) but the
    // app surface is ZERO on both — zero instrumented calls, zero
    // passkey/biometric/fingerprint-labeled UI, zero app registrations.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of CREDENTIALS_WEBAUTHN_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO Web-Speech references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no voice surface — no speechSynthesis.speak
    // (no TTS), no SpeechRecognition construction (no dictation), no
    // getVoices enumeration. The probed parity: the tier is present in the
    // shared context on BOTH sites (speechSynthesis + SpeechRecognition
    // both exposed by the e2e Chromium) but ZERO app surface on either —
    // zero instrumented calls, zero speech/voice/mic-labeled UI, zero
    // speech-family CSSOM rules.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEB_SPEECH_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO Bluetooth / Serial / USB references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone ships no niche-connectivity surface — no
    // navigator.bluetooth.requestDevice, no navigator.serial.requestPort,
    // no navigator.usb.requestDevice, no port/device enumeration. The
    // probed parity: navigator.bluetooth is ABSENT in the shared headless
    // context on BOTH sites (the s47 navigator.share ABSENT case's mirror);
    // serial + usb are present with identical shape but ZERO instrumented
    // calls on either site; zero bluetooth/serial/pairing-labeled UI.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of CONNECTIVITY_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("session-48: the platform-surface source census", () => {
  it("ZERO clipboard-API references anywhere in src/ (the family A zero-stance)", () => {
    // The pin: the clone ships no clipboard surface — no async
    // navigator.clipboard call (writeText/readText/write/read), no legacy
    // document.execCommand copy/cut/paste path. The probed parity: BOTH
    // sites carry zero app-level clipboard calls, zero copy-labeled UI,
    // zero legacy execCommand invocations (the API object itself exists in
    // the shared context on both sites; neither site's code touches it).
    // The copy/cut/paste LISTENERS the runtimes register are framework
    // surface (React's own event delegation), not app handlers.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of CLIPBOARD_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO fullscreen / Picture-in-Picture references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no fullscreen or PiP surface — no
    // requestFullscreen/exitFullscreen call, no requestPictureInPicture on
    // any video (both sites render ZERO video elements), no
    // disablePictureInPicture attribute. The probed parity: both APIs are
    // ENABLED in the shared context on both sites; the instrumented
    // counters never fire on either; zero fullscreen/PiP-labeled UI; zero
    // :fullscreen / :picture-in-picture CSSOM rules on either site. The
    // fullscreenchange/fullscreenerror LISTENERS the clone's react-dom
    // 19.3 registers at the document tier are framework surface (its
    // non-delegated event list carries both — the s48 framework-internal
    // listener family, the listener-tier analogue of the s47 .outline-hidden
    // rule discovery); the live's older React registers no fullscreen
    // family at all. All inert — the app never calls either API.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of FULLSCREEN_PIP_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO gamepad / WebHID references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone ships no gamepad or HID surface — no
    // navigator.getGamepads poll, no gamepadconnected listener, no
    // navigator.hid device request. The probed parity: the APIs exist in
    // the shared context on BOTH sites (getGamepads is a function,
    // navigator.hid present with getDevices/requestDevice — the Chromium
    // surface, identical shape); the instrumented counters never fire on
    // either; zero gamepad/controller/joystick-labeled UI anywhere.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of GAMEPAD_HID_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("session-47: the platform-surface source census", () => {
  it("the app source tree is swept (a non-empty, ts/tsx/css-only source set)", () => {
    // 70+ sources at s47 (ts/tsx + globals.css); the floor catches a
    // broken/partial sweep without pinning the exact count.
    expect(SOURCES.length).toBeGreaterThan(60);
    expect(SOURCES.every((f) => f.startsWith("src/"))).toBe(true);
  });

  it("ZERO Web-Share API references anywhere in src/ (the family B zero-stance)", () => {
    // The pin: the clone ships no share surface — no navigator.share call,
    // no canShare probe, no PWA share_target registration. The live ships
    // none either (the probed parity); neither site exposes a share button,
    // a share handler, or a manifest share target.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of WEB_SHARE_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO idle-API references anywhere in src/ (the family C zero-stance)", () => {
    // The pin: the clone schedules no idle work — no requestIdleCallback
    // registration, no IdleDetector usage (the APIs exist in the context
    // on both sites; neither site's code touches them). The only "idle"
    // strings in src/ are the form status-machine literals.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const api of IDLE_APIS) {
        if (text.includes(api)) offenders.push(`${file}: ${api}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("ZERO prefers-* media families anywhere in src/ (the family A no-adaptation contract)", () => {
    // The pin: the clone adapts to NO media-preference tier — not the two
    // NEW features (prefers-contrast, prefers-reduced-transparency — this
    // session's census: zero rules + no render adaptation on either site),
    // not prefers-reduced-motion (the s41 no-adaptation contract: both
    // sites animate their scroll-reveal under reduce), not
    // prefers-color-scheme (the s43 zinc contract, extended here from
    // globals.css-only to the whole source tree). The live's only rules in
    // these families are its platform chrome (the auth-shell GIS +
    // motion-safe sheets) — all inert.
    const offenders: string[] = [];
    for (const { file, text } of ALL_SOURCE_TEXT) {
      for (const fam of PREFERS_FAMILIES) {
        if (text.includes(fam)) offenders.push(`${file}: ${fam}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
