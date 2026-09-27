"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, GraduationCap } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push("/Dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="email"
              id="email"
              autoComplete="email"
              className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              className="flex w-full border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pl-10 h-11 sm:h-12 bg-slate-50/50 border-slate-200 focus:border-slate-400 focus:ring-slate-400 rounded-xl placeholder:text-slate-600"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-500">
        Need an account?{" "}
        <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700 transition-colors">
          Sign up
        </Link>
      </p>

      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-slate-400">
        <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Demo: sepnetflix2023@outlook.com · $Abcd1234</span>
      </div>
    </form>
  );
}
