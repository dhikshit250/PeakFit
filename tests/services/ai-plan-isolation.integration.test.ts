import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { deleteGeneratedPlan, getGeneratedPlan } from "@/services/ai.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("AI plan isolation", () => {
  it("does not allow cross-user read or delete", async () => {
    const userA = await prisma.user.create({
      data: { clerkUserId: `qa-ai-a-${Date.now()}`, email: "qa-a@test.local" },
    });
    const userB = await prisma.user.create({
      data: { clerkUserId: `qa-ai-b-${Date.now()}`, email: "qa-b@test.local" },
    });

    const plan = await prisma.generatedPlan.create({
      data: {
        userId: userA.id,
        model: "test-model",
        planType: "workout",
        planJson: {
          title: "QA",
          durationMinutes: 30,
          warmup: [],
          exercises: [{ name: "Push-up", sets: 3, reps: "10" }],
          cooldown: [],
        },
      },
    });

    expect(await getGeneratedPlan(userB.id, plan.id)).toBeNull();
    expect(await deleteGeneratedPlan(userB.id, plan.id)).toBeNull();

    const still = await prisma.generatedPlan.findUnique({ where: { id: plan.id } });
    expect(still?.userId).toBe(userA.id);

    expect(await deleteGeneratedPlan(userA.id, plan.id)).not.toBeNull();
    await prisma.user.delete({ where: { id: userA.id } });
    await prisma.user.delete({ where: { id: userB.id } });
  });
});