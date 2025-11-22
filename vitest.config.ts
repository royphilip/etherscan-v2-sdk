import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    maxThreads: 1, // Run tests sequentially to avoid mock interference
    // CI-specific settings
    ...(process.env.CI && {
      retry: 2, // Retry failed tests in CI
      testTimeout: 30000, // 30 second timeout
      hookTimeout: 30000,
    }),
  },
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: [
      'node_modules/',
      'tests/',
      'dist/',
      '**/*.d.ts',
      '**/*.config.ts',
      'src/index.ts', // Just re-exports
    ],
  },
});