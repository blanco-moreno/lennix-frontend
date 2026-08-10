import { Box, Flex } from '@chakra-ui/react'
import { AlertTriangle, GitBranch } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Badge } from '@/components'
import type { AttentionProject } from '@/types'
import { toneStyle } from '@/utils'

import { portfolioHealthMessages as m } from '../../portfolio-health-messages'

/**
 * Why this obra is on the dashboard, beside its name on the shared project
 * row: the schedule numbers a project card has no column for. Zero is not a
 * number worth a badge — "0 activities at risk" is noise on a list of
 * problems.
 *
 * Why the obra is *on the list* is no longer repeated here — the row's own
 * verdict badge says it, in one word, with the same colour every other surface
 * uses. This block is only the two numbers that verdict cannot carry.
 */
export function AttentionMeta({ item }: { item: AttentionProject }) {
  return (
    // `minW={0}`, never `flexShrink={0}`: refusing to shrink made this group's
    // base width "both badges on one line", so it outgrew the row and its own
    // `wrap` never got the chance to break them apart.
    <Flex minW={0} align="center" gap={2} wrap="wrap">
      {item.criticalPathSlipDays > 0 && (
        <Badge
          {...toneStyle('danger')}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Box as={GitBranch} boxSize={3} />
          <FormattedMessage
            {...m.slip}
            values={{ days: item.criticalPathSlipDays }}
          />
        </Badge>
      )}
      {item.delayedOrBlockedTasks > 0 && (
        <Badge
          {...toneStyle('blocked')}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Box as={AlertTriangle} boxSize={3} />
          <FormattedMessage
            {...m.atRisk}
            values={{ count: item.delayedOrBlockedTasks }}
          />
        </Badge>
      )}
    </Flex>
  )
}
