import type { MealSlot } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parsePagination } from "@/lib/api/query";

function toDateOnly(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function listPlannedMeals(userId: string, searchParams: URLSearchParams) {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const { page, pageSize, skip } = parsePagination(searchParams);

  const where: {
    userId: string;
    plannedDate?: { gte?: Date; lte?: Date };
  } = { userId };

  if (from) where.plannedDate = { ...where.plannedDate, gte: toDateOnly(from) };
  if (to) where.plannedDate = { ...where.plannedDate, lte: toDateOnly(to) };

  const [items, total] = await Promise.all([
    prisma.plannedMeal.findMany({
      where,
      orderBy: [{ plannedDate: "asc" }, { mealSlot: "asc" }],
      skip,
      take: pageSize,
    }),
    prisma.plannedMeal.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getDayTotals(userId: string, date: string) {
  const day = toDateOnly(date);
  const items = await prisma.plannedMeal.findMany({
    where: { userId, plannedDate: day },
  });

  return {
    date,
    meals: items.length,
    calories: items.reduce((s, m) => s + m.calories, 0),
    proteinG: items.reduce((s, m) => s + (m.proteinG ?? 0), 0),
    carbsG: items.reduce((s, m) => s + (m.carbsG ?? 0), 0),
    fatG: items.reduce((s, m) => s + (m.fatG ?? 0), 0),
  };
}

export async function createPlannedMeal(
  userId: string,
  body: {
    plannedDate: string;
    mealSlot: MealSlot;
    title: string;
    description?: string | null;
    calories: number;
    proteinG?: number | null;
    carbsG?: number | null;
    fatG?: number | null;
  },
) {
  return prisma.plannedMeal.create({
    data: {
      userId,
      plannedDate: toDateOnly(body.plannedDate),
      mealSlot: body.mealSlot,
      title: body.title,
      description: body.description,
      calories: body.calories,
      proteinG: body.proteinG,
      carbsG: body.carbsG,
      fatG: body.fatG,
    },
  });
}

export async function updatePlannedMeal(
  userId: string,
  id: string,
  body: Partial<{
    plannedDate: string;
    mealSlot: MealSlot;
    title: string;
    description: string | null;
    calories: number;
    proteinG: number | null;
    carbsG: number | null;
    fatG: number | null;
  }>,
) {
  const existing = await prisma.plannedMeal.findFirst({ where: { id, userId } });
  if (!existing) return null;

  return prisma.plannedMeal.update({
    where: { id },
    data: {
      ...(body.plannedDate ? { plannedDate: toDateOnly(body.plannedDate) } : {}),
      ...(body.mealSlot ? { mealSlot: body.mealSlot } : {}),
      ...(body.title ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.calories != null ? { calories: body.calories } : {}),
      ...(body.proteinG !== undefined ? { proteinG: body.proteinG } : {}),
      ...(body.carbsG !== undefined ? { carbsG: body.carbsG } : {}),
      ...(body.fatG !== undefined ? { fatG: body.fatG } : {}),
    },
  });
}

export async function deletePlannedMeal(userId: string, id: string) {
  const removed = await prisma.plannedMeal.deleteMany({ where: { id, userId } });
  return removed.count > 0;
}

export async function calendarSummary(userId: string, from: string, to: string) {
  const items = await prisma.plannedMeal.findMany({
    where: {
      userId,
      plannedDate: { gte: toDateOnly(from), lte: toDateOnly(to) },
    },
    orderBy: [{ plannedDate: "asc" }, { mealSlot: "asc" }],
  });

  const byDate = new Map<
    string,
    { calories: number; proteinG: number; carbsG: number; fatG: number; meals: typeof items }
  >();

  for (const meal of items) {
    const key = meal.plannedDate.toISOString().slice(0, 10);
    const bucket = byDate.get(key) ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, meals: [] };
    bucket.calories += meal.calories;
    bucket.proteinG += meal.proteinG ?? 0;
    bucket.carbsG += meal.carbsG ?? 0;
    bucket.fatG += meal.fatG ?? 0;
    bucket.meals.push(meal);
    byDate.set(key, bucket);
  }

  return {
    from,
    to,
    days: [...byDate.entries()].map(([date, data]) => ({
      date,
      totals: {
        calories: data.calories,
        proteinG: data.proteinG,
        carbsG: data.carbsG,
        fatG: data.fatG,
      },
      meals: data.meals,
    })),
  };
}