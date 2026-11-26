import { prisma } from "@/lib/db";
import { PersonalRecordType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type SetInput = {
  reps?: number | null;
  weightKg?: string | number | null;
};

export async function recomputePersonalRecordsFromSession(
  userId: string,
  exerciseName: string,
  sets: SetInput[],
  achievedAt: Date,
) {
  const bestWeight = sets.reduce((max, s) => {
    const w = s.weightKg != null ? Number(s.weightKg) : 0;
    return w > max ? w : max;
  }, 0);

  const bestReps = sets.reduce((max, s) => {
    const r = s.reps ?? 0;
    return r > max ? r : max;
  }, 0);

  const est1rm = sets.reduce((max, s) => {
    const w = s.weightKg != null ? Number(s.weightKg) : 0;
    const r = s.reps ?? 0;
    if (w <= 0 || r <= 0) return max;
    const e1rm = w * (1 + r / 30);
    return e1rm > max ? e1rm : max;
  }, 0);

  const updates: Array<{
    type: PersonalRecordType;
    value: number;
    unit: string;
  }> = [];

  if (bestWeight > 0) {
    updates.push({ type: PersonalRecordType.MAX_WEIGHT, value: bestWeight, unit: "kg" });
  }
  if (bestReps > 0) {
    updates.push({ type: PersonalRecordType.MAX_REPS, value: bestReps, unit: "reps" });
  }
  if (est1rm > 0) {
    updates.push({ type: PersonalRecordType.EST_1RM, value: est1rm, unit: "kg" });
  }

  for (const u of updates) {
    await upsertPr(userId, exerciseName, u.type, u.value, u.unit, achievedAt);
  }
}

async function upsertPr(
  userId: string,
  exerciseName: string,
  recordType: PersonalRecordType,
  newValue: number,
  unit: string,
  achievedAt: Date,
) {
  const existing = await prisma.personalRecord.findUnique({
    where: {
      userId_exerciseName_recordType: { userId, exerciseName, recordType },
    },
  });

  const newDecimal = new Decimal(newValue.toFixed(2));

  if (!existing || newDecimal.gt(existing.value)) {
    const previousValue = existing?.value ?? null;

    await prisma.$transaction([
      prisma.personalRecord.upsert({
        where: {
          userId_exerciseName_recordType: { userId, exerciseName, recordType },
        },
        create: {
          userId,
          exerciseName,
          recordType,
          value: newDecimal,
          unit,
          achievedAt,
        },
        update: {
          value: newDecimal,
          unit,
          achievedAt,
        },
      }),
      prisma.personalRecordHistory.create({
        data: {
          userId,
          exerciseName,
          recordType,
          previousValue,
          newValue: newDecimal,
          unit,
          achievedAt,
        },
      }),
    ]);
  }
}

export async function listPersonalRecords(userId: string) {
  return prisma.personalRecord.findMany({
    where: { userId },
    orderBy: { achievedAt: "desc" },
  });
}

export async function listPersonalRecordHistory(userId: string, exerciseName?: string) {
  return prisma.personalRecordHistory.findMany({
    where: {
      userId,
      ...(exerciseName ? { exerciseName } : {}),
    },
    orderBy: { achievedAt: "desc" },
    take: 100,
  });
}