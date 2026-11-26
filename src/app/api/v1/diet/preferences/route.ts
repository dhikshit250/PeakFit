import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { dietPreferencesSchema } from "@/lib/validators/profile";
import { getDietPreferences, upsertDietPreferences } from "@/services/preferences.service";

export async function GET() {
  return withAuth(async (user) => {
    return jsonSuccess(await getDietPreferences(user.id));
  });
}

export async function PUT(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, dietPreferencesSchema);
    if (!parsed.ok) return parsed.response;
    return jsonSuccess(await upsertDietPreferences(user, parsed.data));
  });
}