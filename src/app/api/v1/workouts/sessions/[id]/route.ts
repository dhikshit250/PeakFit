import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { patchWorkoutSessionSchema } from "@/lib/validators/workout";
import {
  deleteWorkoutSession,
  getWorkoutSession,
  patchWorkoutSession,
} from "@/services/workout.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const session = await getWorkoutSession(user.id, id);
    if (!session) return jsonError("NOT_FOUND", "Workout session not found", 404);
    return jsonSuccess(session);
  });
}

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, patchWorkoutSessionSchema);
    if (!parsed.ok) return parsed.response;
    const session = await patchWorkoutSession(user.id, id, parsed.data);
    if (!session) return jsonError("NOT_FOUND", "Workout session not found", 404);
    return jsonSuccess(session);
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await deleteWorkoutSession(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Workout session not found", 404);
    return new Response(null, { status: 204 });
  });
}