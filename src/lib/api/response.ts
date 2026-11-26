import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { serializeForClient } from "@/lib/serialization/prisma-decimal";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "CONFIGURATION_ERROR"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiSuccessBody<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

export function jsonSuccess<T>(data: T, init?: ResponseInit & { meta?: Record<string, unknown> }) {
  const body: ApiSuccessBody<T> = {
    data: serializeForClient(data),
    ...(init?.meta ? { meta: init.meta } : {}),
  };
  if (!init?.meta) {
    return NextResponse.json(body, init);
  }
  const { meta, ...responseInit } = init;
  void meta;
  return NextResponse.json(body, responseInit);
}

export function jsonError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiErrorBody = {
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  };
  return NextResponse.json(body, { status });
}

export function jsonFromZodError(error: ZodError) {
  return jsonError("VALIDATION_ERROR", "Validation failed", 400, error.flatten());
}