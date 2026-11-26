import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { mealPlanRangeSchema } from "@/lib/validators/meal-plan";
import { calendarSummary } from "@/services/meal-plan.service";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const url = new URL(request.url);
    const parsed = mealPlanRangeSchema.safeParse({
      from: url.searchParams.get("from"),
      to: url.searchParams.get("to"),
    });
    if (!parsed.success) {
      return jsonError("VALIDATION_ERROR", "from and to (YYYY-MM-DD) are required", 400);
    }
    const data = await calendarSummary(user.id, parsed.data.from, parsed.data.to);
    return jsonSuccess(data);
  });
}