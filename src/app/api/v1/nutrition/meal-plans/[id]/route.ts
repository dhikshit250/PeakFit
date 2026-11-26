import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess, jsonFromZodError } from "@/lib/api/response";
import { plannedMealUpdateSchema } from "@/lib/validators/meal-plan";
import { deletePlannedMeal, updatePlannedMeal } from "@/services/meal-plan.service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }
    const parsed = plannedMealUpdateSchema.safeParse(raw);
    if (!parsed.success) return jsonFromZodError(parsed.error);
    const row = await updatePlannedMeal(user.id, id, parsed.data);
    if (!row) return jsonError("NOT_FOUND", "Planned meal not found", 404);
    return jsonSuccess(row);
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  return withAuth(async (user) => {
    const ok = await deletePlannedMeal(user.id, id);
    if (!ok) return jsonError("NOT_FOUND", "Planned meal not found", 404);
    return jsonSuccess({ id, deleted: true });
  });
}