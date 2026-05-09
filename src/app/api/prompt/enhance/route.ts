import { generateText } from "ai";
import { customModelProvider } from "@/lib/ai/models";
import { mcpClientsManager } from "@/lib/ai/mcp/mcp-manager";
import { getSession } from "auth/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Load tool info to give the enhancer context
    const allTools = await mcpClientsManager.tools();
    const toolContext = Object.entries(allTools)
      .map(([id, tool]) => `- ${id}: ${tool.description}`)
      .join("\n");

    const systemInstructions = `You are an Elite Prompt Engineering Master and AI Orchestrator. 
Your mission: Transform vague user inputs into ultra-precise, high-yield, structured instructions that trigger AI tools (MCP, Code, Data, Search, etc.) with zero ambiguity.

AVAILABLE TOOLS IN THIS WORKSPACE:
${toolContext}

CORE EXPERTISE AREAS:
1. DATA VISUALIZATION: If data is involved, suggest the best chart types (Bar, Line, Pie) and mention the 'Data Visualization' tool.
2. CODE EXECUTION: For logic/math, structure the request for the 'Python/JS Executor' with clear input/output expectations.
3. WEB SEARCH: Craft specific, multi-angle search queries to ensure comprehensive results.
4. IMAGE GENERATION: Expand simple requests into detailed descriptive prompts (style, lighting, composition).
5. MCP TOOLS (Notion, GitHub, etc.): ALWAYS insert mandatory placeholders like [Database ID], [Repository URL], or [Parent Page] to prevent schema errors.
6. WORKFLOWS & AGENTS: Frame the request as a step-by-step mission for specialized personas.

STRICT PROTOCOLS:
- BE PRECISE: Use "Prompt Engineer" level language (e.g., "Synthesize," "Orchestrate," "Extract").
- PREVENT ERRORS: Proactively include missing mandatory parameters as [Placeholders].
- TOKEN EFFICIENCY: Be concise. Don't add fluff. Every word must increase the success rate of the tool call.
- NON-TECHNICAL UI: While the logic is complex, the placeholders should be easy for a human to understand.

OUTPUT: Return ONLY the enhanced prompt. No filler.

EXAMPLE (Master Level):
User: "github issue for bug in login"
Enhanced: "Using the GitHub MCP, create a new issue in the repository [Paste Repository Owner/Name] titled 'Bug: Login Failure' with a detailed description covering [Steps to Reproduce], [Expected Behavior], and [Environment Details]. Tag this as a 'bug'."`;

    const { text: enhancedPrompt } = await generateText({
      model: customModelProvider.getModel({
        provider: "google",
        model: "gemini-2.5-flash-lite",
      }), // Use a fast model for latency
      system: systemInstructions,
      prompt: `Enhance this prompt: "${prompt}"`,
    });

    return NextResponse.json({ enhancedPrompt: enhancedPrompt.trim() });
  } catch (error: any) {
    console.error("Prompt Enhancement Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
