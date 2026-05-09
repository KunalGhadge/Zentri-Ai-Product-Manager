import { createMCPServer } from "@playwright/mcp";

// This server uses the default StreamableHTTP transport (HTTP)
const server = createMCPServer({
  name: "playwright",
});

server.start();
console.log("Playwright MCP server started on HTTP");
