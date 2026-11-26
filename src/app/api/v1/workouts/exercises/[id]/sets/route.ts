import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { setLogSchema } from "@/lib/validators/workout";
import { addSetToExercise } from "@/services/workout.service";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const { id: exerciseLogId } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, setLogSchema);
    if (!parsed.ok) return parsed.response;
    const set = await addSetToExercise(user.id, exerciseLogId, parsed.data);
    if (!set) return jsonError("NOT_FOUND", "Exercise log not found", 404);
    return jsonSuccess(set, { status: 201 });
  });
}