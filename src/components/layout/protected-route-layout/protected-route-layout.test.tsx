/**
 * The shell every protected route renders inside. What it owns — and what
 * these pin — is the role-scoped sidebar: which entries a role sees at all.
 */

import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import { pageOf, seedUser } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ProtectedRouteLayout } from './protected-route-layout'

/** Role ids: 1 owner, 5 user. */
function renderLayout(roleId: number) {
  // The approvals badge polls both approval lists; the mock set has no
  // budget-approvals handler, so answer it locally.
  server.use(
    http.get('*/v1/budget-approvals', () => HttpResponse.json(pageOf([]))),
  )

  const carlos = seedUser(SEED_IDS.USER_CARLOS_ID)
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: carlos.userId,
      email: carlos.email,
      firstName: carlos.firstName,
      lastName: carlos.lastName,
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(<ProtectedRouteLayout />, {
    store,
    route: '/projects',
  })
}

describe('ProtectedRouteLayout — role-scoped sidebar', () => {
  it('shows an admin the full navigation, approvals and trash included', async () => {
    renderLayout(1)

    expect(
      await screen.findByRole('button', { name: /approvals/i }),
    ).toBeInTheDocument()
    for (const label of [
      'Dashboard',
      'Projects',
      'Activities',
      'Import schedule',
      'Drafts',
      'Trash',
      'Team',
      'Settings',
    ]) {
      expect(
        screen.getByRole('button', { name: new RegExp(label, 'i') }),
      ).toBeInTheDocument()
    }
    // Grouped by mode of work, with the header naming the group.
    expect(screen.getByTestId('nav-group-groupSchedules')).toBeInTheDocument()
  })

  it('hides the organization-wide entries from a `user`', async () => {
    renderLayout(5)

    expect(
      await screen.findByRole('button', { name: /projects/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /settings/i }),
    ).toBeInTheDocument()
    // Approvals stays: a `user` reaches the same home to watch their own
    // requests, read-only. Everything else here belongs to owner/admin.
    expect(
      screen.getByRole('button', { name: /approvals/i }),
    ).toBeInTheDocument()
    for (const label of [
      'Dashboard',
      'Import schedule',
      'Drafts',
      'Trash',
      'Team',
    ]) {
      expect(
        screen.queryByRole('button', { name: new RegExp(label, 'i') }),
      ).toBeNull()
    }
    // A group with every item hidden disappears with its header.
    expect(screen.queryByTestId('nav-group-groupSchedules')).toBeNull()
    expect(
      screen.queryByTestId('nav-group-groupManagement'),
    ).toBeInTheDocument()
  })
})
