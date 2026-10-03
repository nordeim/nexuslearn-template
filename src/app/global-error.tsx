"use client";

/**
 * Explicit GLOBAL error boundary — session 43 (fresh-eyes family A: the
 * root-crash census). The s42 pass shipped src/app/error.tsx for the
 * page-segment tier; the ROOT tier was still the framework default. A client
 * error inside the root segment (the root layout's client tree — the scroll
 * normalizer's mount effect, the router's own components) escapes every
 * error.tsx boundary, and Next 16's built-in root boundary rendered
 * version-dependent chrome — which ALSO strips the replacement document: the
 * probed default ships an <html> carrying only an id attribute (no document
 * language, no font classes). The live's equivalent tier ships no recovery
 * UI at all (its SPA freezes blank/shell — probed via the armed
 * element-factory sabotage).
 *
 * This boundary is the deliberate-better root tier (the s42 error.tsx
 * precedent, one segment up): the same slate-50 design language, wrapped in
 * the root layout's exact document shape so the crash-time contract keeps
 * the document language, the scroll-behavior declaration and the font
 * classes. Pinned by tests/global-error-source.test.ts + the session-43
 * e2e pair (the scoped history-listener sabotage → boundary → recovery).
 *
 * Recovery paths: Try again (reset — re-renders the root segment) and Back
 * to Home as a PLAIN anchor. The root tier cannot assume router state
 * survived the crash, so the home link is a full document load — the same
 * deterministic recovery a manual reload gives the visitor (the s42 boundary
 * could use next/link because it renders INSIDE a live root; this tier
 * renders IN PLACE OF it).
 *
 * Renders NO count formatting anywhere in its tree and registers NO event
 * listeners — the boundary must render under the very sabotage that forced
 * the crash (the s42 crash-probe methodology: force render/mount errors
 * through prototype methods looked up at call time; a boundary that calls
 * the sabotaged method would crash with the segment it replaces).
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: unknown };
  reset: () => void;
}) {
  // The digest is the stable error identifier Next ships to the client (the
  // message itself is stripped in production); referencing it keeps the
  // boundary's console output diagnosable without leaking stack traces.
  console.error("root render error", error);

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
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
                <a
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
                </a>
              </div>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
