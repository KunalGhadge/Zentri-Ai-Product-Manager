import { pgDb as db } from "../db.pg";
import {
  PmWorkspaceTable,
  PmRawFeedbackTable,
  PmInsightTable,
  PmEvidenceTable,
  PmFeatureBetTable,
  PmFeatureBetInsightLinkTable,
  PmExecutionAssetTable,
  UserTable,
} from "../schema.pg";
import { eq, and, desc } from "drizzle-orm";
import { generateUUID } from "lib/utils";
import {
  PmWorkspace,
  PmRawFeedback,
  PmInsight,
  PmEvidence,
  PmFeatureBet,
  PmExecutionAsset,
  PmInsightWithEvidence,
  PmFeatureBetWithInsights,
  PmEvidenceWithFeedback,
} from "app-types/pm";

export const pgPmRepository = {
  // --- Workspace Operations ---
  async getOrCreateDefaultWorkspace(userId: string): Promise<PmWorkspace> {
    const [existing] = await db
      .select()
      .from(PmWorkspaceTable)
      .where(eq(PmWorkspaceTable.userId, userId))
      .limit(1);

    if (existing) {
      return existing as PmWorkspace;
    }

    const [created] = await db
      .insert(PmWorkspaceTable)
      .values({
        id: generateUUID(),
        name: "Default Workspace",
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created as PmWorkspace;
  },

  async getWorkspaces(userId: string): Promise<PmWorkspace[]> {
    const result = await db
      .select()
      .from(PmWorkspaceTable)
      .where(eq(PmWorkspaceTable.userId, userId));
    return result as PmWorkspace[];
  },

  // --- Feedback Operations ---
  async saveRawFeedback(
    feedback: Omit<PmRawFeedback, "id" | "createdAt">,
  ): Promise<PmRawFeedback> {
    const [result] = await db
      .insert(PmRawFeedbackTable)
      .values({
        id: generateUUID(),
        workspaceId: feedback.workspaceId,
        userId: feedback.userId,
        sourceName: feedback.sourceName,
        sourceType: feedback.sourceType,
        content: feedback.content,
        occurredAt: feedback.occurredAt || new Date(),
        importBatchId: feedback.importBatchId || null,
        createdAt: new Date(),
      })
      .returning();
    return result as PmRawFeedback;
  },

  async getRawFeedback(workspaceId: string): Promise<PmRawFeedback[]> {
    const result = await db
      .select()
      .from(PmRawFeedbackTable)
      .where(eq(PmRawFeedbackTable.workspaceId, workspaceId))
      .orderBy(desc(PmRawFeedbackTable.createdAt));
    return result as PmRawFeedback[];
  },

  // --- Insight & Evidence Operations ---
  async createInsight(
    insight: Omit<PmInsight, "id" | "createdAt">,
    evidenceList: Omit<PmEvidence, "id" | "insightId" | "createdAt">[],
  ): Promise<PmInsightWithEvidence> {
    return await db.transaction(async (tx) => {
      const [createdInsight] = await tx
        .insert(PmInsightTable)
        .values({
          id: generateUUID(),
          workspaceId: insight.workspaceId,
          title: insight.title,
          summary: insight.summary,
          status: insight.status || "active",
          createdAt: new Date(),
        })
        .returning();

      const createdEvidence: PmEvidenceWithFeedback[] = [];

      for (const evidence of evidenceList) {
        const [ev] = await tx
          .insert(PmEvidenceTable)
          .values({
            id: generateUUID(),
            insightId: createdInsight.id,
            feedbackId: evidence.feedbackId,
            exactQuote: evidence.exactQuote,
            startOffset: evidence.startOffset || null,
            endOffset: evidence.endOffset || null,
            createdAt: new Date(),
          })
          .returning();

        // Retrieve raw feedback details for the evidence link
        const [feedback] = await tx
          .select()
          .from(PmRawFeedbackTable)
          .where(eq(PmRawFeedbackTable.id, evidence.feedbackId))
          .limit(1);

        createdEvidence.push({
          ...(ev as PmEvidence),
          feedback: feedback as PmRawFeedback,
        });
      }

      return {
        ...(createdInsight as PmInsight),
        evidenceList: createdEvidence,
      };
    });
  },

  async getInsights(workspaceId: string): Promise<PmInsightWithEvidence[]> {
    const insights = await db
      .select()
      .from(PmInsightTable)
      .where(eq(PmInsightTable.workspaceId, workspaceId))
      .orderBy(desc(PmInsightTable.createdAt));

    const result: PmInsightWithEvidence[] = [];

    for (const insight of insights) {
      const evidenceRows = await db
        .select()
        .from(PmEvidenceTable)
        .where(eq(PmEvidenceTable.insightId, insight.id));

      const evidenceList: PmEvidenceWithFeedback[] = [];

      for (const ev of evidenceRows) {
        const [feedback] = await db
          .select()
          .from(PmRawFeedbackTable)
          .where(eq(PmRawFeedbackTable.id, ev.feedbackId))
          .limit(1);

        evidenceList.push({
          ...(ev as PmEvidence),
          feedback: feedback as PmRawFeedback,
        });
      }

      result.push({
        ...(insight as PmInsight),
        evidenceList,
      });
    }

    return result;
  },

  async getInsightById(id: string): Promise<PmInsightWithEvidence | null> {
    const [insight] = await db
      .select()
      .from(PmInsightTable)
      .where(eq(PmInsightTable.id, id))
      .limit(1);

    if (!insight) return null;

    const evidenceRows = await db
      .select()
      .from(PmEvidenceTable)
      .where(eq(PmEvidenceTable.insightId, insight.id));

    const evidenceList: PmEvidenceWithFeedback[] = [];

    for (const ev of evidenceRows) {
      const [feedback] = await db
        .select()
        .from(PmRawFeedbackTable)
        .where(eq(PmRawFeedbackTable.id, ev.feedbackId))
        .limit(1);

      evidenceList.push({
        ...(ev as PmEvidence),
        feedback: feedback as PmRawFeedback,
      });
    }

    return {
      ...(insight as PmInsight),
      evidenceList,
    };
  },

  // --- Feature Bet Operations ---
  async createFeatureBet(
    bet: Omit<PmFeatureBet, "id" | "createdAt">,
    insightIds: string[],
  ): Promise<PmFeatureBetWithInsights> {
    return await db.transaction(async (tx) => {
      const [createdBet] = await tx
        .insert(PmFeatureBetTable)
        .values({
          id: generateUUID(),
          workspaceId: bet.workspaceId,
          title: bet.title,
          description: bet.description,
          volumeScore: bet.volumeScore,
          severityScore: bet.severityScore,
          businessImpactScore: bet.businessImpactScore,
          confidenceScore: bet.confidenceScore,
          priorityScoreFinal: bet.priorityScoreFinal,
          priorityReasoning: bet.priorityReasoning,
          status: bet.status || "pending",
          createdAt: new Date(),
        })
        .returning();

      const insights: PmInsight[] = [];

      for (const insightId of insightIds) {
        await tx.insert(PmFeatureBetInsightLinkTable).values({
          id: generateUUID(),
          featureBetId: createdBet.id,
          insightId,
        });

        const [insight] = await tx
          .select()
          .from(PmInsightTable)
          .where(eq(PmInsightTable.id, insightId))
          .limit(1);

        if (insight) {
          insights.push(insight as PmInsight);
        }
      }

      return {
        ...(createdBet as PmFeatureBet),
        insights,
        assets: [],
      };
    });
  },

  async getFeatureBets(
    workspaceId: string,
  ): Promise<PmFeatureBetWithInsights[]> {
    const bets = await db
      .select()
      .from(PmFeatureBetTable)
      .where(eq(PmFeatureBetTable.workspaceId, workspaceId))
      .orderBy(desc(PmFeatureBetTable.priorityScoreFinal));

    const result: PmFeatureBetWithInsights[] = [];

    for (const bet of bets) {
      // Find linked insights
      const links = await db
        .select()
        .from(PmFeatureBetInsightLinkTable)
        .where(eq(PmFeatureBetInsightLinkTable.featureBetId, bet.id));

      const insights: PmInsight[] = [];
      for (const link of links) {
        const [insight] = await db
          .select()
          .from(PmInsightTable)
          .where(eq(PmInsightTable.id, link.insightId))
          .limit(1);
        if (insight) {
          insights.push(insight as PmInsight);
        }
      }

      // Find execution assets
      const assets = await db
        .select()
        .from(PmExecutionAssetTable)
        .where(eq(PmExecutionAssetTable.featureBetId, bet.id));

      result.push({
        ...(bet as PmFeatureBet),
        insights,
        assets: assets as PmExecutionAsset[],
      });
    }

    return result;
  },

  async getFeatureBetById(
    id: string,
  ): Promise<PmFeatureBetWithInsights | null> {
    const [bet] = await db
      .select()
      .from(PmFeatureBetTable)
      .where(eq(PmFeatureBetTable.id, id))
      .limit(1);

    if (!bet) return null;

    const links = await db
      .select()
      .from(PmFeatureBetInsightLinkTable)
      .where(eq(PmFeatureBetInsightLinkTable.featureBetId, bet.id));

    const insights: PmInsight[] = [];
    for (const link of links) {
      const [insight] = await db
        .select()
        .from(PmInsightTable)
        .where(eq(PmInsightTable.id, link.insightId))
        .limit(1);
      if (insight) {
        insights.push(insight as PmInsight);
      }
    }

    const assets = await db
      .select()
      .from(PmExecutionAssetTable)
      .where(eq(PmExecutionAssetTable.featureBetId, bet.id));

    return {
      ...(bet as PmFeatureBet),
      insights,
      assets: assets as PmExecutionAsset[],
    };
  },

  async updateFeatureBetStatus(
    id: string,
    status: string,
  ): Promise<PmFeatureBet> {
    const [result] = await db
      .update(PmFeatureBetTable)
      .set({ status })
      .where(eq(PmFeatureBetTable.id, id))
      .returning();
    return result as PmFeatureBet;
  },

  // --- Execution Asset Operations ---
  async saveExecutionAsset(
    asset: Omit<PmExecutionAsset, "id" | "createdAt">,
  ): Promise<PmExecutionAsset> {
    // Check if asset of this type already exists for the bet
    const [existing] = await db
      .select()
      .from(PmExecutionAssetTable)
      .where(
        and(
          eq(PmExecutionAssetTable.featureBetId, asset.featureBetId),
          eq(PmExecutionAssetTable.type, asset.type),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(PmExecutionAssetTable)
        .set({
          content: asset.content,
          version: asset.version || "1.0.0",
        })
        .where(eq(PmExecutionAssetTable.id, existing.id))
        .returning();
      return updated as PmExecutionAsset;
    }

    const [created] = await db
      .insert(PmExecutionAssetTable)
      .values({
        id: generateUUID(),
        featureBetId: asset.featureBetId,
        type: asset.type,
        version: asset.version || "1.0.0",
        content: asset.content,
        createdAt: new Date(),
      })
      .returning();

    return created as PmExecutionAsset;
  },

  async getExecutionAssets(featureBetId: string): Promise<PmExecutionAsset[]> {
    const result = await db
      .select()
      .from(PmExecutionAssetTable)
      .where(eq(PmExecutionAssetTable.featureBetId, featureBetId))
      .orderBy(desc(PmExecutionAssetTable.createdAt));
    return result as PmExecutionAsset[];
  },
};
export type PmRepository = typeof pgPmRepository;
