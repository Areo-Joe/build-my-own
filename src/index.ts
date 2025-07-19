#!/usr/bin/env node
import { run } from "@stricli/core";

import { app } from "./app";
import { buildContext } from "./context";
import { debug } from "./lib/logger";

// Wrap in an async function and handle as Promise
(async () => {
  try {
    await run(app, process.argv.slice(2), buildContext(process));
  } catch (error) {
    debug("Error:", error);
    throw error; // Throw the error instead of exiting
  }
})();
