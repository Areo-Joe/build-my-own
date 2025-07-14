import { buildCommand, CommandContext } from "@stricli/core";

export const buildMyOwn = buildCommand<{}, [string], CommandContext>({
  func(this, _, url) {
    console.log("Github", url);
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
    brief: "Transform STDIO to POST and SSE in cloudbase cloudrun.",
  },
});
