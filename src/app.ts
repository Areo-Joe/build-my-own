import { buildApplication, buildCommand } from "@stricli/core";
import { CommandContext } from "@stricli/core";

import { description, name, version } from "../package.json";
import { runMcpServer } from "./mcp-server";
import { cloneAndSetupProject } from "./lib/utils";

const mainCommand = buildCommand<{ github?: string }, [], CommandContext>({
  func: async ({ github }) => {
    if (github) {
      // CLI mode with --github flag
      cloneAndSetupProject(github);
    } else {
      await runMcpServer();
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
        optional: true,
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
