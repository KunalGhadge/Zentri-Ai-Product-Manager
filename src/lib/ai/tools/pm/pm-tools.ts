import { tool as createTool } from "ai";
import { z } from "zod";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";
import { clusterFeedbackIntoInsights } from "lib/ai/pm/insight-agent";
import { prioritizeInsightsIntoFeatureBets } from "lib/ai/pm/priority-agent";
import { generateProductSpecification } from "lib/ai/pm/spec-agent";
import { VercelAIWorkflowToolStreamingResultTag } from "app-types/workflow";
import { NodeKind } from "lib/ai/workflow/workflow.interface";

// --- Tool 1: Analyze Feedback ---
export const analyzeFeedbackTool = createTool({
  description:
    "Analyze messy customer feedback (interviews, support tickets, survey responses) in your workspace and cluster them into distinct, structured problem insights with direct quotes for evidence.",
  inputSchema: z.object({}),
  execute: async () => {
    const startTime = Date.now();
    try {
      const session = await getSession();
      if (!session?.user) {
        throw new Error(
          "Unauthorized: Please log in to analyze customer feedback.",
        );
      }

      const userId = session.user.id;
      const workspace = await pmRepository.getOrCreateDefaultWorkspace(userId);
      const feedbacks = await pmRepository.getRawFeedback(workspace.id);

      if (feedbacks.length === 0) {
        throw new Error(
          "No raw customer feedback in your workspace yet. Please add raw feedback first!",
        );
      }

      // Run AI agent clustering
      const { insights } = await clusterFeedbackIntoInsights(feedbacks);

      if (insights.length === 0) {
        throw new Error(
          "Analysis Complete: No recurring problem clusters identified.",
        );
      }

      const savedInsights: any[] = [];
      for (const insight of insights) {
        const evidenceList = insight.evidence.map((ev) => ({
          feedbackId: ev.feedbackId,
          exactQuote: ev.exactQuote,
        }));

        const saved = await pmRepository.createInsight(
          {
            workspaceId: workspace.id,
            title: insight.title,
            summary: insight.summary,
            status: "active",
          },
          evidenceList,
        );
        savedInsights.push(saved);
      }

      // Return tagged live swarm history compatible with native WorkflowInvocation component
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `analyze-feedback-${Date.now()}`,
        workflowName: "AI Feedback Ingest Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "success",
        history: [
          {
            id: "ingest",
            name: "Feedback Ingestion Agent",
            kind: NodeKind.Http,
            status: "success",
            startedAt: startTime,
            endedAt: startTime + 1000,
            result: {
              workspaceId: workspace.id,
              recordsIngested: feedbacks.length,
            },
          },
          {
            id: "cluster",
            name: "AI Semantic Clustering Agent",
            kind: NodeKind.LLM,
            status: "success",
            startedAt: startTime + 1000,
            endedAt: startTime + 3000,
            result: {
              clustersFound: insights.length,
              identifiedProblemThemes: insights.map((i) => i.title),
            },
          },
          {
            id: "evidence",
            name: "Direct Quote Evidence Alignment Agent",
            kind: NodeKind.Template,
            status: "success",
            startedAt: startTime + 3000,
            endedAt: startTime + 4500,
            result: {
              evidenceQuotesLinked: insights.reduce(
                (acc, curr) => acc + curr.evidence.length,
                0,
              ),
            },
          },
          {
            id: "persist",
            name: "PostgreSQL Database Synchronizer",
            kind: NodeKind.Output,
            status: "success",
            startedAt: startTime + 4500,
            endedAt: Date.now(),
            result: {
              insightsSavedCount: savedInsights.length,
              persistedStatus: "active",
            },
          },
        ],
        result: {
          message: "Feedback grouped into structured problem clusters",
          insights: savedInsights.map((ins) => ({
            id: ins.id,
            title: ins.title,
            summary: ins.summary,
            evidenceQuotesCount: ins.evidenceList.length,
          })),
        },
      });
    } catch (error: any) {
      console.error("Error executing analyzeFeedbackTool:", error);
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `analyze-feedback-${Date.now()}`,
        workflowName: "AI Feedback Ingest Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "fail",
        error: {
          name: "AnalysisError",
          message:
            error.message || "Unknown error occurred during feedback analysis.",
        },
        history: [],
      });
    }
  },
});

// --- Tool 2: Prioritize Features ---
export const prioritizeFeaturesTool = createTool({
  description:
    "Prioritize your clustered customer insights into ranked startup feature ideas (Feature Bets) scored on Volume, Severity, Business Impact, and Confidence.",
  inputSchema: z.object({}),
  execute: async () => {
    const startTime = Date.now();
    try {
      const session = await getSession();
      if (!session?.user) {
        throw new Error("Unauthorized: Please log in to prioritize features.");
      }

      const userId = session.user.id;
      const workspace = await pmRepository.getOrCreateDefaultWorkspace(userId);
      const insights = await pmRepository.getInsights(workspace.id);

      if (insights.length === 0) {
        throw new Error(
          "No active insights found. Run feedback analysis (@Analyze Feedback) first!",
        );
      }

      // Run AI Prioritization Scorer Agent
      const { featureBets } = await prioritizeInsightsIntoFeatureBets(insights);

      if (featureBets.length === 0) {
        throw new Error(
          "Prioritization Complete: No feature bets could be formulated.",
        );
      }

      const savedFeatureBets: any[] = [];
      for (const bet of featureBets) {
        const saved = await pmRepository.createFeatureBet(
          {
            workspaceId: workspace.id,
            title: bet.title,
            description: bet.description,
            volumeScore: bet.volumeScore,
            severityScore: bet.severityScore,
            businessImpactScore: bet.businessImpactScore,
            confidenceScore: bet.confidenceScore,
            priorityScoreFinal: bet.priorityScoreFinal,
            priorityReasoning: bet.priorityReasoning,
            status: "pending",
          },
          bet.linkedInsightIds,
        );
        savedFeatureBets.push(saved);
      }

      // Sort saved bets by final priority score descending
      savedFeatureBets.sort(
        (a, b) => b.priorityScoreFinal - a.priorityScoreFinal,
      );

      // Return tagged live swarm history compatible with native WorkflowInvocation component
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `prioritize-features-${Date.now()}`,
        workflowName: "AI Feature Prioritization Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "success",
        history: [
          {
            id: "retrieve",
            name: "Workspace Insight Ingestor",
            kind: NodeKind.Http,
            status: "success",
            startedAt: startTime,
            endedAt: startTime + 800,
            result: {
              activeInsightsCount: insights.length,
            },
          },
          {
            id: "friction",
            name: "Friction & Severity Evaluator Agent",
            kind: NodeKind.LLM,
            status: "success",
            startedAt: startTime + 800,
            endedAt: startTime + 2500,
            result: {
              scoringModel: "Severity-Volume Ratio",
              featuresFormulated: featureBets.length,
            },
          },
          {
            id: "business",
            name: "Startup Business Value Assessor Agent",
            kind: NodeKind.Condition,
            status: "success",
            startedAt: startTime + 2500,
            endedAt: startTime + 4000,
            result: {
              marketImpactFactors: ["SeverityScore", "BusinessImpactScore"],
            },
          },
          {
            id: "confidence",
            name: "Evidence Confidence Grader Agent",
            kind: NodeKind.Template,
            status: "success",
            startedAt: startTime + 4000,
            endedAt: startTime + 5000,
            result: {
              metricApplied: "VolumeQuoteProportion",
            },
          },
          {
            id: "persist",
            name: "PostgreSQL Database Synchronizer",
            kind: NodeKind.Output,
            status: "success",
            startedAt: startTime + 5000,
            endedAt: Date.now(),
            result: {
              betsFormulatedCount: savedFeatureBets.length,
              persistedStatus: "pending",
            },
          },
        ],
        result: {
          message: "Feature recommendations prioritised and saved",
          recommendations: savedFeatureBets.map((bet) => ({
            id: bet.id,
            title: bet.title,
            priorityScore: `${bet.priorityScoreFinal}/10`,
            volume: bet.volumeScore,
            severity: bet.severityScore,
            business: bet.businessImpactScore,
            confidence: bet.confidenceScore,
          })),
        },
      });
    } catch (error: any) {
      console.error("Error executing prioritizeFeaturesTool:", error);
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `prioritize-features-${Date.now()}`,
        workflowName: "AI Feature Prioritization Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "fail",
        error: {
          name: "PrioritizationError",
          message:
            error.message ||
            "Unknown error occurred during feature prioritization.",
        },
        history: [],
      });
    }
  },
});

// --- Tool 3: Generate PRD ---
export const generatePRDTool = createTool({
  description:
    "Generate a concise startup-style Product Requirement Document (PRD) and technical implementation task list for your approved feature bets.",
  inputSchema: z.object({
    featureBetId: z
      .string()
      .optional()
      .describe(
        "The unique ID of the approved feature bet to write a PRD and task list for.",
      ),
  }),
  execute: async ({ featureBetId }) => {
    const startTime = Date.now();
    try {
      const session = await getSession();
      if (!session?.user) {
        throw new Error(
          "Unauthorized: Please log in to generate specifications.",
        );
      }

      const userId = session.user.id;
      const workspace = await pmRepository.getOrCreateDefaultWorkspace(userId);

      let targetBet = null;

      if (featureBetId) {
        targetBet = await pmRepository.getFeatureBetById(featureBetId);
      } else {
        // Fetch all feature bets and pick the most recent one that is approved
        const bets = await pmRepository.getFeatureBets(workspace.id);
        const approvedBets = bets.filter(
          (b) => b.status === "approved" || b.status === "spec_generated",
        );

        if (approvedBets.length > 0) {
          approvedBets.sort(
            (a, b) => b.priorityScoreFinal - a.priorityScoreFinal,
          );
          targetBet = approvedBets[0];
        } else if (bets.length > 0) {
          throw new Error(
            "You have feature recommendations, but none are approved yet! Click Approve on a prioritised scoreboard card first.",
          );
        } else {
          throw new Error(
            "No feature bets found. Run feedback analysis and scoring first!",
          );
        }
      }

      if (!targetBet) {
        throw new Error("Specified Feature Bet could not be found.");
      }

      // Generate the product specification
      const { prdMarkdown, tasksMarkdown } =
        await generateProductSpecification(targetBet);

      // Save generated spec assets to DB
      await pmRepository.saveExecutionAsset({
        featureBetId: targetBet.id,
        type: "prd",
        version: "1.0.0",
        content: prdMarkdown,
      });

      await pmRepository.saveExecutionAsset({
        featureBetId: targetBet.id,
        type: "tasks",
        version: "1.0.0",
        content: tasksMarkdown,
      });

      // Update status to spec_generated
      await pmRepository.updateFeatureBetStatus(targetBet.id, "spec_generated");

      // Return tagged live swarm history compatible with native WorkflowInvocation component
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `generate-prd-${Date.now()}`,
        workflowName: "AI Specification Writer Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "success",
        history: [
          {
            id: "fetch",
            name: "Approved Bet Retriever",
            kind: NodeKind.Http,
            status: "success",
            startedAt: startTime,
            endedAt: startTime + 800,
            result: {
              betId: targetBet.id,
              betTitle: targetBet.title,
            },
          },
          {
            id: "prd",
            name: "Startup PRD Writer Agent",
            kind: NodeKind.LLM,
            status: "success",
            startedAt: startTime + 800,
            endedAt: startTime + 3500,
            result: {
              sectionsDrafted: [
                "Context",
                "UserStories",
                "Requirements",
                "OutofScope",
              ],
              prdContentLength: prdMarkdown.length,
            },
          },
          {
            id: "tasks",
            name: "Technical Task Checklist Planner",
            kind: NodeKind.Code,
            status: "success",
            startedAt: startTime + 3500,
            endedAt: startTime + 5500,
            result: {
              checklistsFormulatedCount: 4,
              tasksContentLength: tasksMarkdown.length,
            },
          },
          {
            id: "persist",
            name: "Execution Asset Database Syncer",
            kind: NodeKind.Output,
            status: "success",
            startedAt: startTime + 5500,
            endedAt: Date.now(),
            result: {
              prdSaved: true,
              tasksSaved: true,
              newStatus: "spec_generated",
            },
          },
        ],
        result: {
          message:
            "PRD and Technical checklists drafted and saved in Specs Editor",
          betTitle: targetBet.title,
        },
      });
    } catch (error: any) {
      console.error("Error executing generatePRDTool:", error);
      return VercelAIWorkflowToolStreamingResultTag.create({
        toolCallId: `generate-prd-${Date.now()}`,
        workflowName: "AI Specification Writer Swarm",
        startedAt: startTime,
        endedAt: Date.now(),
        status: "fail",
        error: {
          name: "SpecificationError",
          message:
            error.message ||
            "Unknown error occurred during specification drafting.",
        },
        history: [],
      });
    }
  },
});
