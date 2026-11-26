import { AiActions } from "@/components/ai-actions";
import { GeneratedPlansList } from "@/components/generated-plans-list";
import { PageHeader } from "@/components/layout/page-header";
import { AiAssistantChat } from "@/components/ai-assistant-chat";
import { AiStatusPanel } from "@/components/ai-status-panel";

export default function AssistantPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI coach"
        description="Generate plans from your profile and progress, chat with the assistant, and manage saved plans."
      />

      <div className="content-grid lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AiActions title="Generate a plan" />
          <GeneratedPlansList />
        </div>
        <div className="space-y-6">
          <AiStatusPanel />
        </div>
      </div>

      <AiAssistantChat />
    </div>
  );
}