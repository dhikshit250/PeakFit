import { Decimal } from "@prisma/client/runtime/library";

/** Convert a Prisma Decimal field to a plain number for clients; preserves null/undefined. */
export function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value == null) return null;
  return value.toNumber();
}

function isDecimal(value: unknown): value is Decimal {
  return Decimal.isDecimal(value);
}

/**
 * Recursively replace Prisma Decimal instances with numbers at server→client boundaries.
 * Does not use JSON.stringify; safe for RSC props and API payloads.
 */
export function serializeForClient<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }

  if (isDecimal(value)) {
    return decimalToNumber(value) as T;
  }

  if (value instanceof Date) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeForClient(item)) as T;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = serializeForClient(nested);
    }
    return out as T;
  }

  return value;
}