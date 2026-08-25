export type ProjectType =
  | "website"
  | "internal-system"
  | "saas"
  | "automation"
  | "ai-integration"
  | "existing-system-modification"
  | "other";

export type Urgency = "normal" | "priority" | "rush" | "critical";

export type Capability = {
  code: string;
  label: string;
  description: string;
  category: string;
};

export type PublicCatalog = {
  version: string;
  categories: Array<{ id: string; label: string }>;
  capabilities: Capability[];
};

export type EntityDraft = {
  name: string;
  complexityHint: "standard" | "complex";
};

export type EstimateRequest = {
  projectType: ProjectType;
  capabilityCodes: string[];
  entities: EntityDraft[];
  delivery: { urgency: Urgency };
  integrations: {
    existingSystem: boolean;
    unknownApi: boolean;
    dataMigration: boolean;
  };
  freeText: string;
};

export type PublicEstimate = {
  estimateId: string;
  currency: string;
  range: { min: number; likely: number; max: number };
  confidence: number;
  missingInformation: string[];
  requiresReview: boolean;
  explanation: string[];
  pricebookPublicVersion: string;
};
