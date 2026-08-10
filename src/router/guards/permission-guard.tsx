import { ShieldOff } from 'lucide-react'
import { useIntl } from 'react-intl'
import { Outlet, useNavigate } from 'react-router'

import { EmptyState } from '@/components'
import { PATHS } from '@/constants'
import { useCurrentRole } from '@/hooks'
import { can, type Permission } from '@/utils'

import { permissionGuardMessages as m } from './permission-guard-messages'

interface PermissionGuardProps {
  /**
   * A single permission, or several meaning **any of them**. The approvals
   * bandeja needs the latter: it is one home for two decision types (budget and
   * force-start), and holding either key is reason enough to open it.
   */
  permission: Permission | Permission[]
}

/**
 * Route-level gate for system-role permissions. Assumes the wrapping
 * `<AuthGuard />` already ensured authentication; a `null` role is refused —
 * the safer default.
 *
 * Refusal is a page, not a silent redirect: someone opening a shared link
 * they cannot see is told what happened and who can fix it.
 */
export function PermissionGuard({ permission }: PermissionGuardProps) {
  const intl = useIntl()
  const navigate = useNavigate()
  const role = useCurrentRole()
  const required = Array.isArray(permission) ? permission : [permission]
  const allowed = required.some((entry) => can(role, entry))
  if (!allowed) {
    return (
      <EmptyState
        icon={ShieldOff}
        title={intl.formatMessage(m.noAccessTitle)}
        description={intl.formatMessage(m.noAccessBody)}
        action={{
          label: intl.formatMessage(m.noAccessAction),
          onClick: async () => navigate(PATHS.PROJECTS, { replace: true }),
        }}
      />
    )
  }
  return <Outlet />
}
