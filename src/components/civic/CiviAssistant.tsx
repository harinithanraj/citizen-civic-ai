import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askCivi } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export function CiviAssistant() {
  const { isAdmin, user } = useAuth();
  const ask = useServerFn(askCivi);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm Civi. Ask me about your complaints — for example “Where is my complaint?” or “Show my unresolved complaints”.",
    },
  ]);

  const suggestions = isAdmin
    ? ["Summarize today's major civic issues", "Which area has the most complaints?"]
    : ["Where is my complaint?", "What does In Progress mean?"];

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setPending(true);
    try {
      const res = await ask({
        data: {
          question: trimmed,
          isAdmin,
          history: next.slice(-6, -1).map((m) => ({ role: m.role, content: m.content })),
        },
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't reach the AI service. Please try again in a moment.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close Civi assistant" : "Open Civi assistant"}
        className="fixed right-5 bottom-5 z-50 size-14 rounded-full shadow-lg"
      >
        {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>

      {open ? (
        <section
          aria-label="Civi AI assistant"
          className="clay-lg fixed right-4 bottom-24 z-50 flex max-h-[70vh] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden p-0"
        >
          <header className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="font-display text-sm font-bold">Civi</p>
              <p className="text-xs text-subtle-foreground">Answers from your complaint data</p>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((m, i) => (
              <p
                key={i}
                className={cn(
                  "max-w-[85%] rounded-3xl px-4 py-2.5 text-sm",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "clay-inset text-foreground",
                )}
              >
                {m.content}
              </p>
            ))}
            {pending ? (
              <p className="clay-inset max-w-[60%] px-4 py-2.5 text-sm text-muted-foreground">
                Civi is thinking…
              </p>
            ) : null}
          </div>

          <div className="space-y-3 border-t border-border/70 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary hover:bg-secondary/70"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <label className="sr-only" htmlFor="civi-input">
                Ask Civi a question
              </label>
              <Input
                id="civi-input"
                value={input}
                maxLength={600}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Civi…"
                className="rounded-2xl"
              />
              <Button type="submit" size="icon" className="rounded-2xl" disabled={pending}>
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </section>
      ) : null}
    </>
  );
}