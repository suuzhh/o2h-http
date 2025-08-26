import oxlint from "eslint-plugin-oxlint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...oxlint.configs["flat/typescript"], // oxlint should be the last one
]);
