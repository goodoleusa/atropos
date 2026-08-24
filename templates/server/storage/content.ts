// TEMPLATE: Content Storage — prompts, gallery, flow nodes
// Manages admin-configurable content and visual editor data.

import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import {
  adminPrompts, promptGallery, flowNodes,
  type AdminPrompt, type InsertAdminPrompt,
  type PromptGalleryEntry, type InsertPromptGallery,
  type FlowNode, type InsertFlowNode,
} from "../../shared/schema";

export class ContentStorage {
  // --- Admin Prompts ---
  async getAllPrompts(): Promise<AdminPrompt[]> {
    return db.select().from(adminPrompts);
  }

  async getPrompt(key: string): Promise<AdminPrompt | undefined> {
    const [prompt] = await db.select().from(adminPrompts)
      .where(eq(adminPrompts.key, key)).limit(1);
    return prompt;
  }

  async upsertPrompt(data: InsertAdminPrompt): Promise<AdminPrompt> {
    const [created] = await db.insert(adminPrompts).values(data)
      .onConflictDoUpdate({ target: adminPrompts.key, set: { content: data.content, updatedAt: new Date() } })
      .returning();
    return created;
  }

  // --- Prompt Gallery ---
  async getGalleryEntries(category?: string): Promise<PromptGalleryEntry[]> {
    const query = db.select().from(promptGallery).orderBy(desc(promptGallery.createdAt)).limit(100);
    // TEMPLATE: Add category filtering if needed
    return query;
  }

  async createGalleryEntry(data: InsertPromptGallery): Promise<PromptGalleryEntry> {
    const [created] = await db.insert(promptGallery).values(data).returning();
    return created;
  }

  // --- Flow Nodes ---
  async getFlowNodes(campaignKey?: string): Promise<FlowNode[]> {
    if (campaignKey) {
      return db.select().from(flowNodes).where(eq(flowNodes.campaignKey, campaignKey));
    }
    return db.select().from(flowNodes);
  }

  async createFlowNode(data: InsertFlowNode): Promise<FlowNode> {
    const [created] = await db.insert(flowNodes).values(data).returning();
    return created;
  }

  async updateFlowNode(nodeId: string, updates: Partial<FlowNode>): Promise<FlowNode | undefined> {
    const [updated] = await db.update(flowNodes)
      .set(updates)
      .where(eq(flowNodes.nodeId, nodeId))
      .returning();
    return updated;
  }

  async deleteFlowNode(nodeId: string): Promise<boolean> {
    const result = await db.delete(flowNodes).where(eq(flowNodes.nodeId, nodeId)).returning();
    return result.length > 0;
  }
}
