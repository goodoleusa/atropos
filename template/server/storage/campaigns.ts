// TEMPLATE: Campaign Storage — campaign runs, templates, agent modules
// Focused on multi-step workflow management.

import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  campaignRuns, campaignTemplates, agentModules,
  type CampaignRun, type InsertCampaignRun,
  type CampaignTemplate, type InsertCampaignTemplate,
  type AgentModule, type InsertAgentModule,
} from "../../shared/schema";

export class CampaignStorage {
  // --- Campaign Runs ---
  async getRun(runId: string): Promise<CampaignRun | undefined> {
    const [run] = await db.select().from(campaignRuns)
      .where(eq(campaignRuns.runId, runId)).limit(1);
    return run;
  }

  async createRun(data: InsertCampaignRun): Promise<CampaignRun> {
    const [created] = await db.insert(campaignRuns).values(data).returning();
    return created;
  }

  async updateRun(runId: string, updates: Partial<CampaignRun>): Promise<CampaignRun | undefined> {
    const [updated] = await db.update(campaignRuns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campaignRuns.runId, runId))
      .returning();
    return updated;
  }

  // --- Templates ---
  async getAllTemplates(): Promise<CampaignTemplate[]> {
    return db.select().from(campaignTemplates).orderBy(desc(campaignTemplates.createdAt));
  }

  async getTemplate(key: string): Promise<CampaignTemplate | undefined> {
    const [template] = await db.select().from(campaignTemplates)
      .where(eq(campaignTemplates.key, key)).limit(1);
    return template;
  }

  async createTemplate(data: InsertCampaignTemplate): Promise<CampaignTemplate> {
    const [created] = await db.insert(campaignTemplates).values(data).returning();
    return created;
  }

  // --- Agent Modules ---
  async getAllModules(): Promise<AgentModule[]> {
    return db.select().from(agentModules).orderBy(agentModules.sortOrder);
  }

  async getModule(moduleId: string): Promise<AgentModule | undefined> {
    const [mod] = await db.select().from(agentModules)
      .where(eq(agentModules.moduleId, moduleId)).limit(1);
    return mod;
  }

  async createModule(data: InsertAgentModule): Promise<AgentModule> {
    const [created] = await db.insert(agentModules).values(data).returning();
    return created;
  }

  async updateModule(moduleId: string, updates: Partial<AgentModule>): Promise<AgentModule | undefined> {
    const [updated] = await db.update(agentModules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(agentModules.moduleId, moduleId))
      .returning();
    return updated;
  }
}
