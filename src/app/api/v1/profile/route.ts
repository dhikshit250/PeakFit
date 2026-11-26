import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { profilePatchSchema } from "@/lib/validators/profile";
import { getProfileClientSnapshot, patchProfile } from "@/services/profile.service";

export async function GET() {
  return withAuth(async (user) => {
    const snapshot = await getProfileClientSnapshot(user.id);
    return jsonSuccess(snapshot);
  });
}

export async function PATCH(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, profilePatchSchema);
    if (!parsed.ok) return parsed.response;
    const profile = await patchProfile(user, parsed.data);
    return jsonSuccess(profile);
  });
}