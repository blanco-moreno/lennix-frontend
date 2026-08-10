import { useIntl } from 'react-intl'

import { roleIdToSlug, systemRoleMessages, type RoleSlug } from '@/utils'

/**
 * Name a role for a human, from either a slug or the numeric `roleId` the auth
 * user carries. `null` when the role is unknown, so the caller decides what an
 * absent role reads as.
 */
export function useSystemRoleName(): (
  role: RoleSlug | number | null | undefined,
) => string | null {
  const intl = useIntl()
  return (role) => {
    const slug = typeof role === 'number' ? roleIdToSlug(role) : (role ?? null)
    return slug ? intl.formatMessage(systemRoleMessages[slug]) : null
  }
}
