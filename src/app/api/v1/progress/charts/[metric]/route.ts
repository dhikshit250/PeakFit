import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { getChartSeries } from "@/services/dashboard.service";

type Ctx = { params: Promise<{ metric: string }> };

export async function GET(request: Request, ctx: Ctx) {
  const { metric } = await ctx.params;
  const range = new URL(request.url).searchParams.get("range") ?? "7d";
  return withAuth(async (user) => {
    const allowed = ["weight", "calories", "water", "steps"];
    if (!allowed.includes(metric)) {
      return jsonError("VALIDATION_ERROR", "Unknown metric", 400);
    }
    return jsonSuccess(await getChartSeries(user.id, metric, range));
  });
}