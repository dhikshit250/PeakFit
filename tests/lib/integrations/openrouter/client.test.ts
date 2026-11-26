import { describe, expect, it } from "vitest";
import {
  createChatCompletion,
  OpenRouterNotConfiguredError,
} from "@/lib/integrations/openrouter/client";
import { resetEnvCacheForTests } from "@/lib/env";

describe("OpenRouter client", () => {
  it("throws when not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    resetEnvCacheForTests();

    await expect(
      createChatCompletion({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(OpenRouterNotConfiguredError);
  });
});