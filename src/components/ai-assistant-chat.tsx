"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ChatMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "peakfit-ai-thread";

export function AiAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [threadId] = useState(() => crypto.randomUUID());
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20), threadId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Chat failed");
        return;
      }
      setDisclaimer(json.data.disclaimer ?? null);
      setMessages((prev) => [...prev, { role: "assistant", content: json.data.reply }]);
    } catch {
      setError("Network error. Retry your message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex max-h-[70vh] flex-col">
      <CardHeader>
        <CardTitle>Fitness assistant</CardTitle>
        <p className="text-xs text-muted-foreground">
          General fitness guidance only — not medical advice. Conversation is stored in this browser session.
        </p>
      </CardHeader>
      <CardContent className="flex min-h-[320px] flex-1 flex-col gap-3">
        <ChatLog messages={messages} loading={loading} bottomRef={bottomRef} />
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {disclaimer ? <p className="text-[11px] text-muted-foreground">{disclaimer}</p> : null}
        <div className="mt-auto flex gap-2 pt-2">
          <input
            className="field flex-1"
            placeholder="Ask about training, nutrition, recovery…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <Button disabled={loading || !input.trim()} onClick={() => void send()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatLog({
  messages,
  loading,
  bottomRef,
}: {
  messages: ChatMessage[];
  loading: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-3">
      {messages.length === 0 && !loading ? (
        <p className="text-sm text-muted-foreground">Start a conversation about your training or nutrition goals.</p>
      ) : null}
      {messages.map((m, i) => (
        <ChatBubble key={`${m.role}-${i}`} message={m} />
      ))}
      {loading ? <Skeleton className="h-12 w-3/4 rounded-lg" /> : null}
      <div ref={bottomRef} />
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "ml-8 text-right" : "mr-8"}>
      <div
        className={
          isUser
            ? "inline-block rounded-lg bg-primary/15 px-3 py-2 text-left text-sm"
            : "inline-block rounded-lg border border-border/60 bg-card px-3 py-2 text-sm"
        }
      >
        {message.content}
      </div>
    </div>
  );
}