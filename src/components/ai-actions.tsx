"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type ActionId = "daily" | "workout" | "diet" | "recommendations";

const actions: { id: ActionId; label: string; path: string; variant?: "outline" }[] = [
  { id: "daily", label: "Daily plan", path: "/api/v1/ai/daily-plan" },
  { id: "workout", label: "Workout", path: "/api/v1/ai/workout-plan", variant: "outline" },
  { id: "diet", label: "Diet", path: "/api/v1/ai/diet-plan", variant: "outline" },
  { id: "recommendations", label: "Today tips", path: "/api/v1/ai/recommendations", variant: "outline" },
];

export function AiActions({ title }: { title: string }) {
  const [loading, setLoading] = useState<ActionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<{ path: string; id: ActionId } | null>(null);
  const [meta, setMeta] = useState<{ planId?: string; model?: string; usedFallback?: boolean } | null>(null);

  const run = useCallback(async (path: string, id: ActionId, retry = false) => {
    setLoading(id);
    setError(null);
    if (!retry) setMeta(null);
    setLastAction({ path, id });

    const clientRequestId = retry ? undefined : crypto.randomUUID().replace(/-/g, "").slice(0, 24);

    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientRequestId ? { clientRequestId } : {}),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error?.message ?? "Generation failed");
        return;
      }
      setMeta({
        planId: json.meta?.planId as string | undefined,
        model: json.meta?.model as string | undefined,
        usedFallback: Boolean(json.meta?.usedFallback),
      });
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(null);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button
              key={a.id}
              disabled={!!loading}
              size="sm"
              variant={a.variant}
              onClick={() => void run(a.path, a.id)}
            >
              {loading === a.id ? "Generating…" : a.label}
            </Button>
          ))}
        </div>
        {loading ? <Skeleton className="h-10 w-full" /> : null}
        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="text-destructive">{error}</p>
            {lastAction ? (
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                disabled={!!loading}
                onClick={() => void run(lastAction.path, lastAction.id, true)}
              >
                Retry
              </Button>
            ) : null}
          </div>
        ) : null}
        {meta?.planId ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary">Saved</Badge>
            {meta.model ? <span className="text-muted-foreground">Model: {meta.model}</span> : null}
            {meta.usedFallback ? <Badge variant="outline">Fallback model</Badge> : null}
            <Link href={`/assistant/plans/${meta.planId}`} className="text-primary hover:underline">
              View plan →
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}