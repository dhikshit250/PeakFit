import Link from "next/link";
import { SiteHeaderNav } from "@/components/site-header-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="page-container flex h-[var(--header-height)] items-center justify-between !py-0">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Peak<span className="text-[var(--peak-gold)]">Fit</span>
        </Link>
        <SiteHeaderNav />
      </div>
    </header>
  );
}