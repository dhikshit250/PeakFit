import type { ZodSchema } from "zod";
import { jsonFromZodError } from "@/lib/api/response";

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, response: jsonFromZodError(parsed.error) };
  }
  return { ok: true as const, data: parsed.data };
}