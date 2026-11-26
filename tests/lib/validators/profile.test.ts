import { describe, expect, it } from "vitest";
import { workoutPreferencesSchema, dietPreferencesSchema } from "@/lib/validators/profile";

describe("workoutPreferencesSchema", () => {
  it("applies defaults", () => {
    const parsed = workoutPreferencesSchema.parse({});
    expect(parsed.durationMinutes).toBe(45);
    expect(parsed.intensity).toBe("MODERATE");
  });
});

describe("dietPreferencesSchema", () => {
  it("accepts indian cuisine flag", () => {
    const parsed = dietPreferencesSchema.parse({ preferIndianCuisine: true });
    expect(parsed.preferIndianCuisine).toBe(true);
  });
});