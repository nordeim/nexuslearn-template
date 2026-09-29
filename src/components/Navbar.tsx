"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/Home", label: "Home" },
  { href: "/Courses", label: "Courses" },
  { href: "/AIAssistant", label: "AI Assistant" },
  { href: "/Pricing", label: "Pricing" },
  { href: "/BecomeInstructor", label: "Teach" },
  { href: "/About", label: "About" },
  { href: "/Contact", label: "Contact" },
];

/**
 * NexusLearn Navbar — faithful clone of the original fixed nav.
 *
 * Two visual states:
 *  - over the dark hero (routes "/" AND "/Home" at scroll 0): transparent,
 *    white text
 *  - everywhere else (or after scrolling): white/95 + backdrop blur + border
 *
 * Mobile menu — Tailwind v4 hardening (see skills/avant-garde-design-v4
 * references 07-mobile-navigation.md + 08-mobile-nav-debugging.md):
 *  - SYMMETRIC breakpoints: desktop row `hidden md:flex`, trigger + panel
 *    `md:hidden` — no sm/lg mixing (Display-Mismatch class B)
 *  - body scroll lock while open (Layout-Warp class G)
 *  - real <button> trigger with aria-expanded/aria-controls (Prop-Drop C,
 *    Focus-Lock E)
 *  - the dropdown animates with the CSS grid-rows 0fr→1fr technique — no
 *    ref measurement, no height math, smooth exactly like the original
 *  - open state is DERIVED from the pathname (menu open only for the route
 *    it was opened on), so navigation closes it without an effect
 *  - Escape closes; border only renders while open (a closed 0-height panel
 *    must not leave a 1px artifact under the transparent hero nav)
 *
 * Session-9 notes (Tailwind v4 space-y engine trap): the reference panel
 * lists the Dashboard CTA as `block mt-3`, but under the reference's v3
 * engine the space-y-1 margin-top (specificity 0,2,0) OVERRIDES the mt-3,
 * rendering a 4px gap. Tailwind v4's engine is
 * `:where(.space-y-1 > :not(:last-child)) { margin-block-end }` — :where()
 * has ZERO specificity, so a child's mt-3 WINS (12px gap, +8px panel). The
 * clone therefore ships the CTA WITHOUT mt-3 (engine-variance class-form
 * fix — same precedent as the hero gradient's sRGB arbitrary form).
 */
export function Navbar() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const panelId = useId();
  const open = openFor === pathname;

  // "Over hero" = a landing route near the top (the hero is a dark
  // full-viewport section). BOTH "/" and "/Home" render the landing — the
  // reference footer links to /Home and the live app renders it with the
  // identical hero-state navbar (transparent at scroll 0, flipping to the
  // white-nav after scroll). Pinned by the session-10 e2e specs.
  const overHero = (pathname === "/" || pathname === "/Home") && !scrolled;

  // Scroll state (listener on window; the page scrolls the html element).
  // The initial sync runs inside rAF to avoid a synchronous setState in the
  // effect body (react-hooks/set-state-in-effect).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Body scroll lock while the mobile menu is open (class G fix)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes (class E)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenFor(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reference active-state semantics: the Home link is active on BOTH the
  // canonical landing "/" and the reference footer target "/Home"; every
  // other link matches by prefix (so /CourseDetail keeps "Courses" active).
  // Case-INSENSITIVE (session 17): the live highlights "Courses" on /courses
  // and every other case variant (its router matches routes
  // case-insensitively); the clone's middleware rewrite preserves the typed
  // URL, so usePathname() reports the raw casing too.
  const path = pathname.toLowerCase();
  const isActive = (href: string) =>
    href === "/Home"
      ? path === "/" || path === "/home"
      : href === "/"
        ? path === "/"
        : path.startsWith(href.toLowerCase());

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        overHero
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link className="flex items-center gap-2" href="/Home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span
              className={cn(
                "text-lg font-bold",
                overHero ? "text-white" : "text-gray-900",
                "transition-colors duration-300"
              )}
            >
              NexusLearn
            </span>
          </Link>

          {/* Desktop links — hidden below md, mirrored by the mobile panel below */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-50 hover:text-purple-600",
                  isActive(link.href) ? "text-purple-600 bg-purple-50" : overHero ? "text-white/80" : "text-gray-700"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/Dashboard">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-medium rounded-xl px-6 py-2.5 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-105">
                My Dashboard
              </button>
            </Link>
          </div>

          {/* Mobile trigger — real button, ARIA wired (a11y hardening the
              reference does not ship), symmetric md:hidden, and the BARE
              reference class string (no hover/transition utilities). */}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label="Toggle navigation menu"
            onClick={() => setOpenFor((v) => (v ? null : pathname))}
            className={cn(
              "md:hidden p-2 rounded-lg",
              overHero ? "text-white/80" : "text-gray-700"
            )}
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel (mirrors desktop nav at < md).
          Animated with grid-rows 0fr→1fr — measurement-free height animation. */}
      <div
        id={panelId}
        className={cn(
          "md:hidden bg-white grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100 border-t border-gray-100" : "grid-rows-[0fr] opacity-0 border-t-0"
        )}
        aria-hidden={!open}
        {...(!open ? { inert: true as never } : {})}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-purple-50 text-purple-600"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* The reference ships `block mt-3`, but its v3 space-y engine
                overrides the mt-3 (4px gap). v4's :where() engine would let
                the mt-3 win (12px gap, +8px panel) — so the clone omits it.
                See the session-9 notes in the component docblock. */}
            <Link className="block" href="/Dashboard" tabIndex={open ? 0 : -1}>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 px-4 w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-xl py-3">
                My Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
