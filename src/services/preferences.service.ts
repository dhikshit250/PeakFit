import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import type { z } from "zod";
import type {
  dietPreferencesSchema,
  workoutPreferencesSchema,
} from "@/lib/validators/profile";

type WorkoutPrefs = z.infer<typeof workoutPreferencesSchema>;
type DietPrefs = z.infer<typeof dietPreferencesSchema>;

export async function getWorkoutPreferences(userId: string) {
  return prisma.workoutPreferences.findUnique({ where: { userId } });
}

export async function upsertWorkoutPreferences(user: User, body: WorkoutPrefs) {
  return prisma.workoutPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...body },
    update: body,
  });
}

export async function getDietPreferences(userId: string) {
  return prisma.dietPreferences.findUnique({ where: { userId } });
}

export async function upsertDietPreferences(user: User, body: DietPrefs) {
  return prisma.dietPreferences.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...body },
    update: body,
  });
}