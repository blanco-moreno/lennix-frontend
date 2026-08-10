import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'

import { makeStore } from '@/stores'
import { SEED_ORGANIZATION, SEED_USERS } from '@/tests/seed'
import type { User } from '@/types'
import type { RoleSlug } from '@/utils'

import { useCurrentRole } from './use-current-role'

/**
 * `useCurrentRole` is the runtime bridge from the auth state to the permission
 * matrix. Two things are pinned here: the role resolution itself (per seeded
 * role, unknown role, signed out) and the source — it must read the
 * profile *snapshot* (query first), not the auth slice, or the one-commit
 * window after a refresh reports an authenticated admin as role-less.
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

/**
 * A store already carrying the profile, with no token so `getMe` stays
 * skipped — otherwise the MSW `/v1/auth/me` handler (always Carlos, owner)
 * would shadow the role under test through the snapshot's query-first read.
 */
function storeWithProfile(user: User | null) {
  return makeStore({
    auth: { accessToken: null, refreshToken: null, expiresAt: null, user },
  })
}

function renderCurrentRole(store: ReturnType<typeof makeStore>) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>
  }
  return renderHook(() => useCurrentRole(), { wrapper: Wrapper })
}

describe('useCurrentRole()', () => {
  it.each<[number, RoleSlug]>([
    [1, 'owner'],
    [2, 'admin'],
    [3, 'manager'],
    [5, 'user'],
  ])('resolves the seeded roleId %i profile to %s', (roleId, slug) => {
    const { result } = renderCurrentRole(storeWithProfile(authUserFor(roleId)))
    expect(result.current).toBe(slug)
  })

  it('returns null when signed out (no token, no profile)', () => {
    const { result } = renderCurrentRole(storeWithProfile(null))
    expect(result.current).toBeNull()
  })

  it('returns null for a roleId outside the local map (unknown role gates as logged out)', () => {
    // 99 is a deliberate non-seed value: the backend adding a role before the
    // frontend maps it must hide controls, not guess.
    const { result } = renderCurrentRole(
      storeWithProfile({ ...authUserFor(1), roleId: 99 }),
    )
    expect(result.current).toBeNull()
  })

  it('resolves the role from the /auth/me query when the slice still holds no user', async () => {
    // The state a hard refresh leaves behind: tokens persisted, user not.
    // Nothing in this render ever writes the slice — so this only passes if
    // the hook reads the snapshot (query-first). A slice-only read would stay
    // null forever, ejecting a refreshed user from every gated route.
    const store = makeStore({
      auth: {
        accessToken: 'refresh-survived-this',
        refreshToken: 'a-refresh-token',
        expiresAt: null,
        user: null,
      },
    })
    const { result } = renderCurrentRole(store)

    // The seed's current user is Carlos, roleId 1 (owner).
    await waitFor(() => expect(result.current).toBe('owner'))
    expect(store.getState().auth.user).toBeNull()
  })
})
