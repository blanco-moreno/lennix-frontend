import { SEED_USERS } from '@/tests/seed'

import { roleIdToSlug, ROLE_SLUGS, type RoleSlug } from './roles'

/**
 * `roles.ts` is the numeric-id → slug seam between the backend (`roleId` on
 * `/v1/auth/me`) and the permission matrix. These tests pin the mapping to the
 * seeded role table so a backend renumbering breaks here, not silently in a
 * hidden button.
 */

describe('roleIdToSlug()', () => {
  it.each<[number, RoleSlug]>([
    [1, 'owner'],
    [2, 'admin'],
    [3, 'manager'],
    [5, 'user'],
  ])('maps backend role id %i to %s', (roleId, slug) => {
    expect(roleIdToSlug(roleId)).toBe(slug)
  })

  it('returns null for null and undefined (no profile yet)', () => {
    expect(roleIdToSlug(null)).toBeNull()
    expect(roleIdToSlug(undefined)).toBeNull()
  })

  // 4 and 6 are the retired ids (Project Controller, Safety Manager): the
  // migration moved their users to `user` and deleted the rows, so seeing one
  // again means a stale backend, and the safest answer is "no role".
  it.each([0, 4, 6, 7, 99, -1])(
    'returns null for unknown role id %i',
    (roleId) => {
      expect(roleIdToSlug(roleId)).toBeNull()
    },
  )

  it('resolves every seeded user to a known slug', () => {
    for (const user of SEED_USERS) {
      expect(roleIdToSlug(user.roleId)).not.toBeNull()
    }
  })

  it('names exactly the four roles of the hierarchy', () => {
    expect([...ROLE_SLUGS]).toEqual(['owner', 'admin', 'manager', 'user'])
  })
})
