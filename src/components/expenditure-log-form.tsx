"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExpenditureLogForm() {
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/nutrition/calories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordedAt: new Date().toISOString(),
        type: "EXPENDITURE",
        calories: Number(fd.get("calories")),
        description: String(fd.get("description")),
      }),
    });
    setMsg(res.ok ? "Expenditure logged." : "Failed.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log calorie burn</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
          <input name="description" placeholder="Activity" className="field min-w-[180px]" required />
          <input name="calories" type="number" placeholder="Calories" className="field w-28" required />
          <Button type="submit" size="sm">
            Save
          </Button>
        </form>
        {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
      </CardContent>
    </Card>
  );
}