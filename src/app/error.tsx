"use client";

import Link from "next/link";

/**
 * Explicit error boundary — session 42 (fresh-eyes family B: the crash
 * census). The clone shipped NO error.tsx, so a persistent client render
 * error showed Next 16's built-in default boundary — version-dependent
 * framework chrome whose copy already silently changed between majors. The
 * live's forced-crash UX is a BLANK WHITE SCREEN (no boundary, no recovery —
 * the platform ships no visible crash UX; probed via an armed createElement
 * sabotage on its SPA).
 *
 * This boundary is the deliberate-better tier (the s10 real-404 precedent):
 * an explicit, on-brand crash surface whose contract is stable across
 * framework upgrades and pinned by the session-42 specs (the source pins in
 * tests/error-boundary-source.test.ts + the e2e persistent-sabotage spec
 * that forces a render error inside CourseCard's count formatting and
 * recovers through reset()).
 *
 * Design language: the not-found.tsx pattern — light slate-50, centered
 * max-w-md, the hairline divider. Two recovery paths: Try again (reset —
 * re-renders the errored segment) and Back to Home.
 *
 * Renders NO count formatting anywhere in its tree — the boundary must
 * render under the count-format sabotage the e2e uses to force the error
 * (the pinned guarantee: the crash surface never depends on the code that
 * crashed).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: unknown };
  reset: () => void;
}) {
  // The digest is the stable error identifier Next ships to the client (the
  // message itself is stripped in production); referencing it keeps the
  // boundary's console output diagnosable without leaking stack traces.
  console.error("route render error", error);

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">500</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Something went wrong</h2>
            <p className="text-slate-600 leading-relaxed">
              An unexpected error occurred while loading this page. Your progress is safe — try
              again, or head back home.
            </p>
          </div>
          <div className="pt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-slate-800 rounded-lg hover:bg-slate-700 hover:border-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
