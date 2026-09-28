"use client";

import { usePathname, useRouter } from "next/navigation";

/**
 * Branded 404 — mirrors the reference app's not-found screen: a light
 * slate-50 page with a large light "404", a hairline divider, the dynamic
 * missing path quoted in the message, and a white "Go Home" button.
 *
 * Two deliberate (invisible) variances vs the live markup, same doctrine as
 * the Navbar's ARIA hardening — pinned by the session-10 e2e spec so a
 * future chrome audit cannot "fix" them backwards:
 *  - the wrapper is a `main` landmark (the live 404 ships a landmark-less
 *    div inside #root — no main, no nav, no footer on either site);
 *  - the root uses `min-h-dvh` (the project's documented page-root form that
 *    avoids the mobile URL-bar warp; the live ships `min-h-screen`).
 */
export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();
  // Reference shows the path without the leading slash ("this-page").
  const missingPath = pathname.replace(/^\//, "");

  return (
    <main className="min-h-dvh flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-slate-800">Page Not Found</h2>
            <p className="text-slate-600 leading-relaxed">
              The page <span className="font-medium text-slate-700">&quot;{missingPath}&quot;</span> could
              not be found in this application.
            </p>
          </div>
          <div className="pt-6">
            <button
              type="button"
              onClick={() => router.push("/")}
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
              Go Home
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
