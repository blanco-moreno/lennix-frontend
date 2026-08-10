import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'
import { Mutex } from 'async-mutex'
import toast from 'react-hot-toast'

import { translate, apiErrorMessages } from '@/i18n'
import type { RootState } from '@/stores'
import { setCredentials, clearAuth } from '@/stores/slices/auth-slice'
import type { AccessTokenResponseDTO } from '@/types/dto/auth-dto'

import { CACHE_TAG_TYPES } from './cache-tags'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
/**
 * Error type produced by our `baseQuery`. Extends RTK Query's
 * `FetchBaseQueryError` with a guaranteed `message: string` derived from the
 * backend's `detail` field.
 */
export type ApiError = FetchBaseQueryError & { message: string }

/** Pull a user-facing string out of an arbitrary FastAPI error body. */
function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string' && data.trim() !== '') return data
  if (data && typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string' && detail.trim() !== '') return detail
    if (
      detail &&
      typeof detail === 'object' &&
      'message' in detail &&
      typeof (detail as { message: unknown }).message === 'string'
    ) {
      return (detail as { message: string }).message
    }
  }
  return fallback
}

/**
 * The machine-readable half of a structured FastAPI error
 * (`detail: {code, message}`) — the reason a refusal happened, free of the
 * English the `message` carries, so the client can say it in its own words.
 */
export function apiErrorCode(error: unknown): string | null {
  const data = (error as { data?: unknown } | null)?.data
  if (!data || typeof data !== 'object' || !('detail' in data)) return null
  const detail = (data as { detail: unknown }).detail
  if (!detail || typeof detail !== 'object' || !('code' in detail)) return null
  const code = (detail as { code: unknown }).code
  return typeof code === 'string' ? code : null
}

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

/**
 * Single-flight guard around the refresh call.
 *
 * Refresh tokens rotate and are single-use: if N requests fail with 401 at the
 * same time and each fires its own refresh, only the first succeeds and the
 * rest get a 401 back. The mutex funnels every concurrent 401 through one
 * refresh; the waiters observe the already-rotated token and simply retry.
 */
const refreshMutex = new Mutex()

/**
 * Bumped once per completed refresh attempt, whatever its outcome.
 *
 * Watching the access token change only detects attempts that mutate auth
 * state — a deferred refresh mutates nothing on purpose, so waiters need this
 * counter to tell "an attempt already happened" from "I am first".
 */
let refreshGeneration = 0

/**
 * Did the refresh fail for a reason that says nothing about the token?
 *
 * A 401/403 means the refresh token is spent or rejected — that is a real
 * logout. A 429, a 5xx or a dropped connection mean we could not *ask* right
 * now, and the token is still good — never treat those as a logout.
 */
function isTransientRefreshFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('status' in error)) return false
  const status = (error as { status: unknown }).status
  if (typeof status === 'number') return status === 429 || status >= 500
  // fetchBaseQuery's non-HTTP failures: the request never got an answer.
  return status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR'
}

/**
 * The base query with interceptors: a 401 triggers a single-flight token
 * refresh and retry (logout when the refresh itself is rejected), a 403 raises
 * one de-duplicated toast, and every error is normalized to carry `message`.
 */
const baseQueryWithInterceptors: BaseQueryFn<
  string | FetchArgs,
  unknown,
  ApiError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Snapshot the token this request failed with, *before* queueing on the
    // mutex: if it differs once we hold the lock, somebody else refreshed for us.
    const staleAccessToken = (api.getState() as RootState).auth.accessToken
    const generationBefore = refreshGeneration
    let refreshDeferred = false

    await refreshMutex.runExclusive(async () => {
      const state = api.getState() as RootState

      // Somebody refreshed while we queued. If it produced a token we retry
      // with it; if the token is untouched the attempt was deferred, and a
      // hard failure would have cleared auth instead.
      if (refreshGeneration !== generationBefore) {
        refreshDeferred = state.auth.accessToken === staleAccessToken
        return
      }

      const refreshToken = state.auth.refreshToken
      if (!refreshToken) {
        api.dispatch(clearAuth())
        return
      }

      const refreshResult = await baseQuery(
        {
          url: '/v1/auth/refresh-token',
          method: 'POST',
          body: { refresh_token: refreshToken },
        },
        api,
        extraOptions,
      )
      refreshGeneration++

      if (refreshResult.data) {
        const tokens = refreshResult.data as AccessTokenResponseDTO
        api.dispatch(
          setCredentials({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expires_at,
          }),
        )
      } else if (isTransientRefreshFailure(refreshResult.error)) {
        // The refresh token is still valid — we just could not spend it right
        // now. Clearing auth would log the user out over a hiccup:
        // `/v1/auth/refresh-token` is limited per client IP, so an office
        // behind one NAT shares the budget. Keep the session; the next request
        // refreshes again.
        refreshDeferred = true
      } else {
        api.dispatch(clearAuth())
      }
    })

    if (refreshDeferred) {
      // Retrying would spend the still-stale token on another 401, and the
      // caller would read it as "signed out". Say what actually happened.
      toast.error(translate(apiErrorMessages.tooManyRequests), {
        id: 'api-refresh-deferred',
      })
    } else if ((api.getState() as RootState).auth.accessToken) {
      // Retry only if we still hold credentials (refresh succeeded, or a
      // concurrent one did it for us). A cleared auth state means logout.
      result = await baseQuery(args, api, extraOptions)
    }
  }

  if (result.error && result.error.status === 403) {
    // Surface a friendly access-denied message once (de-duped by toast id).
    // The fallback goes through react-intl via the imperative bridge — this
    // interceptor is outside the React tree, so `useIntl()` isn't available.
    toast.error(
      extractMessage(result.error.data, translate(apiErrorMessages.forbidden)),
      { id: 'api-forbidden' },
    )
  }

  if (result.error) {
    const apiError = result.error as ApiError
    apiError.message = extractMessage(result.error.data, 'Request failed')
    return { error: apiError }
  }

  return result
}

export const api = createApi({
  baseQuery: baseQueryWithInterceptors,
  endpoints: () => ({}),
  tagTypes: [...CACHE_TAG_TYPES],
})
