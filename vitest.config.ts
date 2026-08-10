import path from 'path'

import { defineConfig } from 'vitest/config'

/**
 * Coverage is repo-wide (the refactor's owner rule, 2026-08-02): every
 * `.ts`/`.tsx` is on the floor. Exemptions are only files with nothing to
 * verify — barrels, type-only modules, message catalogs, constants, test
 * infrastructure, mocks and the bootstrap.
 */
const COVERAGE_FLOOR = {
  statements: 80,
  branches: 80,
  functions: 80,
  lines: 80,
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    /**
     * Threads, not the default forked processes: the per-file cost here is
     * dominated by re-importing the module graph (setup + import were 870s of
     * the 1030s of CPU a full run spent), and a worker thread keeps Vite's
     * module cache warm across the files it runs. Measured 121s -> 112s.
     *
     * `isolate` stays on. Turning it off drops the run to 67s, but 489 tests
     * fail: the suite shares a jsdom document and module-level state across
     * files. Making it isolation-safe is a real piece of work, not a flag.
     */
    pool: 'threads',
    // Vitest owns `src/`; the Gherkin specs playwright-bdd generates are
    // Playwright's and would be collected here otherwise.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/setupTests.ts'],
    /**
     * Vitest defaults to 5s, which is a generic number: these are component
     * tests that render, go through MSW and wait on a round trip, and CI runs
     * them in parallel on two cores under v8 coverage instrumentation. The
     * heaviest of them measured 0.6s locally and 5.08s there — failing on the
     * machine, not on the code. A hung test still fails, just later.
     */
    testTimeout: 15000,
    hookTimeout: 15000,
    env: {
      VITE_API_BASE_URL: 'http://localhost:8000',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      // Count every source file, not only those a test happens to import —
      // an untested file has to show up as a gap.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/index.ts',
        'src/setupTests.ts',
        'src/tests/**',
        'mocks/**',
        'scripts/**',
        '*.config.{js,ts}',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/mocks/**',
        '**/*-messages.ts',
        'src/types/**',
        '**/constants.ts',
        'src/constants/**',
      ],
      thresholds: COVERAGE_FLOOR,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
