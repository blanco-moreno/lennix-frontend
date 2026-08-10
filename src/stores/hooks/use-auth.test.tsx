/**
 * Clicking "sign out" must not leave you inside the private app.
 *
 * `useAuth` resolves the current user as `meData ?? storedUser`. `clearAuth`
 * empties the slice and the stored tokens; if the RTK Query cache survived it,
 * `meData` would keep `user` truthy and `AuthGuard` would see an authenticated
 * user until a later refetch failed against the cleared token.
 */

import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { api } from '@/services'
import { authApi } from '@/services/auth'

import enMessages from '../../../lang/en.json'
import { clearAuth } from '../slices/auth-slice'
import { makeStore, type RootState } from '../store'

import { useAuth, useAuthActions } from './use-auth'

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}))

const SIGNED_IN: Partial<RootState> = {
  auth: {
    accessToken: 'an-access-token',
    refreshToken: 'a-refresh-token',
    expiresAt: null,
    user: null,
  },
}

function wrapperFor(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <IntlProvider locale="en" messages={enMessages}>
          {children}
        </IntlProvider>
      </Provider>
    )
  }
}

/** Cached `getMe` results still held by the api slice. */
function cachedMeEntries(store: ReturnType<typeof makeStore>) {
  const queries = store.getState()[api.reducerPath].queries
  return Object.values(queries).filter(
    (entry) => entry?.endpointName === 'getMe' && entry.data !== undefined,
  )
}

describe('signing out', () => {
  it('leaves no user behind for AuthGuard to read', async () => {
    const store = makeStore(SIGNED_IN)
    const { result } = renderHook(
      () => ({ ...useAuth(), ...useAuthActions() }),
      { wrapper: wrapperFor(store) },
    )

    await waitFor(() => expect(result.current.user).toBeTruthy())

    act(() => {
      result.current.handleLogout()
    })

    await waitFor(() => expect(result.current.user).toBeFalsy())
  })

  it('drops the cached /auth/me response on every sign-out path', async () => {
    // Dispatched directly, not through `handleLogout`: `delete-account-card`
    // and the 401 refresh interceptor end a session this way too, so the rule
    // hangs off the action rather than off the sidebar button.
    const store = makeStore(SIGNED_IN)

    await store.dispatch(authApi.endpoints.getMe.initiate())
    expect(cachedMeEntries(store)).toHaveLength(1)

    store.dispatch(clearAuth())

    expect(cachedMeEntries(store)).toHaveLength(0)
    expect(store.getState().auth.accessToken).toBeNull()
  })

  it('says so in the session language, not hardcoded Spanish', () => {
    const store = makeStore(SIGNED_IN)
    const { result } = renderHook(() => useAuthActions(), {
      wrapper: wrapperFor(store),
    })

    act(() => {
      result.current.handleLogout()
    })

    expect(toast.success).toHaveBeenCalledWith('Signed out', expect.anything())
  })
})
