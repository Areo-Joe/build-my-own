import { buildApplication, buildRouteMap } from "@stricli/core";
import { CommandContext } from "@stricli/core";

import { description, name, version } from "../package.json";
import { buildMyOwn } from "./commands/buildMyOwn";
import { mcp } from "./commands/mcp";

const routes = buildRouteMap<"buildMyOwn" | "mcp", CommandContext>({
  routes: {
    buildMyOwn,
    mcp,
  },
  docs: {
    brief: description,
  },
  defaultCommand: "mcp", // MCP mode as default as requested
});

export const app = buildApplication<CommandContext>(routes, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
