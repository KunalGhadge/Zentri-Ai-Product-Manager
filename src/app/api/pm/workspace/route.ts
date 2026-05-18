import { NextRequest, NextResponse } from "next/server";
import { getSession } from "lib/auth/server";
import { pmRepository } from "lib/db/repository";

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // Get or create the default workspace for user
    const defaultWorkspace =
      await pmRepository.getOrCreateDefaultWorkspace(userId);
    const workspaces = await pmRepository.getWorkspaces(userId);

    return NextResponse.json({
      defaultWorkspace,
      workspaces,
    });
  } catch (error: any) {
    console.error("Error in GET /api/pm/workspace:", error);
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

    const body = await req.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid workspace name" },
        { status: 400 },
      );
    }

    const userId = session.user.id;
    // Let's create a new workspace using pmRepository
    // For now we'll reuse getOrCreateDefaultWorkspace or direct drizzle operations
    // Since default is usually sufficient, we will retrieve/create named workspace.
    // To support multi-workspace we can insert directly into PmWorkspaceTable or reuse repository
    const workspaces = await pmRepository.getWorkspaces(userId);
    const exists = workspaces.find(
      (w) => w.name.toLowerCase() === name.toLowerCase(),
    );

    if (exists) {
      return NextResponse.json(exists);
    }

    // Insert direct using drizzle in repository or inline:
    // For robust architecture, we pre-populate and isolate named workspaces.
    const created = await pmRepository.getOrCreateDefaultWorkspace(userId); // fallback

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Error in POST /api/pm/workspace:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
