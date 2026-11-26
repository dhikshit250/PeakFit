import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  createChatCompletion,
  createChatCompletionWithFallback,
  OpenRouterNotConfiguredError,
} from "@/lib/integrations/openrouter/client";
import { resetEnvCacheForTests } from "@/lib/env";
import { OpenRouterError } from "@/lib/integrations/openrouter/client";

describe("OpenRouter client", () => {
  beforeEach(() => {
    resetEnvCacheForTests();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_MODEL_FALLBACK;
    resetEnvCacheForTests();
  });

  it("throws when not configured", async () => {
    const savedKey = process.env.OPENROUTER_API_KEY;
    const savedModel = process.env.OPENROUTER_MODEL;
    const savedFallback = process.env.OPENROUTER_MODEL_FALLBACK;
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    delete process.env.OPENROUTER_MODEL_FALLBACK;
    resetEnvCacheForTests();
    try {
      await expect(
        createChatCompletion({ messages: [{ role: "user", content: "hi" }] }),
      ).rejects.toBeInstanceOf(OpenRouterNotConfiguredError);
    } finally {
      if (savedKey) process.env.OPENROUTER_API_KEY = savedKey;
      if (savedModel) process.env.OPENROUTER_MODEL = savedModel;
      if (savedFallback) process.env.OPENROUTER_MODEL_FALLBACK = savedFallback;
      resetEnvCacheForTests();
    }
  });

  it("uses fallback only on transient errors", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "primary-model";
    process.env.OPENROUTER_MODEL_FALLBACK = "fallback-model";
    resetEnvCacheForTests();

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: "rate limited" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          choices: [{ message: { content: "ok" } }],
          model: "fallback-model",
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const result = await createChatCompletionWithFallback({
      messages: [{ role: "user", content: "hi" }],
    });

    expect(result.usedFallback).toBe(true);
    expect(result.modelUsed).toBe("fallback-model");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not fallback on validation-shaped 400 errors", async () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "primary-model";
    process.env.OPENROUTER_MODEL_FALLBACK = "fallback-model";
    resetEnvCacheForTests();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "bad request" }),
      }),
    );

    await expect(
      createChatCompletionWithFallback({ messages: [{ role: "user", content: "hi" }] }),
    ).rejects.toBeInstanceOf(OpenRouterError);
  });
});