"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, ShieldCheck } from "lucide-react";

/**
 * The reference login card is an in-place state machine — and it owns the
 * WHOLE card interior (session 11): the sign-in view renders the logo ring,
 * the "Welcome to NexusLearn" h1, the Google button and the OR divider, while
 * every other view (reset, reset-sent, signup, verify) replaces the entire
 * card body with just its own content wrapped in `div.w-full`. Class strings
 * are copied verbatim from the reference DOM.
 */

// Reference shared class strings ------------------------------------------------

const LABEL_CLS = "peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-slate-700";

const FIELD_ICON_CLS = "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4";

const INPUT_CLS =
  "flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600";

const COMPACT_INPUT_CLS =
  "flex w-full border px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400 text-sm sm:text-base";

// The reset view's email input is its own variant (session 11): the live DOM
// carries `text-base` after py-2 — like the sign-in inputs — and NOT the
// `text-sm sm:text-base` tail the signup inputs carry.
const RESET_INPUT_CLS =
  "flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-10 sm:h-11 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-400";

const SLATE_BUTTON_CLS =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 sm:h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200";

const COMPACT_SLATE_BUTTON_CLS =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-10 sm:h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm rounded-xl transition-all duration-200";

const BACK_BUTTON_CLS =
  "flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors -mb-2";

const H2_CLS = "text-xl sm:text-2xl font-bold text-slate-900";

const ALERT_BASE_CLS =
  "relative w-full border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground rounded-xl";

const CODE_INPUT_CLS =
  "flex rounded-lg border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-center w-10 h-11 text-base font-semibold";

type View = "signin" | "reset" | "reset-sent" | "signup" | "verify";

function Alert({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className={`${ALERT_BASE_CLS} ${tone === "red" ? "bg-red-50/70 border-red-200" : "bg-green-50/70 border-green-200"}`}
    >
      <div className={`[&_p]:leading-relaxed ${tone === "red" ? "text-red-700" : "text-green-700"} text-sm`}>
        {children}
      </div>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [view, setView] = useState<View>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const codeRefs = useRef<Array<HTMLInputElement | null>>([]);

  const go = (next: View) => {
    setError("");
    setView(next);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        return;
      }
      // The reference app returns to the landing page after signing in.
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // The reference shows the same check-your-email state whether or not
      // the address exists (no user enumeration).
      setView("reset-sent");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your account");
        return;
      }
      setCode(["", "", "", "", "", ""]);
      setView("verify");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const setCodeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => prev.map((c, i) => (i === index ? digit : c)));
    if (digit && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const joined = code.join("");
    if (joined.length !== 6) {
      setError("Enter the 6-digit verification code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: joined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid verification code");
        return;
      }
      // Verified + signed in — the reference lands on the home page.
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- sign-in (default) ------------------------------------------------------
  // The sign-in view owns the card chrome (session 11): logo ring + glow,
  // the h1 block, the Google button and the OR divider render ONLY here —
  // the other four views replace the whole card interior.
  if (view === "signin") {
    return (
      <>
        {/* Logo — the reference ships the logo image inside the ring
            span with a subtle slate glow (not a gradient icon tile) */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300" />
          <span className="flex shrink-0 overflow-hidden rounded-full relative h-20 w-20 sm:h-24 sm:w-24 shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300">
            <img
              className="aspect-square h-full w-full object-cover"
              alt="NexusLearn logo"
              src="/logo.png"
            />
          </span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome to NexusLearn
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-medium">Sign in to continue</p>
        </div>

        <div className="w-full">
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 px-5 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200 font-medium text-[16px] group"
            >
              {/* Reference structure (session 7): the Google svg (h-5 w-5)
                  sits inside a wrapper div carrying the off-center offset
                  (-ml-4) + transition classes. */}
              <div className=" transition-transform duration-200 -ml-4">
                <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <span>Continue with Google</span>
            </button>

            {/* The reference divider renders "OR" via text-transform on
                the label wrapper, with the shadcn Separator rule */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div
                  data-orientation="horizontal"
                  role="none"
                  className="shrink-0 h-[1px] w-full bg-slate-200"
                />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-500 font-medium tracking-wider">or</span>
              </div>
            </div>

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSignIn}>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <label className={LABEL_CLS} htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={`${FIELD_ICON_CLS} text-slate-500`} aria-hidden="true" />
                    <input
                      type="email"
                      id="email"
                      autoComplete="email"
                      className={INPUT_CLS}
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={LABEL_CLS} htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`${FIELD_ICON_CLS} text-slate-500`} aria-hidden="true" />
                    <input
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      className={INPUT_CLS}
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert tone="red">{error}</Alert>
              )}

              <div className="space-y-3">
                <button type="submit" disabled={loading} className={SLATE_BUTTON_CLS}>
                  {loading ? "Signing in…" : "Sign in"}
                </button>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    onClick={() => {
                      setError("");
                      setView("reset");
                    }}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => {
                      setError("");
                      setConfirmPassword("");
                      setView("signup");
                    }}
                  >
                    Need an account? <span className="font-medium text-slate-700">Sign up</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ---- reset password ---------------------------------------------------------
  if (view === "reset") {
    return (
      <div className="w-full">
        <div className="space-y-4 sm:space-y-6">
          <button type="button" className={BACK_BUTTON_CLS} onClick={() => go("signin")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </button>
          <div className="text-center space-y-2">
            <h2 className={H2_CLS}>Reset your password</h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Enter your email and we&apos;ll send you a link to reset your password
            </p>
          </div>
          <form className="space-y-4 sm:space-y-5" onSubmit={handleReset}>
            <div className="space-y-1.5">
              <label className={LABEL_CLS} htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className={`${FIELD_ICON_CLS} text-slate-400`} aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  className={RESET_INPUT_CLS}
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <Alert tone="red">{error}</Alert>}
            <button type="submit" disabled={loading} className={COMPACT_SLATE_BUTTON_CLS}>
              Send reset link
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- reset sent -------------------------------------------------------------
  if (view === "reset-sent") {
    return (
      <div className="w-full">
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Mail className="h-7 w-7 sm:h-8 sm:w-8 text-slate-700" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className={H2_CLS}>Check your email</h2>
              <p className="text-slate-600 text-sm sm:text-base">
                We&apos;ve sent password reset instructions to
                <br />
                <span className="font-medium text-slate-900">{email}</span>
              </p>
            </div>
          </div>
          <Alert tone="green">
            Please check your email for the password reset link. It may take a few minutes to arrive.
          </Alert>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
            onClick={() => go("signin")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ---- create account ---------------------------------------------------------
  if (view === "signup") {
    return (
      <div className="w-full">
        <div className="space-y-4">
          <button type="button" className={BACK_BUTTON_CLS} onClick={() => go("signin")}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to sign in
          </button>
          <h2 className={H2_CLS}>Create your account</h2>
          <form className="space-y-3 sm:space-y-4" onSubmit={handleSignup}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className={LABEL_CLS} htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className={`${FIELD_ICON_CLS} text-slate-400`} aria-hidden="true" />
                  <input
                    type="email"
                    id="email"
                    className={COMPACT_INPUT_CLS}
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLS} htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`${FIELD_ICON_CLS} text-slate-400`} aria-hidden="true" />
                  <input
                    type="password"
                    id="password"
                    className={COMPACT_INPUT_CLS}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className={LABEL_CLS} htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`${FIELD_ICON_CLS} text-slate-400`} aria-hidden="true" />
                  <input
                    type="password"
                    id="confirmPassword"
                    className={COMPACT_INPUT_CLS}
                    placeholder="Re-enter password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {error && <Alert tone="red">{error}</Alert>}
            <button type="submit" disabled={loading} className={COMPACT_SLATE_BUTTON_CLS}>
              Create account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- verify email -----------------------------------------------------------
  return (
    <div className="w-full">
      <div className="space-y-4 sm:space-y-6">
        <button type="button" className={BACK_BUTTON_CLS} onClick={() => go("signin")}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </button>
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-slate-700" aria-hidden="true" />
          </div>
          <h2 className={H2_CLS}>Verify your email</h2>
          <p className="text-slate-600 text-sm sm:text-base">
            We&apos;ve sent a 6-digit code to
            <br />
            <span className="font-medium text-slate-900">{email}</span>
          </p>
        </div>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleVerify}>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  type="text"
                  className={CODE_INPUT_CLS}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setCodeDigit(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">Enter the verification code sent to your email</p>
          </div>
          <div className="space-y-3">
            <button type="submit" disabled={loading} className={COMPACT_SLATE_BUTTON_CLS}>
              Verify email
            </button>
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  className="font-medium text-slate-700 hover:text-slate-900 disabled:opacity-50 transition-colors"
                  disabled={loading}
                  onClick={() => {
                    setError("");
                    fetch("/api/auth/signup", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email, password, resend: true }),
                    }).catch(() => {});
                  }}
                >
                  Resend
                </button>
              </p>
            </div>
            {error && <Alert tone="red">{error}</Alert>}
          </div>
        </form>
      </div>
    </div>
  );
}
