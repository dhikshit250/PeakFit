import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

export async function ensureUserByClerkId(
  clerkUserId: string,
  email?: string | null,
): Promise<User> {
  return prisma.user.upsert({
    where: { clerkUserId },
    create: {
      clerkUserId,
      email: email ?? undefined,
    },
    update: {
      ...(email ? { email } : {}),
    },
  });
}

/** Resolve Clerk session to a Prisma `User` row (creates on first visit). */
export async function getAuthenticatedUser(): Promise<User | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const clerk = await currentUser();
  const email =
    clerk?.emailAddresses.find((e) => e.id === clerk.primaryEmailAddressId)
      ?.emailAddress ?? clerk?.emailAddresses[0]?.emailAddress;

  return ensureUserByClerkId(clerkUserId, email);
}