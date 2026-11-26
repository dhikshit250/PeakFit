import { auth } from "@clerk/nextjs/server";
import { jsonError } from "@/lib/api/response";

/**
 * Resolve the Clerk user id for API route handlers.
 * Returns a NextResponse error when unauthenticated.
 */
export async function requireUserId(): Promise<string | Response> {
  const { userId } = await auth();
  if (!userId) {
    return jsonError("UNAUTHORIZED", "Authentication required", 401);
  }
  return userId;
}