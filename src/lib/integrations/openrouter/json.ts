import { z } from "zod";

export class AiJsonParseError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "AiJsonParseError";
  }
}

export function extractJsonText(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) throw new AiJsonParseError("Empty model response");

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

export function parseModelJson(content: string): unknown {
  try {
    return JSON.parse(extractJsonText(content));
  } catch (error) {
    throw new AiJsonParseError("Model returned invalid JSON", error);
  }
}

export function parseModelJsonWithSchema<T>(content: string, schema: z.ZodType<T>): T {
  const raw = parseModelJson(content);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}