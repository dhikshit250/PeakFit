import { withAuth } from "@/lib/api/with-auth";
import { parseJsonBody } from "@/lib/api/parse";
import { jsonSuccess } from "@/lib/api/response";
import { workoutPreferencesSchema } from "@/lib/validators/profile";
import {
  getWorkoutPreferences,
  upsertWorkoutPreferences,
} from "@/services/preferences.service";

export async function GET() {
  return withAuth(async (user) => {
    const prefs = await getWorkoutPreferences(user.id);
    return jsonSuccess(prefs);
  });
}

export async function PUT(request: Request) {
  return withAuth(async (user) => {
    const parsed = await parseJsonBody(request, workoutPreferencesSchema);
    if (!parsed.ok) return parsed.response;
    const prefs = await upsertWorkoutPreferences(user, parsed.data);
    return jsonSuccess(prefs);
  });
}