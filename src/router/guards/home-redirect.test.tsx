/**
 * The first screen after signing in has to be one the actor may open. Before
 * this, `/` and the login form both pointed at `/dashboard`, which a `user`
 * does not hold — so their first impression of the product was the refusal page.
 */

import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedCurrentUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { AuthGuard } from './auth-guard'
import { HomeRedirect } from './home-redirect'

/** A store in the state a fresh sign-in leaves behind: token yes, profile no. */
function storeWithTokenOnly() {
  return makeStore({
    auth: {
      accessToken: 'just-signed-in',
      refreshToken: 'refresh-token',
      expiresAt: null,
      user: null,
    },
  })
}

function homeTree() {
  return (
    <MemoryRouter initialEntries={[PATHS.HOME]}>
      <Routes>
        <Route element={<AuthGuard />}>
          <Route path={PATHS.HOME} element={<HomeRedirect />} />
        </Route>
        <Route path={PATHS.DASHBOARD} element={<div>dashboard</div>} />
        <Route path={PATHS.PROJECTS} element={<div>projects</div>} />
        <Route path={PATHS.LOGIN} element={<div>login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

function serveRole(roleId: number) {
  server.use(
    http.get('*/v1/auth/me', () =>
      HttpResponse.json({ ...seedCurrentUserDTO(), role_id: roleId }),
    ),
  )
}

describe('HomeRedirect', () => {
  it('sends a role holding dashboard.view to the dashboard', async () => {
    // Manager: the same dashboard, narrowed by the server to their obras.
    serveRole(3)
    renderWithProviders(homeTree(), { store: storeWithTokenOnly() })

    await waitFor(() => {
      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })
  })

  it('sends a role without it to the projects list, not to a refusal', async () => {
    serveRole(5)
    renderWithProviders(homeTree(), { store: storeWithTokenOnly() })

    await waitFor(() => {
      expect(screen.getByText('projects')).toBeInTheDocument()
    })
    expect(screen.queryByText(/do not have access/i)).not.toBeInTheDocument()
  })

  it('decides nothing until the role has resolved', async () => {
    serveRole(5)
    renderWithProviders(homeTree(), { store: storeWithTokenOnly() })

    // `AuthGuard` holds a loading screen while `/auth/me` is in flight, so the
    // first paint is never a landing on the wrong home.
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('projects')).toBeInTheDocument()
    })
  })
})
