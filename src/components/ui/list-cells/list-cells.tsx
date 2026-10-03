import { Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'

import { ROW_PROGRESS_BAR_MIN_W, ROW_PROGRESS_BAR_W } from '@/constants'
import { useFormatDate } from '@/i18n'
import { formatPercent, getProgressColor, resolveProgressHealth } from '@/utils'

import { Progress } from '../progress'
import { Text } from '../text'

import { listCellsMessages as m } from './list-cells-messages'

/** What `resolveProgressHealth` needs off a row — activity or subactivity. */
type ProgressSubject = Parameters<typeof resolveProgressHealth>[0]

/**
 * The three cells every row of the listing shares. They live here so the
 * activity row, the subactivity row and the assigned-queue row line up under
 * one column header instead of each inventing its own width.
 */

/** Avance: a thin bar with the figure beside it, on one 52px line. */
export function ProgressCell({ subject }: { subject: ProgressSubject }) {
  const intl = useIntl()
  const percent = formatPercent(subject.progress)

  // A 0% bar draws a full track and reads as "started, barely" — the word is
  // the honest answer to "how far along", so nothing has moved says so.
  if (!subject.progress) {
    return (
      <Text as="span" size="xs" color="muted">
        {intl.formatMessage(m.noProgress)}
      </Text>
    )
  }

  return (
    <Flex align="center" gap={2} minW={0} w="full">
      <Progress
        w={ROW_PROGRESS_BAR_W}
        minW={ROW_PROGRESS_BAR_MIN_W}
        h={1.5}
        value={subject.progress}
        indicatorProps={getProgressColor(resolveProgressHealth(subject))}
        aria-label={intl.formatMessage(m.progressValue, { percent })}
      />
      <Text as="span" size="xs" weight="medium" color="primary" flexShrink={0}>
        {percent}
      </Text>
    </Flex>
  )
}

/** Responsable — the fallback is a word, not an empty cell. */
export function AssigneeCell({ name }: { name: string | null }) {
  const intl = useIntl()

  return (
    <Text as="span" size="sm" color={name ? 'default' : 'muted'}>
      {name ?? intl.formatMessage(m.unassigned)}
    </Text>
  )
}

/** Fecha — red once the row is late, which is the only reason to look here. */
export function DueDateCell({
  date,
  delayDays,
}: {
  date: string | null
  delayDays: number
}) {
  const intl = useIntl()
  const formatDate = useFormatDate()

  return (
    <Text
      as="span"
      size="xs"
      color={date && delayDays > 0 ? 'critical' : 'muted'}
    >
      {date ? formatDate(date) : intl.formatMessage(m.noDueDate)}
    </Text>
  )
}

/**
 * A quiet column label — the same register on every listing header. Pass
 * nothing to keep an unlabeled track (a checkbox or chevron labels itself).
 */
export function ColumnHeader({
  children,
  align,
}: {
  children?: React.ReactNode
  align?: 'right'
}) {
  if (children === undefined) return <span role="columnheader" />
  return (
    <Text
      as="span"
      role="columnheader"
      size="xs"
      color="muted"
      weight="medium"
      textTransform="uppercase"
      letterSpacing="0.06em"
      textAlign={align}
    >
      {children}
    </Text>
  )
}
