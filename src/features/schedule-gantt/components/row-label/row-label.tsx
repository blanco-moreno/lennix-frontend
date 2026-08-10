import { Flex } from '@chakra-ui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Text } from '@/components'

import { ROW_HEIGHT } from '../../gantt-geometry'
import type { ScheduleRow } from '../../gantt-model'
import { useRowSummary } from '../../hooks/use-row-summary'
import { MARK_SIZE, ROW_MARKS } from '../../row-marks'
import { RowButton } from '../../schedule-gantt'
import { scheduleGanttMessages as m } from '../../schedule-gantt-messages'
import { rowBackground } from '../../schedule-palette'

interface RowLabelProps {
  row: ScheduleRow
  /** `draft` keeps the accessible sentence to what a draft can claim. */
  scope?: 'live' | 'draft'
  selected: boolean
  /** Driven by the chart too — the bar and this label are one row. */
  hovered: boolean
  /** Present on phase rows when the surface offers collapsing. */
  collapsed?: boolean
  /** The row scale in force — taller on a coarse pointer. */
  rowHeight?: number
  /**
   * The label column is folded to its chevron and marks. The name goes with
   * it, but only visually: `aria-label` still carries it, so the row keeps
   * saying which task it is to anyone reading by ear.
   */
  labelsCollapsed?: boolean
  onToggleCollapse?: () => void
  onHoverChange: (isOver: boolean) => void
  onActivate: () => void
}

export function RowLabel({
  row,
  scope = 'live',
  selected,
  hovered,
  collapsed = false,
  rowHeight = ROW_HEIGHT,
  labelsCollapsed = false,
  onToggleCollapse,
  onHoverChange,
  onActivate,
}: RowLabelProps) {
  const intl = useIntl()
  const rowSummary = useRowSummary(scope)
  // Selection is brand, and hover deepens it instead of replacing it.
  const background = rowBackground({ selected, hovered })

  // The row is a <button>; the collapse toggle must be its *sibling*, not a
  // nested button. Only phases get one, and only when the surface collapses.
  const collapsible = row.level === 'task' && onToggleCollapse !== undefined

  const label = (
    <RowButton
      type="button"
      display="flex"
      w="full"
      flex={1}
      minW={0}
      h={`${rowHeight}px`}
      alignItems="center"
      gap={1.5}
      px={2}
      pl={row.level === 'subtask' && !labelsCollapsed ? 6 : 2}
      textAlign="left"
      bg={background.bg}
      onPointerEnter={() => onHoverChange(true)}
      onPointerLeave={() => onHoverChange(false)}
      data-testid="gantt-row-label"
      data-level={row.level}
      aria-label={rowSummary(row)}
      onClick={onActivate}
    >
      {/*
        The name is the row's identifier, so it gets the column to itself.
        Shared with three text badges it is left 38px of 260, and finding out
        which task you are looking at costs a hover or a drawer.
      */}
      {!labelsCollapsed && (
        <Text
          size="xs"
          color={row.level === 'task' ? 'primary' : 'muted'}
          weight={row.level === 'task' ? 'medium' : undefined}
          lineClamp={1}
          flex={1}
          minW={0}
        >
          {row.title}
        </Text>
      )}
      {/*
        The same three states, as marks instead of sentences: ~50px of icons
        rather than ~220px of pills. `aria-hidden` because the row's own
        `aria-label` already names every one of them — spoken twice is worse
        than spoken once. Colours are the chart's, so a mark and the bar it
        describes cannot drift apart.
      */}
      <Flex
        flexShrink={0}
        align="center"
        gap={1}
        aria-hidden
        data-testid="gantt-row-marks"
      >
        {ROW_MARKS.filter((mark) => mark.applies(row)).map((mark) => (
          <mark.icon
            key={mark.id}
            size={MARK_SIZE}
            color={mark.color}
            data-testid={`gantt-mark-${mark.id}`}
          />
        ))}
      </Flex>
    </RowButton>
  )

  if (!collapsible) return label

  return (
    <Flex align="center" h={`${rowHeight}px`}>
      <RowButton
        type="button"
        flexShrink={0}
        w={5}
        h="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="fg.muted"
        data-testid="gantt-collapse-toggle"
        aria-expanded={!collapsed}
        aria-label={intl.formatMessage(
          collapsed ? m.expandTask : m.collapseTask,
          { title: row.title },
        )}
        onClick={onToggleCollapse}
      >
        {collapsed ? (
          <ChevronRight size={14} aria-hidden />
        ) : (
          <ChevronDown size={14} aria-hidden />
        )}
      </RowButton>
      {label}
    </Flex>
  )
}
