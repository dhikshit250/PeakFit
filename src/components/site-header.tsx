import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import { SiteHeaderUserButton } from "@/components/site-header-user-button";
import { cn } from "@/utils";

export async function SiteHeader() {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Peak<span className="text-[var(--peak-gold)]">Fit</span>
        </Link>
        <nav className="flex items-center gap-3">
          {userId ? (
            <>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Dashboard
              </Link>
              <SiteHeaderUserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}