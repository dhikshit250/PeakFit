import { describe, expect, it } from "vitest";
import {
  dietPlanSchema,
  normalizeDietPlan,
  normalizeWorkoutPlan,
  workoutPlanSchema,
} from "@/lib/validators/ai";

describe("AI validators", () => {
  it("rejects workout without rest bounds", () => {
    const res = workoutPlanSchema.safeParse({
      title: "Test",
      durationMinutes: 45,
      warmup: [],
      exercises: [{ name: "Squat", sets: 0, reps: "8" }],
      cooldown: [],
    });
    expect(res.success).toBe(false);
  });

  it("normalizes diet calories when total drifts from meal sum", () => {
    const plan = normalizeDietPlan({
      title: "Day",
      meals: [
        { name: "Breakfast", description: "Oats", calories: 400 },
        { name: "Lunch", description: "Dal", calories: 600 },
      ],
      totalCalories: 5000,
    });
    expect(plan.totalCalories).toBe(1000);
  });

  it("clamps workout duration", () => {
    const plan = normalizeWorkoutPlan({
      title: "Long",
      durationMinutes: 500,
      warmup: [],
      exercises: [{ name: "Squat", sets: 4, reps: "8", restSeconds: 900 }],
      cooldown: [],
    });
    expect(plan.durationMinutes).toBe(180);
    expect(plan.exercises[0]?.restSeconds).toBe(600);
  });

  it("validates diet macros", () => {
    const res = dietPlanSchema.safeParse({
      title: "Plan",
      meals: [{ name: "Meal", description: "Food", calories: 500, proteinG: -1 }],
      totalCalories: 500,
    });
    expect(res.success).toBe(false);
  });
});