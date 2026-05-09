"use client";
import { useState, useMemo } from "react";
import {
  MCPServerConfig,
  MCPRemoteConfigZodSchema,
  MCPStdioConfigZodSchema,
  SmitheryHttpConfigZodSchema,
} from "app-types/mcp";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import JsonView from "./ui/json-view";
import { toast } from "sonner";
import { safe } from "ts-safe";
import { useRouter } from "next/navigation";
import { createDebounce, fetcher, isNull, safeJSONParse } from "lib/utils";
import { handleErrorWithToast } from "ui/shared-toast";
import { mutate } from "swr";
import { Loader } from "lucide-react";
import {
  isMaybeMCPServerConfig,
  isMaybeRemoteConfig,
  isSmitheryHttpConfig,
} from "lib/ai/mcp/is-mcp-config";

import { Alert, AlertDescription, AlertTitle } from "ui/alert";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { existMcpClientByServerNameAction } from "@/app/api/mcp/actions";
import { MCPIcon } from "ui/mcp-icon";

interface MCPEditorProps {
  initialConfig?: MCPServerConfig;
  name?: string;
  id?: string;
}

const STDIO_ARGS_ENV_PLACEHOLDER = `/** STDIO Example */
{
  "command": "node", 
  "args": ["index.js"],
  "env": {
    "OPENAI_API_KEY": "sk-...",
  }
}

/** SSE,Streamable HTTP Example */
{
  "url": "https://api.example.com",
  "headers": {
    "Authorization": "Bearer sk-..."
  }
}

/** Smithery HTTP Hosted Gateway Example */
{
  "type": "smithery-http",
  "namespace": "your-namespace",
  "connectionId": "your-connection-id",
  "mcpUrl": "https://server.smithery.ai/...",
  "apiKey": "your-smithery-api-key"
}
`;

export default function MCPEditor({
  initialConfig,
  name: initialName,
  id,
}: MCPEditorProps) {
  const t = useTranslations();
  const shouldInsert = useMemo(() => isNull(id), [id]);

  const [isLoading, setIsLoading] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const errorDebounce = useMemo(() => createDebounce(), []);

  // State for form fields
  const [name, setName] = useState<string>(initialName ?? "");
  const router = useRouter();
  const [config, setConfig] = useState<MCPServerConfig>(
    initialConfig as MCPServerConfig,
  );
  const [jsonString, setJsonString] = useState<string>(
    initialConfig ? JSON.stringify(initialConfig, null, 2) : "",
  );

  // Name validation schema
  const nameSchema = z.string().regex(/^[a-zA-Z0-9\-]+$/, {
    message: t("MCP.nameMustContainOnlyAlphanumericCharactersAndHyphens"),
  });

  const validateName = (nameValue: string): boolean => {
    const result = nameSchema.safeParse(nameValue);
    if (!result.success) {
      setNameError(
        t("MCP.nameMustContainOnlyAlphanumericCharactersAndHyphens"),
      );
      return false;
    }
    setNameError(null);
    return true;
  };

  const saveDisabled = useMemo(() => {
    return (
      name.trim() === "" ||
      isLoading ||
      !!jsonError ||
      !!nameError ||
      !isMaybeMCPServerConfig(config)
    );
  }, [isLoading, jsonError, nameError, config, name]);

  // Validate
  const validateConfig = (jsonConfig: unknown): boolean => {
    let result;
    if (isSmitheryHttpConfig(jsonConfig)) {
      result = SmitheryHttpConfigZodSchema.safeParse(jsonConfig);
    } else if (isMaybeRemoteConfig(jsonConfig)) {
      result = MCPRemoteConfigZodSchema.safeParse(jsonConfig);
    } else {
      result = MCPStdioConfigZodSchema.safeParse(jsonConfig);
    }

    if (!result.success) {
      handleErrorWithToast(result.error, "mcp-editor-error");
    }
    return result.success;
  };

  // Handle save button click
  const handleSave = async () => {
    // Perform validation
    if (!validateConfig(config)) return;
    if (!name) {
      return handleErrorWithToast(
        new Error(t("MCP.nameIsRequired")),
        "mcp-editor-error",
      );
    }

    if (!validateName(name)) {
      return handleErrorWithToast(
        new Error(t("MCP.nameMustContainOnlyAlphanumericCharactersAndHyphens")),
        "mcp-editor-error",
      );
    }

    safe(() => setIsLoading(true))
      .map(async () => {
        if (shouldInsert) {
          const exist = await existMcpClientByServerNameAction(name);
          if (exist) {
            throw new Error(t("MCP.nameAlreadyExists"));
          }
        }
      })
      .map(() =>
        fetcher("/api/mcp", {
          method: "POST",
          body: JSON.stringify({
            name,
            config,
            id,
          }),
        }),
      )
      .ifOk(() => {
        toast.success(t("MCP.configurationSavedSuccessfully"));
        mutate("/api/mcp/list");
        router.push("/mcp");
      })
      .ifFail(handleErrorWithToast)
      .watch(() => setIsLoading(false));
  };

  const handleConfigChange = (data: string) => {
    setJsonString(data);
    const result = safeJSONParse(data);
    errorDebounce.clear();
    if (result.success) {
      let value = result.value as any;

      // Detect and normalize wrapped mcpServers format
      if (
        value &&
        typeof value === "object" &&
        "mcpServers" in value &&
        value.mcpServers &&
        typeof value.mcpServers === "object"
      ) {
        const servers = value.mcpServers as Record<string, any>;
        const firstKey = Object.keys(servers)[0];
        if (firstKey && servers[firstKey]) {
          value = servers[firstKey];
          // Auto-fill the name if it's currently empty
          if (!name.trim()) {
            setName(firstKey);
            validateName(firstKey);
          }
        }
      }

      setConfig(value as MCPServerConfig);
      setJsonError(null);
    } else if (data.trim() !== "") {
      errorDebounce(() => {
        setJsonError(
          (result.error as Error)?.message ??
            JSON.stringify(result.error, null, 2),
        );
      }, 1000);
    }
  };

  const [smitheryCommand, setSmitheryCommand] = useState("");

  const handleSmitheryPaste = (cmd: string) => {
    setSmitheryCommand(cmd);
    if (!cmd.trim()) return;

    // 1. Detect Smithery Hosted URL (e.g., https://smithery.run/@user/server)
    const urlMatch = cmd.match(
      /smithery\.run\/(@[a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)/,
    );
    if (urlMatch) {
      const namespace = urlMatch[1];
      const connectionId = urlMatch[2];
      const newConfig = {
        type: "smithery-http",
        namespace,
        connectionId,
        mcpUrl: `https://server.smithery.ai/${namespace.replace("@", "")}/${connectionId}`,
        apiKey: "",
      };
      setConfig(newConfig as any);
      setJsonString(JSON.stringify(newConfig, null, 2));
      if (!name.trim()) setName(connectionId);
      toast.success(t("MCP.smitheryConfigParsed"));
      return;
    }

    // 2. Detect Smithery PUT Curl command
    if (cmd.includes("smithery.run") && cmd.includes("-X PUT")) {
      const namespaceMatch = cmd.match(/smithery\.run\/([^/]+)\/([^/\s?]+)/);
      const mcpUrlMatch = cmd.match(/"mcpUrl":\s*"([^"]+)"/);
      const apiKeyMatch = cmd.match(/Bearer\s+([^"\s]+)/);

      if (namespaceMatch) {
        const newConfig = {
          type: "smithery-http",
          namespace: namespaceMatch[1],
          connectionId: namespaceMatch[2],
          mcpUrl: mcpUrlMatch ? mcpUrlMatch[1] : "",
          apiKey: apiKeyMatch ? apiKeyMatch[1] : "",
        };
        setConfig(newConfig as any);
        setJsonString(JSON.stringify(newConfig, null, 2));
        if (!name.trim()) setName(newConfig.connectionId);
        toast.success(t("MCP.smitheryConfigParsed"));
        return;
      }
    }

    // 3. Parse traditional npx command (fallback)
    const parts = cmd.split(" ").filter((p) => p.trim() !== "");
    if (parts[0] === "npx") {
      const args = parts.slice(1).filter((p) => p !== "-y");
      const newConfig = {
        command: "npx",
        args: args,
      };
      setConfig(newConfig as any);
      setJsonString(JSON.stringify(newConfig, null, 2));
      toast.success(t("MCP.smitheryConfigParsed"));
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-6">
        <Alert className="bg-secondary/20 border-blue-500/50">
          <AlertTitle className="flex items-center gap-2 text-blue-500">
            <MCPIcon className="size-4 fill-blue-500" />
            {t("MCP.howToAddFromServer")}
          </AlertTitle>
          <AlertDescription className="text-xs space-y-2">
            <p>{t("MCP.smitheryHelpDescription")}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>{t("MCP.localServers")}</strong>:{" "}
                {t("MCP.localServersHelp")}
              </li>
              <li>
                <strong>{t("MCP.remoteServers")}</strong>:{" "}
                {t("MCP.remoteServersHelp")}
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Smithery Helper */}
        <div className="space-y-2 border p-4 rounded-lg bg-secondary/10 border-dashed">
          <Label
            htmlFor="smithery-helper"
            className="text-sm font-semibold flex items-center gap-2"
          >
            🚀 {t("MCP.smitheryHelperTitle")}
          </Label>
          <p className="text-xs text-muted-foreground">
            {t("MCP.smitheryHelperDescription")}
          </p>
          <Input
            id="smithery-helper"
            value={smitheryCommand}
            onChange={(e) => handleSmitheryPaste(e.target.value)}
            placeholder="npx -y @modelcontextprotocol/server-github"
            className="font-mono text-xs"
          />
        </div>

        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("MCP.name")}</Label>

          <Input
            id="name"
            value={name}
            disabled={!shouldInsert}
            onChange={(e) => {
              setName(e.target.value);
              if (e.target.value) validateName(e.target.value);
            }}
            placeholder={t("MCP.enterMcpServerName")}
            className={nameError ? "border-destructive" : ""}
          />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="config">Config</Label>
          </div>

          {/* Split view for config editor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left side: Textarea for editing */}
            <div className="space-y-2">
              <Textarea
                id="config-editor"
                value={jsonString}
                onChange={(e) => handleConfigChange(e.target.value)}
                data-testid="mcp-config-editor"
                className="font-mono h-[40vh] resize-none overflow-y-auto"
                placeholder={STDIO_ARGS_ENV_PLACEHOLDER}
              />
            </div>

            {/* Right side: JSON view */}
            <div className="space-y-2 hidden sm:block">
              <div className="border border-input rounded-md p-4 h-[40vh] overflow-auto relative bg-secondary">
                <Label
                  htmlFor="config-view"
                  className="text-xs text-muted-foreground mb-2"
                >
                  preview
                </Label>
                <JsonView
                  data={config}
                  initialExpandDepth={3}
                  data-testid="mcp-config-view"
                />
                {jsonError && jsonString && (
                  <div className="absolute w-full bottom-0 right-0 px-2 pb-2 animate-in fade-in-0 duration-300">
                    <Alert variant="destructive" className="border-destructive">
                      <AlertTitle className="text-xs font-semibold">
                        Parsing Error
                      </AlertTitle>
                      <AlertDescription className="text-xs">
                        {jsonError}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save button */}
        <Button onClick={handleSave} className="w-full" disabled={saveDisabled}>
          {isLoading ? (
            <Loader className="size-4 animate-spin" />
          ) : (
            <span className="font-bold">{t("MCP.saveConfiguration")}</span>
          )}
        </Button>
      </div>
    </>
  );
}
