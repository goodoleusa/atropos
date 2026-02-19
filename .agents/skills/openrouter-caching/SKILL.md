---
name: openrouter-caching
description: Enforce OpenRouter context caching across all AI call sites in a project. Use when setting up OpenRouter API calls, adding new AI features, or optimizing token costs for any project using OpenRouter as an LLM provider.
---

# OpenRouter Context Caching

Centralize all OpenRouter API calls through a single cached client utility to reduce token costs and enforce consistent caching behavior.

## When to Use

- Setting up a new project that uses OpenRouter
- Adding AI features that call OpenRouter
- Optimizing token costs on an existing project
- Any time you see scattered `getOpenRouterClient()` or direct `fetch("https://openrouter.ai/api/v1/...")` calls

## Architecture

Create `server/lib/openrouterClient.ts` that exports:

1. `getOpenRouterClient(options)` — returns an OpenAI SDK instance pointed at OpenRouter
2. `withCache(params, cacheKey?, ttl?)` — wraps non-streaming `chat.completions.create` params to inject `cache_key` and `cache_ttl_seconds`
3. `withCacheStreaming(params, cacheKey?, ttl?)` — same for streaming calls
4. `cachedFetch(model, messages, options)` — for raw fetch calls with cache params baked in
5. `logCacheStatus(response, label)` — logs cache hit/miss from response usage

## Usage Patterns

### SDK non-streaming (most common)
```typescript
import { getOpenRouterClient, withCache, logCacheStatus } from '../lib/openrouterClient';

const client = getOpenRouterClient({ title: "My Feature" });

const response = await client.chat.completions.create(withCache({
  model: "google/gemini-2.5-flash",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  max_tokens: 2048,
}, 'my-feature-cache-key'));

logCacheStatus(response, 'my-feature');
```

### SDK streaming
```typescript
import { getOpenRouterClient, withCacheStreaming } from '../lib/openrouterClient';

const client = getOpenRouterClient({ title: "Chat" });

const stream = await client.chat.completions.create(withCacheStreaming({
  model,
  messages: chatMessages as any,
  stream: true,
  max_tokens: 2048,
  temperature: 0.7,
}, 'nexus-chat'));
```

### Raw fetch (when SDK won't work)
```typescript
import { cachedFetch } from '../lib/openrouterClient';

const { url, init } = cachedFetch(model, messages, {
  temperature: 0.5,
  max_tokens: 2000,
  cacheKey: `agent-${agentId}`,
});

const response = await fetch(url, init);
```

## Migration Checklist

1. Create `server/lib/openrouterClient.ts` with all exports above
2. Find all call sites: `grep -r "openrouter\|chat/completions\|new OpenAI(" server/`
3. Replace per-file `getOpenRouterClient()` with import from centralized module
4. Wrap every `client.chat.completions.create({...})` with `withCache({...}, 'key')` or `withCacheStreaming({...}, 'key')`
5. Replace direct `fetch("https://openrouter.ai/...")` calls with `cachedFetch()`
6. Add `logCacheStatus(response, 'label')` after non-streaming responses
7. Keep `import OpenAI from 'openai'` if the file uses `OpenAI.Chat.Completions.*` types
8. Restart and verify no errors

## Cache Key Strategy

- Use descriptive keys per feature area: `'nexus-chat'`, `'agent-vulnAnalyst'`, `'curriculum-gen'`, `'memory'`
- Agent calls: use `'agent-' + agent.id` so each agent's system prompt caches separately
- Default TTL is 86400s (24h); override with third parameter to `withCache`

## Key Points

- OpenRouter passes cache params to underlying providers (Anthropic, OpenAI, Google)
- `cache_key` groups related requests so repeated system prompts hit the cache
- `cache_ttl_seconds` controls how long cached context lives
- Check `response.usage.cache_read_tokens` / `cache_write_tokens` to verify caching
- Not all models support caching — free-tier models may not benefit
- The `logCacheStatus` helper prints cache metrics to server console for monitoring
