import { describe, expect, it } from "vitest";
import { stripPlanMeta } from "@/services/ai.service";

describe("AI service utilities", () => {
  it("strips internal meta from saved plans", () => {
    const cleaned = stripPlanMeta({
      title: "Workout",
      _meta: { clientRequestId: "abc" },
    });
    expect(cleaned).toEqual({ title: "Workout" });
  });
});