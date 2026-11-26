import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
};

export function StatCard({ title, value, hint, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn("bg-card/80", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs font-medium uppercase tracking-wide md:text-[0.8125rem]">
            {title}
          </CardDescription>
          {Icon ? (
            <span className="rounded-md bg-primary/10 p-2 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
          ) : null}
        </div>
        <CardTitle className="font-heading text-3xl font-semibold tabular-nums tracking-tight md:text-4xl">
          {value}
        </CardTitle>
      </CardHeader>
      {hint ? <CardContent className="pt-0 text-sm text-muted-foreground">{hint}</CardContent> : null}
    </Card>
  );
}