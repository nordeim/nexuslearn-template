import { LoginForm } from "@/components/LoginForm";
import { routeMetadata } from "@/lib/metadata";

// Reference behavior: /login ships the plain "NexusLearn" title (no segment)
// with the /login canonical + mirrored og:url (session 6).
export const metadata = routeMetadata({
  canonical: "/login",
});

// The reference login card is an in-place 5-view state machine (sign-in,
// reset, reset-sent, signup, verify) that owns the WHOLE card interior:
// on every non-signin view the logo ring, the "Welcome to NexusLearn" h1,
// the Google button and the OR divider are absent — the view content IS the
// card body (session 11). The page therefore renders only the static card
// shell (gradient bar + padding + the centered flex column) and delegates
// the interior to <LoginForm/>, whose sign-in branch carries the chrome.
export default function LoginPage() {
  return (
    // data-login-theme: the ONE route whose Base44 runtime token sheet is
    // the shadcn ZINC theme (measured on the live: --ring 240 10% 3.9%
    // etc., while every other route ships NEUTRAL). globals.css scopes the
    // zinc token block to body:has(main[data-login-theme]) — body-level
    // custom properties cover the navbar + card + footer alike, exactly
    // like the live's document-level runtime sheet (session 18).
    <main
      data-login-theme=""
      className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-card-foreground relative overflow-hidden border-0 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200" />

          <div className="p-8 sm:p-10 md:pt-12 md:pb-10 md:px-10">
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8">
              <LoginForm />
            </div>
          </div>
        </div>
        {/* Reference mobile-only spacer under the card (sm:hidden) */}
        <div className="mt-8 text-center text-xs text-slate-400 sm:hidden">
          <p>&nbsp;</p>
        </div>
      </div>
    </main>
  );
}
