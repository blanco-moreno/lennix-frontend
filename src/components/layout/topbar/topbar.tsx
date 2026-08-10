import { Box, Flex } from '@chakra-ui/react'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useIntl } from 'react-intl'

import { LanguageSwitcher } from '@/i18n/components/language-switcher'
import type { User } from '@/types'

import { Breadcrumb } from '../../ui/breadcrumb'
import { Button } from '../../ui/button'
import { Heading } from '../../ui/heading'
import { sidebarMessages } from '../sidebar/sidebar-messages'

import { ColorModeToggle } from './color-mode-toggle'
import { topbarMessages as m } from './topbar-messages'
import { usePageCrumbs } from './use-page-crumbs'
import { UserMenu } from './user-menu'

interface TopbarProps {
  /** Undefined on the mobile drawer, where hiding the sidebar is the backdrop's job. */
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
  /** Opens the mobile drawer. Its button is the first item of the left cluster. */
  onOpenMobileMenu?: () => void
  user?: User | null
  onLogout?: () => void
}

/**
 * The page header — trail, title, and the controls that belong to the person
 * rather than to the page.
 *
 * It replaces two things at once: a thin "you are here" strip, and the
 * `<h1>` every view rendered with the very same string the strip already
 * showed. One title, said once, at a size that reads as a title. The trail
 * above it is context, not a second copy of the name.
 */
export function Topbar({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileMenu,
  user,
  onLogout,
}: TopbarProps) {
  const intl = useIntl()
  const { trail, title } = usePageCrumbs()

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      gap={4}
      minH={20}
      flexShrink={0}
      pl={{
        base: 'calc(1rem + env(safe-area-inset-left))',
        lg: 'calc(1.5rem + env(safe-area-inset-left))',
      }}
      pr={{
        base: 'calc(1rem + env(safe-area-inset-right))',
        lg: 'calc(1.5rem + env(safe-area-inset-right))',
      }}
      py={3}
      bg="bg.panel"
      borderBottomWidth="1px"
      borderColor="border"
      data-testid="topbar"
    >
      <Flex align="center" gap="tight" minW={0}>
        {onOpenMobileMenu && (
          <Button
            variant="ghost"
            size="icon"
            display={{ base: 'inline-flex', md: 'none' }}
            aria-label={intl.formatMessage(sidebarMessages.openMobileMenu)}
            onClick={onOpenMobileMenu}
            data-testid="mobile-menu-trigger"
          >
            <Menu />
          </Button>
        )}

        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            hideBelow="md"
            aria-label={intl.formatMessage(
              sidebarCollapsed ? m.showSidebar : m.hideSidebar,
            )}
            aria-expanded={!sidebarCollapsed}
            onClick={onToggleSidebar}
            data-testid="sidebar-toggle"
          >
            {sidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        )}

        <Box minW={0}>
          {trail.length > 0 && (
            <Breadcrumb
              label={intl.formatMessage(m.breadcrumbLabel)}
              items={trail}
            />
          )}
          {title && (
            <Heading size="h1" data-testid="page-title">
              {title}
            </Heading>
          )}
        </Box>
      </Flex>

      {/* Two groups, read as two: preferences, then the person. Below `lg`
          preferences fold into the account menu — on site nobody uses them. */}
      <Flex align="center" gap="tight" flexShrink={0}>
        <Flex align="center" gap={2} hideBelow="lg">
          <LanguageSwitcher placement="right" />
          <ColorModeToggle />
        </Flex>
        <Box w="1px" h={6} bg="border" hideBelow="lg" />
        <UserMenu user={user} onLogout={onLogout} />
      </Flex>
    </Flex>
  )
}
