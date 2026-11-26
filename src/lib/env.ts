import { z } from "zod";

/**
 * Client-safe env (exposed to browser). Validated at module load in client bundles
 * only for NEXT_PUBLIC_* keys.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
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

  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema> & ClientEnv;

let cachedServerEnv: ServerEnv | null = null;

export function getClientEnv(): ClientEnv {
  return clientEnvSchema.parse({
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
}

/** Parse and cache server environment. Throws if required keys missing when `strict` is true. */
export function getServerEnv(options?: { strict?: boolean }): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;

  const merged = {
    ...process.env,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };

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

export function isOpenRouterConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL);
}

export function isCloudinaryConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
  );
}

export function isDatabaseConfigured(env: ServerEnv = getServerEnv()): boolean {
  return Boolean(env.DATABASE_URL);
}