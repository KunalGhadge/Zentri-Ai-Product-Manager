import { generateText } from "ai";
import { customModelProvider } from "lib/ai/models";
import { mcpClientsManager } from "lib/ai/mcp/mcp-manager";
import { auth } from "lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, mcpServers = [] } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Load tool info to give the enhancer context
    const allTools = await mcpClientsManager.tools();
    const toolContext = Object.entries(allTools)
      .map(([id, tool]) => `- ${id}: ${tool.description}`)
      .join("\n");

    const systemInstructions = `You are a Prompt Engineering Expert for an AI Product Manager.
Your goal is to take a vague user prompt and turn it into a high-quality, structured instruction that triggers the right tools effectively.

AVAILABLE TOOLS:
${toolContext}

STRICT RULES:
1. If the user's prompt implies a tool (like Notion, GitHub, Linear), make sure the enhanced prompt includes all mandatory fields as placeholders.
2. Use non-technical language for the output.
3. Use placeholders like [Insert Database URL here] or [Describe the task here] where specific user info is needed.
4. Keep the output concise but structured.
5. If the prompt is already clear, just refine the professional tone.
6. Return ONLY the enhanced prompt text. No conversational filler.

EXAMPLE:
User: "make a notion page"
Enhanced: "Create a new Notion page in my database [Paste Database URL here] titled [Enter Title here] with the content [Describe page content here]."`;

    const { text: enhancedPrompt } = await generateText({
      model: customModelProvider("google", "gemini-1.5-flash"), // Use a fast model for latency
      system: systemInstructions,
      prompt: `Enhance this prompt: "${prompt}"`,
    });

    return NextResponse.json({ enhancedPrompt: enhancedPrompt.trim() });
  } catch (error: any) {
    console.error("Prompt Enhancement Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
