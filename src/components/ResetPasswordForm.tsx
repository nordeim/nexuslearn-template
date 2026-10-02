"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CircleAlert, Lock } from "lucide-react";

/**
 * The reference /reset-password card (session 37 — the parity gap: the LIVE
 * ships the route; the clone 404'd). Two view states, both probed through
 * the live's own UI with the class strings copied VERBATIM from the
 * reference DOM:
 *
 *  - NO token (or a non-`token` query param) → the "Invalid Reset Link"
 *    state (the red circle-alert + the copy + the "Back to Login" button).
 *  - ANY non-empty `?token=` → the "Set new password" form, rendered
 *    OPTIMISTICALLY (the live validates at submit — the form shows for
 *    every token; a bad one surfaces the API's "Invalid or expired reset
 *    token" in the [role=alert] slot).
 *
 * The client-side validation messages are the live's exact strings:
 * "Passwords do not match" / "Password must be at least 8 characters long".
 * The alert is a DIRECT child of form.space-y-6 between the fields
 * (div.space-y-5) and the buttons (div.space-y-3) — the captured reference
 * position. On success the client navigates to /login (a full page load —
 * the post-action shape of the LoginForm's own redirects; the live's
 * success state is unobservable without a valid token, so the natural
 * completion is the documented deliberate choice).
 */

// Reference shared class strings (copied verbatim from the live DOM) ------

const LABEL_CLS =
  "peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700";

const INPUT_CLS =
  "flex w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-gray-400";

const DARK_BUTTON_CLS =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 px-3 py-2 w-full h-11 bg-gray-900 hover:bg-gray-800 text-white font-medium shadow-sm";

const ALERT_CLS =
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground text-foreground bg-red-50/50 border-red-200";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    // The invalid state — the reference renders it for the bare route and
    // for every non-`token` query param shape (probed: ?t=/?code=/?key=).
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="rounded-lg text-card-foreground max-w-md w-full overflow-hidden border-0 shadow-lg bg-white">
          <div className="p-6 pt-12 pb-10 px-12 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <CircleAlert className="h-10 w-10 text-red-600" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Invalid Reset Link</h2>
              <p className="text-gray-600">This password reset link is invalid or has expired.</p>
            </div>
            <button
              type="button"
              className={DARK_BUTTON_CLS}
              onClick={() => {
                router.push("/login");
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    // The live's client-side validation (the exact reference messages).
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Invalid or expired reset token");
        return;
      }
      // The success navigation to /login — the LoginForm's own
      // post-action shape (router.push), the natural completion (the
      // live's success state is unobservable without a valid token).
      router.push("/login");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="rounded-lg text-card-foreground relative max-w-md w-full overflow-hidden border-0 shadow-lg bg-white">
        {/* The form-state accent bar (the live's h-0.5 gray bar — vs the
            /login card's h-1 slate gradient) */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-900" />
        <div className="p-6 pt-12 pb-10 px-12 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Set new password</h2>
            <p className="text-gray-600">Enter your new password for NexusLearn</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    className={INPUT_CLS}
                    id="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
              </div>
              <div className="space-y-2">
                <label className={LABEL_CLS} htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="password"
                    className={INPUT_CLS}
                    id="confirmPassword"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {error ? (
              <div role="alert" className={ALERT_CLS}>
                <div className="[&_p]:leading-relaxed text-red-800 text-sm">{error}</div>
              </div>
            ) : null}
            <div className="space-y-3">
              <button type="submit" className={DARK_BUTTON_CLS} disabled={loading}>
                {loading ? "Resetting..." : "Reset password"}
              </button>
              <button
                type="button"
                className="w-full text-sm text-gray-600 hover:text-gray-700"
                onClick={() => {
                  router.push("/login");
                }}
              >
                Back to login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * The Suspense-gated client leaf (Next 16's useSearchParams requirement):
 * reads the `token` query param and renders the pure form state machine.
 * ONLY a non-empty `token` param flips the state (probed on the live:
 * ?t=/?code=/?key= all render the invalid state).
 */
export function ResetPasswordGate() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  return <ResetPasswordForm token={token} />;
}
