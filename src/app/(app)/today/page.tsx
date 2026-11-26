import { AiActions } from "@/components/ai-actions";
import { GeneratedPlansList } from "@/components/generated-plans-list";
import { PageHeader } from "@/components/layout/page-header";

export default function TodayPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Today"
        description="Your daily AI plan and saved generations. Set OPENROUTER_MODEL in the environment to enable generation."
      />
      <AiActions title="Generate today's plan" />
      <GeneratedPlansList />
    </div>
  );
}