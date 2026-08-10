import type { OrganizationMember } from '@/types'

import { filterMembers } from './member-search'

const member = (
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  roleSlug: OrganizationMember['user']['roleSlug'],
): OrganizationMember => ({
  id: 1,
  organizationId: 'org-1',
  userId,
  joinedAt: '2026-07-01T00:00:00Z',
  user: {
    userId,
    email,
    firstName,
    lastName,
    roleId: 1,
    roleSlug,
  },
})

const members = [
  member('u-1', 'Miguel', 'Santos', 'miguel@obra.mx', 'admin'),
  member('u-2', 'Fernando', 'Lopez', 'fernando@obra.mx', 'manager'),
]

describe('filterMembers', () => {
  it('returns everyone for an empty or whitespace query', () => {
    expect(filterMembers(members, '')).toBe(members)
    expect(filterMembers(members, '   ')).toBe(members)
  })

  it('matches the full name, case-insensitive', () => {
    expect(filterMembers(members, 'miguel san')).toEqual([members[0]])
  })

  it('matches the email', () => {
    expect(filterMembers(members, 'FERNANDO@')).toEqual([members[1]])
  })

  it('matches the role slug', () => {
    expect(filterMembers(members, 'manag')).toEqual([members[1]])
  })

  it('matches the user id', () => {
    expect(filterMembers(members, 'u-1')).toEqual([members[0]])
  })

  it('finds nobody rather than everybody on a miss', () => {
    expect(filterMembers(members, 'zzz')).toEqual([])
  })
})
