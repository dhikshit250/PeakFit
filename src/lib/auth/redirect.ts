import { getDashboardSummary } from "@/services/dashboard.service";
import { POST_AUTH_DEFAULT, sanitizeRedirectUrl } from "@/lib/auth/safe-redirect";

export { POST_AUTH_DEFAULT, isSafeRelativeRedirect, sanitizeRedirectUrl } from "@/lib/auth/safe-redirect";

/** Server-only: honor onboarding before sending users to their requested route. */
export async function resolvePostAuthDestination(
  userId: string,
  requested?: string | null,
): Promise<string> {
  const summary = await getDashboardSummary(userId);
  if (!summary.onboardingComplete) return "/onboarding";
  return sanitizeRedirectUrl(requested, POST_AUTH_DEFAULT);
}