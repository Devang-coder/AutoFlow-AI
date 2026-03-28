import { useState, useRef, useEffect } from "react";
import { getApiBaseUrl } from "@/lib/config";
import { Bot, Send, Plus, MessageSquare, Trash2, Info } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const STORAGE_KEY = "cfo_ai_conversations";
const DISCOVERY_KEY = "cfo_ai_discovery_seen";

function generateId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim().slice(0, 60);
  return trimmed.length < firstMessage.trim().length ? trimmed + "…" : trimmed;
}

function loadConversations(): Conversation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

const SAMPLE_PROMPTS = [
  "Give me a full CFO briefing on today's pipeline",
  "Which vendors have the highest spend this month?",
  "How many invoices need human review and why?",
  "What is our automation readiness rate?",
];

export default function CfoAiPage() {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.id || null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(!localStorage.getItem(DISCOVERY_KEY));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = conversations.find(c => c.id === activeId) || null;

  useEffect(() => { saveConversations(conversations); }, [conversations]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeConv?.messages.length]);

  const dismissDiscovery = () => { setShowDiscovery(false); localStorage.setItem(DISCOVERY_KEY, "true"); };

  const createNewChat = () => {
    const newConv: Conversation = { id: generateId(), title: "New Chat", messages: [], createdAt: Date.now() };
    setConversations(prev => [newConv, ...prev]);
    setActiveId(newConv.id);
    setInput("");
  };

  const deleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(conversations.find(c => c.id !== id)?.id || null);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");

    let convId = activeId;
    if (!convId) {
      const newConv: Conversation = { id: generateId(), title: generateTitle(userMsg), messages: [], createdAt: Date.now() };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveId(convId);
    }

    setConversations(prev => prev.map(c => {
      if (c.id !== convId) return c;
      const updated = { ...c, messages: [...c.messages, { role: "user" as const, content: userMsg }] };
      if (c.messages.length === 0) updated.title = generateTitle(userMsg);
      return updated;
    }));

    setIsTyping(true);

    try {
      const res = await fetch(`${getApiBaseUrl()}/webhook/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg, session_id: convId }),
      });

      if (!res.ok) throw new Error(`Backend error: ${res.status}`);

      const data = await res.json();
      const insights = data?.insights;

      let aiContent = "";

      if (insights?.query_answer) {
        aiContent += insights.query_answer;
      }
      if (insights?.executive_summary && insights.executive_summary !== insights.query_answer) {
        aiContent += `\n\n**Executive Summary**\n${insights.executive_summary}`;
      }
      if (insights?.recommendations?.length) {
        aiContent += `\n\n**Recommendations**\n${insights.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}`;
      }
      if (insights?.confidence !== undefined) {
        const pct = Math.round(insights.confidence * 100);
        aiContent += `\n\n*Confidence: ${pct}%*`;
      }
      if (!aiContent.trim()) {
        aiContent = data?.raw_data
          ? `Processed ${data.raw_data.total_invoices ?? 0} invoices. Total spend: ${(data.raw_data.total_amount ?? 0).toLocaleString()}. Automation rate: ${Math.round((data.raw_data.automation_readiness_rate ?? 0) * 100)}%.`
          : "I could not retrieve data at this time. Please try again.";
      }

      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, messages: [...c.messages, { role: "assistant" as const, content: aiContent.trim() }] };
      }));
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Request failed";
      setConversations(prev => prev.map(c => {
        if (c.id !== convId) return c;
        return { ...c, messages: [...c.messages, { role: "assistant" as const, content: `⚠️ Could not reach the analytics backend. Make sure the n8n workflow is active.\n\nError: ${errMsg}` }] };
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <PageContainer className="!p-0 h-[calc(100vh-0px)]">
      <div className="flex h-full">
        {/* Chat History Sidebar */}
        <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-3 border-b border-border">
            <Button onClick={createNewChat} className="w-full gap-2" size="sm">
              <Plus className="w-4 h-4" /> New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
            )}
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition",
                  activeId === conv.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                )}
                onClick={() => setActiveId(conv.id)}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="flex-1 truncate">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">CFO AI Assistant</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground"><Info className="w-4 h-4" /></button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">Connected to your live n8n pipeline. Ask about vendor risk, currency exposure, invoice anomalies, payment status, or request a CFO briefing.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Discovery Tooltip */}
          {showDiscovery && (
            <div className="mx-4 mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 relative">
              <button onClick={dismissDiscovery} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-xs">✕</button>
              <div className="flex items-start gap-3">
                <Bot className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Welcome to CFO AI Assistant</p>
                  <p className="text-xs text-muted-foreground">I can help you with vendor risk analysis, currency exposure reviews, audit trail summaries, payment status monitoring, and financial decision support. Try asking me a question!</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {(!activeConv || activeConv.messages.length === 0) && !showDiscovery && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Bot className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Ask the CFO AI anything about your financial pipeline</p>
                <div className="grid grid-cols-2 gap-2 max-w-md">
                  {SAMPLE_PROMPTS.map((prompt, i) => (
                    <button key={i} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className="text-left text-xs p-3 rounded-lg border border-border hover:bg-muted/50 transition text-muted-foreground">
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeConv?.messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[70%] rounded-xl px-4 py-3 text-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"
                )}>
                  <div className="text-sm leading-relaxed">
                    {msg.content.split("\n").map((line, li) => {
                      const escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                      const rendered = escaped
                        .replace(/\*\*(.*?)\*\*/g, (_, t: string) => `<strong>${t}</strong>`)
                        .replace(/\*(.*?)\*/g, (_, t: string) => `<em>${t}</em>`);
                      return (
                        <p key={li} className={li > 0 ? "mt-1" : ""} dangerouslySetInnerHTML={{ __html: rendered || "&nbsp;" }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted/50 rounded-xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask the CFO AI..."
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
              />
              <Button onClick={sendMessage} disabled={!input.trim() || isTyping} size="sm" className="h-10 w-10 p-0 rounded-xl shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
