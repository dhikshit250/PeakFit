import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { getDashboardSummary } from "@/services/dashboard.service";

export async function GET() {
  return withAuth(async (user) => jsonSuccess(await getDashboardSummary(user.id)));
}