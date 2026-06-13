/**
 * vitest.config.ts
 *
 * Vitest is wired up with happy-dom so we get a DOM in unit tests without
 * the start-up cost of jsdom.  Coverage uses the v8 provider (no extra
 * compile step).
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.stories.ts',
        'src/**/*.test.ts',
        'src/__tests__/**',
        'src/stories/**',
        'src/index.ts',
      ],
    },
  },
});
