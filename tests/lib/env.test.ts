import { afterEach, describe, expect, it } from "vitest";
import {
  getServerEnv,
  isCloudinaryConfigured,
  isDatabaseConfigured,
  isOpenRouterConfigured,
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

  it("detects OpenRouter only when key and model are set", () => {
    const before = isOpenRouterConfigured(getServerEnv());
    expect(before).toBe(false);

    process.env.OPENROUTER_API_KEY = "test-key";
    process.env.OPENROUTER_MODEL = "provider/model";
    resetEnvCacheForTests();
    expect(isOpenRouterConfigured(getServerEnv())).toBe(true);
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_MODEL;
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

  it("detects Cloudinary when all three vars are set", () => {
    resetEnvCacheForTests();
    expect(isCloudinaryConfigured(getServerEnv())).toBe(false);

    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    resetEnvCacheForTests();
    expect(isCloudinaryConfigured(getServerEnv())).toBe(true);

    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });
});