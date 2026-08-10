/**
 * Time-scaled Gantt with critical path highlighted and propagated delay drawn
 * past the baseline. The chart reads and selects; the dependency graph is
 * edited in the row's own panel — one flow for mouse, finger and keyboard.
 */

import {
  Box,
  chakra,
  useBreakpointValue,
  useElementRect,
} from '@chakra-ui/react'
import { AlertTriangle, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useIntl } from 'react-intl'

import { EmptyState, Tooltip } from '@/components'
import type { DependencyNode } from '@/types'
import { parseDay } from '@/utils'

import { GanttEdges } from './components/gantt-edges'
import { GanttLegend } from './components/gantt-legend'
import { RowLabel } from './components/row-label'
import {
  AXIS_HEIGHT,
  CHART_TAIL,
  fitDayWidth,
  labelColumns,
  LABEL_WIDTH,
  LABEL_WIDTH_COLLAPSED,
  SCROLL_AREA_MAX_H,
  SCROLLBAR_GUTTER,
  SUBAXIS_HEIGHT,
} from './gantt-geometry'
import {
  type AxisTick,
  buildTimeline,
  monthAxisTicks,
  rowBar,
  type ScheduleRow,
  todayOffset,
  weekAxisTicks,
  weekendSpans,
} from './gantt-model'
import { useGanttMetrics } from './hooks/use-gantt-metrics'
import { useRowSummary } from './hooks/use-row-summary'
import { scheduleGanttMessages as m } from './schedule-gantt-messages'
import {
  BAR_SUBTASK,
  BAR_CRITICAL,
  BAR_DELAY,
  BAR_TASK,
  BAR_SELECTED_STROKE_WIDTH,
  BLOCKED_FILL_OPACITY,
  BLOCKED_STROKE,
  BLOCKED_STROKE_DASH,
  CRITICAL_HATCH_ID,
  EDGE_ARROW_ID,
  PROGRESS_MARK,
  rowBackground,
  TODAY_LINE,
  TODAY_LINE_DASH,
  WEEKEND_BAND,
} from './schedule-palette'

/** A real `<button>`: the row is the keyboard-operable handle of its bar. */
export const RowButton = chakra('button')

/**
 * The bar group is `tabIndex={-1}`, so its focus ring is suppressed on plain
 * focus and kept on `:focus-visible` — scoped to the interaction it is for.
 */
const BarGroup = chakra('g', {
  base: {
    outline: 'none',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'ring',
      outlineOffset: '2px',
    },
  },
})

export interface ScheduleGanttProps {
  rows: ScheduleRow[]
  /** Edges drawn between bars; broken ones get a stub instead of a line. */
  edges?: DependencyNode[]
  /**
   * Horizontal pixels per calendar day, or `fit` to make the whole timeline
   * land inside the chart's own width. `fit` is what a screen of unknown size
   * needs and a fixed ladder of zoom steps cannot give it.
   */
  dayWidth?: number | 'fit'
  selectedRowId?: string | null
  onSelectRow?: (rowId: string) => void
  /** Phases whose subactivities the surface is hiding. */
  collapsedIds?: ReadonlySet<string>
  /** Present when the surface offers collapsing — gates the chevron. */
  onToggleCollapse?: (rowId: string) => void
  /**
   * What this chart is drawing. `draft` narrows the legend to what a draft can
   * actually contain: the engine has not run, so there is no critical path, no
   * propagated delay and no blocked row to explain.
   */
  scope?: 'live' | 'draft'
}

export function ScheduleGantt({
  rows,
  edges = [],
  dayWidth = 8,
  selectedRowId = null,
  onSelectRow,
  collapsedIds,
  onToggleCollapse,
  scope = 'live',
}: ScheduleGanttProps) {
  const intl = useIntl()
  const rowSummary = useRowSummary(scope)
  // The row scale follows the pointer, not the screen: what makes a 14px bar
  // unreachable is the finger. See `use-gantt-metrics`.
  const { rowHeight, barHeight } = useGanttMetrics()
  const [labelsCollapsed, setLabelsCollapsed] = useState(false)
  // The width the label column *actually* renders at. Read from the same
  // breakpoint map the grid template uses: hard-coding the `md` value made the
  // fit zoom 120px too generous on `xl`, where the column is 380px — which is
  // precisely how much of the last row fell off the right edge.
  const breakpointLabelWidth = useBreakpointValue(LABEL_WIDTH) ?? LABEL_WIDTH.md
  // The chart measures itself rather than being told: only it knows how much
  // of its width the sticky label column is currently holding.
  const { ref: scrollAreaRef, rect: scrollAreaRect } = useElementRect()
  // Hover is state, not a CSS `:hover`: the label and the bar are two views of
  // one row and live in different subtrees, so no selector can span them.
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null)
  const timeline = buildTimeline(rows)

  /** The model already chose the format; the component only localises it. */
  const tickLabel = (tick: AxisTick) =>
    tick.format === 'week'
      ? intl.formatDate(parseDay(tick.day), { day: 'numeric', month: 'short' })
      : intl.formatDate(parseDay(tick.day), {
          month: 'short',
          ...(tick.format === 'month' && { year: 'numeric' }),
        })

  if (rows.length === 0 || timeline === null) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title={intl.formatMessage(m.emptyTitle)}
        description={intl.formatMessage(m.emptyDescription)}
      />
    )
  }

  const labelWidth = labelsCollapsed
    ? LABEL_WIDTH_COLLAPSED
    : breakpointLabelWidth
  // What the timeline may spend: the box, less the label column, less the two
  // strips that are chrome — the border pair and the vertical scrollbar — and
  // less the tail the last bar's handle and outline draw into.
  const availableChartWidth =
    (scrollAreaRect?.width ?? 0) -
    labelWidth -
    SCROLLBAR_GUTTER -
    2 -
    CHART_TAIL
  // Fixed zooms are floored at the fit width: a day may be wider than the
  // step asks, never narrower than the viewport — a chart that ends mid-panel
  // leaves a blank strip that reads as broken, not as "no more work".
  const resolvedDayWidth =
    dayWidth === 'fit'
      ? fitDayWidth(timeline.days, availableChartWidth)
      : Math.max(dayWidth, fitDayWidth(timeline.days, availableChartWidth))
  const chartWidth = timeline.days * resolvedDayWidth + CHART_TAIL
  // Two rows, one source each — and the same lists draw the grid, so a line can
  // never drift from the label that names it.
  const monthTicks = monthAxisTicks(timeline, resolvedDayWidth)
  const weekTicks = weekAxisTicks(timeline, resolvedDayWidth)
  // A single week tick is the span's own start, not a rhythm: no second row.
  const twoTierAxis = weekTicks.length > 1
  const axisHeight = AXIS_HEIGHT + (twoTierAxis ? SUBAXIS_HEIGHT : 0)
  const chartHeight = rows.length * rowHeight
  const rowIndex = new Map(rows.map((row, index) => [row.id, index]))
  const weekends = weekendSpans(timeline, resolvedDayWidth)
  const today = todayOffset(timeline)
  const todayX = today === null ? null : today * resolvedDayWidth

  const barGeometry = (row: ScheduleRow) => {
    const bar = rowBar(row, timeline)
    if (!bar) return null
    const index = rowIndex.get(row.id) ?? 0
    return {
      x: bar.offsetDays * resolvedDayWidth,
      width: Math.max(2, bar.durationDays * resolvedDayWidth),
      delayWidth: bar.delayDays * resolvedDayWidth,
      y: index * rowHeight + (rowHeight - barHeight) / 2,
    }
  }

  return (
    <Box data-testid="schedule-gantt">
      {/*
        One scroll container for both axes, so the month axis can stay sticky
        under vertical scroll and the label column under horizontal scroll —
        two nested scrollers (the old layout) put the axis inside an
        `overflow-x` box, where `position: sticky` cannot reach the page.
      */}
      <Box
        borderWidth="1px"
        borderColor="border"
        rounded="md"
        overflow="auto"
        // The horizontal pan belongs to the chart. Without this, a diagonal
        // swipe on a tablet hands the gesture to the page behind it and the
        // schedule scrolls away mid-drag.
        overscrollBehaviorX="contain"
        // A viewport of *rows*: the sticky axis and the scrollbar gutter are
        // added on top, not taken out of it. Taken out, the last row ended
        // flush with the scrollport edge and the scrollbar sat on top of it.
        maxH={SCROLL_AREA_MAX_H}
        ref={scrollAreaRef}
        data-testid="gantt-scroll-area"
      >
        <Box
          display="grid"
          gridTemplateColumns={labelColumns(chartWidth, labelsCollapsed)}
          w="max-content"
          // The grid ends before the scrollport does, so the last row is never
          // under the scrollbar. Part of the layout, not a nudge: it is the
          // same strip the axis reserves at the other end.
          pb={`${SCROLLBAR_GUTTER}px`}
          data-testid="gantt-grid"
        >
          {/* Corner — pinned on both axes; it covers where axis meets labels.
              It also carries the fold: the only chrome that is reachable
              whatever the chart has been scrolled to belongs to the control
              that gives the timeline its width back. */}
          <Box
            position="sticky"
            top={0}
            left={0}
            zIndex={3}
            bg="bg.panel"
            h={`${axisHeight}px`}
            borderBottomWidth="1px"
            borderRightWidth="1px"
            borderColor="border"
            display="flex"
            alignItems="center"
            justifyContent={labelsCollapsed ? 'center' : 'flex-end'}
            px={1}
          >
            <Tooltip
              content={intl.formatMessage(
                labelsCollapsed ? m.expandLabels : m.collapseLabels,
              )}
            >
              <RowButton
                type="button"
                display="flex"
                alignItems="center"
                justifyContent="center"
                w={5}
                h={5}
                rounded="sm"
                color="fg.muted"
                _hover={{ color: 'fg.default' }}
                aria-expanded={!labelsCollapsed}
                aria-label={intl.formatMessage(
                  labelsCollapsed ? m.expandLabels : m.collapseLabels,
                )}
                data-testid="gantt-labels-toggle"
                onClick={() => setLabelsCollapsed((folded) => !folded)}
              >
                {labelsCollapsed ? (
                  <PanelLeftOpen size={14} aria-hidden />
                ) : (
                  <PanelLeftClose size={14} aria-hidden />
                )}
              </RowButton>
            </Tooltip>
          </Box>

          {/* Time axis — the reference a 150-row schedule loses the moment it
              scrolls, so it stays pinned. Two rows where the zoom affords
              them: the calendar above, the week you are standing in below. */}
          <Box
            position="sticky"
            top={0}
            zIndex={2}
            bg="bg.panel"
            h={`${axisHeight}px`}
            borderBottomWidth="1px"
            borderColor="border"
          >
            <svg
              width={chartWidth}
              height={axisHeight}
              role="presentation"
              data-testid="gantt-axis"
            >
              {monthTicks.map((tick) => (
                <Fragment key={tick.day}>
                  {/* The month's own edge. The label reads as belonging to
                      what is to its right rather than floating over a
                      boundary the eye has to guess at. */}
                  <line
                    x1={tick.offsetDays * resolvedDayWidth}
                    x2={tick.offsetDays * resolvedDayWidth}
                    y1={0}
                    y2={axisHeight}
                    stroke="currentColor"
                    strokeOpacity={0.15}
                  />
                  <text
                    x={tick.offsetDays * resolvedDayWidth + 4}
                    y={15}
                    fontSize={10}
                    fontWeight={twoTierAxis ? 600 : 400}
                    fill="currentColor"
                    opacity={0.75}
                  >
                    {tickLabel(tick)}
                  </text>
                </Fragment>
              ))}
              {twoTierAxis && (
                <>
                  <line
                    x1={0}
                    x2={chartWidth}
                    y1={AXIS_HEIGHT}
                    y2={AXIS_HEIGHT}
                    stroke="currentColor"
                    strokeOpacity={0.12}
                  />
                  {weekTicks.map((tick) => (
                    <text
                      key={tick.day}
                      x={tick.offsetDays * resolvedDayWidth + 4}
                      y={AXIS_HEIGHT + 12}
                      fontSize={9}
                      fill="currentColor"
                      opacity={0.55}
                    >
                      {tickLabel(tick)}
                    </text>
                  ))}
                </>
              )}
              {/*
                Today's head on the axis. A pointer, not a word: the label
                would sit on top of the month it lands in, and the line
                below it is already the thing being pointed at. The `title`
                is what names it, for the pointer and the screen reader
                alike.
              */}
              {todayX !== null && (
                <polygon
                  data-testid="gantt-today-marker"
                  points={`${todayX - 4},${axisHeight - 6} ${todayX + 4},${axisHeight - 6} ${todayX},${axisHeight}`}
                  fill={TODAY_LINE}
                >
                  <title>{intl.formatMessage(m.today)}</title>
                </polygon>
              )}
            </svg>
          </Box>

          {/* Label column — the accessible, keyboard-operable view of the chart. */}
          <Box
            position="sticky"
            left={0}
            zIndex={2}
            bg="bg.panel"
            borderRightWidth="1px"
            borderColor="border"
          >
            {rows.map((row) => (
              <RowLabel
                key={row.id}
                row={row}
                scope={scope}
                selected={row.id === selectedRowId}
                hovered={hoveredRowId === row.id}
                collapsed={collapsedIds?.has(row.id) ?? false}
                rowHeight={rowHeight}
                labelsCollapsed={labelsCollapsed}
                onToggleCollapse={
                  onToggleCollapse ? () => onToggleCollapse(row.id) : undefined
                }
                onHoverChange={(isOver) =>
                  setHoveredRowId((current) =>
                    isOver ? row.id : current === row.id ? null : current,
                  )
                }
                onActivate={() => onSelectRow?.(row.id)}
              />
            ))}
          </Box>

          {/* Chart */}
          <Box>
            <svg
              width={chartWidth}
              height={chartHeight}
              role="presentation"
              data-testid="gantt-chart"
            >
              <defs>
                {/*
                Critical path is never hue alone. A reader who cannot separate
                red from amber still sees the hatch, which is the one
                distinction the chart cannot afford to lose.
              */}
                <pattern
                  id={CRITICAL_HATCH_ID}
                  width={6}
                  height={6}
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width={6} height={6} fill={BAR_CRITICAL} />
                  <line
                    x1={0}
                    y1={0}
                    x2={0}
                    y2={6}
                    stroke="#ffffff"
                    strokeOpacity={0.55}
                    strokeWidth={2}
                  />
                </pattern>
                {/*
                  The arrowhead every edge lands with. `orient="auto"` turns it
                  onto the last segment, so an edge that arrives from the right
                  — an FF whose predecessor finishes later — points the way it
                  actually runs rather than the way the markup was written.
                */}
                <marker
                  id={EDGE_ARROW_ID}
                  markerWidth={6}
                  markerHeight={6}
                  refX={5}
                  refY={3}
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path
                    d="M0,0 L6,3 L0,6 Z"
                    fill="currentColor"
                    fillOpacity={0.45}
                  />
                </marker>
              </defs>

              {/*
                Non-working days, at the very back. "Finishes Friday" and
                "finishes Monday" are the same three days apart on a bare
                axis; this is what puts the difference between them back.
              */}
              {weekends.map((span) => (
                <rect
                  key={`weekend-${span.offsetDays}`}
                  data-testid="gantt-weekend"
                  x={span.offsetDays * resolvedDayWidth}
                  y={0}
                  width={span.days * resolvedDayWidth}
                  height={chartHeight}
                  fill={WEEKEND_BAND}
                />
              ))}

              {/*
              The selected row's band, behind everything else so the bars keep
              their own colour. It runs the full chart width because that is
              the question it answers: which line am I on. Shown only in the
              label column, a selection leaves no sign of itself near the bars
              being read on a wide schedule.
            */}
              {rows.map((row, index) => {
                const { band } = rowBackground({
                  selected: row.id === selectedRowId,
                  hovered: row.id === hoveredRowId,
                })
                if (band === null) return null
                return (
                  <rect
                    key={`band-${row.id}`}
                    data-testid={
                      row.id === selectedRowId
                        ? 'gantt-row-selected'
                        : 'gantt-row-hovered'
                    }
                    x={0}
                    y={index * rowHeight}
                    width={chartWidth}
                    height={rowHeight}
                    fill={band}
                    fillOpacity={row.id === selectedRowId ? 1 : 0.7}
                  />
                )
              })}

              {/* The grid is the axis, continued down. Months carry the
                  reading, weeks only pace it — so they are drawn fainter
                  instead of turning the chart into graph paper. */}
              {weekTicks.map((tick) => (
                <line
                  key={`week-${tick.day}`}
                  x1={tick.offsetDays * resolvedDayWidth}
                  x2={tick.offsetDays * resolvedDayWidth}
                  y1={0}
                  y2={chartHeight}
                  stroke="currentColor"
                  strokeOpacity={0.04}
                />
              ))}
              {monthTicks.map((tick) => (
                <line
                  key={`month-${tick.day}`}
                  x1={tick.offsetDays * resolvedDayWidth}
                  x2={tick.offsetDays * resolvedDayWidth}
                  y1={0}
                  y2={chartHeight}
                  stroke="currentColor"
                  strokeOpacity={0.1}
                />
              ))}

              <GanttEdges
                edges={edges}
                rows={rows}
                barGeometry={barGeometry}
                barHeight={barHeight}
              />

              {rows.map((row) => {
                const bar = barGeometry(row)
                if (!bar) return null
                const critical = row.isCriticalPath
                const { outline } = rowBackground({
                  selected: row.id === selectedRowId,
                  hovered: row.id === hoveredRowId,
                })
                const bars = (
                  <BarGroup
                    data-testid="gantt-bar-group"
                    tabIndex={-1}
                    onPointerEnter={() => setHoveredRowId(row.id)}
                    onPointerLeave={() =>
                      setHoveredRowId((current) =>
                        current === row.id ? null : current,
                      )
                    }
                  >
                    <rect
                      data-testid={
                        critical ? 'gantt-bar-critical' : 'gantt-bar'
                      }
                      data-level={row.level}
                      x={bar.x}
                      y={bar.y}
                      width={bar.width}
                      height={barHeight}
                      rx={3}
                      // Critical carries the hatch; otherwise the level
                      // decides, so a phase and an activity never share a fill
                      // distinguished only by six pixels of indent.
                      fill={
                        critical
                          ? `url(#${CRITICAL_HATCH_ID})`
                          : row.level === 'task'
                            ? BAR_TASK
                            : BAR_SUBTASK
                      }
                      fillOpacity={row.isBlocked ? BLOCKED_FILL_OPACITY : 1}
                      // Blocked adds an outline: opacity alone reads as "further
                      // away", not as "cannot start".
                      stroke={row.isBlocked ? BLOCKED_STROKE : undefined}
                      strokeDasharray={
                        row.isBlocked ? BLOCKED_STROKE_DASH : undefined
                      }
                      // Clicking the bar is clicking the row.
                      onPointerUp={() => onSelectRow?.(row.id)}
                    />
                    {/*
                      Work done, as an inner fill spanning the reported
                      fraction of the baseline only — the delay segment is
                      time, not work. A fill, not a 3px centre line: at bar
                      scale the line was invisible from arm's length.
                    */}
                    {row.progress > 0 && (
                      <rect
                        data-testid="gantt-bar-progress"
                        x={bar.x}
                        y={bar.y}
                        width={Math.max(
                          0,
                          (bar.width * Math.min(100, row.progress)) / 100,
                        )}
                        height={barHeight}
                        rx={3}
                        fill={PROGRESS_MARK}
                        fillOpacity={0.45}
                        pointerEvents="none"
                      />
                    )}
                    {/* The figure, where the bar has room to say it. */}
                    {row.progress > 0 && bar.width >= 36 && (
                      <text
                        data-testid="gantt-bar-progress-label"
                        x={bar.x + bar.width + bar.delayWidth + 4}
                        y={bar.y + barHeight / 2}
                        dominantBaseline="central"
                        fontSize={9}
                        fill="currentColor"
                        opacity={0.65}
                        pointerEvents="none"
                      >
                        {intl.formatMessage(m.progressLabel, {
                          progress: Math.round(row.progress),
                        })}
                      </text>
                    )}
                    {bar.delayWidth > 0 && (
                      <rect
                        data-testid="gantt-bar-delay"
                        x={bar.x + bar.width}
                        y={bar.y}
                        width={bar.delayWidth}
                        height={barHeight}
                        rx={3}
                        // Amber, and always appended past the baseline — so time
                        // lost is separable from critical by position, not only
                        // by hue.
                        fill={BAR_DELAY}
                      />
                    )}
                    {/*
                      The selected bar's outline. Its own shape rather than a
                      `stroke` on the bar, for two reasons: it wraps the delay
                      segment too, so what is outlined is the whole row, and it
                      does not fight the dashed stroke a blocked bar already
                      carries — a blocked bar that is selected reads as both.
                      Inert to the pointer, so it never eats the click that
                      selects.
                    */}
                    {outline !== null && (
                      <rect
                        data-testid="gantt-bar-selected-outline"
                        x={bar.x - 2}
                        y={bar.y - 2}
                        width={bar.width + bar.delayWidth + 4}
                        height={barHeight + 4}
                        rx={5}
                        fill="none"
                        stroke={outline}
                        strokeWidth={BAR_SELECTED_STROKE_WIDTH}
                        pointerEvents="none"
                      />
                    )}
                  </BarGroup>
                )
                // The summary knows the scope: a draft's sentence carries the
                // dates, duration and imported progress and claims nothing the
                // engine has not computed.
                return (
                  <Tooltip key={row.id} content={rowSummary(row)}>
                    {bars}
                  </Tooltip>
                )
              })}

              {/*
                Today, over everything: whether a bar is late is read against
                this line, so it has to cross the bars rather than pass behind
                them. Inert to the pointer — it is a reference, not a target.
              */}
              {todayX !== null && (
                <line
                  data-testid="gantt-today"
                  x1={todayX}
                  x2={todayX}
                  y1={0}
                  y2={chartHeight}
                  stroke={TODAY_LINE}
                  strokeWidth={1}
                  strokeDasharray={TODAY_LINE_DASH}
                  pointerEvents="none"
                />
              )}
            </svg>
          </Box>
        </Box>
      </Box>

      <GanttLegend scope={scope} />
    </Box>
  )
}
