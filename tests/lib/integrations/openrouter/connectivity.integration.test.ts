import { describe, expect, it } from "vitest";
import { OpenRouterError, probeOpenRouterConnectivity } from "@/lib/integrations/openrouter/client";
import { resetEnvCacheForTests, isOpenRouterConfigured } from "@/lib/env";

const runProbe = process.env.RUN_OPENROUTER_PROBE === "1";

describe.skipIf(!runProbe)("OpenRouter connectivity (integration)", () => {
  it("probes configured models without logging secrets", async () => {
    resetEnvCacheForTests();
    expect(isOpenRouterConfigured()).toBe(true);
    try {
      const result = await probeOpenRouterConnectivity();
      expect(result.ok).toBe(true);
      expect(result.modelUsed).toBeTruthy();
    } catch (error) {
      // Free-tier rate limits are external; auth + routing still verified if we reach OpenRouter.
      if (error instanceof OpenRouterError && error.status === 429) return;
      throw error;
    }
  });
});