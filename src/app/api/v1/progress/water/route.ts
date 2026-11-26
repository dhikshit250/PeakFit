import { createHandler, listHandler } from "@/lib/api/progress-route";
import { waterEntrySchema } from "@/lib/validators/progress";
import { waterProgress } from "@/services/progress.service";

export const GET = listHandler({ list: waterProgress.list });
export const POST = createHandler({ schema: waterEntrySchema, create: waterProgress.create });