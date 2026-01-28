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

  // Send message and get AI response (streaming)
  // Rate limited: 20 messages per minute per IP
  app.post("/api/conversations/:id/messages", chatRateLimit(20, 60000), async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id as string);
      const { content, model = "meta-llama/llama-3.3-70b-instruct" } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      const chatMessages = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenRouter
      const stream = await openrouter.chat.completions.create({
        model,
        messages: chatMessages,
        stream: true,
        max_tokens: 2048,
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

