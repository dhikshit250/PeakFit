import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { deleteUserAccount } from "@/services/account.service";
import { weightProgress } from "@/services/progress.service";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("account deletion", () => {
  it("removes user and cascaded data", async () => {
    const user = await prisma.user.create({
      data: { clerkUserId: `qa-del-${Date.now()}`, email: "del@test.local" },
    });

    await weightProgress.create(user.id, {
      recordedAt: new Date().toISOString(),
      weightKg: 70,
    });

    const result = await deleteUserAccount(user);
    expect(result.deleted).toBe(true);

    const gone = await prisma.user.findUnique({ where: { id: user.id } });
    expect(gone).toBeNull();
    const weights = await prisma.weightEntry.findMany({ where: { userId: user.id } });
    expect(weights).toHaveLength(0);
  });
});