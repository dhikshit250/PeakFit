import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";

function isTestClerkId(clerkUserId: string) {
  return clerkUserId.startsWith("test-") || clerkUserId.startsWith("qa-");
}

/**
 * Deletes all application data for the user, then the Clerk account when applicable.
 * Uses DB-first ordering so a Clerk failure leaves recoverable state minimal.
 */
export async function deleteUserAccount(user: User) {
  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id: user.id } });
  });

  if (isTestClerkId(user.clerkUserId)) {
    return { deleted: true, clerkDeleted: false, reason: "test_user_skipped_clerk" as const };
  }

  try {
    const client = await clerkClient();
    await client.users.deleteUser(user.clerkUserId);
    return { deleted: true, clerkDeleted: true };
  } catch (error) {
    return {
      deleted: true,
      clerkDeleted: false,
      reason: "clerk_delete_failed",
      message: error instanceof Error ? error.message : "Unknown Clerk error",
    };
  }
}