#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { cloneAndSetupProject } from "./lib/utils.js";
import { debug } from "./lib/logger.js";
import { version } from "../package.json";
import { z } from "zod";

const server = new McpServer(
  {
    name: "build-my-own",
    version,
    description:
      "MCP server for build-my-own - AI-powered project learning tool",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.registerTool(
  "start_to_build_my_own_x",
  {
    description:
      "Use it when the user says they want to build their own `x`. This will clone github project and setup prompts for AI tools. AI tools then will be able to guide them rebuilding the project from 0 to 1.",
    inputSchema: {
      github_url: z
        .string()
        .describe("GitHub repository URL to clone (must end with .git)"),
    },
  },
  async ({ github_url }) => {
    const result = await cloneAndSetupProject(github_url);
    return {
      content: [
        {
          type: "text",
          text: `Now the project is successfully setup. Go ahead to guide user to build their own \`x\`! You should check the rules I've setup for you, they are ${JSON.stringify(result.rulesFiles, null, 2)}. Make sure to read the content of the rules file and follow the rules according to who you are! The original project is cloned under ${result.originalPath}, and an empty folder is also created under ${result.myOwnPath}.`,
        },
      ],
    };
  },
);

// Start the server
export async function runMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  debug("Build-my-own MCP server started");
}
