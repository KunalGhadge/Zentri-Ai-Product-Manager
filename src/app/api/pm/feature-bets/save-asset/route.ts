import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { featureBetId, type, content, version } = body;

    if (!featureBetId || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const savedAsset = await pmRepository.saveExecutionAsset({
      featureBetId,
      type,
      version: version || "1.0.0",
      content,
    });

    return NextResponse.json({
      message: "Successfully updated execution asset",
      asset: savedAsset,
    });
  } catch (error: any) {
    console.error("Error in POST /api/pm/feature-bets/save-asset:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
