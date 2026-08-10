import { Navigate } from 'react-router'

import { PATHS } from '@/constants'
import { usePermission } from '@/hooks'

/**
 * Where `/` lands, and with it every sign-in: the first screen has to be one
 * the actor may open.
 *
 * `dashboard.view` belongs to owner/admin/manager, so a `user` sent to
 * `/dashboard` would meet the refusal page as their first impression. Deciding
 * here rather than in the login form is what makes the role resolved: this sits
 * inside `AuthGuard`, which holds a loading screen until `/auth/me` answers.
 */
export function HomeRedirect() {
  const canViewDashboard = usePermission('dashboard.view')
  return (
    <Navigate
      to={canViewDashboard ? PATHS.DASHBOARD : PATHS.PROJECTS}
      replace
    />
  )
}
