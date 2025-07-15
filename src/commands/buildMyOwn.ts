import { buildCommand, CommandContext } from "@stricli/core";
import { buildMyOwnLegacy } from "../lib/buildMyOwn";

export const buildMyOwn = buildCommand<{}, [string], CommandContext>({
  func(this, _, url) {
    buildMyOwnLegacy(url);
  },
  parameters: {
    positional: {
      kind: "tuple",
      parameters: [
        {
          brief: "The Github url to the project",
          parse: String,
        },
      ],
    },
  },
  docs: {
    brief: "Clone a GitHub project and set up a learning environment with AI teaching rules.",
  },
});
