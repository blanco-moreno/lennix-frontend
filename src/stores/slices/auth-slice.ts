import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { LOCAL_STORAGE_KEYS } from '@/constants'
import type { User } from '@/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  user: User | null
}

const ACCESS_TOKEN_KEY = LOCAL_STORAGE_KEYS.ACCESS_TOKEN
const REFRESH_TOKEN_KEY = LOCAL_STORAGE_KEYS.REFRESH_TOKEN
const REMEMBER_KEY = LOCAL_STORAGE_KEYS.REMEMBER_ME

/** Read a token without committing to a particular storage; check both
 *  localStorage (persisted across sessions) and sessionStorage (this tab only). */
function readStoredToken(key: string): string | null {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key)
}

/** Persist auth tokens.
 *
 *  ⚠️ KNOWN RISK: both storages are readable by any script on the page, so an
 *  XSS gets the refresh token and with it a renewable session. The fix is a
 *  backend one — move the refresh token to an httpOnly, SameSite cookie and
 *  keep only the short-lived access token in memory. Do not "harden" this by
 *  obfuscating the values, it buys nothing.
 */
function persistTokens(
  accessToken: string,
  refreshToken: string,
  remember: boolean | undefined,
): void {
  const useLocal =
    remember !== undefined
      ? remember
      : localStorage.getItem(REMEMBER_KEY) === '1'

  const target = useLocal ? localStorage : sessionStorage
  const other = useLocal ? sessionStorage : localStorage

  other.removeItem(ACCESS_TOKEN_KEY)
  other.removeItem(REFRESH_TOKEN_KEY)
  other.removeItem(REMEMBER_KEY)

  target.setItem(ACCESS_TOKEN_KEY, accessToken)
  target.setItem(REFRESH_TOKEN_KEY, refreshToken)
  target.setItem(REMEMBER_KEY, useLocal ? '1' : '0')
}

function clearStoredTokens(): void {
  for (const key of [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, REMEMBER_KEY]) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

const initialState: AuthState = {
  accessToken: readStoredToken(ACCESS_TOKEN_KEY),
  refreshToken: readStoredToken(REFRESH_TOKEN_KEY),
  expiresAt: null,
  user: null,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        expiresAt: number
        remember?: boolean
      }>,
    ) {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.expiresAt = action.payload.expiresAt
      persistTokens(
        action.payload.accessToken,
        action.payload.refreshToken,
        action.payload.remember,
      )
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearAuth(state) {
      state.accessToken = null
      state.refreshToken = null
      state.expiresAt = null
      state.user = null
      clearStoredTokens()
    },
  },
  selectors: {
    selectAccessToken: (state) => state.accessToken,
    selectAuthUser: (state) => state.user,
  },
})

export const { setCredentials, setUser, clearAuth } = authSlice.actions
export const { selectAccessToken, selectAuthUser } = authSlice.selectors
