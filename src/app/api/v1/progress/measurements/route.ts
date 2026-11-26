import { createHandler, listHandler } from "@/lib/api/progress-route";
import { measurementEntrySchema } from "@/lib/validators/progress";
import { measurementProgress } from "@/services/progress.service";

export const GET = listHandler({ list: measurementProgress.list });
export const POST = createHandler({
  schema: measurementEntrySchema,
  create: (userId, body) => measurementProgress.create(userId, body),
});