import { prisma } from "@/lib/db";
import { CalorieEntryType } from "@prisma/client";
import { startOfDay, endOfDay, subDays } from "@/utils/dates";

export async function getDashboardSummary(userId: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const weekStart = subDays(dayStart, 6);

  const [
    profile,
    latestWeight,
    todayIntake,
    todayExpenditure,
    todayWater,
    todaySteps,
    lastSleep,
    recentSessions,
    activeGoals,
    latestPr,
  ] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.weightEntry.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.calorieEntry.aggregate({
      where: {
        userId,
        type: CalorieEntryType.INTAKE,
        recordedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { calories: true, proteinG: true, carbsG: true, fatG: true },
    }),
    prisma.calorieEntry.aggregate({
      where: {
        userId,
        type: CalorieEntryType.EXPENDITURE,
        recordedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { calories: true },
    }),
    prisma.waterEntry.aggregate({
      where: { userId, recordedAt: { gte: dayStart, lte: dayEnd } },
      _sum: { amountMl: true },
    }),
    prisma.activityDay.findUnique({
      where: {
        userId_date: { userId, date: dayStart },
      },
    }),
    prisma.sleepEntry.findFirst({
      where: { userId },
      orderBy: { recordedAt: "desc" },
    }),
    prisma.workoutSession.findMany({
      where: { userId, startedAt: { gte: weekStart } },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: { id: true, startedAt: true, notes: true, source: true },
    }),
    prisma.fitnessGoal.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.personalRecord.findFirst({
      where: { userId },
      orderBy: { achievedAt: "desc" },
    }),
  ]);

  const onboardingComplete = Boolean(
    profile?.fullName && profile.goal && profile.weightKg,
  );

  return {
    onboardingComplete,
    profile,
    latestWeight,
    nutritionToday: {
      intakeCalories: todayIntake._sum.calories ?? 0,
      expenditureCalories: todayExpenditure._sum.calories ?? 0,
      proteinG: todayIntake._sum.proteinG ?? 0,
      carbsG: todayIntake._sum.carbsG ?? 0,
      fatG: todayIntake._sum.fatG ?? 0,
    },
    hydrationTodayMl: todayWater._sum.amountMl ?? 0,
    stepsToday: todaySteps?.steps ?? null,
    lastSleep,
    workoutsThisWeek: recentSessions,
    activeGoals,
    latestPersonalRecord: latestPr,
  };
}

export async function getChartSeries(
  userId: string,
  metric: string,
  range: string,
) {
  const days = range === "1y" ? 365 : range === "90d" ? 90 : range === "30d" ? 30 : 7;
  const from = subDays(startOfDay(new Date()), days - 1);

  if (metric === "weight") {
    const rows = await prisma.weightEntry.findMany({
      where: { userId, recordedAt: { gte: from } },
      orderBy: { recordedAt: "asc" },
    });
    return rows.map((r) => ({
      at: r.recordedAt.toISOString(),
      value: Number(r.weightKg),
    }));
  }

  if (metric === "calories") {
    const rows = await prisma.calorieEntry.findMany({
      where: { userId, recordedAt: { gte: from }, type: CalorieEntryType.INTAKE },
      orderBy: { recordedAt: "asc" },
    });
    return rows.map((r) => ({
      at: r.recordedAt.toISOString(),
      value: r.calories,
    }));
  }

  if (metric === "water") {
    const rows = await prisma.waterEntry.findMany({
      where: { userId, recordedAt: { gte: from } },
      orderBy: { recordedAt: "asc" },
    });
    return rows.map((r) => ({
      at: r.recordedAt.toISOString(),
      value: r.amountMl,
    }));
  }

  if (metric === "steps") {
    const rows = await prisma.activityDay.findMany({
      where: { userId, date: { gte: from } },
      orderBy: { date: "asc" },
    });
    return rows.map((r) => ({
      at: r.date.toISOString(),
      value: r.steps,
    }));
  }

  return [];
}