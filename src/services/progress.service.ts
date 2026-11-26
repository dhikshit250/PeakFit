import { prisma } from "@/lib/db";
import { toDate, toDecimal } from "@/lib/validators/progress";
import { parsePagination, parseDateRange } from "@/lib/api/query";

type ListDelegate = {
  findMany: (args: {
    where: { userId: string; recordedAt?: object; date?: object };
    skip: number;
    take: number;
    orderBy: Record<string, "desc">;
  }) => Promise<unknown[]>;
  count: (args: { where: { userId: string; recordedAt?: object; date?: object } }) => Promise<number>;
  dateField: "recordedAt" | "date";
};

async function listByUser(userId: string, searchParams: URLSearchParams, delegate: ListDelegate) {
  const { page, pageSize, skip } = parsePagination(searchParams);
  const range = parseDateRange(searchParams);
  const dateFilter =
    range.from || range.to
      ? {
          [delegate.dateField]: {
            ...(range.from ? { gte: range.from } : {}),
            ...(range.to ? { lte: range.to } : {}),
          },
        }
      : {};

  const where = { userId, ...dateFilter };
  const query = {
    where,
    skip,
    take: pageSize,
    orderBy: { [delegate.dateField]: "desc" as const },
  };
  const [items, total] = await Promise.all([delegate.findMany(query), delegate.count({ where })]);
  return { items, total, page, pageSize };
}

export const weightProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.weightEntry.findMany(args),
      count: (args) => prisma.weightEntry.count(args),
      dateField: "recordedAt",
    }),
  create: (
    userId: string,
    body: { recordedAt: string; weightKg: string | number; note?: string | null },
  ) =>
    prisma.weightEntry.create({
      data: {
        userId,
        recordedAt: toDate(body.recordedAt),
        weightKg: toDecimal(body.weightKg),
        note: body.note,
      },
    }),
  update: async (
    userId: string,
    id: string,
    body: Partial<{ recordedAt: string; weightKg: string | number; note?: string | null }>,
  ) => {
    const row = await prisma.weightEntry.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.weightEntry.update({
      where: { id },
      data: {
        ...(body.recordedAt ? { recordedAt: toDate(body.recordedAt) } : {}),
        ...(body.weightKg != null ? { weightKg: toDecimal(body.weightKg) } : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.weightEntry.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.weightEntry.delete({ where: { id } });
    return true;
  },
};

export const bodyFatProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.bodyFatEntry.findMany(args),
      count: (args) => prisma.bodyFatEntry.count(args),
      dateField: "recordedAt",
    }),
  create: (
    userId: string,
    body: { recordedAt: string; bodyFatPercent: string | number; note?: string | null },
  ) =>
    prisma.bodyFatEntry.create({
      data: {
        userId,
        recordedAt: toDate(body.recordedAt),
        bodyFatPercent: toDecimal(body.bodyFatPercent),
        note: body.note,
      },
    }),
  update: async (
    userId: string,
    id: string,
    body: Partial<{
      recordedAt: string;
      bodyFatPercent: string | number;
      note?: string | null;
    }>,
  ) => {
    const row = await prisma.bodyFatEntry.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.bodyFatEntry.update({
      where: { id },
      data: {
        ...(body.recordedAt ? { recordedAt: toDate(body.recordedAt) } : {}),
        ...(body.bodyFatPercent != null
          ? { bodyFatPercent: toDecimal(body.bodyFatPercent) }
          : {}),
        ...(body.note !== undefined ? { note: body.note } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.bodyFatEntry.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.bodyFatEntry.delete({ where: { id } });
    return true;
  },
};

function measurementData(body: {
  recordedAt: string | Date;
  chestCm?: string | number | null;
  waistCm?: string | number | null;
  armCm?: string | number | null;
  thighCm?: string | number | null;
  note?: string | null;
}) {
  return {
    recordedAt: toDate(body.recordedAt),
    chestCm: body.chestCm != null ? toDecimal(body.chestCm) : null,
    waistCm: body.waistCm != null ? toDecimal(body.waistCm) : null,
    armCm: body.armCm != null ? toDecimal(body.armCm) : null,
    thighCm: body.thighCm != null ? toDecimal(body.thighCm) : null,
    note: body.note,
  };
}

export const measurementProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.bodyMeasurement.findMany(args),
      count: (args) => prisma.bodyMeasurement.count(args),
      dateField: "recordedAt",
    }),
  create: (
    userId: string,
    body: Parameters<typeof measurementData>[0],
  ) => prisma.bodyMeasurement.create({ data: { userId, ...measurementData(body) } }),
  update: async (userId: string, id: string, body: Partial<Parameters<typeof measurementData>[0]>) => {
    const row = await prisma.bodyMeasurement.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.bodyMeasurement.update({
      where: { id },
      data: measurementData({
        recordedAt: body.recordedAt ?? row.recordedAt.toISOString(),
        chestCm: body.chestCm ?? (row.chestCm != null ? Number(row.chestCm) : null),
        waistCm: body.waistCm ?? (row.waistCm != null ? Number(row.waistCm) : null),
        armCm: body.armCm ?? (row.armCm != null ? Number(row.armCm) : null),
        thighCm: body.thighCm ?? (row.thighCm != null ? Number(row.thighCm) : null),
        note: body.note ?? row.note,
      }),
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.bodyMeasurement.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.bodyMeasurement.delete({ where: { id } });
    return true;
  },
};

export const calorieProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.calorieEntry.findMany(args),
      count: (args) => prisma.calorieEntry.count(args),
      dateField: "recordedAt",
    }),
  create: (userId: string, body: Record<string, unknown>) =>
    prisma.calorieEntry.create({
      data: {
        userId,
        recordedAt: toDate(body.recordedAt as string),
        type: body.type as "INTAKE" | "EXPENDITURE",
        calories: body.calories as number,
        description: body.description as string | null | undefined,
        proteinG: body.proteinG as number | null | undefined,
        carbsG: body.carbsG as number | null | undefined,
        fatG: body.fatG as number | null | undefined,
      },
    }),
  update: async (userId: string, id: string, body: Record<string, unknown>) => {
    const row = await prisma.calorieEntry.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.calorieEntry.update({
      where: { id },
      data: {
        ...(body.recordedAt ? { recordedAt: toDate(body.recordedAt as string) } : {}),
        ...(body.type ? { type: body.type as "INTAKE" | "EXPENDITURE" } : {}),
        ...(body.calories != null ? { calories: body.calories as number } : {}),
        ...(body.description !== undefined
          ? { description: body.description as string | null }
          : {}),
        ...(body.proteinG !== undefined ? { proteinG: body.proteinG as number | null } : {}),
        ...(body.carbsG !== undefined ? { carbsG: body.carbsG as number | null } : {}),
        ...(body.fatG !== undefined ? { fatG: body.fatG as number | null } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.calorieEntry.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.calorieEntry.delete({ where: { id } });
    return true;
  },
};

export const stepsProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.activityDay.findMany(args),
      count: (args) => prisma.activityDay.count(args),
      dateField: "date",
    }),
  upsert: (userId: string, body: { date: string; steps: number }) =>
    prisma.activityDay.upsert({
      where: { userId_date: { userId, date: toDate(body.date) } },
      create: { userId, date: toDate(body.date), steps: body.steps },
      update: { steps: body.steps },
    }),
  update: async (userId: string, id: string, body: { steps: number }) => {
    const row = await prisma.activityDay.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.activityDay.update({ where: { id }, data: { steps: body.steps } });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.activityDay.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.activityDay.delete({ where: { id } });
    return true;
  },
};

export const waterProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.waterEntry.findMany(args),
      count: (args) => prisma.waterEntry.count(args),
      dateField: "recordedAt",
    }),
  create: (userId: string, body: { recordedAt: string; amountMl: number }) =>
    prisma.waterEntry.create({
      data: { userId, recordedAt: toDate(body.recordedAt), amountMl: body.amountMl },
    }),
  update: async (
    userId: string,
    id: string,
    body: Partial<{ recordedAt: string; amountMl: number }>,
  ) => {
    const row = await prisma.waterEntry.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.waterEntry.update({
      where: { id },
      data: {
        ...(body.recordedAt ? { recordedAt: toDate(body.recordedAt) } : {}),
        ...(body.amountMl != null ? { amountMl: body.amountMl } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.waterEntry.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.waterEntry.delete({ where: { id } });
    return true;
  },
};

export const sleepProgress = {
  list: (userId: string, sp: URLSearchParams) =>
    listByUser(userId, sp, {
      findMany: (args) => prisma.sleepEntry.findMany(args),
      count: (args) => prisma.sleepEntry.count(args),
      dateField: "recordedAt",
    }),
  create: (
    userId: string,
    body: { recordedAt: string; durationMinutes: number; quality?: number | null },
  ) =>
    prisma.sleepEntry.create({
      data: {
        userId,
        recordedAt: toDate(body.recordedAt),
        durationMinutes: body.durationMinutes,
        quality: body.quality,
      },
    }),
  update: async (
    userId: string,
    id: string,
    body: Partial<{ recordedAt: string; durationMinutes: number; quality?: number | null }>,
  ) => {
    const row = await prisma.sleepEntry.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.sleepEntry.update({
      where: { id },
      data: {
        ...(body.recordedAt ? { recordedAt: toDate(body.recordedAt) } : {}),
        ...(body.durationMinutes != null ? { durationMinutes: body.durationMinutes } : {}),
        ...(body.quality !== undefined ? { quality: body.quality } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.sleepEntry.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.sleepEntry.delete({ where: { id } });
    return true;
  },
};

export const photoProgress = {
  list: async (userId: string, sp: URLSearchParams) => {
    const { page, pageSize, skip } = parsePagination(sp);
    const range = parseDateRange(sp);
    const where = {
      userId,
      ...(range.from || range.to
        ? {
            takenAt: {
              ...(range.from ? { gte: range.from } : {}),
              ...(range.to ? { lte: range.to } : {}),
            },
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      prisma.progressPhoto.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { takenAt: "desc" },
      }),
      prisma.progressPhoto.count({ where }),
    ]);
    return { items, total, page, pageSize };
  },
  create: (
    userId: string,
    body: {
      takenAt: string;
      imageUrl: string;
      caption?: string | null;
      cloudinaryPublicId?: string | null;
    },
  ) =>
    prisma.progressPhoto.create({
      data: {
        userId,
        takenAt: toDate(body.takenAt),
        imageUrl: body.imageUrl,
        caption: body.caption,
        cloudinaryPublicId: body.cloudinaryPublicId,
      },
    }),
  delete: async (userId: string, id: string) => {
    const row = await prisma.progressPhoto.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.progressPhoto.delete({ where: { id } });
    return true;
  },
};

export const goalsService = {
  list: (userId: string) =>
    prisma.fitnessGoal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  create: (userId: string, body: Record<string, unknown>) =>
    prisma.fitnessGoal.create({
      data: {
        userId,
        metricType: body.metricType as import("@prisma/client").GoalMetricType,
        targetValue: toDecimal(body.targetValue as string | number),
        currentValue:
          body.currentValue != null
            ? toDecimal(body.currentValue as string | number)
            : null,
        unit: body.unit as string,
        deadline: body.deadline ? toDate(body.deadline as string) : null,
        status: (body.status as import("@prisma/client").GoalStatus) ?? "ACTIVE",
        title: body.title as string | null | undefined,
      },
    }),
  update: async (userId: string, id: string, body: Record<string, unknown>) => {
    const row = await prisma.fitnessGoal.findFirst({ where: { id, userId } });
    if (!row) return null;
    return prisma.fitnessGoal.update({
      where: { id },
      data: {
        ...(body.targetValue != null
          ? { targetValue: toDecimal(body.targetValue as string | number) }
          : {}),
        ...(body.currentValue !== undefined
          ? {
              currentValue:
                body.currentValue != null
                  ? toDecimal(body.currentValue as string | number)
                  : null,
            }
          : {}),
        ...(body.status ? { status: body.status as import("@prisma/client").GoalStatus } : {}),
        ...(body.deadline !== undefined
          ? { deadline: body.deadline ? toDate(body.deadline as string) : null }
          : {}),
        ...(body.title !== undefined ? { title: body.title as string | null } : {}),
      },
    });
  },
  delete: async (userId: string, id: string) => {
    const row = await prisma.fitnessGoal.findFirst({ where: { id, userId } });
    if (!row) return false;
    await prisma.fitnessGoal.delete({ where: { id } });
    return true;
  },
  progress: async (userId: string, id: string) => {
    const goal = await prisma.fitnessGoal.findFirst({ where: { id, userId } });
    if (!goal) return null;
    const target = Number(goal.targetValue);
    const current = goal.currentValue != null ? Number(goal.currentValue) : 0;
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return { goal, percentComplete: pct };
  },
};