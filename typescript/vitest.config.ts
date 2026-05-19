import { defineConfig } from 'vitest/config';
import { quickpickle } from 'quickpickle';

export default defineConfig({
  plugins: [
    quickpickle({
      stepTimeout: 15000,
    }),
  ],
  resolve: {
    dedupe: ['quickpickle'],
  },
  test: {
    include: ['../features/**/*.feature'],
    setupFiles: ['test/quickpickle.ts'],
    testTimeout: 30000,
    server: {
      deps: {
        inline: ['quickpickle'],
      },
    },
  },
});
