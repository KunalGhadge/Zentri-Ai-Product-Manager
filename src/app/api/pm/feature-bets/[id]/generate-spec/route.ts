import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";
import { generateProductSpecification } from "lib/ai/pm/spec-agent";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Feature Bet ID is required" },
        { status: 400 },
      );
    }

    // Retrieve the feature bet with linked insights and evidence
    const featureBet = await pmRepository.getFeatureBetById(id);

    if (!featureBet) {
      return NextResponse.json(
        { error: "Feature Bet not found" },
        { status: 404 },
      );
    }

    // Trigger AI Spec Writer Agent
    const { prdMarkdown, tasksMarkdown } =
      await generateProductSpecification(featureBet);

    // Save generated specs as execution assets in the database
    const prdAsset = await pmRepository.saveExecutionAsset({
      featureBetId: id,
      type: "prd",
      version: "1.0.0",
      content: prdMarkdown,
    });

    const tasksAsset = await pmRepository.saveExecutionAsset({
      featureBetId: id,
      type: "tasks",
      version: "1.0.0",
      content: tasksMarkdown,
    });

    // Update feature bet status to spec_generated
    const updatedBet = await pmRepository.updateFeatureBetStatus(
      id,
      "spec_generated",
    );

    return NextResponse.json({
      message: "Successfully generated specification and task list assets",
      featureBet: updatedBet,
      assets: [prdAsset, tasksAsset],
    });
  } catch (error: any) {
    console.error(
      "Error in POST /api/pm/feature-bets/[id]/generate-spec:",
      error,
    );
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
