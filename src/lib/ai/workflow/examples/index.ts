import { DBEdge, DBNode, DBWorkflow } from "app-types/workflow";
import { generateUUID } from "lib/utils";
import { productRoadmapEdges, productRoadmapNodes } from "./product-roadmap";
import { userInterviewEdges, userInterviewNodes } from "./user-interview-analyzer";

export const ProductRoadmap = (): {
  workflow: Partial<DBWorkflow>;
  nodes: Partial<DBNode>[];
  edges: Partial<DBEdge>[];
} => {
  return {
    workflow: {
      description: "Generate a strategic product roadmap from your vision and objectives.",
      name: "Product Roadmap Strategist",
      isPublished: true,
      visibility: "private",
      icon: {
        type: "emoji",
        value: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f5fa-fe0f.png",
        style: {
          backgroundColor: "oklch(82.8% 0.111 230.318)",
        },
      },
    },
    nodes: productRoadmapNodes,
    edges: productRoadmapEdges.map((edge) => ({
      ...edge,
      id: generateUUID(),
    })),
  };
};

export const UserInterviewAnalyzer = (): {
  workflow: Partial<DBWorkflow>;
  nodes: Partial<DBNode>[];
  edges: Partial<DBEdge>[];
} => {
  return {
    workflow: {
      description: "Extract pain points and feature requests from user interview transcripts.",
      name: "User Research Insights",
      isPublished: true,
      visibility: "private",
      icon: {
        type: "emoji",
        value: "https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/1f50d.png",
        style: {
          backgroundColor: "oklch(84.5% 0.143 164.978)",
        },
      },
    },
    nodes: userInterviewNodes,
    edges: userInterviewEdges.map((edge) => ({
      ...edge,
      id: generateUUID(),
    })),
  };
};
