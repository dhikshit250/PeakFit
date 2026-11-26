import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { parseAiClientRequest } from "@/lib/api/ai-request";
import { handleAiRouteError } from "@/lib/api/ai-route";
import { generateDietPlan } from "@/services/ai.service";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const opts = await parseAiClientRequest(request);
      const result = await generateDietPlan(user, opts);
      return jsonSuccess(result, {
        meta: {
          model: result.model,
          generatedAt: result.generatedAt,
          planId: result.id,
          usedFallback: result.usedFallback,
          idempotent: result.idempotent,
        },
      });
    } catch (e) {
      return handleAiRouteError(e);
    }
  });
}