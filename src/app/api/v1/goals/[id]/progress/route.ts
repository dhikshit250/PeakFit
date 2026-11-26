import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { goalsService } from "@/services/progress.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const progress = await goalsService.progress(user.id, id);
    if (!progress) return jsonError("NOT_FOUND", "Goal not found", 404);
    return jsonSuccess(progress);
  });
}