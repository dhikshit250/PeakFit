import { MarketingFooter } from "@/components/layout/marketing-footer";

export function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}