import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { EXERCISE_LIBRARY } from "@/lib/data/exercise-library";

export async function GET(request: Request) {
  return withAuth(async () => {
    const q = new URL(request.url).searchParams.get("q")?.toLowerCase();
    const list = q
      ? EXERCISE_LIBRARY.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.muscleGroup.toLowerCase().includes(q),
        )
      : EXERCISE_LIBRARY;
    return jsonSuccess(list);
  });
}