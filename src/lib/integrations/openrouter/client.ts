import { z } from "zod";
import { getServerEnv, isOpenRouterConfigured } from "@/lib/env";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

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

/**
 * Call OpenRouter chat completions API. Model ID must come from env or options — never hardcoded.
 */
export async function createChatCompletion(options: OpenRouterChatOptions) {
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
  return {
    content,
    model: parsed.data.model ?? model,
    raw,
  };
}

/**
 * Attempt primary model, then optional fallback from OPENROUTER_MODEL_FALLBACK.
 */
export async function createChatCompletionWithFallback(options: OpenRouterChatOptions) {
  const env = getServerEnv();
  try {
    return await createChatCompletion(options);
  } catch (error) {
    const fallback = env.OPENROUTER_MODEL_FALLBACK;
    if (!fallback || options.model === fallback) throw error;
    return await createChatCompletion({ ...options, model: fallback });
  }
}