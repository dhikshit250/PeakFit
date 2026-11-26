import type { Page } from "@playwright/test";
import { clerk } from "@clerk/testing/playwright";

export async function signInWithPassword(
  page: Page,
  email: string,
  password: string,
  options?: { fromPath?: string },
) {
  await page.goto(options?.fromPath ?? "/");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password,
    },
  });
}

export type ProfilePayload = {
  fullName?: string | null;
  goal?: string | null;
  weightKg?: number | null;
};

export async function fetchProfile(
  request: { get: (url: string) => Promise<{ ok: () => boolean; json: () => Promise<unknown> }> },
) {
  const res = await request.get("/api/v1/profile");
  if (!res.ok()) return null;
  const json = (await res.json()) as { data?: { profile?: ProfilePayload | null } };
  return json.data?.profile ?? null;
}

export function isOnboardingComplete(profile: ProfilePayload | null | undefined): boolean {
  return Boolean(profile?.fullName && profile?.goal && profile?.weightKg != null);
}