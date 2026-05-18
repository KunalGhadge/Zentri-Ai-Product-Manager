import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";
import { prioritizeInsightsIntoFeatureBets } from "lib/ai/pm/priority-agent";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    // Get active insights for workspace
    const insights = await pmRepository.getInsights(workspaceId);

    if (insights.length === 0) {
      return NextResponse.json(
        { error: "No insights available to prioritize" },
        { status: 400 },
      );
    }

    // Call the Priority Agent
    const { featureBets } = await prioritizeInsightsIntoFeatureBets(insights);

    const savedFeatureBets: any[] = [];

    // Loop and insert into the database
    for (const bet of featureBets) {
      const saved = await pmRepository.createFeatureBet(
        {
          workspaceId,
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

    return NextResponse.json({
      message: `Successfully prioritized insights into ${savedFeatureBets.length} feature bets`,
      featureBets: savedFeatureBets,
    });
  } catch (error: any) {
    console.error("Error in POST /api/pm/prioritize:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
