"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MealLogForm() {
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/nutrition/calories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordedAt: new Date().toISOString(),
        type: "INTAKE",
        calories: Number(fd.get("calories")),
        description: String(fd.get("description")),
        proteinG: Number(fd.get("proteinG") || 0),
        carbsG: Number(fd.get("carbsG") || 0),
        fatG: Number(fd.get("fatG") || 0),
      }),
    });
    setMsg(res.ok ? "Meal logged." : "Failed to log meal.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a meal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-2 sm:grid-cols-2">
          <input name="description" placeholder="Meal (e.g. Dal + roti)" required className="field sm:col-span-2" />
          <input name="calories" type="number" placeholder="Calories" required className="field" />
          <input name="proteinG" type="number" placeholder="Protein (g)" className="field" />
          <input name="carbsG" type="number" placeholder="Carbs (g)" className="field" />
          <input name="fatG" type="number" placeholder="Fat (g)" className="field" />
          <Button type="submit" className="w-fit">
            Save
          </Button>
        </form>
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      </CardContent>
    </Card>
  );
}