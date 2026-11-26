import { withAuth } from "@/lib/api/with-auth";
import { jsonError } from "@/lib/api/response";
import { calorieProgress } from "@/services/progress.service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const body = await request.json();
    const row = await calorieProgress.update(user.id, id, body);
    if (!row) return jsonError("NOT_FOUND", "Entry not found", 404);
    return Response.json({ data: row });
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await calorieProgress.delete(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Entry not found", 404);
    return new Response(null, { status: 204 });
  });
}