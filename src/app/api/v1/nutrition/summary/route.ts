import { withAuth } from "@/lib/api/with-auth";
import { jsonSuccess } from "@/lib/api/response";
import { prisma } from "@/lib/db";
import { CalorieEntryType } from "@prisma/client";
import { endOfDay, startOfDay, subDays } from "@/utils/dates";

export async function GET(request: Request) {
  return withAuth(async (user) => {
    const range = new URL(request.url).searchParams.get("range") ?? "7d";
    const days = range === "30d" ? 30 : 7;
    const from = subDays(startOfDay(new Date()), days - 1);
    const to = endOfDay(new Date());

    const entries = await prisma.calorieEntry.findMany({
      where: { userId: user.id, recordedAt: { gte: from, lte: to } },
      orderBy: { recordedAt: "asc" },
    });

    const byDay = new Map<string, { intake: number; expenditure: number; proteinG: number }>();
    for (const e of entries) {
      const key = startOfDay(e.recordedAt).toISOString().slice(0, 10);
      const row = byDay.get(key) ?? { intake: 0, expenditure: 0, proteinG: 0 };
      if (e.type === CalorieEntryType.INTAKE) {
        row.intake += e.calories;
        row.proteinG += e.proteinG ?? 0;
      } else {
        row.expenditure += e.calories;
      }
      byDay.set(key, row);
    }

    return jsonSuccess({
      range,
      days: [...byDay.entries()].map(([date, totals]) => ({ date, ...totals })),
    });
  });
}