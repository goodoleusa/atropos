import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerChatRoutes } from "./replit_integrations/chat";
import osintRoutes from "./routes/osint";
import behaviorRoutes from "./routes/behavior";
import atroposRoutes from "./routes/atropos";
import agentsRoutes from "./routes/agents";
import gameRoutes from "./routes/gameRoutes";
import adminRoutes from "./routes/adminRoutes";
import contentRoutes from "./routes/contentRoutes";
import behaviorRoutes2 from "./routes/behaviorRoutes2";
import { 
  securityHeaders, 
  appAccessGate
} from "./security";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Apply security headers to all responses
  app.use(securityHeaders);
  
  // Apply access gate (requires token in URL or valid cookie)
  app.use(appAccessGate);
  
  // Register chat routes for AI agent
  registerChatRoutes(app);
  
  // Register OSINT routes
  app.use("/api/osint", osintRoutes);
  
  // Register Atropos routes
  app.use("/api/atropos", atroposRoutes);
  
  // Register Behavior Analysis routes
  app.use("/api/behavior", behaviorRoutes);
  
  // Register Multi-Agent Analysis routes
  app.use("/api/agents", agentsRoutes);

  // Register modular route groups
  app.use(gameRoutes);
  app.use(adminRoutes);
  app.use(contentRoutes);
  app.use(behaviorRoutes2);

  return httpServer;
}
