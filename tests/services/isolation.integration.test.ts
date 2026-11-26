import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { weightProgress } from "@/services/progress.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("user data isolation", () => {
  it("does not return another user's weight entry", async () => {
    const userA = await prisma.user.create({
      data: { clerkUserId: `test-a-${Date.now()}`, email: "a@test.local" },
    });
    const userB = await prisma.user.create({
      data: { clerkUserId: `test-b-${Date.now()}`, email: "b@test.local" },
    });

    const entry = await weightProgress.create(userA.id, {
      recordedAt: new Date().toISOString(),
      weightKg: 80,
    });

    const patched = await weightProgress.update(userB.id, entry.id, { weightKg: 70 });
    const deleted = await weightProgress.delete(userB.id, entry.id);

    expect(patched).toBeNull();
    expect(deleted).toBe(false);

    const stillThere = await prisma.weightEntry.findUnique({ where: { id: entry.id } });
    expect(stillThere?.userId).toBe(userA.id);

    await prisma.weightEntry.delete({ where: { id: entry.id } });
    await prisma.user.delete({ where: { id: userA.id } });
    await prisma.user.delete({ where: { id: userB.id } });
  });
});