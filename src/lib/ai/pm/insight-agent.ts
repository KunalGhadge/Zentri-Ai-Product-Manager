import { generateObject } from "ai";
import { z } from "zod";
import { customModelProvider } from "lib/ai/models";
import { PmRawFeedback } from "app-types/pm";

const insightClusteringSchema = z.object({
  insights: z.array(
    z.object({
      title: z
        .string()
        .describe(
          "A concise, action-oriented, problem-focused title (e.g., 'Payment Failure during Upgrade')",
        ),
      summary: z
        .string()
        .describe(
          "A summary of the recurring pain point, what causes it, and how it impacts the customer.",
        ),
      evidence: z
        .array(
          z.object({
            feedbackId: z
              .string()
              .describe(
                "The exact ID of the raw feedback item this quote comes from.",
              ),
            exactQuote: z
              .string()
              .describe(
                "The exact, unmodified quote from the feedback text that proves this pain point.",
              ),
          }),
        )
        .min(1),
    }),
  ),
});

export async function clusterFeedbackIntoInsights(
  feedbacks: PmRawFeedback[],
  customModel?: any,
) {
  if (feedbacks.length === 0) {
    return { insights: [] };
  }

  const model = customModel || customModelProvider.getModel();

  const feedbackListText = feedbacks
    .map(
      (f, _i) =>
        `[Feedback ID: ${f.id}] (Source: ${f.sourceName}, Type: ${f.sourceType})\nContent: ${f.content}`,
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are a world-class Principal AI Product Manager specializing in startup execution.
Your task is to analyze messy, unstructured customer feedback signals and cluster them into distinct, high-impact insight clusters.

Guidelines:
1. **Focus on Pain Points, Not Solutions**: Titles should describe what is broken or frustrating (e.g., "Export fails on large datasets" rather than "Add pagination to export").
2. **Strict Traceability**: For every insight cluster you identify, you must extract exact, word-for-word quotes from the source feedback as evidence. Do NOT alter, summarize, or paraphrase the quotes.
3. **Multi-User Agreement**: Group feedback points only if they share a common root problem. An insight must have at least one clear piece of evidence.
4. **Be highly selective**: Group duplicate issues together. Do not create 20 individual insights when 3 larger clusters capture the problems perfectly.`;

  const userPrompt = `Here is the messy customer feedback for your analysis:

${feedbackListText}

Analyze this feedback and return a structured list of insight clusters. Make sure to attribute each exact quote to its correct Feedback ID.`;

  const { object } = await generateObject({
    model,
    schema: insightClusteringSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.1, // low temp for accurate extraction & quotes
  });

  return object;
}
