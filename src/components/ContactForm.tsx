"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Full Name</Label>
          <input
            id="contact-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Subject</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
            <SelectItem value="Technical Support">Technical Support</SelectItem>
            <SelectItem value="Billing Question">Billing Question</SelectItem>
            <SelectItem value="Partnership">Partnership</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className="flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
