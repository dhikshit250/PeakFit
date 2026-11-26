import { describe, expect, it } from "vitest";
import { isSafeRelativeRedirect, sanitizeRedirectUrl, POST_AUTH_DEFAULT } from "@/lib/auth/redirect";

describe("auth redirect helpers", () => {
  it("accepts safe relative paths", () => {
    expect(isSafeRelativeRedirect("/dashboard")).toBe(true);
    expect(isSafeRelativeRedirect("/workouts?tab=history")).toBe(true);
  });

  it("rejects external and auth-loop URLs", () => {
    expect(isSafeRelativeRedirect("https://evil.test")).toBe(false);
    expect(isSafeRelativeRedirect("//evil.test/path")).toBe(false);
    expect(isSafeRelativeRedirect("/sign-in")).toBe(false);
    expect(isSafeRelativeRedirect("/sign-up/foo")).toBe(false);
    expect(isSafeRelativeRedirect(null)).toBe(false);
  });

  it("sanitizes to fallback when unsafe", () => {
    expect(sanitizeRedirectUrl("/progress", POST_AUTH_DEFAULT)).toBe("/progress");
    expect(sanitizeRedirectUrl("https://evil.test", POST_AUTH_DEFAULT)).toBe(POST_AUTH_DEFAULT);
    expect(sanitizeRedirectUrl(undefined, "/dashboard")).toBe("/dashboard");
  });
});