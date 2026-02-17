// TEMPLATE: Route Registration
// Each domain has its own route file. Register them all here.
// This replaces a single monolithic routes.ts file.

import type { Express } from "express";
import { createServer, type Server } from "http";
import coreRoutes from "./core";
import campaignRoutes from "./campaigns";
import feedbackRoutes from "./feedback";
import contentRoutes from "./content";
// TEMPLATE: Import new domain routes here
// import yourFeatureRoutes from "./yourFeature";

export function registerRoutes(app: Express): Server {
  // TEMPLATE: Mount domain route groups
  // Each file handles its own path prefix internally,
  // or you can set prefixes here for clarity.
  app.use("/api", coreRoutes);
  app.use("/api/campaigns", campaignRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/content", contentRoutes);
  // TEMPLATE: Mount new domain routes
  // app.use("/api/your-feature", yourFeatureRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
