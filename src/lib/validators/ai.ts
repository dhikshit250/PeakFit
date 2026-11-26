import { z } from "zod";

const macroSchema = z.number().min(0).max(500).optional();

export const workoutExerciseSchema = z.object({
  name: z.string().min(1).max(120),
  sets: z.number().int().min(1).max(20),
  reps: z.string().min(1).max(40),
  restSeconds: z.number().int().min(0).max(600).optional(),
  notes: z.string().max(500).optional(),
});

export const workoutPlanSchema = z.object({
  title: z.string().min(1).max(200),
  durationMinutes: z.number().int().min(10).max(180),
  warmup: z.array(z.string().max(300)).max(12),
  exercises: z.array(workoutExerciseSchema).min(1).max(24),
  cooldown: z.array(z.string().max(300)).max(12),
});

export const dietMealSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  calories: z.number().int().min(0).max(4000),
  proteinG: macroSchema,
  carbsG: macroSchema,
  fatG: macroSchema,
  quantity: z.string().max(120).optional(),
});

export const dietPlanSchema = z.object({
  title: z.string().min(1).max(200),
  meals: z.array(dietMealSchema).min(1).max(12),
  totalCalories: z.number().int().min(0).max(15000),
  notes: z.string().max(1000).optional(),
});

export const dailyPlanSchema = z.object({
  dayIndex: z.number().int().min(1).max(30),
  workout: workoutPlanSchema,
  diet: dietPlanSchema,
  tips: z.array(z.string().max(400)).max(10),
});

export const dailyRecommendationsSchema = z.object({
  headline: z.string().min(1).max(200),
  focusAreas: z.array(z.string().max(120)).max(8),
  workoutSummary: z.string().max(800),
  nutritionSummary: z.string().max(800),
  hydrationMl: z.number().int().min(0).max(10000).optional(),
  stepsTarget: z.number().int().min(0).max(100000).optional(),
  disclaimer: z.string().max(400),
});

export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export type DietPlan = z.infer<typeof dietPlanSchema>;
export type DailyPlan = z.infer<typeof dailyPlanSchema>;
export type DailyRecommendations = z.infer<typeof dailyRecommendationsSchema>;

const MEAL_CALORIE_TOLERANCE_RATIO = 0.2;

/** Reconcile AI calorie totals with meal sums; clamp implausible per-meal values. */
export function normalizeDietPlan(plan: DietPlan): DietPlan {
  const meals = plan.meals.map((m) => ({
    ...m,
    calories: Math.round(Math.min(4000, Math.max(0, m.calories))),
    proteinG: m.proteinG != null ? Math.round(Math.min(500, Math.max(0, m.proteinG))) : undefined,
    carbsG: m.carbsG != null ? Math.round(Math.min(800, Math.max(0, m.carbsG))) : undefined,
    fatG: m.fatG != null ? Math.round(Math.min(300, Math.max(0, m.fatG))) : undefined,
  }));

  const mealSum = meals.reduce((acc, m) => acc + m.calories, 0);
  let totalCalories = Math.round(plan.totalCalories);

  if (mealSum > 0) {
    const delta = Math.abs(totalCalories - mealSum) / mealSum;
    if (delta > MEAL_CALORIE_TOLERANCE_RATIO) {
      totalCalories = mealSum;
    }
  } else if (totalCalories > 8000) {
    totalCalories = 8000;
  }

  return { ...plan, meals, totalCalories };
}

export function normalizeWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    ...plan,
    durationMinutes: Math.min(180, Math.max(10, Math.round(plan.durationMinutes))),
    exercises: plan.exercises.map((ex) => ({
      ...ex,
      sets: Math.min(20, Math.max(1, Math.round(ex.sets))),
      restSeconds:
        ex.restSeconds != null
          ? Math.min(600, Math.max(0, Math.round(ex.restSeconds)))
          : undefined,
    })),
  };
}