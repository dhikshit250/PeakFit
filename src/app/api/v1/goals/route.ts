import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { goalSchema } from "@/lib/validators/progress";
import { goalsService } from "@/services/progress.service";

export async function GET() {
  return withAuth(async (user) => jsonSuccess(await goalsService.list(user.id)));
}

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, goalSchema);
    if (!parsed.ok) return parsed.response;
    return jsonSuccess(await goalsService.create(user.id, parsed.data), { status: 201 });
  });
}