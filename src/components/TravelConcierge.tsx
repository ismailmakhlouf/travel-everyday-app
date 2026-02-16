import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { JourneySelections, ComputedJourney } from "@/lib/pricingEngine";
import type { FleetMetrics } from "@/lib/revenueModel";

type Msg = { role: "user" | "assistant"; content: string };

interface AIAction {
  name: string;
  arguments: Record<string, string>;
}

interface TravelConciergeProps {
  selections: JourneySelections;
  computed: ComputedJourney;
  fleet: FleetMetrics;
  onAction: (action: AIAction) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/travel-concierge`;

const TravelConcierge = ({ selections, computed, fleet, onAction }: TravelConciergeProps) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Load chat history on open
  useEffect(() => {
    if (!open || !user || messages.length > 0) return;
    supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMessages(data.filter(m => m.role !== "system") as Msg[]);
        }
      });
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const persistMessage = useCallback(async (role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  }, [user]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: Msg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    persistMessage("user", text);
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          selections,
          computed: {
            totalBundle: computed.totalBundle,
            totalSavings: computed.totalSavings,
            savingsPct: computed.savingsPct,
            tier: computed.tier.name,
            tierPoints: computed.tierPoints,
            trainlinePoints: computed.trainlinePoints,
            airlineMiles: computed.airlineMiles,
            hotelPoints: computed.hotelPoints,
          },
          fleet: {
            adoptionRate: fleet.adoptionRate,
            revPerJourney: fleet.revPerJourney,
            monthlyUplift: fleet.monthlyUplift,
            annualRevHub: fleet.annualRevHub,
            ancillaryAttachRate: fleet.ancillaryAttachRate,
          },
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let toolCalls: AIAction[] = [];

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.content) {
              assistantSoFar += delta.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
            // Handle tool calls
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                if (tc.function?.name && tc.function?.arguments) {
                  try {
                    const args = JSON.parse(tc.function.arguments);
                    toolCalls.push({ name: tc.function.name, arguments: args });
                  } catch {}
                }
              }
            }
            // Check finish_reason for tool_calls
            if (parsed.choices?.[0]?.finish_reason === "tool_calls" || parsed.choices?.[0]?.finish_reason === "stop") {
              // Process accumulated tool calls
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Execute any tool calls
      for (const tc of toolCalls) {
        onAction(tc);
        const actionMsg = `✨ Applied: ${tc.name}(${JSON.stringify(tc.arguments)})`;
        if (!assistantSoFar.includes(actionMsg)) {
          assistantSoFar += `\n\n${actionMsg}`;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        }
      }

      if (assistantSoFar) persistMessage("assistant", assistantSoFar);
    } catch (e: any) {
      const errorMsg = e.message || "Something went wrong";
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-teal-glow hover:scale-110 transition-transform ${open ? "hidden" : ""}`}
      >
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-[360px] max-h-[500px] rounded-2xl bg-card border border-border/40 shadow-card flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground font-display">Travel Concierge</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-secondary rounded-lg">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {messages.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Sparkles className="w-8 h-8 text-primary/40 mx-auto" />
                  <p className="text-xs text-muted-foreground">
                    Ask me anything about your journey, pricing, or executive metrics.
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {["Best flight for tier boost?", "Switch to Emirates", "Revenue at 30% adoption"].map(q => (
                      <button
                        key={q}
                        onClick={() => { setInput(q); }}
                        className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/60 text-foreground"
                  }`}>
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm prose-invert max-w-none [&_p]:m-0 [&_ul]:m-0 [&_li]:m-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-secondary/60 rounded-xl px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border/20 p-3">
              <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask your concierge…"
                  className="flex-1 bg-secondary/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border/20 focus:border-primary/40"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/80 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TravelConcierge;
