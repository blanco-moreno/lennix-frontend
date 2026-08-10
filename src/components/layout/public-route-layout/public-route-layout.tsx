import { Box } from '@chakra-ui/react'
import { Suspense } from 'react'
import { Outlet } from 'react-router'

import { LanguageSwitcher } from '@/i18n/components/language-switcher'

import { LoadingScreen } from '../../ui/loading-screen'

/**
 * Public route layout wrapper for unauthenticated routes (login, register, forgot password)
 * Handles loading states for public pages
 */
export function PublicRouteLayout() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Box position="relative">
        <Box position="absolute" top={4} right={4} zIndex={10}>
          <LanguageSwitcher
            buttonProps={{
              color: 'white',
              _hover: { color: 'white', bg: 'whiteAlpha.200' },
            }}
          />
        </Box>
        <Outlet />
      </Box>
    </Suspense>
  )
}
