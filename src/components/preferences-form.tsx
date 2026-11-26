"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PreferencesForm({ kind }: { kind: "workout" | "diet" }) {
  const endpoint =
    kind === "workout" ? "/api/v1/workouts/preferences" : "/api/v1/diet/preferences";
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((r) => r.json())
      .then((j) => setData(j.data ?? {}));
  }, [endpoint]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body =
      kind === "workout"
        ? {
            workoutType: fd.get("workoutType"),
            durationMinutes: Number(fd.get("durationMinutes")),
            intensity: fd.get("intensity"),
            calorieBurnGoal: Number(fd.get("calorieBurnGoal") || 0) || null,
          }
        : {
            dietType: fd.get("dietType"),
            calorieTarget: Number(fd.get("calorieTarget")),
            mealFrequency: fd.get("mealFrequency"),
            preferIndianCuisine: fd.get("preferIndianCuisine") === "on",
          };

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMsg(res.ok ? "Saved." : "Failed.");
  }

  if (!data) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Update preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          {kind === "workout" ? (
            <>
              <input
                name="workoutType"
                defaultValue={String(data.workoutType ?? "")}
                className="field"
              />
              <input
                name="durationMinutes"
                type="number"
                defaultValue={Number(data.durationMinutes ?? 45)}
                className="field"
              />
              <select name="intensity" defaultValue={String(data.intensity ?? "MODERATE")} className="field">
                <option value="LIGHT">Light</option>
                <option value="MODERATE">Moderate</option>
                <option value="INTENSE">Intense</option>
              </select>
              <input
                name="calorieBurnGoal"
                type="number"
                defaultValue={Number(data.calorieBurnGoal ?? "")}
                placeholder="Calorie burn goal"
                className="field"
              />
            </>
          ) : (
            <>
              <input name="dietType" defaultValue={String(data.dietType ?? "")} className="field" />
              <input
                name="calorieTarget"
                type="number"
                defaultValue={Number(data.calorieTarget ?? "")}
                className="field"
              />
              <input
                name="mealFrequency"
                defaultValue={String(data.mealFrequency ?? "3 meals/day")}
                className="field"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="preferIndianCuisine"
                  defaultChecked={Boolean(data.preferIndianCuisine)}
                />
                Prefer Indian cuisine
              </label>
            </>
          )}
          <Button type="submit">Save</Button>
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </form>
      </CardContent>
    </Card>
  );
}