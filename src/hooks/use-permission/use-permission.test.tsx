import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import type { User } from '@/types'
import type { Permission } from '@/utils'

import { usePermission } from './use-permission'

/**
 * `usePermission` is the boolean face of the gating layer: role resolution
 * (refresh-safe, via `useCurrentRole`) composed with the matrix. The matrix
 * rows themselves are pinned in `matrix.test.ts`; here we pin that the *hook*
 * answers from the live auth state — one allowed and one denied key per
 * representative role, the signed-out default, and the refresh window.
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

function renderPermission(
  permission: Permission,
  store: ReturnType<typeof makeStore>,
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
  return renderHook(() => usePermission(permission), { wrapper: Wrapper })
}

describe('usePermission()', () => {
  it.each<[number, string, Permission, boolean]>([
    // One grant and one denial per seeded role — the row content itself is
    // matrix.test.ts territory; this pins the role wiring end to end.
    [1, 'owner', 'organization.ownership.transfer', true],
    [1, 'owner', 'budget.edit.request', false],
    [2, 'admin', 'org.team.manage', true],
    [2, 'admin', 'organization.ownership.transfer', false],
    [3, 'manager', 'project.create', true],
    [3, 'manager', 'project.delete', false],
    [5, 'user', 'budget.edit.request', true],
    [5, 'user', 'project.create', false],
  ])('roleId %i (%s): %s -> %s', (roleId, _slug, permission, expected) => {
    const { result } = renderPermission(
      permission,
      storeWithProfile(authUserFor(roleId)),
    )
    expect(result.current).toBe(expected)
  })

  it('denies everything while signed out', () => {
    for (const permission of [
      'dashboard.view',
      'project.list.viewAll',
      'task.registerProgress',
    ] as const) {
      const { result } = renderPermission(permission, storeWithProfile(null))
      expect(result.current).toBe(false)
    }
  })

  it('denies for a roleId the local map does not know', () => {
    const { result } = renderPermission(
      'project.list.viewAll',
      storeWithProfile({ ...authUserFor(1), roleId: 99 }),
    )
    expect(result.current).toBe(false)
  })

  it('turns true once /auth/me answers after a refresh, without a slice write', async () => {
    // Token persisted, user not — the refresh window. The hook must follow the
    // query through the profile snapshot; a slice-only read would report
    // false forever, since nothing in this render writes the slice.
    const store = makeStore({
      auth: {
        accessToken: 'refresh-survived-this',
        refreshToken: 'a-refresh-token',
        expiresAt: null,
        user: null,
      },
    })
    const { result } = renderPermission('dashboard.view', store)

    // First commit: role unknown, deny closed.
    expect(result.current).toBe(false)

    // Carlos (roleId 1, owner) arrives over the wire; the answer flips with
    // the slice still untouched.
    await waitFor(() => expect(result.current).toBe(true))
    expect(store.getState().auth.user).toBeNull()
  })
})
