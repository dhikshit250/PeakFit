import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = path.resolve(process.cwd(), "src/app/api/v1");

function collectRouteFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...collectRouteFiles(full));
    else if (entry.name === "route.ts") files.push(full);
  }
  return files;
}

describe("API security static audit", () => {
  it("requires withAuth on every route except public health", () => {
    const routes = collectRouteFiles(apiRoot);
    expect(routes.length).toBeGreaterThanOrEqual(40);

    const failures: string[] = [];
    for (const file of routes) {
      const rel = path.relative(apiRoot, file).replace(/\\/g, "/");
      const content = fs.readFileSync(file, "utf8");
      if (rel === "health/route.ts") {
        expect(content).not.toContain("withAuth");
        continue;
      }
      const authed =
        content.includes("withAuth") ||
        content.includes("listHandler") ||
        content.includes("createHandler");
      if (!authed) {
        failures.push(rel);
      }
    }
    expect(failures).toEqual([]);
  });

  it("health route does not import secrets", () => {
    const health = fs.readFileSync(path.join(apiRoot, "health/route.ts"), "utf8");
    expect(health).not.toMatch(/OPENROUTER_API_KEY/);
    expect(health).not.toMatch(/process\.env\.DATABASE_URL/);
  });
});