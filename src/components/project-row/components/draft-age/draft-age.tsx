import { Box, Flex, Stack } from '@chakra-ui/react'
import { Clock } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Text } from '@/components/ui'
import { useFormatDate } from '@/i18n'

import { projectRowMessages as m } from '../../project-row-messages'

const DAY_MS = 24 * 60 * 60 * 1000

/** Whole days a draft has been waiting — clamped, so a clock skew reads "today". */
function daysWaiting(createdAt: string): number {
  return Math.max(
    0,
    Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / DAY_MS),
  )
}

/**
 * How long the draft has been sitting there, with the span its schedule covers
 * underneath.
 *
 * The age leads because a draft's cost is the time it spends not being live —
 * the same reason a live obra leads with the days left on its deadline. Same
 * track, same register, opposite direction of the clock.
 */
export function DraftAge({
  createdAt,
  startDate,
  dueDate,
}: {
  createdAt?: string
  startDate?: string | null
  dueDate?: string | null
}) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  const dates =
    startDate || dueDate
      ? intl.formatMessage(m.dateRange, {
          start: startDate ? formatDate(startDate) : '—',
          end: dueDate ? formatDate(dueDate) : '—',
        })
      : intl.formatMessage(m.noDate)

  return (
    <Stack gap={0.5} minW={0}>
      <Flex align="center" gap={1.5} minW={0}>
        <Box as={Clock} boxSize={3.5} flexShrink={0} color="fg.subtle" />
        <Text as="span" size="sm" weight="semibold" color="primary">
          {createdAt
            ? intl.formatRelativeTime(-daysWaiting(createdAt), 'day', {
                numeric: 'auto',
              })
            : '—'}
        </Text>
      </Flex>
      <Text as="span" size="xs" color="muted">
        {dates}
      </Text>
    </Stack>
  )
}
