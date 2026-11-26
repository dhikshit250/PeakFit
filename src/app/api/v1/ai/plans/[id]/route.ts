import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { deleteGeneratedPlan, getGeneratedPlan, stripPlanMeta } from "@/services/ai.service";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  return withAuth(async (user) => {
    const { id } = await params;
    const plan = await getGeneratedPlan(user.id, id);
    if (!plan) return jsonError("NOT_FOUND", "Plan not found", 404);
    return jsonSuccess({
      ...plan,
      planJson: stripPlanMeta(plan.planJson),
    });
  });
}

export async function DELETE(_request: Request, { params }: Props) {
  return withAuth(async (user) => {
    const { id } = await params;
    const deleted = await deleteGeneratedPlan(user.id, id);
    if (!deleted) return jsonError("NOT_FOUND", "Plan not found", 404);
    return jsonSuccess({ id, deleted: true });
  });
}