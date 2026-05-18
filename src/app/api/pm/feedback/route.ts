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

    const feedback = await pmRepository.getRawFeedback(workspaceId);
    return NextResponse.json(feedback);
  } catch (error: any) {
    console.error("Error in GET /api/pm/feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();

    // Check if it's a batch CSV upload or a single pasted item
    if (body.feedbacks && Array.isArray(body.feedbacks)) {
      const savedFeedbacks: any[] = [];
      const importBatchId = `batch_${Date.now()}`;

      for (const item of body.feedbacks) {
        const { workspaceId, sourceName, sourceType, content, occurredAt } =
          item;

        if (!workspaceId || !sourceName || !sourceType || !content) {
          continue; // skip malformed rows
        }

        const saved = await pmRepository.saveRawFeedback({
          workspaceId,
          userId,
          sourceName,
          sourceType,
          content,
          occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
          importBatchId,
        });
        savedFeedbacks.push(saved);
      }

      return NextResponse.json({
        message: `Successfully imported ${savedFeedbacks.length} feedback items`,
        feedbacks: savedFeedbacks,
      });
    }

    // Single item import
    const { workspaceId, sourceName, sourceType, content, occurredAt } = body;

    if (!workspaceId || !sourceName || !sourceType || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const saved = await pmRepository.saveRawFeedback({
      workspaceId,
      userId,
      sourceName,
      sourceType,
      content,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    });

    return NextResponse.json(saved);
  } catch (error: any) {
    console.error("Error in POST /api/pm/feedback:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
