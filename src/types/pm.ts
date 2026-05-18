export interface PmWorkspace {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PmRawFeedback {
  id: string;
  workspaceId: string;
  userId: string;
  sourceName: string;
  sourceType: "interview" | "support" | "survey" | "slack" | "other" | string;
  content: string;
  occurredAt: Date;
  importBatchId?: string | null;
  createdAt: Date;
}

export interface PmInsight {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  status: "active" | "resolved" | "archived" | string;
  createdAt: Date;
}

export interface PmEvidence {
  id: string;
  insightId: string;
  feedbackId: string;
  exactQuote: string;
  startOffset?: number | null;
  endOffset?: number | null;
  createdAt: Date;
}

export interface PmFeatureBet {
  id: string;
  workspaceId: string;
  title: string;
  description: string;
  volumeScore: number;
  severityScore: number;
  businessImpactScore: number;
  confidenceScore: number;
  priorityScoreFinal: number;
  priorityReasoning: string;
  status:
    | "pending"
    | "approved"
    | "spec_generated"
    | "completed"
    | "rejected"
    | string;
  createdAt: Date;
}

export interface PmFeatureBetInsightLink {
  id: string;
  featureBetId: string;
  insightId: string;
}

export interface PmExecutionAsset {
  id: string;
  featureBetId: string;
  type: "prd" | "user_stories" | "tasks" | string;
  version: string;
  content: string; // markdown content
  createdAt: Date;
}

// Complex relations for frontend display
export interface PmEvidenceWithFeedback extends PmEvidence {
  feedback: PmRawFeedback;
}

export interface PmInsightWithEvidence extends PmInsight {
  evidenceList: PmEvidenceWithFeedback[];
}

export interface PmFeatureBetWithInsights extends PmFeatureBet {
  insights: PmInsight[];
  assets: PmExecutionAsset[];
}
