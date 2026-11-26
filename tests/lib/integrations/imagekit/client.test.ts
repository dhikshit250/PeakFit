import { describe, expect, it } from "vitest";
import { createClientUploadAuth, ImageKitNotConfiguredError } from "@/lib/integrations/imagekit/client";
import { resetEnvCacheForTests } from "@/lib/env";

describe("ImageKit client", () => {
  it("throws when not configured", () => {
    delete process.env.IMAGEKIT_PUBLIC_KEY;
    delete process.env.IMAGEKIT_PRIVATE_KEY;
    delete process.env.IMAGEKIT_URL_ENDPOINT;
    resetEnvCacheForTests();

    expect(() => createClientUploadAuth()).toThrow(ImageKitNotConfiguredError);
  });
});