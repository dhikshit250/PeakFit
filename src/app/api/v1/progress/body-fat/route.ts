import { createHandler, listHandler } from "@/lib/api/progress-route";
import { bodyFatEntrySchema } from "@/lib/validators/progress";
import { bodyFatProgress } from "@/services/progress.service";

export const GET = listHandler({ list: bodyFatProgress.list });
export const POST = createHandler({ schema: bodyFatEntrySchema, create: bodyFatProgress.create });