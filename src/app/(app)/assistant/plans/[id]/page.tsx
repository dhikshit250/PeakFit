import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/lib/auth/ensure-user";
import { stripPlanMeta, getGeneratedPlan } from "@/services/ai.service";
import { PageHeader } from "@/components/layout/page-header";
import { PlanDetailView } from "@/components/plan-detail-view";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils";
import { DeletePlanButton } from "@/components/delete-plan-button";

type Props = { params: Promise<{ id: string }> };

export default async function AiPlanDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  if (!user) redirect("/sign-in");

  const plan = await getGeneratedPlan(user.id, id);
  if (!plan) notFound();

  const planJson = stripPlanMeta(plan.planJson);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plan detail"
        description="Validated and saved from your account — AI output is informational only."
        actions={
          <>
            <Link href="/assistant" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Back to AI coach
            </Link>
            <DeletePlanButton planId={plan.id} />
          </>
        }
      />
      <PlanDetailView
        plan={{
          id: plan.id,
          planType: plan.planType,
          model: plan.model,
          generatedAt: plan.generatedAt,
          planJson,
        }}
      />
    </div>
  );
}