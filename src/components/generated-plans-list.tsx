"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Plan = {
  id: string;
  planType: string;
  model: string;
  generatedAt: string;
};

export function GeneratedPlansList() {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setPlans(null);
    const res = await fetch("/api/v1/ai/plans?pageSize=10");
    const json = await res.json();
    setPlans(json.data ?? []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/ai/plans?pageSize=10")
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setPlans(json.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function remove(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/v1/ai/plans/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    setDeleting(null);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Saved plans</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => void load()} disabled={plans === null}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {plans === null ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : plans.length === 0 ? (
          <EmptyState title="No saved plans" description="Generate a workout, diet, daily plan, or today's tips above." />
        ) : (
          <ul className="divide-y divide-border/50">
            {plans.map((p) => (
              <li key={p.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{p.planType}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(p.generatedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Model: {p.model}</p>
                </div>
                <PlanRowActions id={p.id} deleting={deleting} onDelete={remove} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function PlanRowActions({
  id,
  deleting,
  onDelete,
}: {
  id: string;
  deleting: string | null;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Link href={`/assistant/plans/${id}`} className="text-primary hover:underline">
        View
      </Link>
      <Button size="sm" variant="ghost" disabled={deleting === id} onClick={() => void onDelete(id)}>
        Delete
      </Button>
    </div>
  );
}