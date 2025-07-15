import { buildApplication, buildCommand } from "@stricli/core";
import { CommandContext } from "@stricli/core";

import { description, name, version } from "../package.json";
import { buildMyOwnLegacy } from "./lib/buildMyOwn";

const mainCommand = buildCommand<{ github?: string }, [], CommandContext>({
  func(this, { github }) {
    if (github) {
      // CLI mode with --github flag
      buildMyOwnLegacy(github);
    } else {
      // Default MCP mode
      require("./mcp-server");
    }
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [],
    },
    flags: {
      github: {
        kind: "parsed",
        brief: "GitHub URL to clone and set up a learning environment",
        parse: String,
      },
    },
  },
  docs: {
    brief: description,
  },
});

export const app = buildApplication<CommandContext>(mainCommand, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
