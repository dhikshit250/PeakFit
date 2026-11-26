import { z } from "zod";
import { FitnessGoalType, Gender, UnitSystem } from "@prisma/client";

const decimalString = z.union([z.string(), z.number()]).optional().nullable();

export const profilePatchSchema = z.object({
  fullName: z.string().max(200).optional().nullable(),
  age: z.number().int().min(13).max(120).optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  heightCm: decimalString,
  weightKg: decimalString,
  goal: z.nativeEnum(FitnessGoalType).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  profileImageUrl: z.string().url().optional().nullable(),
});

export const userPreferencesPatchSchema = z.object({
  timezone: z.string().min(1).max(64).optional(),
  unitSystem: z.nativeEnum(UnitSystem).optional(),
});

export const workoutPreferencesSchema = z.object({
  workoutDays: z.array(z.string()).default([]),
  restDays: z.array(z.string()).default([]),
  intensity: z.enum(["LIGHT", "MODERATE", "INTENSE"]).default("MODERATE"),
  durationMinutes: z.number().int().min(10).max(300).default(45),
  workoutType: z.string().min(1).max(120).default("Strength Training"),
  muscleGroups: z.array(z.string()).default([]),
  exercises: z.array(z.string()).default([]),
  calorieBurnGoal: z.number().int().min(0).optional().nullable(),
  equipment: z.array(z.string()).default([]),
  remindersEnabled: z.boolean().default(false),
  progressiveOverload: z.boolean().default(false),
  warmUpCoolDown: z.boolean().default(true),
});

export const dietPreferencesSchema = z.object({
  dietType: z.string().min(1).max(80).default("Balanced"),
  carbPreference: z.string().min(1).max(80).default("Moderate-carb"),
  allergies: z.string().max(500).optional().nullable(),
  mealFrequency: z.string().min(1).max(80).default("3 meals/day"),
  cheatMealsPerWeek: z.number().int().min(0).max(14).optional().nullable(),
  calorieTarget: z.number().int().min(800).max(10000).optional().nullable(),
  preferIndianCuisine: z.boolean().optional(),
});