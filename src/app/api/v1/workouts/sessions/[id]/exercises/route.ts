import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { exerciseLogSchema } from "@/lib/validators/workout";
import { addExerciseToSession } from "@/services/workout.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id: sessionId } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, exerciseLogSchema);
    if (!parsed.ok) return parsed.response;
    const exercise = await addExerciseToSession(user.id, sessionId, parsed.data);
    if (!exercise) return jsonError("NOT_FOUND", "Workout session not found", 404);
    return jsonSuccess(exercise, { status: 201 });
  });
}