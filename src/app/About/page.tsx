import { Target, Award, Heart, Zap, Globe } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

import { routeMetadata } from "@/lib/metadata";

export const metadata = routeMetadata({
  title: "About",
  canonical: "/About",
});

const STATS = [
  ["10,000+", "Active Students"],
  ["500+", "Expert Courses"],
  ["50+", "Countries"],
  ["95%", "Completion Rate"],
];

const VALUES = [
  {
    icon: Target,
    title: "Mission-Driven",
    text: "We believe everyone deserves access to world-class education, regardless of background.",
  },
  {
    icon: Heart,
    title: "Student-First",
    text: "Every feature, course, and tool is designed with the learner's success in mind.",
  },
  {
    icon: Zap,
    title: "Innovation",
    text: "We leverage cutting-edge AI and technology to create the best learning experience.",
  },
  {
    icon: Globe,
    title: "Global Impact",
    text: "Education without borders — our platform reaches learners in over 150 countries.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + all content sections. */}
        <div className="min-h-screen bg-gray-50">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">About NexusLearn</h1>
              <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
                We&apos;re on a mission to democratize education by combining expert-led courses with
                AI-powered tools, making world-class learning accessible to everyone.
              </p>
            </div>
          </div>

        {/* Stats */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(([value, label]) => (
              <div key={label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-500 to-purple-600 bg-clip-text text-transparent">
                  {value}
                </p>
                <p className="mt-2 text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Our story */}
        <section className="py-24 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Our Story</h2>
                <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
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
              <div className="relative">
                <div className="rounded-3xl overflow-hidden aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                    alt="Team"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Top Rated</p>
                      <p className="text-sm text-gray-500">E-learning Platform 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {VALUES.map((v) => (
                <div key={v.title} className="text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-5">
                    <v.icon className="h-7 w-7 text-purple-600" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{v.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
