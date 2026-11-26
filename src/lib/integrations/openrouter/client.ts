import { z } from "zod";
import { getServerEnv, isOpenRouterConfigured } from "@/lib/env";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const FALLBACK_HTTP_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

export class OpenRouterError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class OpenRouterNotConfiguredError extends Error {
  constructor() {
    super("OpenRouter is not configured. Set OPENROUTER_API_KEY and OPENROUTER_MODEL.");
    this.name = "OpenRouterNotConfiguredError";
  }
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const chatCompletionResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          content: z.string().nullable().optional(),
        }),
      }),
    )
    .min(1),
  model: z.string().optional(),
});

export type OpenRouterChatOptions = {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Override env model for a single request */
  model?: string;
  responseFormat?: { type: "json_object" };
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  modelUsed: string;
  usedFallback: boolean;
  raw: unknown;
};

function logModelUsage(modelUsed: string, tier: "primary" | "fallback") {
  console.info("[openrouter]", { tier, model: modelUsed });
}

/**
 * Call OpenRouter chat completions API. Model ID must come from env or options — never hardcoded.
 */
export async function createChatCompletion(options: OpenRouterChatOptions): Promise<ChatCompletionResult> {
  const env = getServerEnv();
  if (!isOpenRouterConfigured(env)) {
    throw new OpenRouterNotConfiguredError();
  }

  const model = options.model ?? env.OPENROUTER_MODEL;
  if (!model) {
    throw new OpenRouterNotConfiguredError();
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };

  if (env.OPENROUTER_SITE_URL) headers["HTTP-Referer"] = env.OPENROUTER_SITE_URL;
  if (env.OPENROUTER_APP_NAME) headers["X-Title"] = env.OPENROUTER_APP_NAME;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: options.messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 4096,
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
    }),
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    throw new OpenRouterError(
      `OpenRouter request failed (${response.status})`,
      response.status,
      raw,
    );
  }

  const parsed = chatCompletionResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new OpenRouterError("Invalid OpenRouter response shape", response.status, raw);
  }

  const content = parsed.data.choices[0]?.message?.content ?? "";
  const resolvedModel = parsed.data.model ?? model;
  return {
    content,
    model: resolvedModel,
    modelUsed: resolvedModel,
    usedFallback: false,
    raw,
  };
}

function shouldAttemptFallback(error: unknown, primaryModel: string, fallbackModel: string | undefined) {
  if (!fallbackModel || fallbackModel === primaryModel) return false;
  if (!(error instanceof OpenRouterError)) return false;
  if (error.status == null) return true;
  return FALLBACK_HTTP_STATUSES.has(error.status);
}

/**
 * Attempt primary model, then optional fallback from OPENROUTER_MODEL_FALLBACK on transient failures.
 * Fallback model is explicitly configured in env — never silently selects a different paid tier.
 */
export async function createChatCompletionWithFallback(
  options: OpenRouterChatOptions,
): Promise<ChatCompletionResult> {
  const env = getServerEnv();
  const primary = options.model ?? env.OPENROUTER_MODEL!;
  const fallback = env.OPENROUTER_MODEL_FALLBACK;

  try {
    const result = await createChatCompletion({ ...options, model: primary });
    logModelUsage(result.modelUsed, "primary");
    return result;
  } catch (error) {
    if (!shouldAttemptFallback(error, primary, fallback)) throw error;
    logModelUsage(primary, "primary");
    console.warn("[openrouter] primary failed; using configured fallback model");
    const result = await createChatCompletion({ ...options, model: fallback! });
    logModelUsage(result.modelUsed, "fallback");
    return { ...result, usedFallback: true };
  }
}

/** Minimal probe for connectivity checks (auth required at route layer). */
export async function probeOpenRouterConnectivity(): Promise<{ ok: boolean; modelUsed?: string; usedFallback?: boolean }> {
  const result = await createChatCompletionWithFallback({
    messages: [
      { role: "system", content: "Reply with the single word: ok" },
      { role: "user", content: "ping" },
    ],
    maxTokens: 16,
    temperature: 0,
  });
  const ok = /ok/i.test(result.content.trim());
  return { ok, modelUsed: result.modelUsed, usedFallback: result.usedFallback };
}