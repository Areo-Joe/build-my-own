#!/usr/bin/env node
import { run } from "@stricli/core";

import { app } from "./app";
import { buildContext } from "./context";

// Wrap in an async function and handle as Promise
(async () => {
  try {
    await run(app, process.argv.slice(2), buildContext(process));
  } catch (error) {
    console.error("Error:", error);
    throw error; // Throw the error instead of exiting
  }
})();
