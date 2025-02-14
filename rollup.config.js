import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const jsConfig = {
  input: './src/main.ts',
  output: {
    dir: 'dist',
    format: 'es',
    entryFileNames: 'http.esm.js',
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false, // 不生成声明文件
    }),
  ],
  external: [],
};

/**
 * @type {import('rollup').RollupOptions}
 */
const typesConfig = {
  input: './src/main.ts',
  output: {
    dir: 'types', // 虽然不会生成JS文件，但仍需要指定输出目录
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.dts.json',
    }),
  ],
  external: [],
};

export default [jsConfig];