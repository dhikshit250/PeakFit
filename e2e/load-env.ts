import fs from "node:fs";
import path from "node:path";

export function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

export function hasE2ECredentials() {
  return Boolean(process.env.E2E_CLERK_USER_EMAIL && process.env.E2E_CLERK_USER_PASSWORD);
}

export function hasDisposableE2ECredentials() {
  return Boolean(process.env.E2E_CLERK_DISPOSABLE_EMAIL && process.env.E2E_CLERK_DISPOSABLE_PASSWORD);
}