import { can, type Permission } from '@/utils'

import { useCurrentRole } from '../use-current-role'

/**
 * React hook returning whether the active user can perform the given
 * permission. Wraps `useCurrentRole()` + `can()` so call-sites stay
 * compact:
 *
 *   const canDeleteProject = usePermission('project.delete')
 *   if (!canDeleteProject) return null
 */
export function usePermission(permission: Permission): boolean {
  const role = useCurrentRole()
  return can(role, permission)
}
