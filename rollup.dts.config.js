import { dts } from "rollup-plugin-dts";

/**
 * @returns {import('rollup').RollupOptions}
 */
function mergeDtsConfig() {
  return {
    
    input: `./types/src/main.d.ts`,
    output: {
      file: `types/http.d.ts`,
      format: "es",
    },
    plugins: [dts()]
  };
}

/**
 * @type {import('rollup').RollupOptions}
 */
export default [mergeDtsConfig()];
