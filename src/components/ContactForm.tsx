"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Technical Support",
  "Become an Instructor",
  "Partnership",
];

const INPUT_CLASS =
  "flex h-9 w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-2 rounded-xl";

// Reference label (session-7 audit): the full shadcn Label class pair.
const LABEL_CLASS =
  "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 font-medium";

// Reference textarea (session-7 audit): min-h-[60px] (not 120px).
const TEXTAREA_CLASS =
  "flex min-h-[60px] w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mt-2 rounded-xl";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      setStatus(res.ok ? "sent" : "error");
      if (res.ok) {
        setName("");
        setEmail("");
        setSubject("General Inquiry");
        setMessage("");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7 text-green-600" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Message sent!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={LABEL_CLASS} htmlFor="contact-name">
            Full Name
          </label>
          <input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label className={LABEL_CLASS} htmlFor="contact-email">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="contact-subject">
          Subject
        </label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger id="contact-subject" className="w-full border-input mt-2 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUBJECT_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className={LABEL_CLASS} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className={TEXTAREA_CLASS}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600" role="alert">
          Something went wrong — please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-8 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
        <Send className="ml-2 h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
