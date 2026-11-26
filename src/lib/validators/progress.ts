import { z } from "zod";
import { CalorieEntryType, GoalMetricType, GoalStatus } from "@prisma/client";

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/));

export const weightEntrySchema = z.object({
  recordedAt: isoDate,
  weightKg: z.union([z.string(), z.number()]),
  note: z.string().max(500).optional().nullable(),
});

export const bodyFatEntrySchema = z.object({
  recordedAt: isoDate,
  bodyFatPercent: z.union([z.string(), z.number()]),
  note: z.string().max(500).optional().nullable(),
});

export const measurementEntrySchema = z.object({
  recordedAt: isoDate,
  chestCm: z.union([z.string(), z.number()]).optional().nullable(),
  waistCm: z.union([z.string(), z.number()]).optional().nullable(),
  armCm: z.union([z.string(), z.number()]).optional().nullable(),
  thighCm: z.union([z.string(), z.number()]).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export const calorieEntrySchema = z.object({
  recordedAt: isoDate,
  type: z.nativeEnum(CalorieEntryType),
  calories: z.number().int().min(0).max(20000),
  description: z.string().max(500).optional().nullable(),
  proteinG: z.number().int().min(0).optional().nullable(),
  carbsG: z.number().int().min(0).optional().nullable(),
  fatG: z.number().int().min(0).optional().nullable(),
});

export const stepsEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  steps: z.number().int().min(0).max(200000),
});

export const waterEntrySchema = z.object({
  recordedAt: isoDate,
  amountMl: z.number().int().min(0).max(20000),
});

export const sleepEntrySchema = z.object({
  recordedAt: isoDate,
  durationMinutes: z.number().int().min(0).max(1440),
  quality: z.number().int().min(1).max(10).optional().nullable(),
});

export const progressPhotoSchema = z.object({
  takenAt: isoDate,
  imageUrl: z.string().url(),
  caption: z.string().max(500).optional().nullable(),
  cloudinaryPublicId: z.string().max(200).optional().nullable(),
});

export const goalSchema = z.object({
  metricType: z.nativeEnum(GoalMetricType),
  targetValue: z.union([z.string(), z.number()]),
  currentValue: z.union([z.string(), z.number()]).optional().nullable(),
  unit: z.string().min(1).max(32),
  deadline: isoDate.optional().nullable(),
  status: z.nativeEnum(GoalStatus).optional(),
  title: z.string().max(200).optional().nullable(),
});

export function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

export function toDecimal(input: string | number): string {
  return typeof input === "number" ? String(input) : input;
}