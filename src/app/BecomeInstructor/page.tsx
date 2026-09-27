import Link from "next/link";
import {
  DollarSign,
  Globe,
  Clapperboard,
  BarChart3,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Become Instructor",
  alternates: { canonical: "/BecomeInstructor" },
};

const STEPS = [
  { num: "01", title: "Apply", text: "Submit your application with your expertise and course idea." },
  { num: "02", title: "Create", text: "Use our tools to build and upload your course content." },
  { num: "03", title: "Launch", text: "Publish your course and reach thousands of eager learners." },
  { num: "04", title: "Earn", text: "Get paid every month with our competitive revenue sharing." },
];

const BENEFITS = [
  { icon: DollarSign, title: "Up to 70% Revenue Share", text: "One of the highest payouts in the industry." },
  { icon: Globe, title: "Global Audience", text: "Reach students in over 150 countries worldwide." },
  { icon: Clapperboard, title: "Production Support", text: "Free tools and guidance to create professional content." },
  { icon: BarChart3, title: "Analytics Dashboard", text: "Track enrollments, earnings, and engagement in real-time." },
  { icon: Users, title: "Community Support", text: "Join a thriving community of fellow instructors." },
  { icon: Award, title: "Certification Programs", text: "Offer verified certificates to boost your course value." },
];

export default function BecomeInstructorPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + all content sections. */}
        <div className="min-h-screen bg-gray-50">
          {/* Hero — reference decorations are direct children (no inset-0
              wrapper, no radial): purple blur top-left + cyan blur bottom-right */}
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-20 px-4 relative overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                Share Your Knowledge,
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Build Your Legacy
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Join thousands of instructors earning income while making an impact. No technical
                expertise required — we handle the platform, you bring the knowledge.
              </p>
              <Link href="/Contact">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </button>
              </Link>
            </div>
          </div>

        {/* How it works — reference: h2 is a direct child of the max-w
            container with its own text-center mb-16 (no wrapper div) */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits — reference cards are left-aligned with a border hover */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
              Why Teach With Us
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-5">
                    <b.icon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{b.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — reference: h2/p/button are direct section children (no inner
            max-w wrapper); the button carries the full shadcn base + px-10 */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#0a0a1a] to-[#0d0d2b] text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Teaching?
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join our instructor community and start earning while making a difference.
          </p>
          <Link href="/Contact">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
              Get Started Today
            </button>
          </Link>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
