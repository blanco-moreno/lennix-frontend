import { Box, Flex, Stack } from '@chakra-ui/react'
import { CalendarCheck } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

import { Text } from '@/components/ui'
import { useFormatDate } from '@/i18n'
import { daysUntil } from '@/utils'

import { projectRowMessages as m } from '../../project-row-messages'

/**
 * How long is left, with the date underneath.
 *
 * An activity is read by its date — you look it up against a plan. An obra is
 * read by what is left of it, and "45 days" is the answer nobody should have
 * to compute from "2026-09-15" and today. The date stays below because it is
 * still what gets typed into a phone call.
 *
 * The register is the drafts card's: a subtle icon, then the figure with the
 * weight of a figure and its context quiet underneath.
 */
export function ProjectDeadline({ date }: { date: string | null }) {
  const formatDate = useFormatDate()
  if (!date) {
    return (
      <Text as="span" size="xs" color="muted">
        <FormattedMessage {...m.noDate} />
      </Text>
    )
  }

  const days = daysUntil(date)

  return (
    <Stack gap={0.5} minW={0}>
      <Flex align="center" gap={1.5} minW={0}>
        <Box
          as={CalendarCheck}
          boxSize={3.5}
          flexShrink={0}
          color={days < 0 ? 'critical' : 'fg.subtle'}
        />
        <Text
          as="span"
          size="sm"
          weight="semibold"
          color={days < 0 ? 'critical' : 'primary'}
        >
          {days === 0 ? (
            <FormattedMessage {...m.dueToday} />
          ) : days > 0 ? (
            <FormattedMessage {...m.dueInDays} values={{ days }} />
          ) : (
            <FormattedMessage {...m.overdueByDays} values={{ days: -days }} />
          )}
        </Text>
      </Flex>
      <Text as="span" size="xs" color="muted">
        {formatDate(date)}
      </Text>
    </Stack>
  )
}
