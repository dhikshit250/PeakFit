import { z } from "zod";
import { MealSlot } from "@prisma/client";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const plannedMealCreateSchema = z.object({
  plannedDate: dateOnly,
  mealSlot: z.nativeEnum(MealSlot),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().int().min(0).max(1000).optional().nullable(),
  carbsG: z.number().int().min(0).max(1000).optional().nullable(),
  fatG: z.number().int().min(0).max(1000).optional().nullable(),
});

export const plannedMealUpdateSchema = plannedMealCreateSchema.partial();

export const mealPlanRangeSchema = z.object({
  from: dateOnly,
  to: dateOnly,
});