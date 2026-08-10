import { Box, CloseButton, Drawer, Portal } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { sidebarMessages } from './sidebar-messages'
import { SidebarNav, type NavigationGroup } from './sidebar-nav'

interface SidebarProps {
  navigationGroups: NavigationGroup[]
  /** Icon-only rail, from `md` up. Meaningless on the mobile drawer. */
  collapsed?: boolean
  /** Mobile drawer state, owned by the layout because the topbar opens it. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Two surfaces over one navigation list: below `md` a full-width Chakra
 * drawer (focus trap, scroll lock and Escape come with it), from `md` up a
 * plain aside in flow. The drawer's content only mounts while it is open, so
 * on desktop — where nothing can open it — the list exists exactly once.
 */
export function Sidebar({
  navigationGroups,
  collapsed = false,
  open = false,
  onOpenChange,
}: SidebarProps) {
  const intl = useIntl()

  return (
    <>
      <Drawer.Root
        open={open}
        onOpenChange={(event) => onOpenChange?.(event.open)}
        placement="start"
        size="full"
      >
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content
              bg="sidebar"
              css={{
                paddingLeft: 'env(safe-area-inset-left)',
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            >
              <Drawer.CloseTrigger asChild>
                <CloseButton
                  size="lg"
                  position="absolute"
                  top={3}
                  insetEnd={3}
                  color="gray.300"
                  _hover={{ bg: 'white/10', color: 'white' }}
                  aria-label={intl.formatMessage(
                    sidebarMessages.closeMobileMenu,
                  )}
                />
              </Drawer.CloseTrigger>
              <SidebarNav
                navigationGroups={navigationGroups}
                onNavigate={() => onOpenChange?.(false)}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>

      <Box
        as="aside"
        hideBelow="md"
        w={collapsed ? 20 : 64}
        flexShrink={0}
        bg="sidebar"
        transitionProperty="width"
        transitionDuration="0.2s"
        borderRightWidth="1px"
        borderColor="white/10"
        shadow="lg"
        css={{ paddingLeft: 'env(safe-area-inset-left)' }}
      >
        <SidebarNav navigationGroups={navigationGroups} collapsed={collapsed} />
      </Box>
    </>
  )
}
