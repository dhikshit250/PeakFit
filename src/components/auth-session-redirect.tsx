"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { POST_AUTH_DEFAULT, sanitizeRedirectUrl } from "@/lib/auth/safe-redirect";

/**
 * Client-side safety net: after Clerk finishes sign-in (password or OAuth),
 * navigate away from auth pages when the hosted component does not redirect immediately.
 */
export function AuthSessionRedirect({ fallback = POST_AUTH_DEFAULT }: { fallback?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const requested = searchParams.get("redirect_url");
    const destination = sanitizeRedirectUrl(requested, fallback);
    router.replace(destination);
  }, [isLoaded, isSignedIn, router, searchParams, fallback]);

  return null;
}