import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { paginationMeta } from "@/lib/api/query";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const url = new URL(request.url);
    const planType = url.searchParams.get("planType") ?? undefined;
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Number.parseInt(url.searchParams.get("pageSize") ?? "10", 10) || 10);

    const visibleTypes = ["workout", "diet", "daily", "recommendations"];
    const where = {
      userId: user.id,
      planType: planType ? planType : { in: visibleTypes },
    };

    const [items, total] = await Promise.all([
      prisma.generatedPlan.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.generatedPlan.count({ where }),
    ]);

    return jsonSuccess(items, { meta: paginationMeta(page, pageSize, total) });
  });
}