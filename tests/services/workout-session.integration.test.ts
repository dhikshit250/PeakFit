import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { createWorkoutSession } from "@/services/workout.service";
import { listPersonalRecords } from "@/services/personal-records.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("workout session workflow", () => {
  it("creates session, sets, and personal record", async () => {
    const user = await prisma.user.create({
      data: { clerkUserId: `test-wk-${Date.now()}`, email: "wk@test.local" },
    });

    await createWorkoutSession(user, {
      startedAt: new Date().toISOString(),
      exercises: [
        {
          exerciseName: "Bench press",
          orderIndex: 0,
          sets: [{ setNumber: 1, reps: 5, weightKg: 100 }],
        },
      ],
    });

    const prs = await listPersonalRecords(user.id);
    expect(prs.some((p) => p.exerciseName === "Bench press")).toBe(true);

    await prisma.user.delete({ where: { id: user.id } });
  });
});