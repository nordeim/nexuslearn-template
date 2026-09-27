"use client";

import { useState } from "react";
import { CircleCheckBig, Send } from "lucide-react";

/**
 * Landing newsletter form — reference behavior (session 5):
 * submits via fetch (never a native form POST that navigates to the JSON
 * response) and swaps in place for the green success row when done.
 * Class strings copied verbatim from the reference DOM.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        // Stay on the form on failure (the reference has no error state).
        setStatus("idle");
      }
    } catch {
      setStatus("idle");
    }
  };

  if (status === "done") {
    return (
      <div className="mt-10 flex items-center justify-center gap-3 text-green-400">
        <CircleCheckBig className="h-6 w-6" aria-hidden="true" />
        <span className="text-lg font-medium">You&apos;re subscribed! Welcome aboard.</span>
      </div>
    );
  }

  return (
    <form className="mt-10 flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="Enter your email"
        aria-label="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex h-9 w-full border text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl py-6 px-5 focus:border-purple-500"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center gap-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105 whitespace-nowrap"
      >
        Subscribe
        <Send className="ml-2 h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
