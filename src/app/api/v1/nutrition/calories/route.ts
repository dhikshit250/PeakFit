import { createHandler, listHandler } from "@/lib/api/progress-route";
import { calorieEntrySchema } from "@/lib/validators/progress";
import { calorieProgress } from "@/services/progress.service";

export const GET = listHandler({ list: calorieProgress.list });
export const POST = createHandler({
  schema: calorieEntrySchema,
  create: (userId, body) => calorieProgress.create(userId, body),
});