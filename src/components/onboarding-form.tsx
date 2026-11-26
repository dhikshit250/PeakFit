"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

const steps = [
  { id: 1, title: "About you" },
  { id: 2, title: "Body stats" },
  { id: 3, title: "Training" },
  { id: 4, title: "Nutrition" },
] as const;

type FormState = {
  fullName: string;
  age: string;
  weightKg: string;
  heightCm: string;
  goal: string;
  durationMinutes: string;
  workoutType: string;
  intensity: string;
  dietType: string;
  calorieTarget: string;
  preferIndianCuisine: boolean;
};

const initialState: FormState = {
  fullName: "",
  age: "",
  weightKg: "",
  heightCm: "",
  goal: "MAINTAIN",
  durationMinutes: "45",
  workoutType: "Strength Training",
  intensity: "MODERATE",
  dietType: "Balanced",
  calorieTarget: "2200",
  preferIndianCuisine: false,
};

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function patch(partial: Partial<FormState>) {
    setData((d) => ({ ...d, ...partial }));
  }

  async function finish() {
    setLoading(true);
    setError(null);
    try {
      const profileRes = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          age: Number(data.age),
          goal: data.goal,
          weightKg: Number(data.weightKg),
          heightCm: data.heightCm ? Number(data.heightCm) : undefined,
        }),
      });
      if (!profileRes.ok) throw new Error("Failed to save profile");

      await fetch("/api/v1/workouts/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          durationMinutes: Number(data.durationMinutes),
          workoutType: data.workoutType,
          intensity: data.intensity,
        }),
      });

      await fetch("/api/v1/diet/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dietType: data.dietType,
          calorieTarget: Number(data.calorieTarget),
          preferIndianCuisine: data.preferIndianCuisine,
        }),
      });

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Could not complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onNext(e: React.FormEvent) {
    e.preventDefault();
    if (step < steps.length) setStep((s) => s + 1);
    else void finish();
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Set up your profile</CardTitle>
        <StepIndicator current={step} />
      </CardHeader>
      <CardContent>
        <form onSubmit={onNext} className="space-y-4">
          {step === 1 && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                required
                value={data.fullName}
                onChange={(e) => patch({ fullName: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Age" value={data.age} onChange={(age) => patch({ age })} required />
                <NumberField
                  label="Weight (kg)"
                  value={data.weightKg}
                  onChange={(weightKg) => patch({ weightKg })}
                  required
                  step="0.1"
                />
              </div>
              <NumberField
                label="Height (cm)"
                value={data.heightCm}
                onChange={(heightCm) => patch({ heightCm })}
                step="0.1"
              />
              <div className="space-y-2">
                <Label htmlFor="goal">Goal</Label>
                <select
                  id="goal"
                  className="select-field"
                  value={data.goal}
                  onChange={(e) => patch({ goal: e.target.value })}
                >
                  <option value="CUT">Cut</option>
                  <option value="MAINTAIN">Maintain</option>
                  <option value="BULK">Bulk</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <NumberField
                label="Workout duration (min)"
                value={data.durationMinutes}
                onChange={(durationMinutes) => patch({ durationMinutes })}
              />
              <TextField
                label="Workout type"
                value={data.workoutType}
                onChange={(workoutType) => patch({ workoutType })}
              />
              <div className="space-y-2">
                <Label htmlFor="intensity">Intensity</Label>
                <select
                  id="intensity"
                  className="select-field"
                  value={data.intensity}
                  onChange={(e) => patch({ intensity: e.target.value })}
                >
                  <option value="LIGHT">Light</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="INTENSE">Intense</option>
                </select>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <TextField label="Diet style" value={data.dietType} onChange={(dietType) => patch({ dietType })} />
              <NumberField
                label="Calorie target"
                value={data.calorieTarget}
                onChange={(calorieTarget) => patch({ calorieTarget })}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.preferIndianCuisine}
                  onChange={(e) => patch({ preferIndianCuisine: e.target.checked })}
                  className="size-4 rounded border-border"
                />
                Prefer Indian cuisine in meal suggestions
              </label>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || loading}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : step === steps.length ? "Finish setup" : "Continue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="mt-4 flex gap-2">
      {steps.map((s) => (
        <li
          key={s.id}
          className={cn(
            "flex-1 rounded-full py-1 text-center text-[10px] font-medium uppercase tracking-wide sm:text-xs",
            current >= s.id ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {s.title}
        </li>
      ))}
    </ol>
  );
}

function NumberField({
  label,
  value,
  onChange,
  required,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  step?: string;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" required={required} step={step} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}