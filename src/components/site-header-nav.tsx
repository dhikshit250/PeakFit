"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { publicNav } from "@/lib/navigation";

export function SiteHeaderNav() {
  return (
    <nav className="flex items-center gap-1 sm:gap-3">
      <Show when="signed-out">
        <div className="hidden items-center gap-1 md:flex">
          {publicNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-muted-foreground")}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Show>
      <Show when="signed-in">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
        >
          Dashboard
        </Link>
        <UserButton />
      </Show>
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Sign in
        </Link>
        <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
          Get started
        </Link>
      </Show>
    </nav>
  );
}