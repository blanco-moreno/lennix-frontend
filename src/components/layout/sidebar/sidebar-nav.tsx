import { Box, Flex, Stack, chakra } from '@chakra-ui/react'
import { type LucideIcon } from 'lucide-react'
import { useIntl } from 'react-intl'
import { useLocation, useNavigate } from 'react-router'

import { Text, Badge, Button, Tooltip } from '@/components/ui'

import { sidebarMessages } from './sidebar-messages'

interface NavigationItem {
  id: string
  label: string
  icon: LucideIcon
  path: string
  badge?: number
}

export interface NavigationGroup {
  id: string
  label: string
  items: NavigationItem[]
}

interface SidebarNavProps {
  navigationGroups: NavigationGroup[]
  /** Icon-only rail. Never set inside the mobile drawer, which is full width. */
  collapsed?: boolean
  onNavigate?: () => void
}

/**
 * Logo + the grouped destinations. Mounted twice by `Sidebar`: inside the
 * mobile drawer and inside the desktop aside — one list, two surfaces.
 */
export function SidebarNav({
  navigationGroups,
  collapsed = false,
  onNavigate,
}: SidebarNavProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const intl = useIntl()

  const isPrefixMatch = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const activePath = navigationGroups
    .flatMap((group) => group.items)
    .filter((item) => isPrefixMatch(item.path))
    .reduce<string | null>(
      (best, item) =>
        item.path.length > (best?.length ?? 0) ? item.path : best,
      null,
    )
  const isActiveRoute = (path: string) => path === activePath

  const handleNavigation = (path: string) => {
    navigate(path)
    onNavigate?.()
  }

  return (
    <Flex direction="column" h="full" px={collapsed ? 3 : 5} py={6} gap={2}>
      <Flex mb={8} justify="center">
        <chakra.img
          src={collapsed ? '/lennixs-logo-icon.png' : '/lennix-logo.png'}
          alt={intl.formatMessage(sidebarMessages.logoAlt)}
          h={8}
          w="auto"
        />
      </Flex>

      {/* Navigation, grouped by mode of work */}
      <Stack as="nav" flex={1} gap={4} overflowY="auto">
        {navigationGroups.map((group) => (
          <Stack key={group.id} gap={{ base: 2, lg: 1 }}>
            {!collapsed && (
              <Text
                size="xs"
                color="gray.400"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wider"
                px={4}
                data-testid={`nav-group-${group.id}`}
              >
                {group.label}
              </Text>
            )}
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.path)
              const button = (
                <Button
                  key={item.id}
                  variant="ghost"
                  h={11}
                  w="full"
                  justifyContent={collapsed ? 'center' : 'flex-start'}
                  px={collapsed ? 0 : 4}
                  textAlign="left"
                  transition="all 0.2s"
                  bg={isActive ? 'complementary' : undefined}
                  color={isActive ? 'complementary.fg' : 'gray.300'}
                  shadow={isActive ? 'md' : undefined}
                  _hover={
                    isActive
                      ? { bg: 'complementary/90' }
                      : { bg: 'white/10', color: 'white' }
                  }
                  onClick={() => handleNavigation(item.path)}
                >
                  <Box
                    as={Icon}
                    mr={collapsed ? 0 : 3}
                    boxSize={5}
                    color={isActive ? 'complementary.fg' : 'gray.400'}
                  />
                  {!collapsed && item.label}

                  {item.badge ? (
                    collapsed ? null : (
                      <Badge
                        ml="auto"
                        variant="complementary"
                        data-testid={`nav-badge-${item.id}`}
                      >
                        {item.badge}
                      </Badge>
                    )
                  ) : null}
                </Button>
              )

              return collapsed ? (
                <Tooltip key={item.id} content={item.label}>
                  {button}
                </Tooltip>
              ) : (
                button
              )
            })}
          </Stack>
        ))}
      </Stack>
    </Flex>
  )
}
