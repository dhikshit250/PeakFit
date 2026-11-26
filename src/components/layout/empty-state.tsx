import { cn } from "@/utils";
import type { LucideIcon } from "lucide-react";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 px-8 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description ? <p className="mt-2 max-w-md text-base text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}