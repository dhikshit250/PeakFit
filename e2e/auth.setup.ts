import fs from "node:fs";
import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { hasE2ECredentials, loadEnvLocal } from "./load-env";

const authFile = path.join("e2e", ".auth", "user.json");

setup("authenticate test user", async ({ page }) => {
  loadEnvLocal();
  const email = process.env.E2E_CLERK_USER_EMAIL;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (!hasE2ECredentials() || !email || !password) {
    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip();
    return;
  }

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.goto("/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password,
    },
  });

  await page.goto("/dashboard");
  await expect(page).not.toHaveURL(/sign-in/);

  await page.context().storageState({ path: authFile });
});