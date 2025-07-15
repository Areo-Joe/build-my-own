#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { cloneAndSetupProject, createRulesFile, listProjects } from "./lib/utils.js";

const server = new Server(
  {
    name: "build-my-own",
    version: "0.0.2",
    description: "MCP server for build-my-own - AI-powered project learning tool",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools that AI can use
const tools: Tool[] = [
  {
    name: "clone_and_setup_project",
    description:
      "Clone a GitHub project and set up a learning environment with AI teaching rules. Creates both original and my-own directories for hands-on learning.",
    inputSchema: {
      type: "object",
      properties: {
        github_url: {
          type: "string",
          description: "GitHub repository URL to clone (must end with .git)",
        },
        base_path: {
          type: "string",
          description: "Base directory path where the project should be created (optional, defaults to current directory)",
          default: ".",
        },
      },
      required: ["github_url"],
    },
  },
  {
    name: "create_rules_file",
    description:
      "Create or update cursor rules file for AI-assisted learning. Allows customization of teaching approach.",
    inputSchema: {
      type: "object",
      properties: {
        project_path: {
          type: "string",
          description: "Path to the project directory",
        },
        rules_content: {
          type: "string",
          description: "Custom rules content (optional, uses default teaching rules if not provided)",
        },
      },
      required: ["project_path"],
    },
  },
  {
    name: "list_projects",
    description:
      "List all build-my-own projects in the specified directory",
    inputSchema: {
      type: "object",
      properties: {
        base_path: {
          type: "string",
          description: "Base directory to search for projects (optional, defaults to current directory)",
          default: ".",
        },
      },
      required: [],
    },
  },
];

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "clone_and_setup_project": {
        const { github_url, base_path = "." } = args as {
          github_url: string;
          base_path?: string;
        };
        
        const result = await cloneAndSetupProject(github_url, base_path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "create_rules_file": {
        const { project_path, rules_content } = args as {
          project_path: string;
          rules_content?: string;
        };
        
        const result = await createRulesFile(project_path, rules_content);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_projects": {
        const { base_path = "." } = args as {
          base_path?: string;
        };
        
        const result = await listProjects(base_path);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Build-my-own MCP server started");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});