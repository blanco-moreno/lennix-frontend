import { defineConfig, devices } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

/**
 * The e2e suite: Gherkin scenarios over the production build, served locally
 * with msw answering the API. Scope is deliberately narrow — one scenario per
 * role rule, no edge cases (`docs/TESTING.md` §e2e).
 */
const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: ['e2e/steps/**/*.ts', 'e2e/support/fixtures.ts'],
})

const PORT = 4173
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir,
  outputDir: 'e2e/.results',
  fullyParallel: true,
  // `@pending-ui` marks a rule from docs/PRODUCT.md the UI does not implement
  // yet. The scenario is written and stays out of the run until the gate exists
  // — a red suite nobody can fix teaches the team to ignore the suite.
  grepInvert: /@pending-ui/,
  forbidOnly: !!process.env.CI,
  // One retry in CI, and the trace is kept for it: a flake that leaves no
  // trace is a flake nobody fixes.
  retries: process.env.CI ? 1 : 0,
  // The HTML report is written on every run, not only in CI: `pnpm e2e:report`
  // is only useful if the last local run left something to open. `list` stays
  // as the terminal output; CI adds its own annotations on top.
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/.report', open: 'never' }],
    ...(process.env.CI ? [['github'] as const] : []),
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The production build, not the dev server: e2e guards what ships.
    command: `pnpm build:e2e && pnpm exec serve -s dist -l ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
