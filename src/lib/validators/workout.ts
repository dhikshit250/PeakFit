import { z } from "zod";
import { WorkoutSessionSource } from "@prisma/client";

export const setLogSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).optional().nullable(),
  weightKg: z.union([z.string(), z.number()]).optional().nullable(),
  durationSec: z.number().int().min(0).optional().nullable(),
  rpe: z.union([z.string(), z.number()]).optional().nullable(),
});

export const exerciseLogSchema = z.object({
  exerciseName: z.string().min(1).max(200),
  orderIndex: z.number().int().min(0).default(0),
  sets: z.array(setLogSchema).default([]),
});

export const createWorkoutSessionSchema = z.object({
  startedAt: z.string().datetime({ offset: true }),
  endedAt: z.string().datetime({ offset: true }).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  source: z.nativeEnum(WorkoutSessionSource).optional(),
  exercises: z.array(exerciseLogSchema).default([]),
});

export const patchWorkoutSessionSchema = z.object({
  startedAt: z.string().datetime({ offset: true }).optional(),
  endedAt: z.string().datetime({ offset: true }).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const patchExerciseLogSchema = z.object({
  exerciseName: z.string().min(1).max(200).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export const patchSetLogSchema = z.object({
  setNumber: z.number().int().min(1).optional(),
  reps: z.number().int().min(0).optional().nullable(),
  weightKg: z.union([z.string(), z.number()]).optional().nullable(),
  durationSec: z.number().int().min(0).optional().nullable(),
  rpe: z.union([z.string(), z.number()]).optional().nullable(),
});