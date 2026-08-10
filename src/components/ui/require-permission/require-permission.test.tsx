import { screen, waitFor } from '@testing-library/react'

import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import type { User } from '@/types'

import { RequirePermission } from './require-permission'

/**
 * Behaviour pinned: children render when the matrix allows, the default
 * fallback is nothing, and an explicit `fallback` replaces children when denied.
 */

function authUserFor(roleId: number): User {
  const seed = SEED_USERS.find((user) => user.roleId === roleId)
  if (!seed) throw new Error(`no seeded user carries roleId ${roleId}`)
  return {
    userId: seed.userId,
    email: seed.email,
    firstName: seed.firstName,
    lastName: seed.lastName,
    phone: null,
    isActive: true,
    planId: SEED_ORGANIZATION.planId,
    roleId: seed.roleId,
    organizationId: SEED_ORGANIZATION.id,
  }
}

/** Tokenless on purpose: `getMe` stays skipped, so the MSW `/v1/auth/me`
 *  handler (always Carlos, owner) cannot shadow the role under test. */
function storeWithProfile(user: User | null) {
  return makeStore({
    auth: { accessToken: null, refreshToken: null, expiresAt: null, user },
  })
}

describe('<RequirePermission />', () => {
  it('renders its children for a role the matrix allows', () => {
    // Owner (Carlos, roleId 1) holds project.delete.
    renderWithProviders(
      <RequirePermission permission="project.delete">
        <button>Delete project</button>
      </RequirePermission>,
      { store: storeWithProfile(authUserFor(1)) },
    )
    expect(
      screen.getByRole('button', { name: 'Delete project' }),
    ).toBeInTheDocument()
  })

  it('renders nothing by default for a role the matrix denies', () => {
    // A `user` (roleId 5) may not delete projects — the papelera belongs to
    // the roles that delete.
    const { container } = renderWithProviders(
      <RequirePermission permission="project.delete">
        <button>Delete project</button>
      </RequirePermission>,
      { store: storeWithProfile(authUserFor(5)) },
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the fallback instead of the children when denied', () => {
    // A `user` (roleId 5) works on their obras but does not create them.
    renderWithProviders(
      <RequirePermission
        permission="project.create"
        fallback={<span>Read only</span>}
      >
        <button>New project</button>
      </RequirePermission>,
      { store: storeWithProfile(authUserFor(5)) },
    )
    expect(screen.getByText('Read only')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('treats signed out as denied', () => {
    const { container } = renderWithProviders(
      <RequirePermission permission="project.list.viewAll">
        <button>Projects</button>
      </RequirePermission>,
      { store: storeWithProfile(null) },
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('reveals the control once /auth/me resolves after a refresh', async () => {
    // Token persisted, user not — the gate must open when the query lands,
    // with the slice still empty.
    const store = makeStore({
      auth: {
        accessToken: 'refresh-survived-this',
        refreshToken: 'a-refresh-token',
        expiresAt: null,
        user: null,
      },
    })
    renderWithProviders(
      <RequirePermission permission="org.team.manage">
        <button>Manage team</button>
      </RequirePermission>,
      { store },
    )

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Manage team' }),
      ).toBeInTheDocument()
    })
    expect(store.getState().auth.user).toBeNull()
  })
})
