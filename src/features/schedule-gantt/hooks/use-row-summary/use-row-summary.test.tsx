import { screen } from '@testing-library/react'

import { displayedDate } from '@/tests/intl-date'
import { renderWithIntl } from '@/tests/with-intl'

import type { ScheduleRow } from '../../gantt-model'

import { useRowSummary } from '.'

const row = (overrides: Partial<ScheduleRow> = {}): ScheduleRow => ({
  id: 'p1',
  parentId: null,
  level: 'task',
  title: 'Obras preliminares',
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

/** The hook returns a sentence; render it so intl resolves as in the chart. */
function Probe({
  target,
  scope,
}: {
  target: ScheduleRow
  scope?: 'live' | 'draft'
}) {
  const rowSummary = useRowSummary(scope)
  return <p>{rowSummary(target)}</p>
}

describe('useRowSummary', () => {
  it('says a row is undated instead of speaking an empty range', () => {
    renderWithIntl(<Probe target={row({ startDate: null, dueDate: null })} />)

    expect(
      screen.getByText('Main activity · Obras preliminares. No dates. On time'),
    ).toBeInTheDocument()
  })

  it('leaves a missing end open rather than inventing one', () => {
    renderWithIntl(<Probe target={row({ dueDate: null })} />)

    expect(
      screen.getByText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to —. On time`,
      ),
    ).toBeInTheDocument()
  })

  it('appends the critical and blocked marks after the slip', () => {
    renderWithIntl(
      <Probe
        target={row({
          level: 'subtask',
          title: 'Excavación',
          delayDays: 3,
          isCriticalPath: true,
          isBlocked: true,
        })}
      />,
    )

    expect(
      screen.getByText(
        `Subactivity · Excavación. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. +3 days. Critical · Blocked`,
      ),
    ).toBeInTheDocument()
  })

  it('names the cause next to the slip when the row carries one', () => {
    renderWithIntl(
      <Probe
        target={row({ delayDays: 3, delayReason: 'weather_conditions' })}
      />,
    )

    expect(
      screen.getByText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. +3 days · Weather conditions`,
      ),
    ).toBeInTheDocument()
  })

  it('speaks who carries the row and where, when the schedule knows', () => {
    renderWithIntl(
      <Probe
        target={row({
          assigneeName: 'Carla Ruiz',
          location: 'Sector 3',
          progress: 40,
        })}
      />,
    )

    expect(
      screen.getByText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. On time. 40% done · Assigned to Carla Ruiz · At Sector 3`,
      ),
    ).toBeInTheDocument()
  })

  it('claims no verdict for a draft — dates, ref and imported progress only', () => {
    renderWithIntl(
      <Probe
        scope="draft"
        target={row({ ref: 'A-120', progress: 25, delayDays: 3 })}
      />,
    )

    expect(
      screen.getByText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. Source ID A-120 · 25% done`,
      ),
    ).toBeInTheDocument()
  })

  it('keeps a recorded cause silent while the row is still on time', () => {
    renderWithIntl(
      <Probe target={row({ delayReason: 'weather_conditions' })} />,
    )

    expect(
      screen.getByText(
        `Main activity · Obras preliminares. ${displayedDate('2026-03-01')} to ${displayedDate('2026-03-10')}. On time`,
      ),
    ).toBeInTheDocument()
  })
})
