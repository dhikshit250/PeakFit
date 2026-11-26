import { GoalsManager } from "@/components/goals-manager";
import { PageHeader } from "@/components/layout/page-header";

export default function GoalsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Goals"
        description="Set measurable targets and update progress as you log workouts and metrics."
      />
      <GoalsManager />
    </div>
  );
}