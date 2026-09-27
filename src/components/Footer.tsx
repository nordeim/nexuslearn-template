import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Youtube, Instagram } from "lucide-react";

const SOCIALS = [
  { label: "Twitter", icon: Twitter },
  { label: "LinkedIn", icon: Linkedin },
  { label: "YouTube", icon: Youtube },
  { label: "Instagram", icon: Instagram },
];

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Browse Courses", href: "/Courses" },
      { label: "Learning Paths", href: "/Courses" },
      { label: "AI Assistant", href: "/AIAssistant" },
      { label: "Pricing", href: "/Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/About" },
      { label: "Become Instructor", href: "/BecomeInstructor" },
      { label: "Contact", href: "/Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/Contact" },
      { label: "FAQ", href: "/Contact" },
      { label: "Privacy Policy", href: "/About" },
      { label: "Terms of Service", href: "/About" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#0a0a1a] text-gray-400 pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <Link href="/Home" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold text-white">NexusLearn</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              Empowering millions of learners worldwide with expert-led courses and cutting-edge AI study tools.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-purple-500/20 hover:text-purple-400 transition-all duration-300"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-white font-semibold mb-4">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) =>
                  link.href.startsWith("/") ? (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm hover:text-purple-400 transition-colors duration-200">
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a href={link.href} className="text-sm hover:text-purple-400 transition-colors duration-200">
                        {link.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© 2026 NexusLearn. All rights reserved.</p>
          <p className="text-xs text-gray-600">Built for the future of education.</p>
        </div>
      </div>
    </footer>
  );
}
