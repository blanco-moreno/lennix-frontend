/**
 * Tooltip. A hint, never the only copy: everything a tooltip says must also be
 * in the trigger's `aria-label`.
 */

import { Tooltip as ChakraTooltip, Portal } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface TooltipProps {
  /** The hint. Plain text, already translated. */
  content: ReactNode
  children: ReactNode
  /** Skip rendering the tooltip entirely — for a trigger with nothing to say. */
  disabled?: boolean
  /** Milliseconds before it opens. Short, because the chart is scanned. */
  openDelay?: number
}

export function Tooltip({
  content,
  children,
  disabled = false,
  openDelay = 200,
}: TooltipProps) {
  if (disabled) return <>{children}</>

  return (
    <ChakraTooltip.Root openDelay={openDelay} closeDelay={80}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <Portal>
        <ChakraTooltip.Positioner>
          <ChakraTooltip.Content
            bg="primary"
            color="primary.fg"
            fontSize="xs"
            lineHeight="short"
            px={2.5}
            py={1.5}
            rounded="md"
            maxW="60"
            data-testid="tooltip"
          >
            <ChakraTooltip.Arrow>
              <ChakraTooltip.ArrowTip />
            </ChakraTooltip.Arrow>
            {content}
          </ChakraTooltip.Content>
        </ChakraTooltip.Positioner>
      </Portal>
    </ChakraTooltip.Root>
  )
}
