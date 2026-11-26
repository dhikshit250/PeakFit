import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { userPreferencesPatchSchema } from "@/lib/validators/profile";
import { patchUserPreferences } from "@/services/profile.service";

export async function PATCH(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, userPreferencesPatchSchema);
    if (!parsed.ok) return parsed.response;
    const updated = await patchUserPreferences(user, parsed.data);
    return jsonSuccess(updated);
  });
}