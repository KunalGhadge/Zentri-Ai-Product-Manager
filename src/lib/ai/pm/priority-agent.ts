import { generateObject } from "ai";
import { z } from "zod";
import { customModelProvider } from "lib/ai/models";
import { PmInsightWithEvidence } from "app-types/pm";

const prioritySchema = z.object({
  featureBets: z.array(
    z.object({
      title: z
        .string()
        .describe(
          "Sleek, product-oriented feature title (e.g., 'One-Click Workspace CSV Export')",
        ),
      description: z
        .string()
        .describe(
          "A high-level description of what the feature does, what it solves, and how it works.",
        ),
      volumeScore: z
        .number()
        .min(1)
        .max(5)
        .describe(
          "Score 1-5. How many unique customer signals complain about or touch on this issue?",
        ),
      severityScore: z
        .number()
        .min(1)
        .max(5)
        .describe(
          "Score 1-5. How severe is the issue for affected users? (1 = minor annoyance, 5 = absolute blocker/loss of trust)",
        ),
      businessImpactScore: z
        .number()
        .min(1)
        .max(5)
        .describe(
          "Score 1-5. Estimated impact on core company metrics (retention, upgrade conversion, support cost).",
        ),
      confidenceScore: z
        .number()
        .min(1)
        .max(5)
        .describe(
          "Score 1-5. How clear is the data? (1 = vague hunch, 5 = verified by clear, multiple quotes from interviews)",
        ),
      priorityReasoning: z
        .string()
        .describe(
          "A 2-3 sentence transparent breakdown of why this feature is scored this way and its core trade-offs.",
        ),
      linkedInsightIds: z
        .array(z.string())
        .describe(
          "The exact IDs of the insights this feature bet directly addresses and solves.",
        ),
    }),
  ),
});

export async function prioritizeInsightsIntoFeatureBets(
  insights: PmInsightWithEvidence[],
  customModel?: any,
) {
  if (insights.length === 0) {
    return { featureBets: [] };
  }

  const model = customModel || customModelProvider.getModel();

  const insightsText = insights
    .map(
      (ins) =>
        `[Insight ID: ${ins.id}]\nTitle: ${ins.title}\nSummary: ${ins.summary}\nEvidence Count: ${ins.evidenceList.length} unique quotes`,
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are a growth-focused Principal AI Product Manager at a fast-moving software startup.
Your team is resource-constrained. You need to review a list of validated customer pain points (insights) and propose lean, impactful product features (called "Feature Bets") that address them.

For each Feature Bet, you must estimate the following scores from 1 to 5:
1. **Volume (1-5)**: 1 = few people, 5 = affects everyone.
2. **Severity (1-5)**: 1 = minor papercut, 5 = severe crash/blocker.
3. **Business Impact (1-5)**: 1 = nice to have, 5 = directly impacts MRR/retention.
4. **Confidence (1-5)**: 1 = speculative, 5 = verified by multiple pieces of clear quote evidence.

Make sure to map each feature bet back to the Insight IDs it addresses. A feature bet can address one or multiple insights.`;

  const userPrompt = `Here are the validated customer insights:

${insightsText}

Propose and score a ranked list of Feature Bets to address these pain points.`;

  const { object } = await generateObject({
    model,
    schema: prioritySchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.2,
  });

  // Calculate final priority score: ((Volume + Severity + Business) / 3) * (Confidence / 5) * 10
  // Scaled out of 10 for readability
  const featureBetsWithCalculatedScores = object.featureBets.map((bet) => {
    const rawPriority =
      ((bet.volumeScore + bet.severityScore + bet.businessImpactScore) / 3) *
      (bet.confidenceScore / 5) *
      10;
    const priorityScoreFinal = Math.round(rawPriority * 10) / 10; // Round to 1 decimal place

    return {
      ...bet,
      priorityScoreFinal,
    };
  });

  return {
    featureBets: featureBetsWithCalculatedScores,
  };
}
