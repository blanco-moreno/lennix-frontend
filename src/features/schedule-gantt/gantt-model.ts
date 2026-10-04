/**
 * The pure model behind the Gantt. Everything is derived from what the backend
 * computed on read — nothing is recomputed here. Undated rows stay undated:
 * they sort last and get no bar.
 */

import type { Task } from '@/types'
import { toISODay, parseDay } from '@/utils'

export const DAY_MS = 86_400_000

/** Row levels mirror the domain: a task holds subtasks. */
export type ScheduleRowLevel = 'task' | 'subtask'

export interface ScheduleRow {
  id: string
  parentId: string | null
  level: ScheduleRowLevel
  title: string
  status: string
  progress: number
  startDate: string | null
  dueDate: string | null
  /** Closed `DelayReason` set; `null` = no cause recorded. */
  delayReason: string | null
  /** Forecast − baseline, in days. `0` when on time. */
  delayDays: number
  isBlocked: boolean
  isCriticalPath: boolean
  /** Who carries the row — `null` when unassigned or unknown (drafts). */
  assigneeName: string | null
  /** Where the work happens; subactivities only. */
  location: string | null
  /** Permanent force-start provenance — see `Task.atRisk`. */
  atRisk: boolean
  forceStarted: boolean
  /** Phases only — spend against budget is tracked one level up. */
  isOverBudget: boolean
  /** Source-file row reference, carried through the import review. */
  ref: string | null
  /** A draft row whose predecessor reference is still a question. */
  openQuestion?: boolean
}

export interface Timeline {
  /** First day covered, ISO `yyyy-MM-dd`. */
  start: string
  /** Last day covered, ISO `yyyy-MM-dd`, delay included. */
  end: string
  /** Inclusive day count — always ≥ 1 for a non-empty schedule. */
  days: number
}

export interface RowBar {
  /** Days between the timeline start and this row's start. */
  offsetDays: number
  /** Baseline duration in days, minimum 1 so a same-day row is visible. */
  durationDays: number
  /** Propagated slip drawn past the baseline end. `0` when on time. */
  delayDays: number
}

export type ScheduleFilter = 'all' | 'critical' | 'delayed' | 'at-risk'

export const SCHEDULE_FILTERS: readonly ScheduleFilter[] = [
  'all',
  'critical',
  'delayed',
  'at-risk',
]

export function daysBetween(from: string, to: string): number {
  return Math.round(
    (parseDay(to).getTime() - parseDay(from).getTime()) / DAY_MS,
  )
}

export function addDays(day: string, days: number): string {
  const date = parseDay(day)
  date.setDate(date.getDate() + days)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const dayOfMonth = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${dayOfMonth}`
}

/** Undated rows sort last: they are unplaceable, not "starting at epoch". */
function sortKey(row: { startDate: string | null; dueDate: string | null }) {
  return row.startDate ?? row.dueDate ?? '9999-12-31'
}

function byStart<
  T extends { startDate: string | null; dueDate: string | null },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
}

/**
 * Flatten the project into the row order the Gantt paints: phases
 * chronologically, each immediately followed by its own activities.
 */
export function buildScheduleRows(tasks: Task[]): ScheduleRow[] {
  return byStart(tasks).flatMap((task) => {
    const phase: ScheduleRow = {
      id: task.id,
      parentId: null,
      level: 'task',
      title: task.title,
      status: task.status,
      progress: task.progress,
      startDate: task.startDate,
      dueDate: task.dueDate,
      delayReason: task.delayReason,
      delayDays: task.delayDays,
      isBlocked: task.isBlocked,
      isCriticalPath: task.isCriticalPath,
      assigneeName: task.assigneeName,
      location: null,
      atRisk: task.atRisk,
      forceStarted: task.forceStarted,
      isOverBudget: task.isOverBudget,
      ref: null,
    }
    const activities: ScheduleRow[] = byStart(task.subtasks ?? []).map(
      (subtask) => ({
        id: subtask.id,
        parentId: task.id,
        level: 'subtask',
        title: subtask.title,
        status: subtask.status,
        progress: subtask.progress,
        startDate: subtask.startDate,
        dueDate: subtask.dueDate,
        delayReason: subtask.delayReason,
        delayDays: subtask.delayDays,
        isBlocked: subtask.isBlocked,
        isCriticalPath: subtask.isCriticalPath,
        assigneeName: subtask.assigneeName,
        location: subtask.location,
        atRisk: subtask.atRisk,
        forceStarted: subtask.forceStarted,
        isOverBudget: false,
        ref: null,
      }),
    )
    return [phase, ...activities]
  })
}

/** The last day a row occupies once its propagated delay is drawn. */
function rowEnd(row: ScheduleRow): string | null {
  const end = row.dueDate ?? row.startDate
  if (!end) return null
  return row.delayDays > 0 ? addDays(end, row.delayDays) : end
}

/**
 * The span every bar is positioned against. `null` when no row carries a date
 * — an empty axis is honest; a made-up month is not.
 */
export function buildTimeline(rows: ScheduleRow[]): Timeline | null {
  let start: string | null = null
  let end: string | null = null
  for (const row of rows) {
    const rowStart = row.startDate ?? row.dueDate
    if (rowStart && (start === null || rowStart < start)) start = rowStart
    const finish = rowEnd(row)
    if (finish && (end === null || finish > end)) end = finish
  }
  if (!start || !end) return null
  return { start, end, days: daysBetween(start, end) + 1 }
}

/** `null` for an undated row — it has no place on the axis, and says so. */
export function rowBar(row: ScheduleRow, timeline: Timeline): RowBar | null {
  const start = row.startDate ?? row.dueDate
  const end = row.dueDate ?? row.startDate
  if (!start || !end) return null
  return {
    offsetDays: Math.max(0, daysBetween(timeline.start, start)),
    durationDays: Math.max(1, daysBetween(start, end) + 1),
    delayDays: Math.max(0, row.delayDays),
  }
}

/**
 * How the component must render a tick's day. The model picks it, because the
 * model is what knows how many pixels the tick has to itself.
 */
export type AxisTickFormat = 'week' | 'month' | 'short'

export interface AxisTick {
  /** ISO day the tick sits on. */
  day: string
  /** Days from the timeline start — multiply by the day width for x. */
  offsetDays: number
  format: AxisTickFormat
}

/**
 * Pixels a label of each format needs before it starts touching its neighbour,
 * at the axis font size: a localized `d MMM`, `MMM yyyy`, and a bare `MMM`.
 */
const LABEL_PX: Record<AxisTickFormat, number> = {
  week: 46,
  month: 45,
  short: 28,
}

/**
 * Clear space demanded between two labels on top of their own width. The old
 * threshold accepted the exact-fit case, where a label ends on the pixel the
 * next one starts — which is the overlap the axis existed to avoid.
 */
const TICK_GAP = 12

/** The 1st of every month strictly inside the span, in order. */
function monthBoundaries(timeline: Timeline): string[] {
  const days: string[] = []
  const cursor = parseDay(timeline.start)
  cursor.setDate(1)
  cursor.setMonth(cursor.getMonth() + 1)
  while (true) {
    const month = `${cursor.getMonth() + 1}`.padStart(2, '0')
    const day = `${cursor.getFullYear()}-${month}-01`
    if (day > timeline.end) break
    days.push(day)
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return days
}

/**
 * The axis is two rows, the way every schedule tool a site engineer has used
 * draws one: the calendar above, the working detail below. They are two
 * functions because they answer to different things — the top row to the
 * calendar, which does not care about zoom, and the bottom row to the zoom,
 * which is the only thing that decides whether a week has room for a date.
 */
const tickAt =
  (timeline: Timeline) =>
  (day: string, format: AxisTickFormat): AxisTick => ({
    day,
    offsetDays: daysBetween(timeline.start, day),
    format,
  })

/**
 * The top row: months. `MMM yyyy` while it fits, then a bare `MMM`, then whole
 * months are skipped rather than let two labels collide — at 3px/day a printed
 * month is 51px from the next one and there is no honest way to show both.
 */
export function monthAxisTicks(
  timeline: Timeline,
  dayWidth: number,
): AxisTick[] {
  const at = tickAt(timeline)
  // A boundary is always the 1st, so its day-of-month is noise — the label is
  // the month. Worst case is February: size the format against 28 days, not 31.
  const format: AxisTickFormat =
    28 * dayWidth >= LABEL_PX.month + TICK_GAP ? 'month' : 'short'
  const gap = LABEL_PX[format] + TICK_GAP
  const ticks: AxisTick[] = []
  for (const day of monthBoundaries(timeline)) {
    const tick = at(day, format)
    const previous = ticks.at(-1)
    if (previous && (tick.offsetDays - previous.offsetDays) * dayWidth < gap) {
      continue
    }
    ticks.push(tick)
  }

  // The span opens mid-month, so the first month has no boundary of its own
  // inside the timeline. It gets one at day zero — labelled as a month, since
  // that is the row it is in — whenever there is room before the next. Bare
  // label width here, not the padded gap: losing the start label costs more
  // than the two labels sitting close once.
  const first = ticks[0]
  if (!first || first.offsetDays * dayWidth >= LABEL_PX[format]) {
    ticks.unshift(at(timeline.start, format))
  }
  return ticks
}

/**
 * Where the last label of an axis row ends, in pixels: its tick, the 4px inset
 * every label is drawn at, the width its format needs, and the gap any label
 * keeps (the semibold top row runs a few px past the bare budget). The chart
 * is at least this wide, so a month that opens on the span's final day reads.
 */
export function axisLabelEnd(ticks: AxisTick[], dayWidth: number): number {
  const last = ticks.at(-1)
  return last
    ? last.offsetDays * dayWidth + 4 + LABEL_PX[last.format] + TICK_GAP
    : 0
}

/**
 * Below this, a weekend is four pixels of shading between two working weeks —
 * a texture, not an interval. The band is drawn only where it can be read as
 * the two days it stands for.
 */
const WEEKEND_MIN_DAY_WIDTH = 5

/** A run of non-working days, in offsets from the timeline start. */
export interface DaySpan {
  offsetDays: number
  days: number
}

/**
 * Saturdays and Sundays inside the span.
 *
 * A construction schedule is read against the working week — "it finishes
 * Friday" and "it finishes Monday" are the same three days apart on a bare
 * axis, and the difference between them is the whole question. The band is
 * what puts the weekend back in the chart.
 *
 * Clipped to the timeline at both ends, so a span that opens on a Sunday
 * still gets its Sunday.
 */
export function weekendSpans(timeline: Timeline, dayWidth: number): DaySpan[] {
  if (dayWidth < WEEKEND_MIN_DAY_WIDTH) return []
  // 0 is Sunday, 6 is Saturday. Start a week early so the weekend the span
  // opens in the middle of is not skipped.
  const weekday = parseDay(timeline.start).getDay()
  const spans: DaySpan[] = []
  for (
    let saturday = ((6 - weekday + 7) % 7) - 7;
    saturday < timeline.days;
    saturday += 7
  ) {
    const from = Math.max(0, saturday)
    const to = Math.min(timeline.days, saturday + 2)
    if (to > from) spans.push({ offsetDays: from, days: to - from })
  }
  return spans
}

/**
 * Where today falls on the axis, or `null` when the span does not contain it.
 *
 * The one line a site engineer looks for first: a bar is late or not against
 * today, and without it the reader is comparing dates in their head. `from` is
 * injectable so a test is not hostage to the day it runs on.
 */
export function todayOffset(
  timeline: Timeline,
  from: Date = new Date(),
): number | null {
  const offset = daysBetween(timeline.start, toISODay(from))
  return offset < 0 || offset > timeline.days ? null : offset
}

/**
 * The bottom row: a dated tick every week, or every fortnight when a week is
 * too tight. Empty once even a fortnight cannot carry a date — the row folds
 * away rather than print labels on top of each other, which is why the axis
 * has one tier at month zoom and two at day zoom.
 */
export function weekAxisTicks(
  timeline: Timeline,
  dayWidth: number,
): AxisTick[] {
  const at = tickAt(timeline)
  const needed = LABEL_PX.week + TICK_GAP
  const step = 7 * dayWidth >= needed ? 7 : 14
  if (step * dayWidth < needed) return []
  const ticks: AxisTick[] = []
  for (let offset = 0; offset < timeline.days; offset += step) {
    ticks.push(at(addDays(timeline.start, offset), 'week'))
  }
  return ticks
}

function matchesFilter(row: ScheduleRow, filter: ScheduleFilter): boolean {
  switch (filter) {
    case 'critical':
      return row.isCriticalPath
    case 'delayed':
      return row.delayDays > 0
    case 'at-risk':
      // Blocked by an unmet or broken edge, or carrying force-start
      // provenance — the two facts a PM reads as "watch this row".
      return row.isBlocked || row.atRisk
    case 'all':
      return true
  }
}

/**
 * Progressive disclosure for large schedules. A matching activity keeps its
 * phase visible — an orphaned activity would read as a top-level phase and
 * quietly misrepresent the WBS.
 */
export function filterRows(
  rows: ScheduleRow[],
  filter: ScheduleFilter,
): ScheduleRow[] {
  if (filter === 'all') return rows
  const keep = new Set<string>()
  for (const row of rows) {
    if (!matchesFilter(row, filter)) continue
    keep.add(row.id)
    if (row.parentId) keep.add(row.parentId)
  }
  return rows.filter((row) => keep.has(row.id))
}

/**
 * Hide the subactivities of collapsed phases. The phase row itself always
 * stays: its own bar spans its dates, so a collapsed phase still shows *when*
 * — it only stops itemizing.
 */
export function collapseRows(
  rows: ScheduleRow[],
  collapsedIds: ReadonlySet<string>,
): ScheduleRow[] {
  if (collapsedIds.size === 0) return rows
  return rows.filter((row) => !(row.parentId && collapsedIds.has(row.parentId)))
}
