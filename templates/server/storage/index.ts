// TEMPLATE: Storage Barrel Export
// Each domain has its own storage module with focused CRUD operations.
// The main storage instance composes all domain modules.

import { CoreStorage } from "./core";
import { CampaignStorage } from "./campaigns";
import { ProgressionStorage } from "./progression";
import { FeedbackStorage } from "./feedback";
import { ContentStorage } from "./content";

// TEMPLATE: Compose all storage modules into one interface.
// When adding a new domain, create its storage class and add it here.
export class DatabaseStorage {
  core = new CoreStorage();
  campaigns = new CampaignStorage();
  progression = new ProgressionStorage();
  feedback = new FeedbackStorage();
  content = new ContentStorage();
  // TEMPLATE: Add new domain storage here
  // yourFeature = new YourFeatureStorage();
}

export const storage = new DatabaseStorage();

// Re-export individual modules for direct access when needed
export { CoreStorage, CampaignStorage, ProgressionStorage, FeedbackStorage, ContentStorage };
