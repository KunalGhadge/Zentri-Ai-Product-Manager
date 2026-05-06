import { DBEdge, DBNode } from "app-types/workflow";
import { generateUUID } from "lib/utils";

const INPUT_ID = generateUUID();
const LLM_ID = generateUUID();
const OUTPUT_ID = generateUUID();

export const userInterviewNodes: Partial<DBNode>[] = [
  {
    id: INPUT_ID,
    kind: "input",
    name: "INTERVIEW TRANSCRIPT",
    description: "Paste your user interview transcript here",
    uiConfig: {
      position: { x: 0, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "input",
      outputSchema: {
        type: "object",
        properties: {
          transcript: { type: "string" },
        },
        required: ["transcript"],
      },
    },
  },
  {
    id: LLM_ID,
    kind: "llm",
    name: "INSIGHT EXTRACTOR",
    description: "Extract pain points, needs, and feature requests",
    uiConfig: {
      position: { x: 400, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "llm",
      outputSchema: {
        type: "object",
        properties: {
          painPoints: { type: "array", items: { type: "string" } },
          featureRequests: { type: "array", items: { type: "string" } },
          sentiment: { type: "string" },
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
                    text: "You are an expert User Researcher. Analyze the transcript and extract structured insights.",
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
                    text: "Analyze this transcript: ",
                  },
                  {
                    type: "mention",
                    attrs: {
                      id: generateUUID(),
                      label: `{"nodeId":"${INPUT_ID}","path":["transcript"]}`,
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
    id: OUTPUT_ID,
    kind: "output",
    name: "RESEARCH SUMMARY",
    description: "Final research findings",
    uiConfig: {
      position: { x: 800, y: 0 },
      type: "default",
    },
    nodeConfig: {
      kind: "output",
      outputSchema: { type: "object", properties: {} },
      outputData: [
        {
          key: "painPoints",
          source: { nodeId: LLM_ID, path: ["painPoints"] },
        },
        {
          key: "featureRequests",
          source: { nodeId: LLM_ID, path: ["featureRequests"] },
        },
      ],
    },
  },
];

export const userInterviewEdges: Partial<DBEdge>[] = [
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
