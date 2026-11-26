import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess, jsonFromZodError } from "@/lib/api/response";
import { paginationMeta } from "@/lib/api/query";
import { plannedMealCreateSchema } from "@/lib/validators/meal-plan";
import { createPlannedMeal, listPlannedMeals } from "@/services/meal-plan.service";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const result = await listPlannedMeals(user.id, new URL(request.url).searchParams);
    return jsonSuccess(result.items, {
      meta: paginationMeta(result.page, result.pageSize, result.total),
    });
  });
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }
    const parsed = plannedMealCreateSchema.safeParse(raw);
    if (!parsed.success) return jsonFromZodError(parsed.error);
    const row = await createPlannedMeal(user.id, parsed.data);
    return jsonSuccess(row, { status: 201 });
  });
}