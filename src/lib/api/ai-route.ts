import { jsonError } from "@/lib/api/response";
import { OpenRouterError, OpenRouterNotConfiguredError } from "@/lib/integrations/openrouter/client";
import { AiJsonParseError } from "@/lib/integrations/openrouter/json";
import { AiRateLimitError, AiResponseValidationError } from "@/services/ai.service";

export function handleAiRouteError(e: unknown) {
  if (e instanceof OpenRouterNotConfiguredError) {
    return jsonError("CONFIGURATION_ERROR", e.message, 503);
  }
  if (e instanceof AiRateLimitError) {
    return jsonError("RATE_LIMITED", "AI rate limit exceeded. Try again later.", 429);
  }
  if (e instanceof AiResponseValidationError) {
    return jsonError("VALIDATION_ERROR", e.message, 422, e.details);
  }
  if (e instanceof AiJsonParseError) {
    return jsonError("VALIDATION_ERROR", e.message, 422);
  }
  if (e instanceof OpenRouterError) {
    const retryable = e.status != null && [408, 429, 500, 502, 503, 504].includes(e.status);
    return jsonError(
      retryable ? "SERVICE_UNAVAILABLE" : "INTERNAL_ERROR",
      retryable ? "AI provider temporarily unavailable. Retry shortly." : e.message,
      retryable ? 503 : 502,
    );
  }
  throw e;
}