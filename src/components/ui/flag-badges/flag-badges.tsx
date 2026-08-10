import { Box } from '@chakra-ui/react'
import { Clock, Target } from 'lucide-react'
import type { ElementType, ReactNode } from 'react'
import { useIntl } from 'react-intl'

import { useDelayReasonLabel } from '@/hooks'
import { getBlockedBadgeColor, getCriticalPathBadgeColor } from '@/utils'

import { Badge } from '../badge'

import { flagBadgesMessages as m } from './flag-badges-messages'

/**
 * The two schedule flags a row or header can carry — "blocked" and "on the
 * critical path". Both are the same `Badge` with a fixed tone (from the
 * `utils/color` helpers) and the same register on every surface; only the
 * label differs, so each caller passes its own wording as children. The badge
 * recipe already lays out icon + text (inline-flex, gap), so nothing here
 * repeats that.
 */

/** Amber flag: this row waits on unfinished work. Pass `icon` for a lock. */
export function BlockedBadge({
  icon,
  children,
}: {
  icon?: ElementType
  children: ReactNode
}) {
  return (
    <Badge {...getBlockedBadgeColor()}>
      {icon && <Box as={icon} boxSize={3} />}
      {children}
    </Badge>
  )
}

/** Red flag with a target: this row is on the project's critical path. */
export function CriticalPathBadge({ children }: { children: ReactNode }) {
  return (
    <Badge {...getCriticalPathBadgeColor()}>
      <Box as={Target} boxSize={3} />
      {children}
    </Badge>
  )
}

/**
 * The recorded cause of a delay, with the derived day count when the engine
 * has one. Rendered only when a `reason` exists; `days` of 0 (a cause flagged
 * before any delay is derived) shows the reason alone.
 */
export function DelayBadge({ reason, days }: { reason: string; days: number }) {
  const intl = useIntl()
  const delayReasonLabel = useDelayReasonLabel()
  const label = delayReasonLabel(reason)
  return (
    <Badge
      bg="critical/10"
      color="critical"
      borderColor="critical/20"
      flexShrink={0}
    >
      <Box as={Clock} boxSize={3} />
      {days > 0
        ? `${label} · ${intl.formatMessage(m.delayDays, { days })}`
        : label}
    </Badge>
  )
}
