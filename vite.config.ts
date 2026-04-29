import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BubbleTree',
      fileName: () => 'bubbletree.js',
      formats: ['es'],
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: (asset) =>
          asset.name === 'style.css' ? 'bubbletree.css' : asset.name ?? '[name][extname]',
      },
    },
  },
});
