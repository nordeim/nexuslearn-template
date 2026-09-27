import { Mail, Phone, MapPin } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description: "We'd love to hear from you. Send us a message.",
};

const INFO = [
  { icon: Mail, title: "Email", value: "hello@nexuslearn.com", href: "mailto:hello@nexuslearn.com" },
  { icon: Phone, title: "Phone", value: "+1 (555) 123-4567", href: "tel:+15551234567" },
  { icon: MapPin, title: "Address", value: "San Francisco, CA 94105", href: undefined },
];

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + the overlapping contact content. */}
        <div className="min-h-screen bg-gray-50">
          {/* Hero */}
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Get In Touch</h1>
              <p className="mt-4 text-lg text-gray-400">
                We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>
          </div>

          {/* Content — overlaps the hero (reference: max-w-6xl -mt-6 pb-24) */}
          <div className="max-w-6xl mx-auto px-4 -mt-6 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Info cards */}
              <div className="space-y-6">
                {INFO.map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                      <item.icon className="h-5 w-5 text-purple-600" aria-hidden="true" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <ContactForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
