import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { z } from "zod";
import { stepsProgress } from "@/services/progress.service";

const patchStepsSchema = z.object({ steps: z.number().int().min(0).max(200000) });

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, patchStepsSchema);
    if (!parsed.ok) return parsed.response;
    const row = await stepsProgress.update(user.id, id, parsed.data);
    if (!row) return jsonError("NOT_FOUND", "Entry not found", 404);
    return jsonSuccess(row);
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await stepsProgress.delete(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Entry not found", 404);
    return new Response(null, { status: 204 });
  });
}