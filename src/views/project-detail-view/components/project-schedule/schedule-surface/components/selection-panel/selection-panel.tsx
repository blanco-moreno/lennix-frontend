import { Box, Flex, Stack } from '@chakra-ui/react'
import { GitBranch, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  AssigneeCell,
  AtRiskBadge,
  Badge,
  BlockedBadge,
  Button,
  CriticalPathBadge,
  DelayBadge,
  DueDateCell,
  ListRow,
  ProgressCell,
  StatusBadge,
  Text,
  Tooltip,
} from '@/components'
import type { ScheduleRow } from '@/features'
import { useFormatDate } from '@/i18n'
import { toneStyle } from '@/utils'

import { scheduleSurfaceMessages as m } from '../../schedule-surface-messages'

/**
 * One metric for the three actions, so they read as one row of controls: the
 * same height, and the same 1px border in every variant — the solid one draws
 * its border transparent rather than skipping it, which is what left it a
 * hair shorter than the outlined pair.
 */
const ACTION = {
  size: 'sm',
  h: { base: 8, lg: 9 },
  minH: { base: 8, lg: 9 },
} as const

interface SelectionPanelProps {
  row: ScheduleRow
  dependencyCount: number
  /** Absent when the surface has nowhere to open a row (see ScheduleSurfaceProps). */
  onOpenRow?: (row: ScheduleRow) => void
  /** Opens the row's dependency drawer, without leaving the schedule. */
  onShowDependencies?: () => void
  onClear: () => void
}

/**
 * The selected row, on the same row grammar as every activity listing —
 * `ListRow`, the same badge vocabulary, the same avance, responsable and fecha
 * cells — so the row you clicked in the chart reads like the row you would
 * have clicked in `/tasks`.
 *
 * It extends that grammar rather than repeating it: this row is a selection,
 * so it carries the complementary tint and the actions the schedule owns
 * (dependencies, open, clear) instead of the listing's view/edit pair, and it
 * says the row's level outright — the chart distinguishes a phase from a
 * subactivity by colour and indent, and neither survives being read as "the
 * row I clicked".
 *
 * It reads in two beats rather than one crowded line: what the row *is*
 * (level, name, every state it carries), then what it *says* — labelled facts,
 * because a selection has no column header above it to name them, and an
 * unlabelled date is the datum a reader takes for the wrong one. Facts a row
 * cannot have (a phase has no location, a live row no source ref) are absent,
 * not empty.
 *
 * Above the chart in normal flow — not sticky. The distance problem sticky
 * would solve is closed by two facts working together: the chart scrolls
 * inside its own ≤70vh container, so the panel plus the whole visible chart
 * always fit one viewport; and on selection the panel scrolls itself into
 * view (`block: 'nearest'`).
 */
export function SelectionPanel({
  row,
  dependencyCount,
  onOpenRow,
  onShowDependencies,
  onClear,
}: SelectionPanelProps) {
  const intl = useIntl()
  const formatDate = useFormatDate()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [row.id])

  return (
    <ListRow
      ref={panelRef}
      // A selection is not a row of a table — it is one row lifted out of the
      // chart, so it keeps the listing's shell and drops the table semantics.
      role="group"
      // Two tracks, not five: identity and facts on the left, the actions on
      // the right. The facts are labelled here (there is no header above this
      // row to label them), so they read as a block rather than as columns
      // that line up with nothing.
      templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 1fr) auto' }}
      alignItems="start"
      rowGap={3}
      // The dismiss is pinned to the corner; the row keeps its lane clear so
      // no badge or button ever runs under it.
      position="relative"
      pt={{ base: 9, lg: 3 }}
      pr={{ base: 'tight', lg: 10 }}
      rounded="md"
      borderWidth="1px"
      borderLeftWidth="3px"
      // The left tick every listing row carries, in the one colour only a
      // selection uses — critical and blocked say so with their badges here.
      borderColor="complementary"
      bg="complementary/10"
      _hover={undefined}
      shadow="md"
      data-testid="schedule-selection"
    >
      <Stack gap={3} minW={0}>
        {/* What the row is, then every state it carries — one line, wrapping.
            Nothing here is hidden at any width: a state the reader selected
            the row to check must not be counted away. */}
        <Flex minW={0} align="center" gap={2} wrap="wrap">
          <Badge variant={row.level === 'task' ? 'gray' : 'outline'}>
            {intl.formatMessage(
              row.level === 'task' ? m.listPhase : m.listTask,
            )}
          </Badge>
          <Text size="base" weight="semibold" color="primary" maxW="full">
            {row.title}
          </Text>
          <StatusBadge domain="status" value={row.status} />
          {row.isBlocked && (
            <BlockedBadge>
              <FormattedMessage {...m.badgeBlocked} />
            </BlockedBadge>
          )}
          {row.isCriticalPath && (
            <CriticalPathBadge>
              <FormattedMessage {...m.badgeCritical} />
            </CriticalPathBadge>
          )}
          {row.delayReason && (
            <DelayBadge reason={row.delayReason} days={row.delayDays} />
          )}
          <AtRiskBadge atRisk={row.atRisk} />
          {row.isOverBudget && (
            <Badge {...toneStyle('danger')} flexShrink={0}>
              <FormattedMessage {...m.badgeOverBudget} />
            </Badge>
          )}
        </Flex>

        {/* The facts, each under the label its column would have had. Avance
            and the two dates first — the questions the chart raises — then who
            carries it, where, and how tied in it is. */}
        <Flex gap={6} rowGap={3} wrap="wrap">
          <Fact label={intl.formatMessage(m.factProgress)} minW="10rem">
            <ProgressCell subject={row} />
          </Fact>
          <Fact label={intl.formatMessage(m.factStart)}>
            <Text as="span" size="xs" color="muted">
              {row.startDate ? formatDate(row.startDate) : '—'}
            </Text>
          </Fact>
          <Fact label={intl.formatMessage(m.factDue)}>
            <DueDateCell date={row.dueDate} delayDays={row.delayDays} />
          </Fact>
          <Fact label={intl.formatMessage(m.factAssignee)}>
            <AssigneeCell name={row.assigneeName} />
          </Fact>
          {row.location && (
            <Fact label={intl.formatMessage(m.factLocation)}>
              <Text as="span" size="sm">
                {row.location}
              </Text>
            </Fact>
          )}
          {/* No dependency fact here: the count lives on the button that
              opens them, so the panel says it once. */}
          {!onShowDependencies && (
            <Fact label={intl.formatMessage(m.factDependencies)}>
              <Text as="span" size="sm" weight="medium">
                {dependencyCount}
              </Text>
            </Fact>
          )}
          {/* Only imported rows carry a source reference — it is the one fact
              that answers "which line of my file is this?". */}
          {row.ref && (
            <Fact label={intl.formatMessage(m.factRef)}>
              <Text as="span" size="xs" color="muted">
                {row.ref}
              </Text>
            </Fact>
          )}
        </Flex>
      </Stack>

      {/* The two things you can do *with* the row, as a pair — dependencies
          reads its links, "ver detalle" leaves for the page that owns it.
          Dropping the selection is not one of them: it is the panel's own
          dismiss, so it sits in the corner as an X, out of the pair's way. */}
      <Flex
        gap={2}
        wrap="wrap"
        flexShrink={0}
        align="center"
        justify="flex-end"
        alignSelf="center"
      >
        {onShowDependencies && (
          <Button
            {...ACTION}
            variant="outline"
            data-testid="selection-dependencies"
            onClick={onShowDependencies}
          >
            <Box as={GitBranch} boxSize={4} />
            {intl.formatMessage(m.openDependenciesCount, {
              count: dependencyCount,
            })}
          </Button>
        )}
        {onOpenRow && (
          <Button {...ACTION} variant="ghost" onClick={() => onOpenRow(row)}>
            {intl.formatMessage(
              row.level === 'task' ? m.openRowTask : m.openRowSubtask,
            )}
          </Button>
        )}
      </Flex>

      {/* The dismiss, where every dismiss lives. Icon-only, so the word it
          would have carried is its accessible name and its tooltip. */}
      <Tooltip content={intl.formatMessage(m.clearSelection)}>
        <Button
          variant="ghost"
          size="icon"
          boxSize={7}
          minW={7}
          position="absolute"
          top={1.5}
          right={1.5}
          aria-label={intl.formatMessage(m.clearSelection)}
          onClick={onClear}
        >
          <Box as={X} boxSize={4} />
        </Button>
      </Tooltip>
    </ListRow>
  )
}

/**
 * One fact of the selection, label above value. `RowFact` is the listing's
 * version of this and puts its label *beside* the value below `lg` only — here
 * there is no header at any width, so the label always shows and always sits
 * over what it names.
 */
function Fact({
  label,
  minW,
  children,
}: {
  label: string
  minW?: string
  children: ReactNode
}) {
  return (
    <Stack gap={0.5} minW={minW ?? 0}>
      <Text
        as="span"
        size="xs"
        color="muted"
        weight="medium"
        textTransform="uppercase"
        letterSpacing="0.06em"
      >
        {label}
      </Text>
      <Flex minW={0} align="center" minH={5}>
        {children}
      </Flex>
    </Stack>
  )
}
