import { test as base, createBdd } from 'playwright-bdd'

import { MOCK_ACTOR_KEY } from '../../src/mocks/actor-key'

import { actorIdFor } from './roles'

interface LennixFixtures {
  /** The role the running scenario is playing. */
  actor: { role: string }
  /** Who msw answers as — without a session. The login scenario needs this half. */
  playRole: (role: string) => Promise<void>
  signInAs: (role: string) => Promise<void>
}

/**
 * A session, planted.
 *
 * The app holds its session as two tokens in storage and reads the profile from
 * `GET /v1/auth/me`; msw answers that call as whoever `MOCK_ACTOR_KEY` names. So
 * signing in as a role is a few writes before the first navigation — no login
 * form and no backend. The login screen is exercised by its own scenario, which
 * is the only place a real form belongs.
 */
export const test = base.extend<LennixFixtures>({
  actor: async ({}, use) => {
    await use({ role: '' })
  },
  playRole: async ({ page, actor }, use) => {
    await use(async (role: string) => {
      actor.role = role
      await page.addInitScript(
        ([key, id]) => {
          localStorage.setItem(key, id)
          // Scenarios are written in English, so the app runs in English —
          // the same bundle the unit tests assert against. `es` stays the
          // launch default everywhere else.
          localStorage.setItem('lennix.locale', 'en')
        },
        [MOCK_ACTOR_KEY, actorIdFor(role)] as const,
      )
    })
  },
  signInAs: async ({ page, playRole }, use) => {
    await use(async (role: string) => {
      await playRole(role)
      await page.addInitScript(() => {
        localStorage.setItem('accessToken', 'e2e.access-token')
        localStorage.setItem('refreshToken', 'e2e.refresh-token')
        localStorage.setItem('rememberMe', '1')
      })
    })
  },
})

export const { Given, When, Then } = createBdd(test)
