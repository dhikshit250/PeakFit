"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/layout/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "week" | "month";

type PlannedMeal = {
  id: string;
  plannedDate: string;
  mealSlot: string;
  title: string;
  description: string | null;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
};

type CalendarDay = {
  date: string;
  totals: { calories: number; proteinG: number; carbsG: number; fatG: number };
  meals: PlannedMeal[];
};

const slots = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] as const;

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function MealPlanCalendar() {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(() => new Date());
  const [days, setDays] = useState<CalendarDay[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const start = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), cursor.getUTCDate()));
    if (view === "week") {
      const day = start.getUTCDay();
      const mondayOffset = (day + 6) % 7;
      const from = addDays(start, -mondayOffset);
      const to = addDays(from, 6);
      return { from: formatDate(from), to: formatDate(to) };
    }
    const from = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const to = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
    return { from: formatDate(from), to: formatDate(to) };
  }, [cursor, view]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch(
      `/api/v1/nutrition/meal-plans/calendar?from=${range.from}&to=${range.to}`,
    );
    const json = await res.json();
    if (!res.ok) {
      setError(json.error?.message ?? "Could not load meal plan");
      setDays([]);
    } else {
      setDays(json.data.days as CalendarDay[]);
    }
    setLoading(false);
  }, [range.from, range.to]);

  function shiftCursor(days: number) {
    setDays(null);
    setLoading(true);
    setCursor((c) => addDays(new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate())), days));
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/v1/nutrition/meal-plans/calendar?from=${range.from}&to=${range.to}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.data?.days) setDays(json.data.days as CalendarDay[]);
        else {
          setError(json.error?.message ?? "Could not load meal plan");
          setDays([]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Network error");
          setDays([]);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "week" ? "default" : "outline"}
            onClick={() => {
              setDays(null);
              setLoading(true);
              setView("week");
            }}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "month" ? "default" : "outline"}
            onClick={() => {
              setDays(null);
              setLoading(true);
              setView("month");
            }}
          >
            Month
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => shiftCursor(view === "week" ? -7 : -28)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {range.from} → {range.to}
          </span>
          <Button size="sm" variant="outline" onClick={() => shiftCursor(view === "week" ? 7 : 28)}>
            Next
          </Button>
        </div>
      </div>

      <MealPlanForm onSaved={load} defaultDate={range.from} />

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : !days?.length ? (
        <EmptyState title="No planned meals" description="Schedule meals for this period using the form above." />
      ) : (
        <CalendarGrid days={days} onChanged={load} />
      )}
    </div>
  );
}

function MealPlanForm({ onSaved, defaultDate }: { onSaved: () => void; defaultDate: string }) {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      plannedDate: String(fd.get("plannedDate")),
      mealSlot: String(fd.get("mealSlot")),
      title: String(fd.get("title")),
      description: String(fd.get("description") || "") || null,
      calories: Number(fd.get("calories")),
      proteinG: fd.get("proteinG") ? Number(fd.get("proteinG")) : null,
      carbsG: fd.get("carbsG") ? Number(fd.get("carbsG")) : null,
      fatG: fd.get("fatG") ? Number(fd.get("fatG")) : null,
    };
    const res = await fetch("/api/v1/nutrition/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) {
      e.currentTarget.reset();
      (e.currentTarget.elements.namedItem("plannedDate") as HTMLInputElement).value = defaultDate;
      onSaved();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Schedule a meal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="content-grid gap-3 md:grid-cols-2">
          <FormField label="Date" name="plannedDate" type="date" defaultValue={defaultDate} required />
          <div className="space-y-2">
            <Label htmlFor="mealSlot">Slot</Label>
            <select id="mealSlot" name="mealSlot" className="select-field" required>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Title" name="title" required />
          <FormField label="Calories" name="calories" type="number" required />
          <FormField label="Protein (g)" name="proteinG" type="number" />
          <FormField label="Carbs (g)" name="carbsG" type="number" />
          <FormField label="Fat (g)" name="fatG" type="number" />
          <div className="md:col-span-2">
            <Label htmlFor="description">Notes</Label>
            <Input id="description" name="description" className="mt-2" />
          </div>
          <Button type="submit" disabled={loading} className="md:col-span-2 w-full sm:w-auto">
            {loading ? "Saving…" : "Add to plan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} defaultValue={defaultValue} />
    </div>
  );
}

function CalendarGrid({ days, onChanged }: { days: CalendarDay[]; onChanged: () => void }) {
  return (
    <div className="content-grid md:grid-cols-2 xl:grid-cols-3">
      {days.map((day) => (
        <Card key={day.date} className="bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tabular-nums">{day.date}</CardTitle>
            <p className="text-xs tabular-nums text-muted-foreground">
              {day.totals.calories} kcal · P{day.totals.proteinG} C{day.totals.carbsG} F{day.totals.fatG}
            </p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {day.meals.map((m) => (
              <div key={m.id} className="rounded-lg border border-border/60 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {m.mealSlot}
                    </Badge>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs tabular-nums text-muted-foreground">{m.calories} kcal</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      const res = await fetch(`/api/v1/nutrition/meal-plans/${m.id}`, { method: "DELETE" });
                      if (res.ok) onChanged();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}