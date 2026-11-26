import Link from "next/link";
import { PreferencesForm } from "@/components/preferences-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export default function WorkoutPreferencesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Workout preferences"
        description="Default duration, training style, and intensity for AI and logging."
        actions={
          <Link href="/workouts" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to workouts
          </Link>
        }
      />
      <PreferencesForm kind="workout" />
    </div>
  );
}