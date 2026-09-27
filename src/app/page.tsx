import Link from "next/link";
import {
  ArrowRight,
  Play,
  Briefcase,
  Cpu,
  Megaphone,
  Palette,
  Heart,
  Code,
  Sparkles,
  Bot,
  Lightbulb,
  BarChart3,
  FileText,
  Award,
  CheckCircle2,
  DollarSign,
  Globe,
  LineChart,
  Star,
  Quote,
} from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { name: "Business", slug: "business", icon: Briefcase },
  { name: "Technology", slug: "technology", icon: Cpu },
  { name: "Marketing", slug: "marketing", icon: Megaphone },
  { name: "Design", slug: "design", icon: Palette },
  { name: "Personal Development", slug: "personal-development", icon: Heart },
  { name: "Programming", slug: "programming", icon: Code },
  { name: "AI & Innovation", slug: "ai-innovation", icon: Sparkles },
];

const CATEGORY_ICON_TINT: Record<string, string> = {
  Business: "bg-blue-500/10",
  Technology: "bg-cyan-500/10",
  Marketing: "bg-orange-500/10",
  Design: "bg-pink-500/10",
  "Personal Development": "bg-green-500/10",
  Programming: "bg-purple-500/10",
  "AI & Innovation": "bg-indigo-500/10",
};

const CATEGORY_ICON_COLOR: Record<string, string> = {
  Business: "text-blue-600",
  Technology: "text-cyan-600",
  Marketing: "text-orange-600",
  Design: "text-pink-600",
  "Personal Development": "text-green-600",
  Programming: "text-purple-600",
  "AI & Innovation": "text-indigo-600",
};

const LEARNING_PATHS = [
  {
    title: "Full-Stack Developer",
    description: "From HTML basics to deploying full-stack applications with React, Node.js, and cloud services.",
    gradient: "from-cyan-500 to-blue-600",
    steps: ["HTML & CSS", "JavaScript", "React", "Node.js", "Databases", "DevOps"],
  },
  {
    title: "Data Science Expert",
    description: "Master Python, statistics, machine learning, and data visualization for data-driven decisions.",
    gradient: "from-purple-500 to-pink-600",
    steps: ["Python", "Statistics", "Pandas", "ML Models", "Deep Learning", "Deployment"],
  },
  {
    title: "Digital Marketing Pro",
    description: "Learn modern marketing from SEO and content strategy to paid ads and marketing automation.",
    gradient: "from-orange-500 to-red-600",
    steps: ["SEO Basics", "Content Strategy", "Paid Ads", "Social Media", "Analytics", "Automation"],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "NexusLearn completely changed my career trajectory. The structured learning paths helped me go from beginner to landing my dream job in 8 months.",
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
  },
  {
    quote:
      "The AI study assistant is a game-changer. It's like having a personal tutor available 24/7. Best investment I've made in my education.",
    name: "Marcus Johnson",
    role: "Marketing Director",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
  },
  {
    quote:
      "Incredible course quality and the certification actually helped me negotiate a higher salary. The community is amazingly supportive.",
    name: "Elena Rodriguez",
    role: "Data Scientist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["Access to 50+ free courses", "Community forum access", "Basic progress tracking", "Mobile app access"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited course access",
      "AI study assistant",
      "Certification exams",
      "Priority support",
      "Offline downloads",
      "Learning paths",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$299",
    period: "one-time",
    features: [
      "Everything in Pro",
      "Lifetime access",
      "1-on-1 mentorship sessions",
      "Exclusive masterclasses",
      "Early access to new courses",
      "Career coaching",
    ],
    cta: "Get Lifetime Access",
    popular: false,
  },
];

export default async function LandingPage() {
  const courses = await db.course.findMany({
    where: { featured: true },
    orderBy: { sortOrder: "asc" },
    take: 6,
  });

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />

      <main>
        {/* ------------------------------- HERO ------------------------------- */}
        <div className="w-full h-screen relative flex items-center justify-center antialiased overflow-hidden bg-[linear-gradient(to_right_bottom,#0a0a1a,#0d0d2b,#0a0a1a)]">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <div className="text-center px-4 max-w-4xl mx-auto">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-8 backdrop-blur-sm">
                🚀 Over 10,000+ students already learning
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                Learn Skills That
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Shape Your Future
                </span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Master the most in-demand skills with expert-led courses, AI-powered study tools, and
                structured learning paths designed for real-world success.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/Courses">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
                    Browse Courses
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </button>
                </Link>
                <Link href="/login">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border shadow-sm h-9 border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
                    <Play className="mr-2 h-5 w-5" aria-hidden="true" />
                    Start Learning
                  </button>
                </Link>
              </div>
              <div className="mt-16 flex items-center justify-center gap-8 flex-wrap">
                {[
                  ["10K+", "Students"],
                  ["500+", "Courses"],
                  ["50+", "Instructors"],
                  ["95%", "Satisfaction"],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero illustration — the reference app's flowing gradient lines,
              absolutely positioned behind the content (opacity-60) */}
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <svg
              width="858"
              height="434"
              viewBox="0 0 858 434"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex flex-shrink-0 opacity-60"
            >
              <path d="M0 220 Q200 180 429 217 Q600 250 858 200" stroke="rgba(99, 68, 245, 0.15)" strokeWidth="1" />
              <path d="M0 220 Q200 180 429 217 Q600 250 858 200" stroke="url(#heroLineA)" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 300 Q250 260 429 300 Q650 340 858 280" stroke="rgba(99, 68, 245, 0.15)" strokeWidth="1" />
              <path d="M0 300 Q250 260 429 300 Q650 340 858 280" stroke="url(#heroLineB)" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 140 Q300 100 500 140 Q700 180 858 120" stroke="rgba(99, 68, 245, 0.15)" strokeWidth="1" />
              <path d="M0 140 Q300 100 500 140 Q700 180 858 120" stroke="url(#heroLineC)" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 380 Q200 340 429 380 Q600 420 858 360" stroke="rgba(99, 68, 245, 0.15)" strokeWidth="1" />
              <path d="M0 380 Q200 340 429 380 Q600 420 858 360" stroke="url(#heroLineD)" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="heroLineA" gradientUnits="userSpaceOnUse" x1="571.40387" x2="571.40387" y1="220" y2="220">
                  <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" />
                  <stop offset="20%" stopColor="#18CCFC" stopOpacity="1" />
                  <stop offset="50%" stopColor="#6344F5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="heroLineB" gradientUnits="userSpaceOnUse" x1="858" x2="858" y1="280" y2="280">
                  <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" />
                  <stop offset="20%" stopColor="#18CCFC" stopOpacity="1" />
                  <stop offset="50%" stopColor="#6344F5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="heroLineC" gradientUnits="userSpaceOnUse" x1="627.22539" x2="627.22539" y1="140" y2="140">
                  <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" />
                  <stop offset="20%" stopColor="#18CCFC" stopOpacity="1" />
                  <stop offset="50%" stopColor="#6344F5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="heroLineD" gradientUnits="userSpaceOnUse" x1="858" x2="858" y1="360" y2="360">
                  <stop offset="0%" stopColor="#18CCFC" stopOpacity="0" />
                  <stop offset="20%" stopColor="#18CCFC" stopOpacity="1" />
                  <stop offset="50%" stopColor="#6344F5" stopOpacity="1" />
                  <stop offset="100%" stopColor="#AE48FF" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* ---------------------------- CATEGORIES ---------------------------- */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">EXPLORE</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Browse by Category
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Find the perfect course from our diverse catalog of expert-led programs
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/Courses?category=${cat.slug}`}>
                  <div className="group relative bg-gray-50 rounded-2xl p-6 md:p-8 text-center hover:bg-white hover:shadow-xl transition-all duration-500 border border-transparent hover:border-gray-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-transparent group-hover:from-purple-50/50 group-hover:to-cyan-50/50 transition-all duration-500 rounded-2xl" />
                    <div className="relative z-10">
                      <div
                        className={`inline-flex p-4 rounded-2xl ${CATEGORY_ICON_TINT[cat.name]} mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <cat.icon
                          className={`h-7 w-7 ${CATEGORY_ICON_COLOR[cat.name]}`}
                          aria-hidden="true"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{cat.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------- FEATURED COURSES ------------------------ */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">TOP PICKS</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Featured Courses
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Hand-picked courses by our editors to accelerate your learning journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/Courses">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border bg-background shadow-sm h-9 group border-gray-300 text-gray-700 hover:border-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl px-6 py-3 transition-all duration-300">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* --------------------------- LEARNING PATHS ------------------------- */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">CAREER TRACKS</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Structured Learning Paths
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Follow a guided roadmap from beginner to expert and earn certifications along the way
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {LEARNING_PATHS.map((path) => (
                <div
                  key={path.title}
                  className="group relative bg-white rounded-3xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl hover:shadow-purple-500/5 transition-all duration-500"
                >
                  <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-r ${path.gradient} mb-6`}>
                    <Code className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{path.title}</h3>
                  <p className="text-gray-500 mb-6 leading-relaxed">{path.description}</p>
                  <div className="space-y-3 mb-8">
                    {path.steps.map((step, i) => (
                      <div key={step} className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-r ${path.gradient} flex items-center justify-center text-white text-xs font-bold opacity-80`}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 pb-6 border-b border-gray-50">
                    <Award className="h-4 w-4 text-purple-600" aria-hidden="true" />
                    Certification upon completion
                  </div>
                  <Link href="/Courses">
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 py-2 mt-6 w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-300">
                      Start This Path
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ AI SECTION -------------------------- */}
        <section className="py-24 px-4 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]" />
            <div className="absolute top-20 right-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-medium mb-6 backdrop-blur-sm">
                ✨ Powered by AI
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Your Personal AI Study Companion
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Our AI-powered tools adapt to your learning style, helping you study smarter — not harder.
                Get real-time help, track your progress, and master concepts faster than ever.
              </p>
              <Link href="/AIAssistant">
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
                  Try AI Assistant
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </button>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Bot, title: "AI Study Assistant", text: "Get instant answers to your course questions, 24/7." },
                { icon: Lightbulb, title: "Smart Recommendations", text: "Personalized course suggestions based on your goals." },
                { icon: BarChart3, title: "Progress Analytics", text: "Track your learning with detailed insights and stats." },
                { icon: FileText, title: "Course Summaries", text: "AI-generated summaries to reinforce key concepts." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------- BECOME INSTRUCTOR ------------------------ */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">TEACH WITH US</p>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  Become an Instructor
                </h2>
                <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                  Share your knowledge with thousands of eager learners. Our platform gives you the tools,
                  audience, and support to build a thriving teaching business.
                </p>
                <Link href="/BecomeInstructor">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 mt-10 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105">
                    Start Teaching Today
                    <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                  </button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { icon: DollarSign, title: "Competitive Revenue", text: "Earn up to 70% revenue share on every enrollment." },
                  { icon: Globe, title: "Global Reach", text: "Reach students from over 150 countries worldwide." },
                  { icon: LineChart, title: "Analytics Dashboard", text: "Track your course performance with real-time analytics." },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------- TESTIMONIALS -------------------------- */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">TESTIMONIALS</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                What Our Students Say
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Real stories from real learners who transformed their careers
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.name}
                  className="group p-8 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <Quote className="h-8 w-8 text-purple-200 mb-4" aria-hidden="true" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                    { }
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-11 h-11 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{t.name}</p>
                      <p className="text-sm text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------ PRICING ----------------------------- */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">PRICING</p>
              <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                Choose Your Plan
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                Flexible pricing to match your learning goals
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PRICING.map((plan) => (
                <div
                  key={plan.name}
                  className={`group relative bg-white rounded-2xl p-8 transition-all duration-300 ${
                    plan.popular
                      ? "border-2 border-purple-600 shadow-2xl shadow-purple-500/10 md:-translate-y-4"
                      : "border border-gray-100 hover:shadow-xl hover:shadow-purple-500/5"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-purple-500/25">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className={`text-xl font-bold ${plan.popular ? "text-purple-600" : "text-gray-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <div className="mt-8 space-y-4">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm">
                        <CheckCircle2
                          className={`h-5 w-5 ${plan.popular ? "text-purple-600" : "text-green-500"}`}
                          aria-hidden="true"
                        />
                        <span className="text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow h-9 mt-8 w-full py-6 rounded-xl text-base transition-all duration-300 hover:scale-105 ${
                      plan.popular
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------- NEWSLETTER CTA ------------------------ */}
        <section className="py-24 px-4 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,68,245,0.15),transparent_70%)]" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Stay in the Loop</h2>
            <p className="mt-4 text-lg text-gray-400">
              Get the latest courses, tips, and exclusive offers delivered to your inbox.
            </p>
            <form
              className="mt-8 flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              action="/api/newsletter"
              method="post"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                aria-label="Enter your email"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 h-12 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
