import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore, type RootState } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  seedCriticalPathSummaryDTO,
} from '@/tests/fixtures'

import { analyticsApi } from './analytics/analytics-service'
import { api } from './api-injector'

describe('api-injector', () => {
  it('should export api instance', () => {
    expect(api).toBeDefined()
    expect(typeof api).toBe('object')
  })

  it('should have required RTK Query properties', () => {
    expect(api.endpoints).toBeDefined()
    expect(api.injectEndpoints).toBeDefined()
  })
})

/**
 * FE-2 — the refresh token rotates and is single-use. Without a single-flight
 * guard, N concurrent 401s fire N refresh calls, N-1 of them fail against the
 * already-rotated token, and the user is logged out for no reason.
 */
describe('refresh-token single flight (FE-2)', () => {
  const STALE_ACCESS = 'stale-access-token'
  const STALE_REFRESH = 'stale-refresh-token'
  const FRESH_ACCESS = 'fresh-access-token'

  const PROJECT_IDS = [
    'b0000000-0000-0001-0000-000000000000',
    'b0000000-0000-0002-0000-000000000000',
    'b0000000-0000-0003-0000-000000000000',
  ]

  function preloadedAuth(): Partial<RootState> {
    return {
      auth: {
        accessToken: STALE_ACCESS,
        refreshToken: STALE_REFRESH,
        expiresAt: null,
        user: null,
      },
    }
  }

  /** Only the fresh token is accepted; everything else 401s. */
  function useProtectedEndpoint() {
    server.use(
      http.get(
        '*/v1/analytics/projects/:projectId/critical-paths',
        ({ request }) => {
          if (request.headers.get('Authorization') !== `Bearer ${FRESH_ACCESS}`)
            return new HttpResponse(null, { status: 401 })
          return HttpResponse.json(
            seedCriticalPathSummaryDTO(DEFAULT_SEED_PROJECT_ID),
          )
        },
      ),
    )
  }

  /** Rotating refresh endpoint: the stale token works exactly once. */
  function useRotatingRefresh() {
    let refreshCalls = 0
    let consumed = false
    server.use(
      http.post('*/v1/auth/refresh-token', async ({ request }) => {
        refreshCalls++
        const body = (await request.json()) as { refresh_token: string }
        if (body.refresh_token !== STALE_REFRESH || consumed)
          return new HttpResponse(null, { status: 401 })
        consumed = true
        return HttpResponse.json({
          token_type: 'bearer',
          access_token: FRESH_ACCESS,
          expires_at: 1_800_000_000,
          refresh_token: 'fresh-refresh-token',
          refresh_token_expires_at: 1_800_000_000,
        })
      }),
    )
    return () => refreshCalls
  }

  afterEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('fires a single refresh for N parallel 401s and does not log out', async () => {
    useProtectedEndpoint()
    const getRefreshCalls = useRotatingRefresh()
    const store = makeStore(preloadedAuth())

    const results = await Promise.all(
      PROJECT_IDS.map(async (id) =>
        store.dispatch(analyticsApi.endpoints.getCriticalPaths.initiate(id)),
      ),
    )

    expect(getRefreshCalls()).toBe(1)
    for (const result of results) expect(result.isSuccess).toBe(true)
    expect(store.getState().auth.accessToken).toBe(FRESH_ACCESS)
  })

  it('clears auth exactly once when the refresh itself fails', async () => {
    useProtectedEndpoint()
    let refreshCalls = 0
    server.use(
      http.post('*/v1/auth/refresh-token', () => {
        refreshCalls++
        return new HttpResponse(null, { status: 401 })
      }),
    )
    const store = makeStore(preloadedAuth())

    const results = await Promise.all(
      PROJECT_IDS.map(async (id) =>
        store.dispatch(analyticsApi.endpoints.getCriticalPaths.initiate(id)),
      ),
    )

    expect(refreshCalls).toBe(1)
    expect(store.getState().auth.accessToken).toBeNull()
    // A sign-out drops the whole RTK Query cache, and a failed refresh is one —
    // so the entries are gone rather than holding an error, and no caller is
    // left reading data that belongs to a session that ended.
    for (const result of results) expect(result.isSuccess).toBe(false)
  })

  /**
   * A refusal to *spend* the refresh token is not a rejection *of* it. The auth
   * limits are keyed per client IP, so an office behind one NAT shares the
   * refresh budget — a 429 must not sign the user out.
   */
  it.each([
    ['rate-limited', 429],
    ['server error', 503],
  ])('keeps the session when the refresh is %s', async (_label, status) => {
    useProtectedEndpoint()
    let refreshCalls = 0
    server.use(
      http.post('*/v1/auth/refresh-token', () => {
        refreshCalls++
        return new HttpResponse(null, { status })
      }),
    )
    const store = makeStore(preloadedAuth())

    const results = await Promise.all(
      PROJECT_IDS.map(async (id) =>
        store.dispatch(analyticsApi.endpoints.getCriticalPaths.initiate(id)),
      ),
    )

    expect(refreshCalls).toBe(1)
    // The requests still fail — we could not get a usable token — but the
    // credentials survive, so the next attempt refreshes instead of landing on
    // a login screen.
    for (const result of results) expect(result.isError).toBe(true)
    expect(store.getState().auth.accessToken).toBe(STALE_ACCESS)
    expect(store.getState().auth.refreshToken).toBe(STALE_REFRESH)
  })

  it('does not retry with the stale token when the refresh is deferred', async () => {
    let protectedCalls = 0
    server.use(
      http.get('*/v1/analytics/projects/:projectId/critical-paths', () => {
        protectedCalls++
        return new HttpResponse(null, { status: 401 })
      }),
      http.post(
        '*/v1/auth/refresh-token',
        () => new HttpResponse(null, { status: 429 }),
      ),
    )
    const store = makeStore(preloadedAuth())

    await store.dispatch(
      analyticsApi.endpoints.getCriticalPaths.initiate(PROJECT_IDS[0]),
    )

    // One attempt, not two: retrying with a token we already know is stale only
    // burns another request and reads to the caller as "signed out".
    expect(protectedCalls).toBe(1)
  })
})
