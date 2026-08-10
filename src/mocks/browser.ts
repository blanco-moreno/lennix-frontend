/**
 * The same handlers Vitest serves, in a real browser — the e2e HTTP layer.
 *
 * There is no second set of stubs on purpose: a fixture edited for a unit test
 * must move the e2e suite with it, or the two drift and one of them starts
 * lying. `public/mockServiceWorker.js` is the worker script msw generated
 * (`msw.workerDirectory` in package.json keeps it current).
 */

import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
