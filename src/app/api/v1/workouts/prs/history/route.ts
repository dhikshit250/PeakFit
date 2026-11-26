import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { listPersonalRecordHistory } from "@/services/personal-records.service";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const exercise = new URL(request.url).searchParams.get("exerciseName") ?? undefined;
    return jsonSuccess(await listPersonalRecordHistory(user.id, exercise));
  });
}