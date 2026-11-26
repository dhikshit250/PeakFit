import { withAuth } from "@/lib/api/with-auth";
import { jsonError, jsonSuccess, jsonFromZodError } from "@/lib/api/response";
import { paginationMeta } from "@/lib/api/query";
import type { ZodSchema } from "zod";

type ProgressResource<TCreate, TList> = {
  list: (userId: string, sp: URLSearchParams) => Promise<TList>;
  create?: (userId: string, body: TCreate) => Promise<unknown>;
  createSchema?: ZodSchema<TCreate>;
};

export function listHandler(resource: ProgressResource<unknown, { items: unknown[]; total: number; page: number; pageSize: number }>) {
  return (request: Request) =>
    withAuth(async (user) => {
      try {
        const result = await resource.list(user.id, new URL(request.url).searchParams);
        return jsonSuccess(result.items, {
          meta: paginationMeta(result.page, result.pageSize, result.total),
        });
      } catch (e) {
        if (e instanceof Error && e.message === "Invalid from date") {
          return jsonError("VALIDATION_ERROR", "Invalid date range", 400);
        }
        throw e;
      }
    });
}

export function createHandler<T>(resource: {
  create: (userId: string, body: T) => Promise<unknown>;
  schema: ZodSchema<T>;
}) {
  return (request: Request) =>
    withAuth(async (user) => {
      let raw: unknown;
      try {
        raw = await request.json();
      } catch {
        return jsonError("VALIDATION_ERROR", "Invalid JSON body", 400);
      }
      const parsed = resource.schema.safeParse(raw);
      if (!parsed.success) return jsonFromZodError(parsed.error);
      const row = await resource.create(user.id, parsed.data);
      return jsonSuccess(row, { status: 201 });
    });
}