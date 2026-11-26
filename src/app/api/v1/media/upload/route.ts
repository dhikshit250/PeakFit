import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess } from "@/lib/api/response";
import { ImageKitNotConfiguredError, uploadImageBuffer } from "@/lib/integrations/imagekit/client";

export async function POST(request: Request) {
  return withAuth(async (user) => {
    try {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonError("VALIDATION_ERROR", "Missing file field", 400);
      }
      const maxBytes = 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        return jsonError("VALIDATION_ERROR", "File exceeds 5MB limit", 400);
      }
      const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
      const mime = file.type || "application/octet-stream";
      if (!allowed.has(mime)) {
        return jsonError("VALIDATION_ERROR", "Unsupported image type", 400);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadImageBuffer(buffer, mime, {
        fileName: file.name,
        folder: `/peakfit/users/${user.id}`,
        tags: ["peakfit", user.id],
      });
      return jsonSuccess(result, { status: 201 });
    } catch (e) {
      if (e instanceof ImageKitNotConfiguredError) {
        return jsonError("CONFIGURATION_ERROR", e.message, 503);
      }
      throw e;
    }
  });
}