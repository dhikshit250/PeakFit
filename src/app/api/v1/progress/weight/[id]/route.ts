import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { weightEntrySchema } from "@/lib/validators/progress";
import { weightProgress } from "@/services/progress.service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, weightEntrySchema.partial());
    if (!parsed.ok) return parsed.response;
    const row = await weightProgress.update(user.id, id, parsed.data);
    if (!row) return jsonError("NOT_FOUND", "Entry not found", 404);
    return jsonSuccess(row);
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await weightProgress.delete(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Entry not found", 404);
    return new Response(null, { status: 204 });
  });
}