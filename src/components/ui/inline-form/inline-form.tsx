import { Box, Flex, Icon, Stack } from '@chakra-ui/react'
import { type LucideIcon } from 'lucide-react'
import * as React from 'react'

import { Text } from '../text'

// The in-place surface for forms opened from inside the activity drawer.
// A drawer on top of a drawer buries the record you were reading, so the form
// opens as a panel in the record itself. Same prop shape as the classic
// `Modal` and `FormDrawer`, so a form moves between the three by swapping the
// element.

interface InlineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: React.ReactNode
  description?: React.ReactNode
  icon?: LucideIcon
  iconColor?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  /** When provided, header/body/footer are wrapped in a <form>. */
  onSubmit?: React.FormEventHandler<HTMLFormElement>
}

function InlineForm({
  open,
  title,
  description,
  icon,
  iconColor,
  children,
  footer,
  onSubmit,
}: InlineFormProps) {
  const panel = React.useRef<HTMLDivElement>(null)

  // A modal announced itself by covering the page. Opening in place has to
  // earn the same attention: bring the panel into view and hand it the focus,
  // or a form that opened below the fold reads as a button that did nothing.
  React.useEffect(() => {
    if (!open) return
    panel.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
    panel.current?.focus?.()
  }, [open])

  if (!open) return null

  const body = (
    <Stack gap={4} p={4}>
      {(title || description) && (
        <Stack gap={1}>
          {title && (
            <Text
              weight="medium"
              color="primary"
              display={icon ? 'flex' : undefined}
              alignItems="center"
              gap={2}
            >
              {icon && <Icon as={icon} boxSize={4} color={iconColor} />}
              {title}
            </Text>
          )}
          {description && (
            <Text size="sm" color="muted">
              {description}
            </Text>
          )}
        </Stack>
      )}
      {children}
      {footer && (
        <Flex
          justify="flex-end"
          gap="tight"
          borderTopWidth="1px"
          borderColor="border"
          pt={4}
        >
          {footer}
        </Flex>
      )}
    </Stack>
  )

  return (
    <Box
      ref={panel}
      tabIndex={-1}
      _focusVisible={{ outline: 'none' }}
      colorPalette="brand"
      borderWidth="1px"
      borderColor="border"
      rounded="lg"
      bg="bg.subtle"
    >
      {onSubmit ? <form onSubmit={onSubmit}>{body}</form> : body}
    </Box>
  )
}

export { InlineForm }
export type { InlineFormProps }
