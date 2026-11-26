import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { handleAiRouteError } from "@/lib/api/ai-route";
import { chatWithAssistant } from "@/services/ai.service";

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
  threadId: z.string().max(64).optional(),
});

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const raw = await request.json();
      const parsed = bodySchema.safeParse(raw);
      if (!parsed.success) {
        return jsonError("VALIDATION_ERROR", "Invalid chat payload", 400, parsed.error.flatten());
      }
      const result = await chatWithAssistant(user, parsed.data);
      return jsonSuccess(result, {
        meta: { model: result.model, usedFallback: result.usedFallback },
      });
    } catch (e) {
      return handleAiRouteError(e);
    }
  });
}