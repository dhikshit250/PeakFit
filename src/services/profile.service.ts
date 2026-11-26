import { prisma } from "@/lib/db";
import type { DietPreferences, User, UserProfile, WorkoutPreferences } from "@prisma/client";
import type { z } from "zod";
import type { profilePatchSchema, userPreferencesPatchSchema } from "@/lib/validators/profile";
import { serializeForClient } from "@/lib/serialization/prisma-decimal";
import { toDecimal } from "@/lib/validators/progress";

export type ClientUserProfile = Omit<UserProfile, "weightKg" | "heightCm"> & {
  weightKg: number | null;
  heightCm: number | null;
};

export type ProfileClientSnapshot = {
  user: User;
  profile: ClientUserProfile | null;
  workoutPreferences: WorkoutPreferences | null;
  dietPreferences: DietPreferences | null;
};

type ProfilePatch = z.infer<typeof profilePatchSchema>;
type UserPrefsPatch = z.infer<typeof userPreferencesPatchSchema>;

export async function getProfileSnapshot(userId: string) {
  const [user, profile, workoutPreferences, dietPreferences] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.workoutPreferences.findUnique({ where: { userId } }),
    prisma.dietPreferences.findUnique({ where: { userId } }),
  ]);

  return { user, profile, workoutPreferences, dietPreferences };
}

/** Profile snapshot with Decimal fields converted for Client Components and APIs. */
export async function getProfileClientSnapshot(userId: string): Promise<ProfileClientSnapshot> {
  const snapshot = await getProfileSnapshot(userId);
  return serializeForClient(snapshot) as ProfileClientSnapshot;
}

export async function patchProfile(user: User, body: ProfilePatch) {
  const data = {
    fullName: body.fullName,
    age: body.age,
    gender: body.gender,
    heightCm: body.heightCm != null ? toDecimal(body.heightCm) : body.heightCm,
    weightKg: body.weightKg != null ? toDecimal(body.weightKg) : body.weightKg,
    goal: body.goal,
    bio: body.bio,
    profileImageUrl: body.profileImageUrl,
  };

  return prisma.userProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  });
}

export async function patchUserPreferences(user: User, body: UserPrefsPatch) {
  return prisma.user.update({
    where: { id: user.id },
    data: {
      ...(body.timezone !== undefined ? { timezone: body.timezone } : {}),
      ...(body.unitSystem !== undefined ? { unitSystem: body.unitSystem } : {}),
    },
  });
}