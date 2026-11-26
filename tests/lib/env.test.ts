import { afterEach, describe, expect, it } from "vitest";
import {
  getServerEnv,
  isDatabaseConfigured,
  isImageKitConfigured,
  isOpenRouterConfigured,
  isOpenRouterKeyConfigured,
  resetEnvCacheForTests,
} from "@/lib/env";

describe("env", () => {
  afterEach(() => {
    resetEnvCacheForTests();
  });

  it("parses partial env without throwing", () => {
    const env = getServerEnv();
    expect(env.NODE_ENV).toBeDefined();
  });

  it("treats empty optional env strings as unset", () => {
    process.env.OPENROUTER_MODEL = "";
    process.env.CLERK_WEBHOOK_SECRET = "";
    resetEnvCacheForTests();
    const env = getServerEnv();
    expect(env.OPENROUTER_MODEL).toBeUndefined();
    expect(env.CLERK_WEBHOOK_SECRET).toBeUndefined();
    delete process.env.OPENROUTER_MODEL;
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  it("detects OpenRouter model config when key and model are set", () => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
    resetEnvCacheForTests();
    expect(isOpenRouterConfigured(getServerEnv())).toBe(false);

    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "provider/model";
    resetEnvCacheForTests();
    expect(isOpenRouterConfigured(getServerEnv())).toBe(true);
    expect(isOpenRouterKeyConfigured(getServerEnv())).toBe(true);
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
  });

  it("detects OpenRouter key without model", () => {
    process.env.OPENROUTER_API_KEY = "test-key";
    resetEnvCacheForTests();
    expect(isOpenRouterKeyConfigured(getServerEnv())).toBe(true);
    expect(isOpenRouterConfigured(getServerEnv())).toBe(false);
    delete process.env.OPENROUTER_API_KEY;
  });

  it("detects database configuration from DATABASE_URL", () => {
    delete process.env.DATABASE_URL;
    resetEnvCacheForTests();
    expect(isDatabaseConfigured(getServerEnv())).toBe(false);

    process.env.DATABASE_URL = "postgresql://localhost:5432/peakfit_v2";
    resetEnvCacheForTests();
    expect(isDatabaseConfigured(getServerEnv())).toBe(true);
    delete process.env.DATABASE_URL;
  });

  it("detects ImageKit when all three vars are set", () => {
    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
    resetEnvCacheForTests();
    expect(isImageKitConfigured(getServerEnv())).toBe(false);

    process.env.IMAGEKIT_PUBLIC_KEY = "public";
    process.env.IMAGEKIT_PRIVATE_KEY = "private";
    process.env.IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/demo";
    resetEnvCacheForTests();
    expect(isImageKitConfigured(getServerEnv())).toBe(true);

    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
  });
});