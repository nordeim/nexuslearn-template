import Link from "next/link";
import { Check, CircleHelp, Sparkles } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Pricing",
  alternates: { canonical: "/Pricing" },
};

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Perfect for getting started",
    features: ["Access to 50+ free courses", "Community forum access", "Basic progress tracking", "Mobile app access"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    desc: "For serious learners",
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
    desc: "Best value for committed learners",
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

const FAQS = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Absolutely! Pro comes with a 7-day free trial. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        <div className="min-h-screen bg-gray-50">
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-4 text-lg text-gray-400">
                Start free, upgrade when you&apos;re ready. No hidden fees.
              </p>
            </div>
          </div>

          <section className="py-24 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-sm font-semibold text-purple-600 tracking-wider uppercase">Pricing</span>
                <h2 className="mt-3 text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">
                  Choose Your Plan
                </h2>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
                  Flexible pricing to match your learning goals
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {PLANS.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative rounded-3xl p-8 transition-all duration-500 ${
                      plan.popular
                        ? "bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3a] text-white shadow-2xl shadow-purple-500/20 scale-105 border border-purple-500/30"
                        : "bg-white border border-gray-100 hover:shadow-xl hover:border-gray-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h3 className={`text-lg font-semibold ${plan.popular ? "text-gray-300" : "text-gray-500"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className={`text-5xl font-bold ${plan.popular ? "text-white" : "text-gray-900"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-sm ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${plan.popular ? "text-gray-400" : "text-gray-500"}`}>{plan.desc}</p>
                    <div className="mt-8 space-y-4">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-3">
                          <Check
                            className={`h-5 w-5 shrink-0 ${plan.popular ? "text-cyan-400" : "text-purple-600"}`}
                            aria-hidden="true"
                          />
                          <span className={`text-sm ${plan.popular ? "text-gray-300" : "text-gray-600"}`}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <Link href="/login">
                      <button
                        className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 px-4 mt-8 w-full py-6 rounded-xl text-base transition-all duration-300 hover:scale-105 ${
                          plan.popular
                            ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25"
                            : "shadow bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 px-4 bg-white">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {FAQS.map((faq) => (
                  <div
                    key={faq.q}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100"
                  >
                    <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                      <CircleHelp className="h-5 w-5 text-purple-500" aria-hidden="true" />
                      {faq.q}
                    </h3>
                    <p className="mt-3 text-gray-600 leading-relaxed ml-7">{faq.a}</p>
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
