import { createHandler, listHandler } from "@/lib/api/progress-route";
import { sleepEntrySchema } from "@/lib/validators/progress";
import { sleepProgress } from "@/services/progress.service";

export const GET = listHandler({ list: sleepProgress.list });
export const POST = createHandler({ schema: sleepEntrySchema, create: sleepProgress.create });