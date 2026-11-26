import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { handleAiRouteError } from "@/lib/api/ai-route";
import { getOpenRouterPublicStatus } from "@/services/ai.service";
import { probeOpenRouterConnectivity } from "@/lib/integrations/openrouter/client";
import { isOpenRouterConfigured } from "@/lib/env";

export async function GET(request: Request) {
  return withAuth(async () => {
    const status = getOpenRouterPublicStatus();
    const url = new URL(request.url);
    const probe = url.searchParams.get("probe") === "1";

    if (!probe) {
      return jsonSuccess({
        ...status,
        connectivity: status.configured ? "not_tested" : "not_configured",
      });
    }

    if (!isOpenRouterConfigured()) {
      return jsonError("CONFIGURATION_ERROR", "OpenRouter is not fully configured.", 503);
    }

    try {
      const result = await probeOpenRouterConnectivity();
      return jsonSuccess({
        ...status,
        connectivity: result.ok ? "ok" : "degraded",
        probe: { ok: result.ok, modelUsed: result.modelUsed, usedFallback: result.usedFallback },
      });
    } catch (e) {
      return handleAiRouteError(e);
    }
  });
}