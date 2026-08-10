/** The team table's search: one box over name, email, role slug and user id. */

import type { OrganizationMember } from '@/types'

export function filterMembers(
  members: OrganizationMember[],
  searchTerm: string,
): OrganizationMember[] {
  const q = searchTerm.trim().toLowerCase()
  if (!q) return members
  return members.filter((m) => {
    const name = `${m.user.firstName} ${m.user.lastName}`.toLowerCase()
    return (
      name.includes(q) ||
      m.user.email.toLowerCase().includes(q) ||
      (m.user.roleSlug ?? '').toLowerCase().includes(q) ||
      m.userId.toLowerCase().includes(q)
    )
  })
}
