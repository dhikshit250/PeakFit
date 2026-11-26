import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthSessionRedirect } from "@/components/auth-session-redirect";
import { POST_AUTH_DEFAULT, resolvePostAuthDestination } from "@/lib/auth/redirect";

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { userId } = await auth();
  if (userId) {
    const { redirect_url } = await searchParams;
    redirect(await resolvePostAuthDestination(userId, redirect_url));
  }

  return (
    <>
      <Suspense fallback={null}>
        <AuthSessionRedirect />
      </Suspense>
      <div className="page-container flex min-h-[calc(100vh-var(--header-height))] items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold md:text-3xl">Sign in to PeakFit</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Your workouts, nutrition, and progress in one place.
          </p>
        </div>
        <SignIn
          fallbackRedirectUrl={POST_AUTH_DEFAULT}
          signUpFallbackRedirectUrl={POST_AUTH_DEFAULT}
          appearance={{
            variables: {
              colorPrimary: "oklch(0.82 0.14 85)",
              colorBackground: "oklch(0.17 0.012 260)",
            },
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-card border border-border shadow-lg rounded-xl",
            },
          }}
        />
      </div>
      </div>
    </>
  );
}