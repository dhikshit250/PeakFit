import { test, expect, type APIRequestContext, type Browser } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";
import { hasE2ECredentials, loadEnvLocal } from "../load-env";
import {
  fetchProfile,
  isOnboardingComplete,
  signInWithPassword,
  type ProfilePayload,
} from "../helpers/clerk-sign-in";

loadEnvLocal();

const primaryEmail = process.env.E2E_CLERK_USER_EMAIL;
const primaryPassword = process.env.E2E_CLERK_USER_PASSWORD;
const disposableEmail = process.env.E2E_CLERK_DISPOSABLE_EMAIL;
const disposablePassword = process.env.E2E_CLERK_DISPOSABLE_PASSWORD;
const hasDisposable = Boolean(disposableEmail && disposablePassword);

test.describe("authentication redirects", () => {
  test.skip(!hasE2ECredentials(), "Set E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD in .env.local");

  test("login redirects to /dashboard when onboarding is complete", async ({ browser, request }) => {
    test.skip(!primaryEmail || !primaryPassword, "Primary E2E credentials missing");

    const profile = await fetchProfile(request);
    test.skip(
      !isOnboardingComplete(profile),
      "Primary E2E user must have fullName, goal, and weightKg set (complete onboarding)",
    );

    const context = await browser.newContext();
    const page = await context.newPage();

    await signInWithPassword(page, primaryEmail!, primaryPassword!, { fromPath: "/sign-in" });
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await context.close();
  });

  test("logged-in user visiting /sign-in is redirected away", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).not.toHaveURL(/\/sign-in(\?|$)/);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test("logged-in user visiting /sign-up is redirected away", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page).not.toHaveURL(/\/sign-up(\?|$)/);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test("signed-in user with unsafe external redirect_url is sent to a safe in-app route", async ({ page }) => {
    await page.goto("/sign-in?redirect_url=https%3A%2F%2Fevil.example%2Fsteal");
    await expect(page).not.toHaveURL(/evil\.example/);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);

    await page.goto("/sign-up?redirect_url=%2F%2Fevil.example%2Fpath");
    await expect(page).not.toHaveURL(/evil\.example/);
    await expect(page).toHaveURL(/\/(dashboard|onboarding)/);
  });

  test.describe("logged-out return URL", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("protected /workouts redirects to sign-in and preserves safe return URL", async ({ page }) => {
      await page.goto("/workouts");
      await expect(page).toHaveURL(/sign-in|accounts\.dev/, { timeout: 30_000 });

      const href = page.url();
      expect(href).toMatch(/redirect_url|return/i);
      if (href.includes("redirect_url")) {
        const url = new URL(href);
        const returnPath = url.searchParams.get("redirect_url") ?? "";
        expect(returnPath).toMatch(/\/workouts/);
      }
    });

    test("external redirect_url is not honored after password sign-in", async ({ browser }) => {
      test.skip(!primaryEmail || !primaryPassword, "Primary E2E credentials missing");

      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto(
        `/sign-in?redirect_url=${encodeURIComponent("https://evil.example/phish")}`,
      );
      await signInWithPassword(page, primaryEmail!, primaryPassword!, { fromPath: "/sign-in" });

      await expect(page).not.toHaveURL(/evil\.example/, { timeout: 30_000 });
      await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
      expect(page.url()).not.toContain("evil.example");

      await context.close();
    });
  });
});

test.describe("authentication redirects — incomplete onboarding (disposable user)", () => {
  test.skip(
    !hasDisposable,
    "Set E2E_CLERK_DISPOSABLE_EMAIL and E2E_CLERK_DISPOSABLE_PASSWORD for isolated onboarding tests",
  );

  test("login redirects to /onboarding when onboarding is incomplete", async ({ browser }) => {
    const savedProfile = await runWithDisposableSession(browser, async ({ request }) => {
      const before = await fetchProfile(request);
      await request.patch("/api/v1/profile", {
        data: { fullName: null, goal: null, weightKg: null },
      });
      return before;
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      await signInWithPassword(page, disposableEmail!, disposablePassword!, { fromPath: "/sign-in" });
      await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      await context.close();
    } finally {
      await runWithDisposableSession(browser, async ({ request }) => {
        await restoreProfile(request, savedProfile);
      });
    }
  });
});

async function runWithDisposableSession(
  browser: Browser,
  fn: (ctx: { request: APIRequestContext }) => Promise<ProfilePayload | null | undefined>,
) {
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
  const result = await fn({ request: context.request });
  await context.close();
  return result;
}

async function restoreProfile(
  request: APIRequestContext,
  snapshot: ProfilePayload | null | undefined,
) {
  if (!snapshot) return;
  await request.patch("/api/v1/profile", {
    data: {
      fullName: snapshot.fullName ?? null,
      goal: snapshot.goal ?? null,
      weightKg: snapshot.weightKg ?? null,
    },
  });
}