"use client";

import { useRef, useState } from "react";
import { Bot, LoaderCircle, Send, Sparkles, User } from "lucide-react";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RevealController } from "@/components/reveal/RevealController";
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

export function AIAssistantChat() {
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
      <main className="pt-20">
        {/* Reference shell: gray wrapper under the navbar offset holds the
            dark hero + the overlapping chat card. */}
        <div className="min-h-screen bg-gray-50">
          {/* Hero — reference: max-w-3xl, Sparkles in a w-14 gradient box */}
          <div className="bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] pt-16 pb-12 px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="flex items-center justify-center gap-3 mb-4"
                data-reveal="a"
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
                </div>
              </div>
              <h1
                className="text-3xl md:text-5xl font-bold text-white tracking-tight"
                data-reveal="a"
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                AI Study Assistant
              </h1>
              <p
                className="mt-4 text-lg text-gray-400"
                data-reveal="a"
                style={{ opacity: 0, transform: "translateY(20px)" }}
              >
                Ask anything — get instant, expert-level answers to accelerate your learning.
              </p>
            </div>
          </div>

          {/* Chat card — reference: max-w-3xl overlapping -mt-6, min-h-60vh flex column */}
          <div className="max-w-3xl mx-auto px-4 -mt-6 pb-24">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[60vh] flex flex-col">
            {/* Messages — reference: flex-1 (grows with the card, no fixed height) */}
            <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
                    <Bot className="h-8 w-8 text-purple-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to help you learn</h3>
                  <p className="text-gray-500 max-w-sm">
                    Ask me about any topic — programming, business, design, data science, and more.
                  </p>
                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      m.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center shrink-0 mt-1">
                      <User className="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}

              {/* Reference loading state (session 18): the live renders a
                  spinning lucide-loader-circle + "Thinking..." text in a
                  px-5 py-3 flex items-center gap-2 text-gray-400 bubble —
                  byte-captured from the live's DOM during a real request
                  (the transient state every settled-DOM audit missed). */}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 flex items-center gap-2 text-gray-400">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Thinking...
                  </div>
                </div>
              )}
            </div>

            {/* Composer — reference: auto-growing textarea + self-end gradient send.
                Session 20: the live wraps the composer in a DIV (no form
                element anywhere in its /AIAssistant main — Enter-to-send
                runs through a runtime keydown listener). The textarea's own
                onKeyDown already drove Enter (it preventDefault()s, so the
                old form's onSubmit was dead code); the button now carries
                the onClick directly and NO type attribute (the live's form). */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder="Ask a question..."
                  aria-label="Ask a question"
                  className="flex w-full border bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 resize-none rounded-xl border-gray-200 focus:border-purple-500 min-h-[48px] max-h-32"
                />
                <button
                  disabled={!input.trim() || loading}
                  aria-label="Send message"
                  onClick={() => send(input)}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-9 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white rounded-xl px-5 shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 self-end"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
      {/* Session 15: the reference scroll-reveal system (3 targets here). */}
      <RevealController />

      <Footer />
    </div>
  );
}
