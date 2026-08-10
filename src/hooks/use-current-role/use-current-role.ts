import { useProfileSnapshot } from '@/stores/hooks'
import { roleIdToSlug, type RoleSlug } from '@/utils'

/**
 * Read the active user's role slug; `null` for no profile or an unknown roleId.
 * Reads `useProfileSnapshot()`, not the auth slice — the slice trails the query
 * by one commit, and reading it on refresh would make `PermissionGuard` redirect.
 */
export function useCurrentRole(): RoleSlug | null {
  const user = useProfileSnapshot()
  return roleIdToSlug(user?.roleId)
}
