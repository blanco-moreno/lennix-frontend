import { Box, Flex } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'
import type * as React from 'react'

import { Text } from '..'
import { Card } from '../card'

interface StatCardProps {
  icon: LucideIcon
  label: React.ReactNode
  value: React.ReactNode
  /** Semantic key (success/info/destructive/warning/complementary/default) driving the icon colors. */
  semantic: string
  /**
   * "panel" (default): a muted rounded panel, used inside overview grids.
   * "card": wrapped in a `Card`, used in the project header grid.
   */
  variant?: 'panel' | 'card'
  /** In the "card" variant, render a long value at a smaller size (e.g. a location). */
  isLong?: boolean
}

/**
 * Icon + label + value KPI tile shared by the project/task overview grids and
 * the project detail header. Extracted from three near-identical copies.
 */
function getStatCardIconColor(semantic: string) {
  switch (semantic) {
    case 'info':
      return { container: { bg: 'info/10' }, icon: { color: 'info' } }
    case 'success':
      return { container: { bg: 'success/10' }, icon: { color: 'success' } }
    case 'complementary':
      return {
        container: { bg: 'complementary/10' },
        icon: { color: 'complementary' },
      }
    case 'warning':
      return { container: { bg: 'warning/10' }, icon: { color: 'warning' } }
    case 'destructive':
      return {
        container: { bg: 'destructive/10' },
        icon: { color: 'destructive' },
      }
    case 'critical':
      return {
        container: { bg: 'critical/10' },
        icon: { color: 'critical' },
      }
    case 'overBudget':
      return {
        container: { bg: 'overBudget/10' },
        icon: { color: 'overBudget' },
      }
    case 'error':
      return {
        container: { bg: 'error/10' },
        icon: { color: 'error' },
      }
    default:
      return { container: { bg: 'bg.muted' }, icon: { color: 'fg.muted' } }
  }
}

export function StatCard({
  icon,
  label,
  value,
  semantic,
  variant = 'panel',
  isLong = false,
}: StatCardProps) {
  const iconColor = getStatCardIconColor(semantic)

  const body = (
    <Flex
      align="center"
      gap="tight"
      {...(variant === 'panel'
        ? { rounded: 'xl', px: 4, py: 5, bg: 'bg.muted/30' }
        : {})}
    >
      <Box
        rounded={variant === 'panel' ? 'xl' : 'lg'}
        p={2.5}
        {...iconColor.container}
      >
        <Box as={icon} boxSize={5} {...iconColor.icon} />
      </Box>
      <Box minW={0} flex={1}>
        <Text
          size="xs"
          color="muted"
          letterSpacing="wide"
          textTransform="uppercase"
        >
          {label}
        </Text>
        <Text
          weight="semibold"
          // A stat card exists to show ONE number: it is never body text.
          // Long values (a location, a name) get a smaller size, and wrap —
          // the tile grows rather than cutting the value off.
          size={variant === 'card' && isLong ? 'sm' : 'lg'}
        >
          {value}
        </Text>
      </Box>
    </Flex>
  )

  return variant === 'card' ? <Card size="compact">{body}</Card> : body
}
