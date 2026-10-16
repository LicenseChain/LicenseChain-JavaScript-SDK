import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import fs from 'node:fs';

const packageJson = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function buildPlugins({ minify = false, declarations = false } = {}) {
  const plugins = [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: declarations,
      declarationDir: declarations ? 'dist' : undefined,
      sourceMap: true,
    }),
    nodeResolve({ preferBuiltins: false }),
    commonjs(),
  ];
  if (minify) plugins.push(terser());
  return plugins;
}

const external = ['axios', 'crypto-js', 'jose', 'crypto'];

export default [
  {
    input: 'src/index.ts',
    external,
    output: {
      file: packageJson.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins: buildPlugins({ declarations: true }),
  },
  {
    input: 'src/index.ts',
    external,
    output: {
      file: packageJson.module,
      format: 'es',
      sourcemap: true,
    },
    plugins: buildPlugins(),
  },
  {
    input: 'src/index.ts',
    external,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LicenseChain',
      globals: {
        axios: 'axios',
        'crypto-js': 'CryptoJS',
        jose: 'jose',
      },
      sourcemap: true,
    },
    plugins: buildPlugins({ minify: true }),
  },
  {
    input: 'src/index.ts',
    output: {
      file: packageJson.types,
      format: 'es',
    },
    plugins: [dts()],
    external: [/\.css$/],
  },
];
