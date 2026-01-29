import type { Express, Request, Response, NextFunction } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";

// Simple rate limiter for chat routes
const chatRateLimitStore = new Map<string, { count: number; resetTime: number }>();
const chatRateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `${clientId}:${req.path}`;
    const now = Date.now();
    
    const record = chatRateLimitStore.get(key);
    if (!record || now > record.resetTime) {
      chatRateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many chat requests. Please slow down.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }
    record.count++;
    next();
  };
};

// Support user's own OpenRouter key (full access) or Replit integration (paid models only)
// User's key unlocks ALL models including free tier without data policy restrictions
function getOpenRouterClient() {
  if (process.env.OPENROUTER_API_KEY) {
    console.log("[chat] Using user's OpenRouter API key - full model access");
    return new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        "HTTP-Referer": "https://sysadmin.corp",
        "X-Title": "SysAdmin Corp NEXUS Agent"
      }
    });
  }
  console.log("[chat] Using Replit AI Integrations - paid models recommended");
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY,
  });
}

const openrouter = getOpenRouterClient();

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation (rate limited: 30/min)
  app.post("/api/conversations", chatRateLimit(30, 60000), async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id as string);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Compress conversation context (non-streaming)
  // Rate limited: 10/min - expensive operation
  app.post("/api/chat/compress", chatRateLimit(10, 60000), async (req: Request, res: Response) => {
    try {
      const { messages, model = "meta-llama/llama-3.3-70b-instruct" } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      const response = await openrouter.chat.completions.create({
        model,
        messages: messages.map((m: any) => ({
          role: m.role || 'user',
          content: m.content
        })),
        max_tokens: 500,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content || '';
      res.json({ content, compressed: content });
    } catch (error) {
      console.error("Error compressing context:", error);
      res.status(500).json({ error: "Compression failed" });
    }
  });

  // Model Battleground - compare same prompt across multiple models
  // Rate limited: 5/min - very expensive operation
  app.post("/api/chat/battleground", chatRateLimit(5, 60000), async (req: Request, res: Response) => {
    try {
      const { prompt, systemPrompt, models } = req.body;

      if (!prompt || !models || !Array.isArray(models) || models.length < 2) {
        return res.status(400).json({ error: "Prompt and at least 2 models required" });
      }

      // Limit to 4 models max
      const targetModels = models.slice(0, 4);
      
      // Run all model requests in parallel
      const startTimes: Record<string, number> = {};
      const promises = targetModels.map(async (model: string) => {
        startTimes[model] = Date.now();
        try {
          const messages: Array<{role: string; content: string}> = [];
          if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
          }
          messages.push({ role: 'user', content: prompt });

          const response = await openrouter.chat.completions.create({
            model,
            messages: messages as any,
            max_tokens: 1024,
            temperature: 0.7,
          });

          return {
            model,
            response: response.choices[0]?.message?.content || '',
            latency: Date.now() - startTimes[model],
            success: true
          };
        } catch (error: any) {
          return {
            model,
            response: `Error: ${error.message || 'Request failed'}`,
            latency: Date.now() - startTimes[model],
            success: false
          };
        }
      });

      const results = await Promise.all(promises);
      
      // Convert to record format
      const resultsMap: Record<string, { response: string; latency: number }> = {};
      results.forEach(r => {
        resultsMap[r.model] = { response: r.response, latency: r.latency };
      });

      res.json({ results: resultsMap });
    } catch (error) {
      console.error("Error in battleground:", error);
      res.status(500).json({ error: "Battleground comparison failed" });
    }
  });

  // Send message and get AI response (streaming)
  // Rate limited: 20 messages per minute per IP
  app.post("/api/conversations/:id/messages", chatRateLimit(20, 60000), async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id as string);
      const { 
        content, 
        model = "meta-llama/llama-3.3-70b-instruct",
        context,
        temperature = 0.7,
        maxTokens = 2048
      } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Use provided context if available (includes system prompt + history)
      // Otherwise fall back to conversation history from storage
      let chatMessages: Array<{ role: string; content: string }>;
      
      if (context && Array.isArray(context) && context.length > 0) {
        // Use client-provided context with dynamic system prompt
        chatMessages = context.map((m: any) => ({
          role: m.role as "user" | "assistant" | "system",
          content: m.content,
        }));
      } else {
        // Fall back to stored messages
        const messages = await chatStorage.getMessagesByConversation(conversationId);
        chatMessages = messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));
      }

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenRouter with client-specified settings
      const stream = await openrouter.chat.completions.create({
        model,
        messages: chatMessages as any,
        stream: true,
        max_tokens: Math.min(maxTokens, 4096),
        temperature: Math.max(0, Math.min(2, temperature)),
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

