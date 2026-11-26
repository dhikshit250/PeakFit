import Link from "next/link";
import { PreferencesForm } from "@/components/preferences-form";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";

export default function DietPreferencesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Diet preferences"
        description="Calorie targets, diet type, and regional cuisine settings."
        actions={
          <Link href="/diet" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Back to nutrition
          </Link>
        }
      />
      <PreferencesForm kind="diet" />
    </div>
  );
}