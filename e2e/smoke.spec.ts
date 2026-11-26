import { test, expect } from "@playwright/test";

test.describe("public smoke", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("health API returns JSON", async ({ request }) => {
    const res = await request.get("/api/v1/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data).toBeDefined();
    expect(json.data.checks).toBeDefined();
  });

  test("protected dashboard redirects unauthenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in|accounts/);
  });
});