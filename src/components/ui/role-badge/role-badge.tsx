import { useIntl } from 'react-intl'

import { systemRoleMessages, type RoleSlug } from '@/utils'

import { Badge } from '../badge'

/**
 * One role axis, so the badge colours the four roles. The two that act across
 * the whole organization stand out; the two scoped to their obras do not.
 */
const ROLE_VARIANT: Record<
  RoleSlug,
  'default' | 'secondary' | 'info' | 'complementary'
> = {
  owner: 'info',
  admin: 'info',
  manager: 'complementary',
  user: 'secondary',
}

/**
 * A person's system role, named in the user's language.
 *
 * Two surfaces need it and must agree: the team table, where the role is the
 * row's own fact, and the assignee pickers, where it explains why somebody who
 * is not on the obra's team is nonetheless offered.
 */
export function RoleBadge({ role }: { role: RoleSlug }) {
  const intl = useIntl()
  return (
    <Badge variant={ROLE_VARIANT[role]}>
      {intl.formatMessage(systemRoleMessages[role])}
    </Badge>
  )
}
