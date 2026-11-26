import { z } from "zod";

/**
 * Client-safe env (exposed to browser). Validated at module load in client bundles
 * only for NEXT_PUBLIC_* keys.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
});

/**
 * Server-only env. Never import getServerEnv() from client components.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  DATABASE_URL: z.string().min(1).optional(),

  CLERK_SECRET_KEY: z.string().min(1).optional(),
  CLERK_WEBHOOK_SECRET: z.string().min(1).optional(),

  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENROUTER_MODEL: z.string().min(1).optional(),
  OPENROUTER_MODEL_FALLBACK: z.string().min(1).optional(),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_APP_NAME: z.string().min(1).optional(),

  IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
  IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
  IMAGEKIT_URL_ENDPOINT: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema> & ClientEnv;

let cachedServerEnv: ServerEnv | null = null;

export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });
}

/** Parse and cache server environment. Throws if required keys missing when `strict` is true. */
/** Treat empty strings in `.env` as unset (common for optional keys). */
function normalizeEnvRecord(record: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...record };
  for (const [key, value] of Object.entries(out)) {
    if (value === "") out[key] = undefined;
  }
  return out;
}

export function getServerEnv(options?: { strict?: boolean }): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const merged = normalizeEnvRecord({
    ...process.env,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
  });

  const parsed = serverEnvSchema.merge(clientEnvSchema).safeParse(merged);

  if (!parsed.success) {
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  }

  const env = parsed.data as ServerEnv;

  if (options?.strict) {
    assertServerEnvReady(env);
  }

  cachedServerEnv = env;
  return env;
}

/** Reset cache (tests only). */
export function resetEnvCacheForTests(): void {
  cachedServerEnv = null;
}

const REQUIRED_FOR_RUNTIME: (keyof ServerEnv)[] = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
];

export function assertServerEnvReady(env: ServerEnv): void {
  const missing = REQUIRED_FOR_RUNTIME.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

/** AI generation requires API key and a model ID. */
export function isOpenRouterConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL);
}

/** OpenRouter account / key present (model may be unset until you choose one). */
export function isOpenRouterKeyConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(env.OPENROUTER_API_KEY);
}

export function isImageKitConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(
    env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT,
  );
}

export function isDatabaseConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(env.DATABASE_URL);
}