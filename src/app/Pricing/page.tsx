import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free, upgrade when you're ready.",
};

const PLANS = [
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

const FAQS = [
  {
    q: "Can I switch between plans?",
    a: "Yes — upgrade, downgrade or cancel anytime. Changes take effect at the start of your next billing cycle, and we never charge cancellation fees.",
  },
  {
    q: "What's included in the free plan?",
    a: "The free plan includes access to 50+ courses, community forums, basic progress tracking and the mobile app — enough to start learning today.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes, verified students get 40% off Pro. Contact our support team with proof of enrollment and we'll set you up.",
  },
  {
    q: "What is your refund policy?",
    a: "Every paid plan comes with a 30-day money-back guarantee, no questions asked. Lifetime purchases are refundable within 30 days too.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="py-20 px-4 bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a]">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Start free, upgrade when you&apos;re ready. No hidden fees.
            </p>
          </div>
        </section>

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
              {PLANS.map((plan) => (
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
                  <Link href="/login">
                    <button
                      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shadow h-9 mt-8 w-full py-6 rounded-xl text-base transition-all duration-300 hover:scale-105 ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
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
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-purple-200 transition-colors p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
