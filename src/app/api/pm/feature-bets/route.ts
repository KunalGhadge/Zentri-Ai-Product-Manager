import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId is required" },
        { status: 400 },
      );
    }

    const featureBets = await pmRepository.getFeatureBets(workspaceId);
    return NextResponse.json(featureBets);
  } catch (error: any) {
    console.error("Error in GET /api/pm/feature-bets:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
