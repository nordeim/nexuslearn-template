import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Github, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a0a1a] text-gray-400 pt-20 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold text-white">NexusLearn</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering millions of learners worldwide with expert-led courses and cutting-edge AI study tools.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" aria-label="Twitter" className="text-gray-500 hover:text-cyan-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-cyan-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" aria-label="GitHub" className="text-gray-500 hover:text-cyan-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-cyan-400 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/Courses" className="hover:text-white transition-colors">Browse Courses</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Learning Paths</Link></li>
              <li><Link href="/AIAssistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              <li><Link href="/Pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/About" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/BecomeInstructor" className="hover:text-white transition-colors">Become Instructor</Link></li>
              <li><Link href="/Contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {new Date().getFullYear()} NexusLearn. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
