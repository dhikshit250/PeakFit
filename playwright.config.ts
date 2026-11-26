import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { loadEnvLocal } from "./e2e/load-env";

loadEnvLocal();

const authFile = path.join("e2e", ".auth", "user.json");

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  timeout: 60_000,
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium-authenticated",
      testMatch: /authenticated\/.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
    },
    {
      name: "chromium",
      testIgnore: [/authenticated\//, /auth\.setup\.ts/],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});