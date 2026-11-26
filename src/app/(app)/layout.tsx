import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { requireOnboardingComplete } from "@/lib/onboarding";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";
  await requireOnboardingComplete(user.id, pathname);

  return <AppShell>{children}</AppShell>;
}