import { z } from "zod";

export const aiClientRequestSchema = z.object({
  clientRequestId: z.string().min(8).max(64).optional(),
  dayIndex: z.number().int().min(1).max(30).optional(),
});

export async function parseAiClientRequest(request: Request) {
  try {
    const raw = await request.json();
    const parsed = aiClientRequestSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    return {};
  } catch {
    return {};
  }
}