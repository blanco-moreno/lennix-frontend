import { Flex } from '@chakra-ui/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useIntl } from 'react-intl'

import { Text } from '@/components'

import { ROW_HEIGHT, STACKED_NAME_LINE } from '../../gantt-geometry'
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
   * Phone layout: no column, the label is the row's top line drawn over the
   * chart. Only that line takes the press, so the bar under it stays the
   * bar's own target, and it carries no fill: the chart already shades the
   * selected and hovered row across its width.
   */
  stacked?: boolean
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
  stacked = false,
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
      h={stacked ? `${STACKED_NAME_LINE}px` : `${rowHeight}px`}
      alignItems="center"
      gap={1.5}
      px={2}
      pl={row.level === 'subtask' ? 6 : 2}
      textAlign="left"
      bg={stacked ? undefined : background.bg}
      pointerEvents="auto"
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
      <Text
        size="xs"
        color={row.level === 'task' ? 'primary' : 'muted'}
        weight={row.level === 'task' ? 'medium' : undefined}
        lineClamp={1}
        flex={stacked ? undefined : 1}
        minW={0}
        // Over the chart the name crosses gridlines and dependency edges; a
        // backing keeps it readable without hiding what runs behind it.
        {...(stacked && { bg: 'bg.panel/80', px: 1, rounded: 'sm' })}
      >
        {row.title}
      </Text>
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

  // Stacked, the row box is the whole row but transparent to the pointer:
  // only the name line under the finger belongs to the label.
  const rowBox = stacked
    ? ({ align: 'flex-start', pointerEvents: 'none' } as const)
    : ({ align: 'center' } as const)

  if (!collapsible) {
    return stacked ? (
      <Flex h={`${rowHeight}px`} {...rowBox}>
        {label}
      </Flex>
    ) : (
      label
    )
  }

  return (
    <Flex h={`${rowHeight}px`} {...rowBox}>
      <RowButton
        type="button"
        flexShrink={0}
        w={5}
        h={stacked ? `${STACKED_NAME_LINE}px` : 'full'}
        pointerEvents="auto"
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
