import { defineConfig } from 'tsup';
import { version } from './package.json';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  minify: true,
  shims: true,
  define: {
    'process.env.VERSION': JSON.stringify(version),
  },
});
