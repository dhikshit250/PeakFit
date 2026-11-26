import { jsonError, jsonSuccess } from "@/lib/api/response";
import { runHealthCheck } from "@/lib/health/check";

export async function GET() {
  try {
    const result = await runHealthCheck();
    const status = result.status === "ok" ? 200 : 503;
    return jsonSuccess(result, { status });
  } catch (error) {
    console.error("Health check failed", error);
    return jsonError("INTERNAL_ERROR", "Health check failed", 500);
  }
}