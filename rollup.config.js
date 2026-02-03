import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig([
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/index.js',
        format: 'esm',
        sourcemap: !isProduction
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        sourcemap: !isProduction
      }
    ],
    external: [
      'fs',
      'path',
      'worker_threads',
      'acorn',
      'acorn-typescript',
      'escodegen',
      'estraverse',
      'chalk',
      'minimist'
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug']
        },
        mangle: {
          reserved: ['compile', 'check', 'clearCache']
        }
      })
    ].filter(Boolean)
  },
  {
    input: 'bin/tsl.js',
    output: {
      file: 'dist/bin/tsl.js',
      format: 'esm',
      banner: '#!/usr/bin/env node',
      sourcemap: !isProduction
    },
    external: [
      'fs',
      'path',
      'worker_threads',
      'acorn',
      'acorn-typescript',
      'escodegen',
      'estraverse',
      'chalk',
      'minimist'
    ],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      isProduction && terser({
        compress: {
          drop_console: false,
          drop_debugger: true
        }
      })
    ].filter(Boolean)
  }
]);
