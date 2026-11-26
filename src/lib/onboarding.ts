import { redirect } from "next/navigation";
import { getDashboardSummary } from "@/services/dashboard.service";

export async function requireOnboardingComplete(userId: string, pathname: string) {
  if (pathname.startsWith("/onboarding")) return;
  const summary = await getDashboardSummary(userId);
  if (!summary.onboardingComplete) redirect("/onboarding");
}