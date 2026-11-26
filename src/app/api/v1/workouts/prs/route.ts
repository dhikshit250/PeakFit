import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { listPersonalRecords } from "@/services/personal-records.service";

export async function GET() {
  return withAuth(async (user) => jsonSuccess(await listPersonalRecords(user.id)));
}