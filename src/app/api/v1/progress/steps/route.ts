import { listHandler } from "@/lib/api/progress-route";
import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { stepsEntrySchema } from "@/lib/validators/progress";
import { stepsProgress } from "@/services/progress.service";

export const GET = listHandler({ list: stepsProgress.list });

export async function POST(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, stepsEntrySchema);
    if (!parsed.ok) return parsed.response;
    return jsonSuccess(await stepsProgress.upsert(user.id, parsed.data), { status: 201 });
  });
}