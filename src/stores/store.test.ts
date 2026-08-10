/**
 * The configured store: every slice mounted under its name, preloaded state
 * accepted (what every component test relies on), and the RTK Query middleware
 * actually running — a `configureStore` without `api.middleware` would still
 * type-check and silently never resolve a query. The sign-out listener's
 * behaviour is pinned in `hooks/use-auth.test.tsx`, not repeated here.
 */

import { api } from '@/services'
import { authApi } from '@/services/auth'

import { makeStore, store, type RootState } from './store'

const SIGNED_IN: Partial<RootState> = {
  auth: {
    accessToken: 'an-access-token',
    refreshToken: 'a-refresh-token',
    expiresAt: null,
    user: null,
  },
}

describe('store wiring', () => {
  it('mounts every slice plus the RTK Query api reducer', () => {
    const state = store.getState()
    for (const key of [api.reducerPath, 'auth', 'locale']) {
      expect(state, `missing slice: ${key}`).toHaveProperty(key)
    }
  })

  it('holds no list filters: those live in the URL', () => {
    // `/projects` and `/tasks` keep their filters, sort and page in the query
    // string, so a listing survives a reload and can be pasted into a message.
    // A slice beside that URL would be a second truth for the same state.
    const state = store.getState()
    expect(state).not.toHaveProperty('projects')
    expect(state).not.toHaveProperty('taskDashboard')
  })

  it('seeds from preloaded state', () => {
    const seeded = makeStore(SIGNED_IN)
    expect(seeded.getState().auth.accessToken).toBe('an-access-token')
  })

  it('runs RTK Query through its middleware: a dispatched fetch lands in the cache', async () => {
    const seeded = makeStore(SIGNED_IN)

    const result = await seeded.dispatch(authApi.endpoints.getMe.initiate())

    expect(result.data).toBeDefined()
    const cached = Object.values(
      seeded.getState()[api.reducerPath].queries,
    ).filter((entry) => entry?.endpointName === 'getMe' && entry.data)
    expect(cached).toHaveLength(1)
  })
})
