import { z } from "zod";
import { prisma } from "@/lib/db";
import type { User } from "@prisma/client";
import {
  createChatCompletionWithFallback,
  OpenRouterNotConfiguredError,
} from "@/lib/integrations/openrouter/client";
import { parseModelJson } from "@/lib/integrations/openrouter/json";
import { getServerEnv, isOpenRouterConfigured } from "@/lib/env";
import { buildAiUserContext, getAiSystemPreamble } from "@/services/ai-context.service";
import {
  dailyPlanSchema,
  dailyRecommendationsSchema,
  dietPlanSchema,
  normalizeDietPlan,
  normalizeWorkoutPlan,
  workoutPlanSchema,
  type DailyPlan,
} from "@/lib/validators/ai";

const AI_PLAN_RATE_LIMIT_PER_HOUR = 30;
const AI_CHAT_RATE_LIMIT_PER_HOUR = 40;

export class AiRateLimitError extends Error {
  constructor() {
    super("RATE_LIMITED");
    this.name = "AiRateLimitError";
  }
}

export class AiResponseValidationError extends Error {
  constructor(
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AiResponseValidationError";
  }
}

const PLAN_TYPES_FOR_LIST = ["workout", "diet", "daily", "recommendations"] as const;

type SavePlanInput = {
  userId: string;
  planType: (typeof PLAN_TYPES_FOR_LIST)[number];
  plan: unknown;
  modelUsed: string;
  dayIndex?: number;
  clientRequestId?: string;
  usedFallback?: boolean;
};

async function assertPlanRateLimit(userId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.generatedPlan.count({
    where: {
      userId,
      generatedAt: { gte: since },
      planType: { in: [...PLAN_TYPES_FOR_LIST] },
    },
  });
  if (count >= AI_PLAN_RATE_LIMIT_PER_HOUR) throw new AiRateLimitError();
}

async function assertChatRateLimit(userId: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.generatedPlan.count({
    where: { userId, generatedAt: { gte: since }, planType: "chat_turn" },
  });
  if (count >= AI_CHAT_RATE_LIMIT_PER_HOUR) throw new AiRateLimitError();
}

async function findIdempotentPlan(userId: string, clientRequestId: string) {
  const since = new Date(Date.now() - 15 * 60 * 1000);
  const recent = await prisma.generatedPlan.findMany({
    where: {
      userId,
      generatedAt: { gte: since },
      planType: { in: [...PLAN_TYPES_FOR_LIST] },
    },
    orderBy: { generatedAt: "desc" },
    take: 25,
  });

  return recent.find((row) => {
    const json = row.planJson as Record<string, unknown>;
    const meta = json._meta as { clientRequestId?: string } | undefined;
    return meta?.clientRequestId === clientRequestId;
  });
}

function withMeta<T extends object>(plan: T, meta: { clientRequestId?: string; usedFallback?: boolean }) {
  return { ...plan, _meta: meta };
}

async function saveValidatedPlan(input: SavePlanInput) {
  const { userId, planType, plan, modelUsed, dayIndex, clientRequestId, usedFallback } = input;

  if (clientRequestId) {
    const existing = await findIdempotentPlan(userId, clientRequestId);
    if (existing) {
      return {
        id: existing.id,
        plan: existing.planJson,
        model: existing.model,
        generatedAt: existing.generatedAt.toISOString(),
        idempotent: true as const,
      };
    }
  }

  const created = await prisma.generatedPlan.create({
    data: {
      userId,
      model: modelUsed,
      planJson: withMeta(plan as object, { clientRequestId, usedFallback }),
      planType,
      dayIndex: dayIndex ?? 1,
    },
  });

  return {
    id: created.id,
    plan,
    model: modelUsed,
    generatedAt: created.generatedAt.toISOString(),
    idempotent: false as const,
  };
}

function parseValidated<T>(content: string, schema: z.ZodType<T>, label: string): T {
  try {
    const raw = parseModelJson(content);
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      throw new AiResponseValidationError(`${label} failed validation`, parsed.error.flatten());
    }
    return parsed.data;
  } catch (e) {
    if (e instanceof AiResponseValidationError) throw e;
    if (e instanceof z.ZodError) {
      throw new AiResponseValidationError(`${label} failed validation`, e.flatten());
    }
    throw new AiResponseValidationError(`${label} could not be parsed`, e);
  }
}

const WORKOUT_JSON_INSTRUCTIONS = `Respond with JSON only matching:
{"title","durationMinutes","warmup":[string],"exercises":[{"name","sets","reps","restSeconds?","notes?"}],"cooldown":[string]}
Use sensible restSeconds (30-180) between sets.`;

const DIET_JSON_INSTRUCTIONS = `Respond with JSON only matching:
{"title","meals":[{"name","description","calories","proteinG?","carbsG?","fatG?","quantity?"}],"totalCalories","notes?"}
Total calories must be close to the sum of meal calories.`;

export type GenerateOptions = {
  clientRequestId?: string;
  dayIndex?: number;
};

export async function generateWorkoutPlan(user: User, options?: GenerateOptions) {
  if (!isOpenRouterConfigured()) throw new OpenRouterNotConfiguredError();
  await assertPlanRateLimit(user.id);

  const context = await buildAiUserContext(user.id);
  const { content, modelUsed, usedFallback } = await createChatCompletionWithFallback({
    messages: [
      { role: "system", content: `${getAiSystemPreamble()}\nYou are a certified fitness coach.\n${WORKOUT_JSON_INSTRUCTIONS}` },
      { role: "user", content: `Athlete context (no name):\n${JSON.stringify(context)}\nGenerate a personalized workout for today.` },
    ],
    responseFormat: { type: "json_object" },
  });

  const parsed = normalizeWorkoutPlan(parseValidated(content, workoutPlanSchema, "Workout plan"));

  const saved = await saveValidatedPlan({
    userId: user.id,
    planType: "workout",
    plan: parsed,
    modelUsed,
    clientRequestId: options?.clientRequestId,
    usedFallback,
  });

  return { ...saved, plan: parsed, usedFallback };
}

export async function generateDietPlan(user: User, options?: GenerateOptions) {
  if (!isOpenRouterConfigured()) throw new OpenRouterNotConfiguredError();
  await assertPlanRateLimit(user.id);

  const context = await buildAiUserContext(user.id);
  const preferIndian = context.dietPreferences?.preferIndianCuisine;

  const { content, modelUsed, usedFallback } = await createChatCompletionWithFallback({
    messages: [
      {
        role: "system",
        content: `${getAiSystemPreamble()}\nYou are a nutrition coach.\n${DIET_JSON_INSTRUCTIONS}${
          preferIndian
            ? " Prefer practical Indian dishes (dal, roti, idli, dosa, sabzi, curry, biryani in moderation)."
            : ""
        }`,
      },
      {
        role: "user",
        content: `Athlete context (no name):\n${JSON.stringify(context)}\nGenerate a full-day diet plan.`,
      },
    ],
    responseFormat: { type: "json_object" },
  });

  const parsed = normalizeDietPlan(parseValidated(content, dietPlanSchema, "Diet plan"));

  const saved = await saveValidatedPlan({
    userId: user.id,
    planType: "diet",
    plan: parsed,
    modelUsed,
    clientRequestId: options?.clientRequestId,
    usedFallback,
  });

  return { ...saved, plan: parsed, usedFallback };
}

export async function generateDailyPlan(user: User, dayIndex = 1, options?: GenerateOptions) {
  if (!isOpenRouterConfigured()) throw new OpenRouterNotConfiguredError();
  await assertPlanRateLimit(user.id);

  const context = await buildAiUserContext(user.id);

  const { content, modelUsed, usedFallback } = await createChatCompletionWithFallback({
    messages: [
      {
        role: "system",
        content: `${getAiSystemPreamble()}\nRespond with JSON: {"dayIndex","workout":{...},"diet":{...},"tips":[string]}.\n${WORKOUT_JSON_INSTRUCTIONS}\n${DIET_JSON_INSTRUCTIONS}`,
      },
      {
        role: "user",
        content: `Athlete context:\n${JSON.stringify(context)}\nGenerate daily plan for day ${dayIndex}.`,
      },
    ],
    responseFormat: { type: "json_object" },
  });

  const raw = parseValidated(content, dailyPlanSchema, "Daily plan");
  const plan: DailyPlan = {
    ...raw,
    dayIndex,
    workout: normalizeWorkoutPlan(raw.workout),
    diet: normalizeDietPlan(raw.diet),
  };

  const saved = await saveValidatedPlan({
    userId: user.id,
    planType: "daily",
    plan,
    modelUsed,
    dayIndex,
    clientRequestId: options?.clientRequestId,
    usedFallback,
  });

  return { ...saved, plan, usedFallback };
}

export async function generateDailyRecommendations(user: User, options?: GenerateOptions) {
  if (!isOpenRouterConfigured()) throw new OpenRouterNotConfiguredError();
  await assertPlanRateLimit(user.id);

  const context = await buildAiUserContext(user.id);

  const { content, modelUsed, usedFallback } = await createChatCompletionWithFallback({
    messages: [
      {
        role: "system",
        content: `${getAiSystemPreamble()}\nRespond with JSON: {"headline","focusAreas":[string],"workoutSummary","nutritionSummary","hydrationMl?","stepsTarget?","disclaimer"}.`,
      },
      {
        role: "user",
        content: `Athlete context:\n${JSON.stringify(context)}\nGive concise actionable recommendations for today based on their logged progress.`,
      },
    ],
    responseFormat: { type: "json_object" },
  });

  const recommendations = parseValidated(content, dailyRecommendationsSchema, "Daily recommendations");

  const saved = await saveValidatedPlan({
    userId: user.id,
    planType: "recommendations",
    plan: recommendations,
    modelUsed,
    clientRequestId: options?.clientRequestId,
    usedFallback,
  });

  return { ...saved, recommendations, usedFallback };
}

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const chatBodySchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20),
  threadId: z.string().optional(),
});

export async function chatWithAssistant(user: User, body: z.infer<typeof chatBodySchema>) {
  if (!isOpenRouterConfigured()) throw new OpenRouterNotConfiguredError();
  await assertChatRateLimit(user.id);

  const parsed = chatBodySchema.parse(body);
  const context = await buildAiUserContext(user.id);

  const openRouterMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    {
      role: "system",
      content: `${getAiSystemPreamble()}\nUse the athlete context when relevant. Keep answers practical and concise.`,
    },
    { role: "user", content: `Context snapshot:\n${JSON.stringify(context)}` },
    ...parsed.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const { content, modelUsed, usedFallback } = await createChatCompletionWithFallback({
    messages: openRouterMessages,
    temperature: 0.5,
    maxTokens: 1200,
  });

  const reply = content.trim();
  if (!reply) throw new AiResponseValidationError("Empty assistant response");

  await prisma.generatedPlan.create({
    data: {
      userId: user.id,
      model: modelUsed,
      planType: "chat_turn",
      planJson: {
        threadId: parsed.threadId ?? null,
        userMessage: parsed.messages[parsed.messages.length - 1]?.content,
        replyPreview: reply.slice(0, 280),
        usedFallback,
      },
    },
  });

  return {
    reply,
    model: modelUsed,
    usedFallback,
    disclaimer: context.disclaimer,
    generatedAt: new Date().toISOString(),
  };
}

export async function getGeneratedPlan(userId: string, planId: string) {
  const plan = await prisma.generatedPlan.findFirst({
    where: { id: planId, userId, planType: { in: [...PLAN_TYPES_FOR_LIST] } },
  });
  return plan;
}

export async function deleteGeneratedPlan(userId: string, planId: string) {
  const existing = await getGeneratedPlan(userId, planId);
  if (!existing) return null;
  const removed = await prisma.generatedPlan.deleteMany({
    where: { id: planId, userId },
  });
  return removed.count > 0 ? existing : null;
}

export function stripPlanMeta(planJson: unknown): unknown {
  if (!planJson || typeof planJson !== "object") return planJson;
  const { _meta: _, ...rest } = planJson as Record<string, unknown>;
  void _;
  return rest;
}

export function getOpenRouterPublicStatus() {
  const env = getServerEnv();
  return {
    configured: isOpenRouterConfigured(env),
    keyPresent: Boolean(env.OPENROUTER_API_KEY),
    primaryModel: env.OPENROUTER_MODEL ?? null,
    fallbackModel: env.OPENROUTER_MODEL_FALLBACK ?? null,
    fallbackConfigured: Boolean(env.OPENROUTER_MODEL_FALLBACK),
  };
}