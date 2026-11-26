import { createHandler, listHandler } from "@/lib/api/progress-route";
import { weightEntrySchema } from "@/lib/validators/progress";
import { weightProgress } from "@/services/progress.service";

export const GET = listHandler({
  list: weightProgress.list,
});

export const POST = createHandler({
  schema: weightEntrySchema,
  create: weightProgress.create,
});