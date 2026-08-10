/**
 * A refresh on a permission-gated route must not eject you: only tokens are
 * persisted, so the role arrives later over `/v1/auth/me` — the guard must read
 * the query-backed snapshot, not the slice that trails it by one commit.
 */

import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'

import { PATHS } from '@/constants'
import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedCurrentUserDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { AuthGuard } from './auth-guard'
import { PermissionGuard } from './permission-guard'

/** A store in the state a hard refresh leaves behind: token yes, user no. */
function storeAfterRefresh() {
  return makeStore({
    auth: {
      accessToken: 'refresh-survived-this',
      refreshToken: 'refresh-token',
      expiresAt: null,
      user: null,
    },
  })
}

/**
 * Records every path the router lands on, not just the last one.
 *
 * `<Navigate replace>` erases the entry it leaves, so asserting on the final
 * location would pass even if the user had been bounced to `/projects` and
 * back — which is exactly the flicker the owner reported.
 */
function PathRecorder({ into }: { into: string[] }) {
  const { pathname } = useLocation()
  if (into.at(-1) !== pathname) into.push(pathname)
  return null
}

function guardedTree(visited: string[]) {
  return (
    <MemoryRouter initialEntries={[PATHS.DASHBOARD]}>
      <PathRecorder into={visited} />
      <Routes>
        <Route element={<AuthGuard />}>
          <Route element={<PermissionGuard permission="dashboard.view" />}>
            <Route path={PATHS.DASHBOARD} element={<div>dashboard</div>} />
          </Route>
        </Route>
        <Route path={PATHS.PROJECTS} element={<div>projects</div>} />
        <Route path={PATHS.LOGIN} element={<div>login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('PermissionGuard while the role is still resolving', () => {
  it('keeps an authenticated user on the gated route across a refresh', async () => {
    const visited: string[] = []
    renderWithProviders(guardedTree(visited), { store: storeAfterRefresh() })

    // The seed's current user is Carlos, roleId 1 (admin) — he holds
    // `dashboard.view`, so the only correct destination is /dashboard.
    await waitFor(() => {
      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })
    expect(screen.queryByText('projects')).not.toBeInTheDocument()
  })

  it('never routes through /projects on the way there', async () => {
    const visited: string[] = []
    renderWithProviders(guardedTree(visited), { store: storeAfterRefresh() })

    await waitFor(() => {
      expect(screen.getByText('dashboard')).toBeInTheDocument()
    })

    expect(visited).not.toContain(PATHS.PROJECTS)
    expect(visited).toEqual([PATHS.DASHBOARD])
  })
})

describe('PermissionGuard refusing', () => {
  it('shows the no-access page and stays on the URL — no silent redirect', async () => {
    // Field supervisor (role 5) does not hold `dashboard.view`. The profile
    // snapshot prefers the `/v1/auth/me` answer, so the role is set there.
    server.use(
      http.get('*/v1/auth/me', () =>
        HttpResponse.json({ ...seedCurrentUserDTO(), role_id: 5 }),
      ),
    )
    const visited: string[] = []
    renderWithProviders(guardedTree(visited), { store: storeAfterRefresh() })

    expect(await screen.findByText(/do not have access/i)).toBeInTheDocument()
    expect(screen.queryByText('dashboard')).not.toBeInTheDocument()
    // The refusal is a page at the same address, not a bounce.
    expect(visited).toEqual([PATHS.DASHBOARD])
  })
})
