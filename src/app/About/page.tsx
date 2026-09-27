import Link from "next/link";
import { Target, Eye, Heart, Users, Award, Globe, Rocket, ShieldCheck } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "About",
  description: "We're on a mission to democratize education.",
};

const STATS = [
  ["10,000+", "Active Students"],
  ["500+", "Expert Courses"],
  ["50+", "Countries"],
  ["95%", "Completion Rate"],
];

const VALUES = [
  { icon: Heart, title: "Student First", text: "Every decision we make starts with one question: does this help our students learn better?" },
  { icon: Award, title: "Quality Over Quantity", text: "We carefully vet every instructor and course to maintain our high standards." },
  { icon: Globe, title: "Accessible Everywhere", text: "Learning knows no borders. Our platform works on any device, anywhere in the world." },
  { icon: Rocket, title: "Continuous Innovation", text: "We constantly evolve our platform with the latest technology and teaching methods." },
  { icon: Users, title: "Community Driven", text: "Our vibrant community of learners and instructors makes NexusLearn special." },
  { icon: ShieldCheck, title: "Trust & Transparency", text: "Honest pricing, clear policies, and a 30-day money-back guarantee on every course." },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Hero */}
        <section className="py-20 px-4 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">About NexusLearn</h1>
            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
              We&apos;re on a mission to democratize education by combining expert-led courses with
              AI-powered tools, making world-class learning accessible to everyone.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 px-4 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="mt-2 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our story */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Target className="h-6 w-6 text-purple-600" aria-hidden="true" />
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Our Story</h2>
            </div>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                NexusLearn was founded with a simple belief: that quality education should be accessible
                to everyone, everywhere. What started as a small collection of courses has grown into a
                global learning platform serving thousands of students.
              </p>
              <p>
                Our team of educators, technologists, and designers work tirelessly to create an
                unparalleled learning experience. We combine the expertise of industry professionals
                with cutting-edge AI technology to deliver personalized, effective education.
              </p>
              <p>
                Today, we&apos;re proud to offer hundreds of courses across multiple disciplines,
                empowering learners to build the skills they need for the careers they want.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-purple-600" aria-hidden="true" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Our Values</h2>
              </div>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                The principles that guide everything we build
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {VALUES.map((v) => (
                <div
                  key={v.title}
                  className="group p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <v.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-4 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Join Our Community
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Start learning today and become part of a global community of learners.
            </p>
            <Link href="/Courses">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
                Browse Courses
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
