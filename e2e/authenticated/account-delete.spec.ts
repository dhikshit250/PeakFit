import { test, expect } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

const disposableEmail = process.env.E2E_CLERK_DISPOSABLE_EMAIL;
const disposablePassword = process.env.E2E_CLERK_DISPOSABLE_PASSWORD;
const hasDisposable = Boolean(disposableEmail && disposablePassword);

test.describe("account deletion (disposable user)", () => {
  test.skip(
    !hasDisposable,
    "Set E2E_CLERK_DISPOSABLE_EMAIL and E2E_CLERK_DISPOSABLE_PASSWORD for a throwaway Clerk user",
  );

  test("deletes account end-to-end", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/");
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "password",
        identifier: disposableEmail!,
        password: disposablePassword!,
      },
    });

    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: /settings/i, level: 1 })).toBeVisible();

    await page.getByLabel("Deletion confirmation").fill("DELETE MY ACCOUNT");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: /delete my account/i }).click();

    await expect(page).toHaveURL(/\/(sign-in)?$/, { timeout: 30_000 });

    await context.close();
  });
});