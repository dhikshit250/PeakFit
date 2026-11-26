import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { createPlannedMeal, deletePlannedMeal, calendarSummary } from "@/services/meal-plan.service";
import { MealSlot } from "@prisma/client";

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)("meal planning", () => {
  it("creates, lists in calendar, and deletes", async () => {
    const user = await prisma.user.create({
      data: { clerkUserId: `qa-meal-${Date.now()}`, email: "meal@test.local" },
    });
    const date = "2026-11-26";

    const meal = await createPlannedMeal(user.id, {
      plannedDate: date,
      mealSlot: MealSlot.DINNER,
      title: "Dal + roti",
      calories: 520,
      proteinG: 18,
    });

    const summary = await calendarSummary(user.id, date, date);
    expect(summary.days).toHaveLength(1);
    expect(summary.days[0]?.totals.calories).toBe(520);

    const other = await prisma.user.create({
      data: { clerkUserId: `qa-meal-b-${Date.now()}`, email: "meb@test.local" },
    });
    expect(await deletePlannedMeal(other.id, meal.id)).toBe(false);
    expect(await deletePlannedMeal(user.id, meal.id)).toBe(true);

    await prisma.user.delete({ where: { id: user.id } });
    await prisma.user.delete({ where: { id: other.id } });
  });
});