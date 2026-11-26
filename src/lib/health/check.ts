import { isCloudinaryConfigured, isDatabaseConfigured, isOpenRouterConfigured } from "@/lib/env";
import { checkDatabaseConnection } from "@/lib/db";

export type HealthCheckResult = {
  status: "ok" | "degraded";
  version: string;
  timestamp: string;
  checks: {
    database: { configured: boolean; connected: boolean };
    clerk: { configured: boolean };
    openRouter: { configured: boolean };
    cloudinary: { configured: boolean };
  };
};

const APP_VERSION = process.env.npm_package_version ?? "0.1.0";

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const dbConfigured = isDatabaseConfigured();
  const dbConnected = dbConfigured ? await checkDatabaseConnection() : false;

  const clerkConfigured = Boolean(
    process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  const openRouterConfigured = isOpenRouterConfigured();
  const cloudinaryConfigured = isCloudinaryConfigured();

  const degraded =
    !dbConnected || !clerkConfigured || !openRouterConfigured || !cloudinaryConfigured;

  return {
    status: degraded ? "degraded" : "ok",
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    checks: {
      database: { configured: dbConfigured, connected: dbConnected },
      clerk: { configured: clerkConfigured },
      openRouter: { configured: openRouterConfigured },
      cloudinary: { configured: cloudinaryConfigured },
    },
  };
}