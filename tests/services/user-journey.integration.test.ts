import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { weightProgress, calorieProgress, goalsService } from "@/services/progress.service";
import { createWorkoutSession } from "@/services/workout.service";
import { WorkoutSessionSource } from "@prisma/client";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("critical user journey (DB)", () => {
  it("profile metrics → workout → nutrition → goal progress", async () => {
    const user = await prisma.user.create({
      data: { clerkUserId: `qa-journey-${Date.now()}`, email: "journey@test.local" },
    });

    const weight = await weightProgress.create(user.id, {
      recordedAt: new Date().toISOString(),
      weightKg: 77.2,
    });
    expect(weight.weightKg).toBeDefined();

    const { items: weights } = await weightProgress.list(user.id, new URLSearchParams({ pageSize: "5" }));
    const weightIds = (weights as Array<{ id: string }>).map((w) => w.id);
    expect(weightIds).toContain(weight.id);

    const session = await createWorkoutSession(user, {
      startedAt: new Date().toISOString(),
      source: WorkoutSessionSource.MANUAL,
      exercises: [
        {
          exerciseName: "Bench press",
          orderIndex: 0,
          sets: [{ setNumber: 1, reps: 8, weightKg: 60 }],
        },
      ],
    });
    expect(session.exerciseLogs.length).toBe(1);

    const meal = await calorieProgress.create(user.id, {
      recordedAt: new Date().toISOString(),
      type: "INTAKE",
      calories: 520,
      description: "QA lunch",
      proteinG: 32,
      carbsG: 45,
      fatG: 18,
    });
    expect(meal.calories).toBe(520);

    const goal = await goalsService.create(user.id, {
      metricType: "WEIGHT",
      targetValue: 72,
      unit: "kg",
      title: "Cut to 72kg",
    });
    expect(goal.status).toBe("ACTIVE");

    await prisma.calorieEntry.delete({ where: { id: meal.id } });
    await prisma.workoutSession.delete({ where: { id: session.id } });
    await prisma.fitnessGoal.delete({ where: { id: goal.id } });
    await prisma.weightEntry.delete({ where: { id: weight.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });
});