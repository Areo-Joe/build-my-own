import { buildCommand, CommandContext } from "@stricli/core";

export const mcp = buildCommand<{}, [], CommandContext>({
  func(this) {
    // Import and start MCP server
    require("../mcp-server");
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
  },
  docs: {
    brief: "Start MCP (Model Context Protocol) server for AI integration",
  },
});