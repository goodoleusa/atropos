import OpenAI from "openai";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const CACHE_TTL_SECONDS = 86400;

interface CachedClientOptions {
  referer?: string;
  title?: string;
}

export function getOpenRouterClient(options: CachedClientOptions = {}): OpenAI {
  const {
    referer = "https://sysadmin.corp",
    title = "Atropos Platform",
  } = options;

  if (process.env.OPENROUTER_API_KEY) {
    return new OpenAI({
      baseURL: OPENROUTER_BASE_URL,
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": referer,
        "X-Title": title,
      },
    });
  }

  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL || OPENROUTER_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  });
}

export function withCache(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
  cacheKey?: string,
  ttl?: number
): OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming {
  const extra: Record<string, any> = {
    ...params,
    cache_ttl_seconds: ttl ?? CACHE_TTL_SECONDS,
  };
  if (cacheKey) {
    extra.cache_key = cacheKey;
  }
  return extra as any;
}

export function withCacheStreaming(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming,
  cacheKey?: string,
  ttl?: number
): OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming {
  const extra: Record<string, any> = {
    ...params,
    cache_ttl_seconds: ttl ?? CACHE_TTL_SECONDS,
  };
  if (cacheKey) {
    extra.cache_key = cacheKey;
  }
  return extra as any;
}

export function cachedFetch(
  model: string,
  messages: Array<{ role: string; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
    cacheKey?: string;
    cacheTtlSeconds?: number;
  } = {}
): { url: string; init: RequestInit } {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const body: Record<string, any> = {
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
    cache_ttl_seconds: options.cacheTtlSeconds ?? CACHE_TTL_SECONDS,
  };

  if (options.cacheKey) {
    body.cache_key = options.cacheKey;
  }

  return {
    url: `${OPENROUTER_BASE_URL}/chat/completions`,
    init: {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://sysadmin.corp",
        "X-Title": "Atropos Platform",
      },
      body: JSON.stringify(body),
    },
  };
}

export function logCacheStatus(response: any, label: string = "OpenRouter") {
  const usage = response?.usage;
  if (!usage) return;
  const parts: string[] = [];
  if (usage.cache_read_tokens) parts.push(`cache-read: ${usage.cache_read_tokens}`);
  if (usage.cache_write_tokens) parts.push(`cache-write: ${usage.cache_write_tokens}`);
  if (usage.prompt_tokens) parts.push(`prompt: ${usage.prompt_tokens}`);
  if (usage.completion_tokens) parts.push(`completion: ${usage.completion_tokens}`);
  if (parts.length > 0) {
    console.log(`[${label}] ${parts.join(", ")}`);
  }
}

export { OPENROUTER_BASE_URL, CACHE_TTL_SECONDS };
