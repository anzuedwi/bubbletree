/**
 * vite.config.ts
 *
 * Library build configuration.  Emits a single ESM bundle (bubbletree.js)
 * plus a concatenated bubbletree.css.  Storybook drives the same Vite
 * pipeline through @storybook/web-components-vite.
 */
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        bubbletree: resolve(__dirname, 'src/index.ts'),
        components: resolve(__dirname, 'src/components/index.ts'),
      },
      formats: ['es'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: (asset) =>
          asset.name === 'style.css' ? 'bubbletree.css' : asset.name ?? '[name][extname]',
        entryFileNames: '[name].js',
      },
    },
  },
});
