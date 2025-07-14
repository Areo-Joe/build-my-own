import { buildApplication, buildRouteMap } from "@stricli/core";
import { CommandContext } from "@stricli/core";

import { description, name, version } from "../package.json";
import { buildMyOwn } from "./commands/buildMyOwn";

const routes = buildRouteMap<"buildMyOwn", CommandContext>({
  routes: {
    buildMyOwn,
  },
  docs: {
    brief: description,
  },
  defaultCommand: "buildMyOwn",
});

export const app = buildApplication<CommandContext>(routes, {
  name,
  versionInfo: {
    currentVersion: version,
  },
});
