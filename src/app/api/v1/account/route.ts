import { z } from "zod";
import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess, jsonFromZodError } from "@/lib/api/response";
import { deleteUserAccount } from "@/services/account.service";

const deleteSchema = z.object({
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

export async function DELETE(request: Request) {
  return withAuth(async (user) => {
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
    }

    const parsed = deleteSchema.safeParse(raw);
    if (!parsed.success) return jsonFromZodError(parsed.error);

    const result = await deleteUserAccount(user);
    return jsonSuccess(result);
  });
}