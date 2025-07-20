import { rspack } from "@rslib/core";
import { defineConfig } from "@rslib/core";

export default defineConfig({
  lib: [
    {
      format: "umd",
      output: {
        distPath: {
          root: "./dist",
        },
      },
      bundle: true,
    },
  ],
  tools: {
    rspack: {
      plugins: [
        new rspack.CopyRspackPlugin({
          patterns: [{ from: "assets", to: "assets" }],
        }),
      ],
    },
  },
});
