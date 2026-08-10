import type { ReactNode } from 'react'

import { usePermission } from '@/hooks'
import type { Permission } from '@/utils'

interface RequirePermissionProps {
  permission: Permission
  children: ReactNode
  /** Rendered instead of `children` when the active user lacks the
   *  permission. Defaults to `null` (control disappears). */
  fallback?: ReactNode
}

/**
 * Declarative gate. Renders `children` only when the active user is allowed by
 * the permission matrix; for boolean use cases call `usePermission()` directly.
 */
export function RequirePermission({
  permission,
  children,
  fallback = null,
}: RequirePermissionProps) {
  const allowed = usePermission(permission)
  return allowed ? <>{children}</> : <>{fallback}</>
}
