"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Goal = {
  id: string;
  title: string | null;
  metricType: string;
  targetValue: number;
  currentValue: number | null;
  unit: string;
  status: string;
};

export function GoalsManager() {
  const [goals, setGoals] = useState<Goal[]>([]);

  async function load() {
    const res = await fetch("/api/v1/goals");
    const json = await res.json();
    setGoals(json.data ?? []);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/v1/goals")
      .then((r) => r.json())
      .then((json) => {
        if (active) setGoals(json.data ?? []);
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/v1/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(fd.get("title")),
        metricType: String(fd.get("metricType")),
        targetValue: Number(fd.get("targetValue")),
        currentValue: Number(fd.get("currentValue") || 0),
        unit: String(fd.get("unit")),
      }),
    });
    e.currentTarget.reset();
    await load();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Create goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
            <input name="title" placeholder="Title" className="field sm:col-span-2" required />
            <select name="metricType" className="field">
              <option value="WEIGHT">Weight</option>
              <option value="STEPS">Steps</option>
              <option value="CALORIES">Calories</option>
              <option value="BODY_FAT">Body fat</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <input name="unit" placeholder="Unit" defaultValue="kg" className="field" required />
            <input name="targetValue" type="number" placeholder="Target" className="field" required />
            <input name="currentValue" type="number" placeholder="Current" className="field" />
            <Button type="submit" className="w-fit">
              Add goal
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {goals.length === 0 ? (
            <p className="text-muted-foreground">No goals yet.</p>
          ) : (
            goals.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-2 border-b border-border/40 py-2">
                <span>
                  {g.title ?? g.metricType} — {g.currentValue ?? 0} / {g.targetValue} {g.unit} ({g.status})
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await fetch(`/api/v1/goals/${g.id}`, { method: "DELETE" });
                    await load();
                  }}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}