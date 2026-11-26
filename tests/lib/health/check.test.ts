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
  });

  it("returns degraded when integrations are not configured", async () => {
    const result = await runHealthCheck();
    expect(result.status).toBe("degraded");
    expect(result.checks.database.configured).toBe(false);
    expect(result.checks.clerk.configured).toBe(false);
  });

  it("reports database connected when check succeeds", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/peakfit_v2";
    resetEnvCacheForTests();
    vi.spyOn(db, "checkDatabaseConnection").mockResolvedValue(true);

    const result = await runHealthCheck();
    expect(result.checks.database.connected).toBe(true);
  });
});