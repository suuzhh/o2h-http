import { defineConfig } from "tsdown/config";

export default defineConfig([
  {
    entry: {
      http: "./src/main.ts",
    },
    outDir: "./dist",
    // options about  https://github.com/sxzz/rolldown-plugin-dts
    dts: {
      tsconfig: "./tsconfig.dts.json",
    },
    outputOptions: {
      format: "esm",
    },
  },
]);
