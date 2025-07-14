import { buildCommand, CommandContext } from "@stricli/core";
import { buildMyOwn as buildMyOwnFn } from "../lib/buildMyOwn";

export const buildMyOwn = buildCommand<{}, [string], CommandContext>({
  func(this, _, url) {
    buildMyOwnFn(url);
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
