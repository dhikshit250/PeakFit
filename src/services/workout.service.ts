import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import type { z } from "zod";
import type {
  createWorkoutSessionSchema,
  patchWorkoutSessionSchema,
  exerciseLogSchema,
  patchExerciseLogSchema,
  patchSetLogSchema,
  setLogSchema,
} from "@/lib/validators/workout";
import { recomputePersonalRecordsFromSession } from "@/services/personal-records.service";
import { toDecimal, toDate } from "@/lib/validators/progress";
import { parseDateRange, parsePagination } from "@/lib/api/query";

type CreateSession = z.infer<typeof createWorkoutSessionSchema>;
type PatchSession = z.infer<typeof patchWorkoutSessionSchema>;
type ExerciseInput = z.infer<typeof exerciseLogSchema>;
type SetInput = z.infer<typeof setLogSchema>;
type PatchExercise = z.infer<typeof patchExerciseLogSchema>;
type PatchSet = z.infer<typeof patchSetLogSchema>;

export async function listWorkoutSessions(
  userId: string,
  searchParams: URLSearchParams,
) {
  const { page, pageSize, skip } = parsePagination(searchParams);
  let range: { from?: Date; to?: Date };
  try {
    range = parseDateRange(searchParams);
  } catch {
    throw new Error("INVALID_DATE_RANGE");
  }

  const where = {
    userId,
    ...(range.from || range.to
      ? {
          startedAt: {
            ...(range.from ? { gte: range.from } : {}),
            ...(range.to ? { lte: range.to } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.workoutSession.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { startedAt: "desc" },
      include: {
        exerciseLogs: {
          orderBy: { orderIndex: "asc" },
          include: { sets: { orderBy: { setNumber: "asc" } } },
        },
      },
    }),
    prisma.workoutSession.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getWorkoutSession(userId: string, id: string) {
  return prisma.workoutSession.findFirst({
    where: { id, userId },
    include: {
      exerciseLogs: {
        orderBy: { orderIndex: "asc" },
        include: { sets: { orderBy: { setNumber: "asc" } } },
      },
    },
  });
}

export async function createWorkoutSession(user: User, body: CreateSession) {
  const startedAt = toDate(body.startedAt);
  const endedAt = body.endedAt ? toDate(body.endedAt) : null;

  const session = await prisma.workoutSession.create({
    data: {
      userId: user.id,
      startedAt,
      endedAt,
      notes: body.notes,
      source: body.source,
      exerciseLogs: {
        create: body.exercises.map((ex) => ({
          exerciseName: ex.exerciseName,
          orderIndex: ex.orderIndex,
          sets: {
            create: ex.sets.map((s) => ({
              setNumber: s.setNumber,
              reps: s.reps,
              weightKg: s.weightKg != null ? toDecimal(s.weightKg) : null,
              durationSec: s.durationSec,
              rpe: s.rpe != null ? toDecimal(s.rpe) : null,
            })),
          },
        })),
      },
    },
    include: {
      exerciseLogs: { include: { sets: true } },
    },
  });

  for (const ex of body.exercises) {
    if (ex.sets.length > 0) {
      await recomputePersonalRecordsFromSession(
        user.id,
        ex.exerciseName,
        ex.sets,
        startedAt,
      );
    }
  }

  return session;
}

export async function patchWorkoutSession(userId: string, id: string, body: PatchSession) {
  const existing = await getWorkoutSession(userId, id);
  if (!existing) return null;

  return prisma.workoutSession.update({
    where: { id },
    data: {
      ...(body.startedAt ? { startedAt: toDate(body.startedAt) } : {}),
      ...(body.endedAt !== undefined
        ? { endedAt: body.endedAt ? toDate(body.endedAt) : null }
        : {}),
      ...(body.notes !== undefined ? { notes: body.notes } : {}),
    },
    include: {
      exerciseLogs: { include: { sets: true } },
    },
  });
}

export async function deleteWorkoutSession(userId: string, id: string) {
  const existing = await prisma.workoutSession.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.workoutSession.delete({ where: { id } });
  return true;
}

export async function addExerciseToSession(
  userId: string,
  sessionId: string,
  body: ExerciseInput,
) {
  const session = await getWorkoutSession(userId, sessionId);
  if (!session) return null;

  const exercise = await prisma.exerciseLog.create({
    data: {
      sessionId,
      exerciseName: body.exerciseName,
      orderIndex: body.orderIndex,
      sets: {
        create: body.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg != null ? toDecimal(s.weightKg) : null,
          durationSec: s.durationSec,
          rpe: s.rpe != null ? toDecimal(s.rpe) : null,
        })),
      },
    },
    include: { sets: true },
  });

  if (body.sets.length > 0) {
    await recomputePersonalRecordsFromSession(
      userId,
      body.exerciseName,
      body.sets,
      session.startedAt,
    );
  }

  return exercise;
}

async function getExerciseLogForUser(userId: string, exerciseLogId: string) {
  return prisma.exerciseLog.findFirst({
    where: { id: exerciseLogId, session: { userId } },
    include: { session: true, sets: true },
  });
}

export async function patchExerciseLog(userId: string, exerciseLogId: string, body: PatchExercise) {
  const existing = await getExerciseLogForUser(userId, exerciseLogId);
  if (!existing) return null;
  return prisma.exerciseLog.update({
    where: { id: exerciseLogId },
    data: {
      ...(body.exerciseName ? { exerciseName: body.exerciseName } : {}),
      ...(body.orderIndex !== undefined ? { orderIndex: body.orderIndex } : {}),
    },
    include: { sets: true },
  });
}

export async function deleteExerciseLog(userId: string, exerciseLogId: string) {
  const existing = await getExerciseLogForUser(userId, exerciseLogId);
  if (!existing) return false;
  await prisma.exerciseLog.delete({ where: { id: exerciseLogId } });
  return true;
}

export async function addSetToExercise(userId: string, exerciseLogId: string, body: SetInput) {
  const existing = await getExerciseLogForUser(userId, exerciseLogId);
  if (!existing) return null;

  const set = await prisma.setLog.create({
    data: {
      exerciseLogId,
      setNumber: body.setNumber,
      reps: body.reps,
      weightKg: body.weightKg != null ? toDecimal(body.weightKg) : null,
      durationSec: body.durationSec,
      rpe: body.rpe != null ? toDecimal(body.rpe) : null,
    },
  });

  const setInputs = [...existing.sets, set].map((s) => ({
    reps: s.reps,
    weightKg: s.weightKg != null ? Number(s.weightKg) : null,
  }));

  await recomputePersonalRecordsFromSession(
    userId,
    existing.exerciseName,
    setInputs,
    existing.session.startedAt,
  );

  return set;
}

async function getSetForUser(userId: string, setId: string) {
  return prisma.setLog.findFirst({
    where: { id: setId, exerciseLog: { session: { userId } } },
    include: { exerciseLog: { include: { session: true, sets: true } } },
  });
}

export async function patchSetLog(userId: string, setId: string, body: PatchSet) {
  const existing = await getSetForUser(userId, setId);
  if (!existing) return null;

  const updated = await prisma.setLog.update({
    where: { id: setId },
    data: {
      ...(body.setNumber !== undefined ? { setNumber: body.setNumber } : {}),
      ...(body.reps !== undefined ? { reps: body.reps } : {}),
      ...(body.weightKg !== undefined
        ? { weightKg: body.weightKg != null ? toDecimal(body.weightKg) : null }
        : {}),
      ...(body.durationSec !== undefined ? { durationSec: body.durationSec } : {}),
      ...(body.rpe !== undefined ? { rpe: body.rpe != null ? toDecimal(body.rpe) : null } : {}),
    },
  });

  const exercise = existing.exerciseLog;
  const sets = exercise.sets.map((s) =>
    s.id === setId
      ? {
          reps: updated.reps,
          weightKg: updated.weightKg != null ? Number(updated.weightKg) : null,
        }
      : { reps: s.reps, weightKg: s.weightKg != null ? Number(s.weightKg) : null },
  );

  await recomputePersonalRecordsFromSession(
    userId,
    exercise.exerciseName,
    sets,
    exercise.session.startedAt,
  );

  return updated;
}

export async function deleteSetLog(userId: string, setId: string) {
  const existing = await getSetForUser(userId, setId);
  if (!existing) return false;
  await prisma.setLog.delete({ where: { id: setId } });
  return true;
}