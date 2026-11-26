import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import { decimalToNumber, serializeForClient } from "@/lib/serialization/prisma-decimal";

describe("prisma decimal serialization", () => {
  it("decimalToNumber preserves null", () => {
    expect(decimalToNumber(null)).toBeNull();
    expect(decimalToNumber(undefined)).toBeNull();
  });

  it("decimalToNumber converts Decimal to number", () => {
    expect(decimalToNumber(new Decimal("72.50"))).toBe(72.5);
  });

  it("serializeForClient walks nested Prisma rows", () => {
    const input = {
      profile: {
        weightKg: new Decimal("80.25"),
        heightCm: null,
        fullName: "Test",
      },
      sessions: [
        {
          sets: [{ weightKg: new Decimal("100"), rpe: new Decimal("8.5") }],
        },
      ],
    };
    expect(serializeForClient(input)).toEqual({
      profile: {
        weightKg: 80.25,
        heightCm: null,
        fullName: "Test",
      },
      sessions: [
        {
          sets: [{ weightKg: 100, rpe: 8.5 }],
        },
      ],
    });
  });
});