import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

const packageJson = require('./package.json');

const baseConfig = {
  input: 'src/index.js',
  external: ['axios', 'crypto-js'],
  plugins: [
    nodeResolve({
      preferBuiltins: false,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      presets: [['@babel/preset-env', { targets: { node: '14' } }]],
    }),
  ],
};

export default [
  // CommonJS build
  {
    ...baseConfig,
    output: {
      file: packageJson.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins,
      typescript({
        tsconfig: 'tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
  // ES Module build
  {
    ...baseConfig,
    output: {
      file: packageJson.module,
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins,
      typescript({
        tsconfig: 'tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
  // UMD build (minified)
  {
    ...baseConfig,
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'LicenseChain',
      sourcemap: true,
    },
    plugins: [
      ...baseConfig.plugins,
      typescript({
        tsconfig: 'tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
      terser(),
    ],
  },
  // TypeScript definitions
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

