import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm', 'cjs'],
  entry: ['src/cli.ts'],
  target: 'node14',
  splitting: true,
  sourcemap: true,
  clean: true,
});
