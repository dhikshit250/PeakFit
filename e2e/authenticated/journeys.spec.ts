import { test, expect } from "@playwright/test";

const hasAuth = Boolean(process.env.E2E_CLERK_USER_EMAIL && process.env.E2E_CLERK_USER_PASSWORD);

test.describe("authenticated journeys", () => {
  test.skip(!hasAuth, "E2E Clerk credentials not configured in .env.local");

  const appRoutes = [
    { path: "/onboarding", heading: /onboarding|welcome|profile/i },
    { path: "/dashboard", heading: /dashboard|welcome/i },
    { path: "/workouts", heading: /workout/i },
    { path: "/diet", heading: /nutrition/i },
    { path: "/diet/plan", heading: /meal planning/i },
    { path: "/progress", heading: /progress/i },
    { path: "/goals", heading: /goal/i },
    { path: "/assistant", heading: /ai coach/i },
    { path: "/settings", heading: /settings/i },
    { path: "/profile", heading: /profile/i },
    { path: "/today", heading: /today/i },
  ];

  for (const route of appRoutes) {
    test(`loads ${route.path}`, async ({ page }) => {
      await page.goto(route.path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("authenticated API profile returns JSON", async ({ request }) => {
    const res = await request.get("/api/v1/profile");
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });

  test("meal plan calendar API", async ({ request }) => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await request.get(`/api/v1/nutrition/meal-plans/calendar?from=${today}&to=${today}`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.data.days).toBeDefined();
  });

  test("can schedule and delete a planned meal", async ({ request }) => {
    const today = new Date().toISOString().slice(0, 10);
    const create = await request.post("/api/v1/nutrition/meal-plans", {
      data: {
        plannedDate: today,
        mealSlot: "LUNCH",
        title: "E2E test meal",
        calories: 450,
        proteinG: 30,
      },
    });
    expect(create.status()).toBe(201);
    const created = await create.json();
    const id = created.data.id as string;

    const del = await request.delete(`/api/v1/nutrition/meal-plans/${id}`);
    expect(del.status()).toBe(200);
  });
});