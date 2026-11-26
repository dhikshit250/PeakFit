import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { createClientUploadAuth, ImageKitNotConfiguredError } from "@/lib/integrations/imagekit/client";

export async function POST() {
  return withAuth(async () => {
    try {
      return jsonSuccess(createClientUploadAuth());
    } catch (e) {
      if (e instanceof ImageKitNotConfiguredError) {
        return jsonError("CONFIGURATION_ERROR", e.message, 503);
      }
      throw e;
    }
  });
}