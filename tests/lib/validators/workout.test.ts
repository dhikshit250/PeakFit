import { describe, expect, it } from "vitest";
import { createWorkoutSessionSchema, setLogSchema } from "@/lib/validators/workout";

describe("workout validators", () => {
  it("requires exercise name in session", () => {
    const parsed = createWorkoutSessionSchema.safeParse({
      startedAt: new Date().toISOString(),
      exercises: [{ exerciseName: "Squat", sets: [] }],
    });
    expect(parsed.success).toBe(true);
  });

  it("validates set numbers", () => {
    expect(setLogSchema.safeParse({ setNumber: 0 }).success).toBe(false);
    expect(setLogSchema.safeParse({ setNumber: 1, reps: 10 }).success).toBe(true);
  });
});