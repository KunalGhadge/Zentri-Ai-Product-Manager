import type {
  MCPServerConfig,
  MCPRemoteConfig,
  MCPStdioConfig,
  SmitheryHttpConfig,
} from "app-types/mcp";

/**
 * Type guard to check if an object is potentially a valid stdio config
 */
export function isMaybeStdioConfig(config: unknown): config is MCPStdioConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }
  return "command" in config && typeof config.command === "string";
}

/**
 * Type guard to check if an object is potentially a valid remote config (sse,streamable)
 */
export function isMaybeRemoteConfig(
  config: unknown,
): config is MCPRemoteConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }
  return "url" in config && typeof config.url === "string";
}

/**
 * Type guard for Smithery HTTP config
 */
export function isSmitheryHttpConfig(
  config: unknown,
): config is SmitheryHttpConfig {
  if (typeof config !== "object" || config === null) {
    return false;
  }
  return "type" in config && (config as any).type === "smithery-http";
}

/**
 * Type guard for MCP server config (stdio, remote, or smithery-http)
 */
export function isMaybeMCPServerConfig(
  config: unknown,
): config is MCPServerConfig {
  return (
    isMaybeStdioConfig(config) ||
    isMaybeRemoteConfig(config) ||
    isSmitheryHttpConfig(config)
  );
}
