/**
 * Pins the auth slice: the reducer transitions AND the storage side effects,
 * because `rememberMe` is exactly the choice of which storage the tokens live
 * in (localStorage survives the browser, sessionStorage dies with the tab).
 */

import type { User } from '@/types'

import {
  authSlice,
  clearAuth,
  selectAccessToken,
  selectAuthUser,
  setCredentials,
  setUser,
} from './auth-slice'

const signedOut = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  user: null,
}

const user: User = {
  userId: '4f2b8a1c-9d3e-4b6f-8a1c-2e5d7f9b0c3a',
  email: 'ana@constructora.cl',
  firstName: 'Ana',
  lastName: 'Riquelme',
  phone: null,
  isActive: true,
  planId: 2,
  roleId: 3,
  organizationId: '9d3e4b6f-8a1c-2e5d-7f9b-0c3a4f2b8a1c',
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('initial state hydration', () => {
  it('starts signed out when neither storage holds a token', async () => {
    vi.resetModules()
    const mod = await import('./auth-slice')
    expect(mod.authSlice.getInitialState()).toEqual(signedOut)
  })

  it('rehydrates a remembered session from localStorage', async () => {
    vi.resetModules()
    localStorage.setItem('accessToken', 'persisted-access')
    localStorage.setItem('refreshToken', 'persisted-refresh')
    const mod = await import('./auth-slice')
    expect(mod.authSlice.getInitialState()).toEqual({
      ...signedOut,
      accessToken: 'persisted-access',
      refreshToken: 'persisted-refresh',
    })
  })

  it('falls back to sessionStorage for a this-tab-only session', async () => {
    vi.resetModules()
    sessionStorage.setItem('accessToken', 'tab-access')
    sessionStorage.setItem('refreshToken', 'tab-refresh')
    const mod = await import('./auth-slice')
    expect(mod.authSlice.getInitialState().accessToken).toBe('tab-access')
    expect(mod.authSlice.getInitialState().refreshToken).toBe('tab-refresh')
  })
})

describe('setCredentials', () => {
  const payload = {
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
    expiresAt: 1_754_200_000_000,
  }

  it('stores the token pair and expiry in state', () => {
    const next = authSlice.reducer(
      signedOut,
      setCredentials({ ...payload, remember: true }),
    )
    expect(next.accessToken).toBe('access-1')
    expect(next.refreshToken).toBe('refresh-1')
    expect(next.expiresAt).toBe(1_754_200_000_000)
    // The user is fetched separately; credentials alone must not invent one.
    expect(next.user).toBeNull()
  })

  it('persists to localStorage when remember is true, and evicts sessionStorage', () => {
    sessionStorage.setItem('accessToken', 'stale')
    sessionStorage.setItem('refreshToken', 'stale')
    authSlice.reducer(signedOut, setCredentials({ ...payload, remember: true }))
    expect(localStorage.getItem('accessToken')).toBe('access-1')
    expect(localStorage.getItem('refreshToken')).toBe('refresh-1')
    expect(localStorage.getItem('rememberMe')).toBe('1')
    expect(sessionStorage.getItem('accessToken')).toBeNull()
    expect(sessionStorage.getItem('refreshToken')).toBeNull()
  })

  it('persists to sessionStorage when remember is false, and evicts localStorage', () => {
    localStorage.setItem('accessToken', 'stale')
    localStorage.setItem('refreshToken', 'stale')
    authSlice.reducer(
      signedOut,
      setCredentials({ ...payload, remember: false }),
    )
    expect(sessionStorage.getItem('accessToken')).toBe('access-1')
    expect(sessionStorage.getItem('refreshToken')).toBe('refresh-1')
    expect(sessionStorage.getItem('rememberMe')).toBe('0')
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  it('inherits a remembered choice when remember is omitted (token refresh)', () => {
    localStorage.setItem('rememberMe', '1')
    authSlice.reducer(signedOut, setCredentials(payload))
    expect(localStorage.getItem('accessToken')).toBe('access-1')
    expect(sessionStorage.getItem('accessToken')).toBeNull()
  })

  it('defaults an unremembered session to sessionStorage when remember is omitted', () => {
    // No rememberMe flag anywhere — the refresh interceptor must not silently
    // upgrade a this-tab session into a persisted one.
    authSlice.reducer(signedOut, setCredentials(payload))
    expect(sessionStorage.getItem('accessToken')).toBe('access-1')
    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})

describe('setUser', () => {
  it('attaches the fetched user without touching the tokens', () => {
    const signedIn = {
      ...signedOut,
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      expiresAt: 123,
    }
    const next = authSlice.reducer(signedIn, setUser(user))
    expect(next.user).toEqual(user)
    expect(next.accessToken).toBe('access-1')
  })
})

describe('clearAuth', () => {
  it('signs out in state and wipes BOTH storages — logout must leave no token behind', () => {
    localStorage.setItem('accessToken', 'access-1')
    localStorage.setItem('refreshToken', 'refresh-1')
    localStorage.setItem('rememberMe', '1')
    sessionStorage.setItem('accessToken', 'access-2')
    sessionStorage.setItem('refreshToken', 'refresh-2')
    sessionStorage.setItem('rememberMe', '0')

    const next = authSlice.reducer(
      {
        accessToken: 'access-1',
        refreshToken: 'refresh-1',
        expiresAt: 1,
        user,
      },
      clearAuth(),
    )

    expect(next).toEqual(signedOut)
    for (const key of ['accessToken', 'refreshToken', 'rememberMe']) {
      expect(localStorage.getItem(key)).toBeNull()
      expect(sessionStorage.getItem(key)).toBeNull()
    }
  })
})

describe('selectors', () => {
  it('read the token and user from the auth branch of the root state', () => {
    const state = {
      auth: { ...signedOut, accessToken: 'access-1', user },
    }
    expect(selectAccessToken(state)).toBe('access-1')
    expect(selectAuthUser(state)).toEqual(user)
  })

  it('answer null while signed out', () => {
    const state = { auth: signedOut }
    expect(selectAccessToken(state)).toBeNull()
    expect(selectAuthUser(state)).toBeNull()
  })
})
