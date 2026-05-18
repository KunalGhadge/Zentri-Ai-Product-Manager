import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";

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

    const updated = await pmRepository.updateFeatureBetStatus(id, "approved");
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error in POST /api/pm/feature-bets/[id]/approve:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
