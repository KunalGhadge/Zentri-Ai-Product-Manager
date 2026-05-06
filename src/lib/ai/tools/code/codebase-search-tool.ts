import { tool as createTool } from "ai";
import { z } from "zod";
import { safe } from "ts-safe";
import fs from "fs";
import path from "path";

export const codebaseSearchTool = createTool({
  description:
    "Search the local codebase for specific keywords or patterns. This is a built-in expert tool for understanding the current project structure and logic.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("Keyword or pattern to search for in the codebase"),
    extension: z
      .string()
      .optional()
      .describe("Filter by file extension (e.g., .ts, .tsx)"),
    maxResults: z.number().optional().default(10),
  }),
  execute: async ({ query, extension, maxResults }) => {
    return safe(async () => {
      const results: { path: string; line: number; content: string }[] = [];
      const rootDir = process.cwd();
      const searchDir = path.join(rootDir, "src");

      if (!fs.existsSync(searchDir)) {
        return { error: "Source directory not found", results: [] };
      }

      function searchFiles(dir: string) {
        if (results.length >= maxResults!) return;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (results.length >= maxResults!) break;
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (file === "node_modules" || file === ".next" || file === ".git")
              continue;
            searchFiles(fullPath);
          } else if (stat.isFile()) {
            if (extension && !file.endsWith(extension)) continue;
            // Skip binary or huge files
            if (
              file.endsWith(".png") ||
              file.endsWith(".jpg") ||
              file.endsWith(".ico") ||
              stat.size > 1024 * 1024
            )
              continue;

            const content = fs.readFileSync(fullPath, "utf8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(query)) {
                results.push({
                  path: path.relative(rootDir, fullPath),
                  line: i + 1,
                  content: lines[i].trim().slice(0, 200),
                });
                if (results.length >= maxResults!) break;
              }
            }
          }
        }
      }

      searchFiles(searchDir);
      return { results };
    }).unwrap();
  },
});

export const codebaseFileContentTool = createTool({
  description: "Read the content of a specific file from the codebase.",
  inputSchema: z.object({
    path: z
      .string()
      .describe(
        "Path to the file relative to the project root (e.g., src/lib/utils.ts)",
      ),
  }),
  execute: async ({ path: filePath }) => {
    return safe(async () => {
      const rootDir = process.cwd();
      const fullPath = path.join(rootDir, filePath);

      // Security check: ensure the path is within the project root and doesn't try to escape
      const relative = path.relative(rootDir, fullPath);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error("Invalid file path: Access denied");
      }

      if (!fs.existsSync(fullPath)) {
        throw new Error("File not found");
      }

      const content = fs.readFileSync(fullPath, "utf8");
      return { content };
    }).unwrap();
  },
});
