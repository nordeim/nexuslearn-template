"use client";

import { useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Explain machine learning",
  "JavaScript vs Python",
  "How to start a business",
  "Design principles",
];

/**
 * Minimal markdown renderer for assistant replies — headings, bold, italic,
 * inline code, lists and paragraphs. No dependencies; keeps the chat bubble
 * polished when the model answers in markdown.
 */
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const inline = (s: string): React.ReactNode => {
    const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
        return <em key={i}>{p.slice(1, -1)}</em>;
      if (p.startsWith("`") && p.endsWith("`") && p.length > 2)
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-gray-200/70 text-[13px] font-mono">
            {p.slice(1, -1)}
          </code>
        );
      return p;
    });
  };

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={key++} className="list-disc pl-5 space-y-1 my-2">
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      list.push(line.replace(/^\s*[-*]\s+/, ""));
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      list.push(line.replace(/^\s*\d+\.\s+/, ""));
      continue;
    }
    flushList();
    if (!line.trim()) continue;
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const size = level <= 2 ? "text-base" : "text-sm";
      blocks.push(
        <p key={key++} className={`${size} font-semibold text-gray-900 mt-3 mb-1`}>
          {inline(h[2])}
        </p>
      );
      continue;
    }
    blocks.push(
      <p key={key++} className="my-1">
        {inline(line)}
      </p>
    );
  }
  flushList();
  return blocks;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;

    const next: Message[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ??
            data.error ??
            "Sorry — I couldn't answer that right now. Please try again.",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Network error — please try again." },
      ]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  };

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
              <Bot className="h-8 w-8 text-white" aria-hidden="true" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              AI Study Assistant
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Ask anything — get instant, expert-level answers to accelerate your learning.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-8 pb-24">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl shadow-purple-500/5 overflow-hidden">
            {/* Messages */}
            <div ref={scrollRef} className="h-[480px] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center mb-6">
                    <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to help you learn</h3>
                  <p className="text-sm text-gray-500 max-w-sm mb-8">
                    Ask me about any topic — programming, business, design, data science, and more.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t border-gray-100 p-4 bg-white">
              <form
                className="flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  aria-label="Ask a question"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  className="inline-flex items-center justify-center gap-2 w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
