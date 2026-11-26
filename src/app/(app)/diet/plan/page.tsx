import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { MealPlanCalendar } from "@/components/meal-plan-calendar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export const metadata = { title: "Meal planning" };

export default function MealPlanPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Meal planning"
        description="Weekly and monthly calendar with scheduled meals and daily nutrition totals."
        actions={
          <Link href="/diet" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to nutrition
          </Link>
        }
      />
      <MealPlanCalendar />
    </div>
  );
}