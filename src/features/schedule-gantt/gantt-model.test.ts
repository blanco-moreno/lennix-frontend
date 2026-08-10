import { mapTaskDTOArrayToTasks } from '@/services/task'
import { DEFAULT_SEED_PROJECT_ID, seedTaskListDTO } from '@/tests/fixtures'
import type { Task } from '@/types'

import {
  addDays,
  buildScheduleRows,
  buildTimeline,
  daysBetween,
  filterRows,
  monthAxisTicks,
  rowBar,
  type ScheduleRow,
  todayOffset,
  weekAxisTicks,
  weekendSpans,
} from './gantt-model'

const seededTasks = (): Task[] =>
  mapTaskDTOArrayToTasks(seedTaskListDTO(DEFAULT_SEED_PROJECT_ID))

const row = (overrides: Partial<ScheduleRow> = {}): ScheduleRow => ({
  id: 'r1',
  parentId: null,
  level: 'task',
  title: 'Actividad principal',
  status: 'todo',
  progress: 0,
  startDate: '2026-03-01',
  dueDate: '2026-03-10',
  delayReason: null,
  delayDays: 0,
  isBlocked: false,
  isCriticalPath: false,
  assigneeName: null,
  location: null,
  atRisk: false,
  forceStarted: false,
  isOverBudget: false,
  ref: null,
  ...overrides,
})

describe('day arithmetic', () => {
  it('counts calendar days between two ISO days', () => {
    expect(daysBetween('2026-03-01', '2026-03-10')).toBe(9)
    expect(daysBetween('2026-03-10', '2026-03-01')).toBe(-9)
  })

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-03-30', 3)).toBe('2026-04-02')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-03-05', -5)).toBe('2026-02-28')
  })
})

describe('buildScheduleRows', () => {
  it('emits each phase followed by its own activities, chronologically', () => {
    const rows = buildScheduleRows(seededTasks())

    expect(rows.length).toBeGreaterThan(0)
    const phases = rows.filter((r) => r.level === 'task')
    expect(phases.length).toBe(seededTasks().length)
    // Every activity sits after its phase and points back at it.
    for (const [index, current] of rows.entries()) {
      if (current.level !== 'subtask') continue
      const phaseIndex = rows.findIndex((r) => r.id === current.parentId)
      expect(phaseIndex).toBeGreaterThanOrEqual(0)
      expect(phaseIndex).toBeLessThan(index)
    }
    const starts = phases.map((p) => p.startDate ?? p.dueDate ?? '9999-12-31')
    expect([...starts].sort((a, b) => a.localeCompare(b))).toEqual(starts)
  })

  it('sorts undated rows last instead of placing them at epoch', () => {
    const rows = buildScheduleRows([
      { ...taskShell('undated'), startDate: null, dueDate: null },
      { ...taskShell('dated'), startDate: '2026-01-05', dueDate: '2026-01-09' },
    ])
    expect(rows.map((r) => r.id)).toEqual(['dated', 'undated'])
  })
})

describe('buildTimeline', () => {
  it('spans the first start to the last finish, delay included', () => {
    const timeline = buildTimeline([
      row({ id: 'a', startDate: '2026-03-01', dueDate: '2026-03-10' }),
      row({
        id: 'b',
        startDate: '2026-03-05',
        dueDate: '2026-03-20',
        delayDays: 4,
      }),
    ])
    expect(timeline).toEqual({
      start: '2026-03-01',
      end: '2026-03-24',
      days: 24,
    })
  })

  it('is null when nothing carries a date', () => {
    expect(buildTimeline([row({ startDate: null, dueDate: null })])).toBeNull()
  })

  it('covers the seeded project', () => {
    const timeline = buildTimeline(buildScheduleRows(seededTasks()))
    expect(timeline).not.toBeNull()
    expect(timeline!.days).toBeGreaterThan(1)
    expect(timeline!.start < timeline!.end).toBe(true)
  })
})

describe('rowBar', () => {
  const timeline = { start: '2026-03-01', end: '2026-03-31', days: 31 }

  it('places the baseline bar and the propagated delay past its end', () => {
    expect(
      rowBar(
        row({ startDate: '2026-03-05', dueDate: '2026-03-09', delayDays: 3 }),
        timeline,
      ),
    ).toEqual({ offsetDays: 4, durationDays: 5, delayDays: 3 })
  })

  it('gives a same-day row a visible one-day bar', () => {
    expect(
      rowBar(row({ startDate: '2026-03-05', dueDate: '2026-03-05' }), timeline)
        ?.durationDays,
    ).toBe(1)
  })

  it('never draws negative delay as a bar', () => {
    expect(rowBar(row({ delayDays: -4 }), timeline)?.delayDays).toBe(0)
  })

  it('has no bar for an undated row', () => {
    expect(rowBar(row({ startDate: null, dueDate: null }), timeline)).toBeNull()
  })
})

describe('weekAxisTicks', () => {
  // A year and a half, so every granularity has something to thin out.
  const long = { start: '2026-01-15', end: '2027-06-30', days: 532 }
  // The three fixed zoom levels the surface offers, in px per day.
  const [dayZoom, weekZoom, monthZoom] = [24, 8, 3]

  it('dates every week at day zoom and every fortnight at week zoom', () => {
    const daily = weekAxisTicks(long, dayZoom)
    const weekly = weekAxisTicks(long, weekZoom)

    expect(daily.every((tick) => tick.format === 'week')).toBe(true)
    expect(daily[1]!.offsetDays).toBe(7)
    expect(weekly[1]!.offsetDays).toBe(14)
    expect(daily.length).toBeGreaterThan(weekly.length)
  })

  it('folds the row away once even a fortnight cannot carry a date', () => {
    expect(weekAxisTicks(long, monthZoom)).toEqual([])
    expect(weekAxisTicks(long, 1)).toEqual([])
  })
})

describe('monthAxisTicks', () => {
  const long = { start: '2026-01-15', end: '2027-06-30', days: 532 }

  it('labels boundaries, and the opening month at day zero', () => {
    const ticks = monthAxisTicks(long, 3)

    expect(ticks[0]).toEqual({
      day: '2026-01-15',
      offsetDays: 0,
      format: 'month',
    })
    expect(ticks.slice(1).every((tick) => tick.day.endsWith('-01'))).toBe(true)
  })

  it('shortens the label, then skips whole months, as space runs out', () => {
    const short = monthAxisTicks(long, 1)
    const skipping = monthAxisTicks(long, 0.5)

    expect(short.every((tick) => tick.format === 'short')).toBe(true)
    // Every month at 30px; one in two at 15px.
    expect(short.length).toBeGreaterThan(skipping.length)
    expect(skipping.length).toBeGreaterThan(1)
  })

  it('emits more ticks the wider the day, never more than fit', () => {
    const counts = [0.5, 1, 3, 8, 24].map(
      (dayWidth) => monthAxisTicks(long, dayWidth).length,
    )
    expect([...counts].sort((a, b) => a - b)).toEqual(counts)
  })

  it('never places two labels closer than the label between them needs', () => {
    // 28px is the tightest label the model emits (a bare `MMM`).
    const minimumGapPx = 28
    for (const dayWidth of [0.5, 1, 2, 3, 5, 8, 12, 24]) {
      const ticks = monthAxisTicks(long, dayWidth)
      for (const [index, tick] of ticks.entries()) {
        if (index === 0) continue
        const gap = (tick.offsetDays - ticks[index - 1]!.offsetDays) * dayWidth
        expect(gap).toBeGreaterThanOrEqual(minimumGapPx)
      }
    }
  })

  it('still labels the start of a span with no month boundary in it', () => {
    expect(
      monthAxisTicks({ start: '2026-01-10', end: '2026-01-20', days: 11 }, 3),
    ).toEqual([{ day: '2026-01-10', offsetDays: 0, format: 'month' }])
  })
})

describe('weekendSpans', () => {
  // 2026-03-01 is a Sunday: the span opens mid-weekend.
  const march = { start: '2026-03-01', end: '2026-03-31', days: 31 }

  it('bands every Saturday-Sunday pair, clipped to the span at both ends', () => {
    expect(weekendSpans(march, 8)).toEqual([
      { offsetDays: 0, days: 1 },
      { offsetDays: 6, days: 2 },
      { offsetDays: 13, days: 2 },
      { offsetDays: 20, days: 2 },
      { offsetDays: 27, days: 2 },
    ])
  })

  it('starts on the first Saturday when the span opens mid-week', () => {
    // 2026-03-04 is a Wednesday; its Saturday is three days later.
    const spans = weekendSpans({ start: '2026-03-04', end: '2026-03-31', days: 28 }, 8) // prettier-ignore
    expect(spans[0]).toEqual({ offsetDays: 3, days: 2 })
  })

  it('says nothing at a zoom where a weekend is a texture, not two days', () => {
    expect(weekendSpans(march, 3)).toEqual([])
  })
})

describe('todayOffset', () => {
  const march = { start: '2026-03-01', end: '2026-03-31', days: 31 }

  it('places today on the axis in days from the span start', () => {
    expect(todayOffset(march, new Date(2026, 2, 11))).toBe(10)
  })

  it('is null outside the span, on either side', () => {
    expect(todayOffset(march, new Date(2026, 1, 28))).toBeNull()
    expect(todayOffset(march, new Date(2026, 3, 2))).toBeNull()
  })
})

describe('filterRows', () => {
  const rows = [
    row({ id: 'p1', level: 'task' }),
    row({
      id: 'a1',
      level: 'subtask',
      parentId: 'p1',
      isCriticalPath: true,
    }),
    row({ id: 'a2', level: 'subtask', parentId: 'p1', delayDays: 6 }),
    row({ id: 'p2', level: 'task', isBlocked: true }),
  ]

  it('keeps the phase of a matching activity so the WBS stays truthful', () => {
    expect(filterRows(rows, 'critical').map((r) => r.id)).toEqual(['p1', 'a1'])
  })

  it('filters by propagated delay and by blocked work', () => {
    expect(filterRows(rows, 'delayed').map((r) => r.id)).toEqual(['p1', 'a2'])
    expect(filterRows(rows, 'at-risk').map((r) => r.id)).toEqual(['p2'])
  })

  it('returns the untouched list for "all"', () => {
    expect(filterRows(rows, 'all')).toBe(rows)
  })
})

function taskShell(id: string): Task {
  return {
    id,
    projectId: DEFAULT_SEED_PROJECT_ID,
    projectName: null,
    title: id,
    description: null,
    status: 'todo',
    priority: 'medium',
    budget: null,
    progress: 0,
    startDate: null,
    dueDate: null,
    spent: 0,
    isOverBudget: false,
    delayReason: null,
    delayDays: 0,
    isDraft: false,
    isBlocked: false,
    isCriticalPath: false,
    assigneeId: null,
    assigneeName: null,
    forceStarted: false,
    atRisk: false,
    createdAt: '2026-01-01T00:00:00Z',
    subtasks: [],
  }
}
