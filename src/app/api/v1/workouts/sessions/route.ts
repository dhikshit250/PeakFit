import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { paginationMeta } from "@/lib/api/query";
import { createWorkoutSessionSchema } from "@/lib/validators/workout";
import { createWorkoutSession, listWorkoutSessions } from "@/services/workout.service";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    try {
      const result = await listWorkoutSessions(user.id, new URL(request.url).searchParams);
      return jsonSuccess(result.items, {
        meta: paginationMeta(result.page, result.pageSize, result.total),
      });
    } catch (e) {
      if (e instanceof Error && e.message === "INVALID_DATE_RANGE") {
        return jsonError("VALIDATION_ERROR", "Invalid date range", 400);
      }
      throw e;
    }
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, createWorkoutSessionSchema);
    if (!parsed.ok) return parsed.response;
    const session = await createWorkoutSession(user, parsed.data);
    return jsonSuccess(session, { status: 201 });
  });
}