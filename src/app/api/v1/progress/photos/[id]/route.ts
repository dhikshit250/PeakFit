import { withAuth } from "@/lib/api/with-auth";
import { jsonError } from "@/lib/api/response";
import { photoProgress } from "@/services/progress.service";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await photoProgress.delete(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Photo not found", 404);
    return new Response(null, { status: 204 });
  });
}