import { describe, expect, it } from "vitest";
import {
  extractJsonText,
  parseModelJson,
  parseModelJsonWithSchema,
} from "@/lib/integrations/openrouter/json";
import { workoutPlanSchema } from "@/lib/validators/ai";
import { z } from "zod";

describe("OpenRouter JSON helpers", () => {
  it("extracts fenced JSON", () => {
    const text = "Here you go:\n```json\n{\"title\":\"A\",\"durationMinutes\":30,\"warmup\":[],\"exercises\":[{\"name\":\"Push\",\"sets\":3,\"reps\":\"10\"}],\"cooldown\":[]}\n```";
    const extracted = extractJsonText(text);
    expect(extracted.startsWith("{")).toBe(true);
    const parsed = parseModelJson(text);
    expect(parsed).toMatchObject({ title: "A" });
  });

  it("throws on invalid JSON", () => {
    expect(() => parseModelJson("not json")).toThrow();
  });

  it("validates schema after parse", () => {
    const content = JSON.stringify({
      title: "A",
      durationMinutes: 30,
      warmup: [],
      exercises: [{ name: "Push", sets: 3, reps: "10" }],
      cooldown: [],
    });
    const plan = parseModelJsonWithSchema(content, workoutPlanSchema);
    expect(plan.exercises).toHaveLength(1);
    expect(z.number().safeParse(plan.durationMinutes).success).toBe(true);
  });
});