/**
 * The gate on every private route: an unauthenticated visit is turned back to
 * login — with the address it was headed to saved for the post-login redirect
 * — while an authenticated session reaches the protected outlet.
 */

import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router'

import { LOCAL_STORAGE_KEYS, PATHS } from '@/constants'
import { makeStore, type RootState } from '@/stores'
import {
  LOCATION_TEST_ID,
  renderWithProviders,
} from '@/tests/render-with-providers'

import { AuthGuard } from './auth-guard'

const SIGNED_IN: Partial<RootState> = {
  auth: {
    accessToken: 'an-access-token',
    refreshToken: 'a-refresh-token',
    expiresAt: null,
    user: null,
  },
}

function guardedApp() {
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/projects" element={<div>private area</div>} />
      </Route>
      <Route path={PATHS.LOGIN} element={<div>login page</div>} />
    </Routes>
  )
}

afterEach(() => {
  localStorage.clear()
})

describe('AuthGuard', () => {
  it('turns an unauthenticated visit back to login and remembers where it was going', async () => {
    renderWithProviders(guardedApp(), {
      store: makeStore(),
      route: '/projects',
    })

    expect(await screen.findByText('login page')).toBeInTheDocument()
    expect(screen.getByTestId(LOCATION_TEST_ID)).toHaveTextContent(PATHS.LOGIN)
    expect(screen.queryByText('private area')).not.toBeInTheDocument()
    expect(localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE)).toBe(
      '/projects',
    )
  })

  it('lets an authenticated session through to the protected outlet', async () => {
    // Credentials preloaded; /auth/me resolves via the MSW seed handler.
    renderWithProviders(guardedApp(), {
      store: makeStore(SIGNED_IN),
      route: '/projects',
    })

    expect(await screen.findByText('private area')).toBeInTheDocument()
    // Nothing was saved: the visit never bounced through login.
    expect(
      localStorage.getItem(LOCAL_STORAGE_KEYS.LAST_VISITED_ROUTE),
    ).toBeNull()
  })
})
