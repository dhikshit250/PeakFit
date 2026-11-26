import { describe, expect, it } from "vitest";
import { z } from "zod";
import { jsonError, jsonFromZodError, jsonSuccess } from "@/lib/api/response";

describe("api response helpers", () => {
  it("jsonSuccess wraps data", async () => {
    const res = jsonSuccess({ ok: true });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ data: { ok: true } });
  });

  it("jsonError returns structured error", async () => {
    const res = jsonError("NOT_FOUND", "Missing", 404);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("jsonFromZodError maps validation failures", async () => {
    const schema = z.object({ name: z.string().min(1) });
    const parsed = schema.safeParse({});
    if (parsed.success) throw new Error("expected failure");
    const res = jsonFromZodError(parsed.error);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});