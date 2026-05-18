import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";
import { clusterFeedbackIntoInsights } from "lib/ai/pm/insight-agent";

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

    // Get all raw feedback for this workspace
    const feedbacks = await pmRepository.getRawFeedback(workspaceId);

    if (feedbacks.length === 0) {
      return NextResponse.json(
        { error: "No feedback available to cluster" },
        { status: 400 },
      );
    }

    // Call the AI clusterer
    const { insights } = await clusterFeedbackIntoInsights(feedbacks);

    const savedInsights = [];

    // Loop and insert into the database
    for (const insight of insights) {
      // Map evidence exactQuotes to the respective feedback item ids
      const evidenceList = insight.evidence.map((ev) => ({
        feedbackId: ev.feedbackId,
        exactQuote: ev.exactQuote,
        startOffset: null,
        endOffset: null,
      }));

      const saved = await pmRepository.createInsight(
        {
          workspaceId,
          title: insight.title,
          summary: insight.summary,
          status: "active",
        },
        evidenceList,
      );
      savedInsights.push(saved);
    }

    return NextResponse.json({
      message: `Successfully clustered feedback into ${savedInsights.length} insights`,
      insights: savedInsights,
    });
  } catch (error: any) {
    console.error("Error in POST /api/pm/insights/cluster:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
