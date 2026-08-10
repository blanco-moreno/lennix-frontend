import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'

import { LoadingScreen } from '@/components/ui/loading-screen'
import { PATHS } from '@/constants'
import { useAuth } from '@/stores'

import { saveLastVisitedRoute } from '../router-utils'

/**
 * Authentication guard component
 * Protects routes that require user authentication
 * Redirects to login if user is not authenticated
 */
export function AuthGuard() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  // Save current route for redirect after login
  useEffect(() => {
    if (!user && !isLoading && location.pathname !== PATHS.LOGIN) {
      saveLastVisitedRoute(location.pathname)
    }
  }, [user, isLoading, location.pathname])

  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={PATHS.LOGIN} replace />
  }

  // Render protected routes
  return <Outlet />
}
