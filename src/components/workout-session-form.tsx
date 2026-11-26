"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function WorkoutSessionForm() {
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const exerciseName = String(fd.get("exerciseName"));
    const sets = Number(fd.get("sets"));
    const reps = Number(fd.get("reps"));
    const weightKg = Number(fd.get("weightKg"));

    const res = await fetch("/api/v1/workouts/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startedAt: new Date().toISOString(),
        exercises: [
          {
            exerciseName,
            orderIndex: 0,
            sets: Array.from({ length: sets }, (_, i) => ({
              setNumber: i + 1,
              reps,
              weightKg,
            })),
          },
        ],
      }),
    });
    if (res.ok) {
      setMessage("Workout logged.");
      e.currentTarget.reset();
    } else {
      setMessage("Failed to log workout.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log a session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <input name="exerciseName" placeholder="Exercise" required className="field" />
          <input name="sets" type="number" placeholder="Sets" defaultValue={3} className="field" />
          <input name="reps" type="number" placeholder="Reps" defaultValue={10} className="field" />
          <input name="weightKg" type="number" placeholder="Weight (kg)" step="0.5" className="field" />
          <Button type="submit" className="sm:col-span-2 w-fit">
            Save session
          </Button>
        </form>
        {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}