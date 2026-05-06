import { DBEdge, DBNode } from "app-types/workflow";
import { generateUUID } from "lib/utils";

const INPUT_ID = generateUUID();
const OUTPUT_ID = generateUUID();
const NOTE_ID = generateUUID();
const LLM_ID = generateUUID();

export const productRoadmapNodes: Partial<DBNode>[] = [
  {
    id: INPUT_ID,
    kind: "input",
    name: "PRODUCT VISION",
    description: "Input your product vision and key objectives",
    uiConfig: {
      position: { x: 0, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "input",
      outputSchema: {
        type: "object",
        properties: {
          vision: { type: "string" },
          timeline: { type: "string", description: "Desired timeline (e.g., 6 months, 1 year)" },
        },
        required: ["vision"],
      },
    },
  },
  {
    id: LLM_ID,
    kind: "llm",
    name: "ROADMAP GENERATOR",
    description: "Generate a strategic roadmap based on the product vision",
    uiConfig: {
      position: { x: 400, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "llm",
      outputSchema: {
        type: "object",
        properties: {
          roadmap: {
            type: "array",
            items: {
              type: "object",
              properties: {
                phase: { type: "string" },
                milestones: { type: "array", items: { type: "string" } },
                priority: { type: "string", enum: ["High", "Medium", "Low"] },
              },
            },
          },
        },
      },
      messages: [
        {
          role: "system",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "You are a Strategic Product Consultant. Your task is to generate a detailed product roadmap phase by phase.",
                  },
                ],
              },
            ],
          },
        },
        {
          role: "user",
          content: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Generate a roadmap for: ",
                  },
                  {
                    type: "mention",
                    attrs: {
                      id: generateUUID(),
                      label: `{"nodeId":"${INPUT_ID}","path":["vision"]}`,
                    },
                  },
                  {
                    type: "text",
                    text: " with a timeline of ",
                  },
                  {
                    type: "mention",
                    attrs: {
                      id: generateUUID(),
                      label: `{"nodeId":"${INPUT_ID}","path":["timeline"]}`,
                    },
                  },
                ],
              },
            ],
          },
        },
      ],
      model: { provider: "google", model: "gemini-2.0-flash-lite" },
    },
  },
  {
    id: NOTE_ID,
    kind: "note",
    name: "GUIDE",
    description: `# 🗺️ Product Roadmap Workflow
    
This workflow helps PMs transform a raw product vision into a structured, phase-based roadmap.

### ➡️ Process
1. **Vision**: Describe what you want to build.
2. **Strategy**: The LLM analyzes the vision and breaks it down into phases.
3. **Execution**: The output is a JSON-compatible roadmap structure.
`,
    uiConfig: {
      position: { x: 0, y: -250 },
      type: "default",
    },
    nodeConfig: {
      kind: "note",
      outputSchema: { type: "object", properties: {} },
    },
  },
  {
    id: OUTPUT_ID,
    kind: "output",
    name: "FINAL ROADMAP",
    description: "Final structured roadmap output",
    uiConfig: {
      position: { x: 800, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "output",
      outputSchema: { type: "object", properties: {} },
      outputData: [
        {
          key: "roadmap",
          source: { nodeId: LLM_ID, path: ["roadmap"] },
        },
      ],
    },
  },
];

export const productRoadmapEdges: Partial<DBEdge>[] = [
  {
    source: INPUT_ID,
    target: LLM_ID,
    uiConfig: {},
  },
  {
    source: LLM_ID,
    target: OUTPUT_ID,
    uiConfig: {},
  },
];
