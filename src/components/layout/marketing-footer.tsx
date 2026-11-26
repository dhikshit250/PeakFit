import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const product = [
  { href: "/features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assistant", label: "AI Coach" },
];

const company = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1">
          <p className="font-heading text-lg font-semibold">
            Peak<span className="text-primary">Fit</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Premium fitness technology — workouts, nutrition, progress, and AI planning in one place.
          </p>
        </div>
        <FooterColumn title="Product" links={product} />
        <FooterColumn title="Company" links={company} />
        <FooterColumn title="Legal" links={legal} />
      </div>
      <Separator />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} PeakFit. All rights reserved.</p>
        <p>Built for individual athletes — not coach dashboards.</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}