import { createHandler, listHandler } from "@/lib/api/progress-route";
import { progressPhotoSchema } from "@/lib/validators/progress";
import { photoProgress } from "@/services/progress.service";

export const GET = listHandler({ list: photoProgress.list });
export const POST = createHandler({ schema: progressPhotoSchema, create: photoProgress.create });