import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { jsonError } from "@/lib/api/response";
import type { User } from "@prisma/client";

type AuthedHandler = (user: User) => Promise<Response>;

export async function withAuth(handler: AuthedHandler): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return jsonError("UNAUTHORIZED", "Authentication required", 401);
  }
  return handler(user);
}