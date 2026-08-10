import {
  chakra,
  CloseButton,
  Drawer as ChakraDrawer,
  Portal,
} from '@chakra-ui/react'
import { type LucideIcon } from 'lucide-react'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { commonMessages } from '../../common-messages'

import { DrawerHeader } from './components/drawer-header'

// The side surface for forms opened from a page. Same prop shape as the
// classic `Modal` so a form moves between the two by swapping the element:
// header + scrollable body (children) + a footer pinned to the bottom.
// Chakra's `Drawer.*` supplies escape/backdrop dismissal and the focus trap.

type DrawerSize = 'sm' | 'md' | 'lg' | 'xl'

interface FormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  size?: DrawerSize
  /** Optional leading icon rendered next to the title. */
  icon?: LucideIcon
  iconColor?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  /** When provided, header/body/footer are wrapped in a <form>. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>
}

function FormDrawer({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  icon,
  iconColor,
  children,
  footer,
  onSubmit,
}: FormDrawerProps) {
  const intl = useIntl()

  const body = (
    <>
      <DrawerHeader
        title={title}
        description={description}
        icon={icon}
        iconColor={iconColor}
      />
      <ChakraDrawer.Body flex="1" overflowY="auto" p="card">
        {children}
      </ChakraDrawer.Body>
      {footer && (
        <ChakraDrawer.Footer
          borderTopWidth="1px"
          borderColor="border"
          gap="tight"
          justifyContent="flex-end"
        >
          {footer}
        </ChakraDrawer.Footer>
      )}
    </>
  )

  return (
    <ChakraDrawer.Root
      open={open}
      onOpenChange={(event) => onOpenChange(event.open)}
      size={size}
    >
      <Portal>
        <ChakraDrawer.Backdrop />
        <ChakraDrawer.Positioner>
          <ChakraDrawer.Content colorPalette="brand">
            <ChakraDrawer.CloseTrigger asChild>
              <CloseButton
                size="sm"
                position="absolute"
                top={3}
                insetEnd={3}
                aria-label={intl.formatMessage(commonMessages.close)}
              />
            </ChakraDrawer.CloseTrigger>
            {onSubmit ? (
              <chakra.form
                display="flex"
                flexDirection="column"
                flex="1"
                minH={0}
                onSubmit={onSubmit}
              >
                {body}
              </chakra.form>
            ) : (
              body
            )}
          </ChakraDrawer.Content>
        </ChakraDrawer.Positioner>
      </Portal>
    </ChakraDrawer.Root>
  )
}

export { FormDrawer }
export type { FormDrawerProps, DrawerSize }
