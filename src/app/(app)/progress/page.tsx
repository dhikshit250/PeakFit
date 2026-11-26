import { ProgressHub } from "@/components/progress-hub";
import { PageHeader } from "@/components/layout/page-header";

export default function ProgressPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Progress"
        description="Weight, body composition, hydration, sleep, steps, measurements, and photos — stored in your account."
      />
      <ProgressHub />
    </div>
  );
}