import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: "./src/main.ts",
  outDir: "./dist2",
  // options about  https://github.com/sxzz/rolldown-plugin-dts
  dts: {
    tsconfig: "./tsconfig.dts.json",
  },
  outputOptions: {
    format: "esm",
    entryFileNames: "http.esm.js",
  }
});
