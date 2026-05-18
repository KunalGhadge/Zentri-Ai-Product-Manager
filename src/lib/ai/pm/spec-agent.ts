import { generateObject } from "ai";
import { z } from "zod";
import { customModelProvider } from "lib/ai/models";
import { PmFeatureBetWithInsights } from "app-types/pm";

const specOutputSchema = z.object({
  prdMarkdown: z
    .string()
    .describe(
      "startup PRD Markdown content containing: Target User, Problem Context, Proposed Solution, In-Scope, Out-of-Scope, User Stories, and Acceptance Criteria.",
    ),
  tasksMarkdown: z
    .string()
    .describe(
      "Technical task breakdown list in Markdown containing clear checklists grouped by: Database & API, Backend Logic, Frontend UI & UX, and Testing & Verification.",
    ),
});

export async function generateProductSpecification(
  featureBet: PmFeatureBetWithInsights,
  customModel?: any,
) {
  const model = customModel || customModelProvider.getModel();

  const insightsDetails = featureBet.insights
    .map(
      (ins, idx) =>
        `Insight #${idx + 1}: ${ins.title}\nSummary: ${ins.summary}`,
    )
    .join("\n\n");

  const systemPrompt = `You are an elite, execution-focused Principal Product Manager at a hyper-growth tech startup.
Your superpower is turning prioritized, validated feature ideas into crisp, startup-style specifications (PRDs) and granular, copy-pasteable engineer-ready task checklists.

Your output must contain two separate, comprehensive Markdown blocks:
1. **prdMarkdown**: A concise, clean, startup PRD including:
   - **Target User**: Who are we building for?
   - **Problem Context**: What is the validated user friction (quote insights)?
   - **Proposed Solution**: What is the elegant solution?
   - **In-Scope**: Boundaries of the initial version.
   - **Out-of-Scope**: What are we intentionally NOT building to move fast.
   - **User Stories**: A few crisp user stories.
   - **Acceptance Criteria**: Concrete definitions of done.

2. **tasksMarkdown**: A complete developer-ready implementation checklist containing:
   - **🗄️ Database & API**: Any schema changes, migrations, or endpoint payloads.
   - **⚙️ Backend Logic**: Internal functions, services, LLM integrations, caching.
   - **🎨 Frontend UI & UX**: Styling, responsiveness, loading states, accessibility.
   - **🧪 Testing & Verification**: Edge cases, manual steps, automated tests.

Avoid generic descriptions or corporate fluff. Speak like a senior lead engineer-turned-product manager who values raw clarity, rapid shipping, and premium user experience.`;

  const userPrompt = `Here is the approved Feature Bet:
Feature Bet Title: ${featureBet.title}
Description: ${featureBet.description}
Priority Score: ${featureBet.priorityScoreFinal}/10
Priority Reasoning: ${featureBet.priorityReasoning}

Linked Customer Insights:
${insightsDetails}

Please generate the PRD Markdown and the Technical Task List Markdown for this Feature Bet.`;

  const { object } = await generateObject({
    model,
    schema: specOutputSchema,
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 0.3,
  });

  return object;
}
