import { afterEach, describe, expect, it, vi } from "vitest";
import { runHealthCheck } from "@/lib/health/check";
import * as db from "@/lib/db";
import { resetEnvCacheForTests } from "@/lib/env";

describe("runHealthCheck", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.DATABASE_URL;
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    resetEnvCacheForTests();
  });

  it("returns degraded when Clerk or database are not ready", async () => {
    delete process.env.DATABASE_URL;
    delete process.env.CLERK_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    resetEnvCacheForTests();
    vi.spyOn(db, "checkDatabaseConnection").mockResolvedValue(false);
    const result = await runHealthCheck();
    expect(result.status).toBe("degraded");
    expect(result.checks.database.configured).toBe(false);
    expect(result.checks.clerk.configured).toBe(false);
  });

  it("can be ok when Clerk and database are ready without optional integrations", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/peakfit_v2";
    process.env.CLERK_SECRET_KEY = "sk_test";
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test";
    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
    delete process.env.OPENROUTER_API_KEY;
    resetEnvCacheForTests();
    vi.spyOn(db, "checkDatabaseConnection").mockResolvedValue(true);

    const result = await runHealthCheck();
    expect(result.status).toBe("ok");
    expect(result.checks.imageKit.configured).toBe(false);
    expect(result.checks.openRouter.keyPresent).toBe(false);
  });

  it("reports database connected when check succeeds", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/peakfit_v2";
    resetEnvCacheForTests();
    vi.spyOn(db, "checkDatabaseConnection").mockResolvedValue(true);

    const result = await runHealthCheck();
    expect(result.checks.database.connected).toBe(true);
  });
});