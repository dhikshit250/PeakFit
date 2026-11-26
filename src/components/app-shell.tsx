"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/utils";
import { appNavPrimary, appNavSecondary, isNavActive } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOnboarding = pathname.startsWith("/onboarding");

  if (isOnboarding) {
    return <div className="page-container max-w-4xl">{children}</div>;
  }

  return (
    <div className="page-container flex min-h-[calc(100vh-var(--header-height))] gap-0 pb-24 lg:gap-10 lg:pb-10">
      <aside className="hidden w-[var(--sidebar-width)] shrink-0 lg:block">
        <AppSidebar pathname={pathname} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <AppSidebar pathname={pathname} mobile onNavigate={() => setMobileOpen(false)} />
        </div>
      ) : null}

      <div className="min-w-0 flex-1 space-y-8">
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <Button variant="outline" size="icon-sm" aria-expanded={mobileOpen} onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
          <span className="text-sm font-medium text-muted-foreground">PeakFit</span>
          <UserButton />
        </div>
        {children}
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-surface-elevated/95 backdrop-blur-md lg:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2 py-1.5">
          {appNavPrimary.slice(0, 5).map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2.5 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-[1.375rem]" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function AppSidebar({
  pathname,
  mobile,
  onNavigate,
}: {
  pathname: string;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav
      className={cn(
        mobile
          ? "absolute left-0 top-0 flex h-full w-80 flex-col border-r border-border bg-surface p-5 shadow-xl"
          : "sticky top-[calc(var(--header-height)+0.75rem)] flex max-h-[calc(100vh-var(--header-height)-2rem)] flex-col gap-1.5 overflow-y-auto rounded-xl border border-border/60 bg-surface/60 p-4",
      )}
    >
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Menu</p>
      {appNavPrimary.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
      <Separator className="my-2" />
      <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
      {appNavSecondary.map((item) => (
        <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
      <div className="mt-auto hidden pt-4 lg:block">
        <SidebarUserRow />
      </div>
    </nav>
  );
}

function NavLink({
  item,
  pathname,
  onNavigate,
}: {
  item: (typeof appNavPrimary)[number];
  pathname: string;
  onNavigate?: () => void;
}) {
  const active = isNavActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.9375rem] transition-colors",
        active
          ? "bg-primary/12 font-medium text-primary"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      <Icon className="size-[1.125rem] shrink-0 opacity-80" aria-hidden />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarUserRow() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-2 py-2">
      <UserButton />
      <span className="text-xs text-muted-foreground">Your account</span>
    </div>
  );
}