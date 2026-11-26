import { test, expect } from "@playwright/test";

const publicPages = ["/", "/features", "/about", "/contact", "/privacy", "/terms", "/sign-in", "/sign-up"];

const protectedApis: Array<{ method: "GET" | "POST" | "DELETE" | "PATCH" | "PUT"; path: string }> = [
  { method: "GET", path: "/api/v1/profile" },
  { method: "GET", path: "/api/v1/progress/dashboard" },
  { method: "GET", path: "/api/v1/ai/plans" },
  { method: "POST", path: "/api/v1/ai/chat" },
  { method: "POST", path: "/api/v1/workouts/sessions" },
  { method: "POST", path: "/api/v1/nutrition/calories" },
  { method: "POST", path: "/api/v1/progress/weight" },
  { method: "GET", path: "/api/v1/goals" },
];

test.describe("public site", () => {
  for (const path of publicPages) {
    test(`renders ${path}`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.ok()).toBeTruthy();
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("unauthenticated API security", () => {
  for (const api of protectedApis) {
    test(`${api.method} ${api.path} rejects unauthenticated access`, async ({ request }) => {
      const init: Parameters<typeof request.fetch>[1] = { method: api.method };
      if (api.method !== "GET") {
        init.headers = { "Content-Type": "application/json" };
        init.data = {};
      }
      const res = await request.fetch(api.path, init);
      expect(res.status()).toBe(401);
      const json = await res.json();
      expect(json.error?.code).toBe("UNAUTHORIZED");
    });
  }

  test("health is public", async ({ request }) => {
    const res = await request.get("/api/v1/health");
    expect(res.ok()).toBeTruthy();
  });
});

test.describe("protected app routes redirect", () => {
  const appRoutes = ["/dashboard", "/workouts", "/diet", "/progress", "/assistant", "/profile"];

  for (const path of appRoutes) {
    test(`${path} requires auth`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/sign-in|accounts/);
    });
  }
});