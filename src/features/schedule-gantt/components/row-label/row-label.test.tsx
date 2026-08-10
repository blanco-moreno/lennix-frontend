import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/tests/render-with-providers'

import type { ScheduleRow } from '../../gantt-model'
import { BAR_CRITICAL, BAR_DELAY, BLOCKED_STROKE } from '../../schedule-palette'

import { RowLabel } from './row-label'

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

type Handlers = Partial<Parameters<typeof RowLabel>[0]>

function renderLabel(overrides: Handlers = {}) {
  return renderWithProviders(
    <RowLabel
      row={row()}
      selected={false}
      hovered={false}
      onHoverChange={vi.fn()}
      onActivate={vi.fn()}
      {...overrides}
    />,
  )
}

describe('RowLabel', () => {
  it('activates on click and reports the pointer entering and leaving', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    const onHoverChange = vi.fn()
    renderLabel({ onActivate, onHoverChange })

    const label = screen.getByTestId('gantt-row-label')
    await user.hover(label)
    expect(onHoverChange).toHaveBeenLastCalledWith(true)
    await user.unhover(label)
    expect(onHoverChange).toHaveBeenLastCalledWith(false)

    await user.click(label)
    expect(onActivate).toHaveBeenCalledTimes(1)
  })

  it('wears every state the row carries, as a mark', () => {
    renderLabel({
      row: row({ isCriticalPath: true, isBlocked: true, delayDays: 3 }),
    })

    expect(screen.getByTestId('gantt-mark-critical')).toBeInTheDocument()
    expect(screen.getByTestId('gantt-mark-blocked')).toBeInTheDocument()
    expect(screen.getByTestId('gantt-mark-delay')).toBeInTheDocument()
  })

  it('carries no mark for a state the row is not in', () => {
    renderLabel()

    expect(screen.queryByTestId('gantt-mark-critical')).toBeNull()
    expect(screen.queryByTestId('gantt-mark-blocked')).toBeNull()
    expect(screen.queryByTestId('gantt-mark-delay')).toBeNull()
  })

  /**
   * The bug: the marks were text badges sharing the fixed label column with
   * the title, which measured down to 38px of 260 on a real row — the name,
   * which is the row's identifier, was only readable from the tooltip.
   */
  it('leaves the whole column to the name, marks and all', () => {
    const title = 'Movimiento de suelos y excavación de fundaciones — sector 3'
    renderLabel({
      row: row({ title, isCriticalPath: true, isBlocked: true, delayDays: 3 }),
    })

    const label = screen.getByTestId('gantt-row-label')
    // Nothing else in the column spends width on words.
    expect(label).toHaveTextContent(title)
    expect(label.textContent).toBe(title)
    // The title is what grows into the column; the marks never push it out.
    expect(screen.getByText(title)).toHaveStyle({ flex: 1, minWidth: 0 })
  })

  it('says the marks once, in the row’s own name, and not again per icon', () => {
    renderLabel({
      row: row({ isCriticalPath: true, isBlocked: true, delayDays: 3 }),
    })

    const name = screen
      .getByTestId('gantt-row-label')
      .getAttribute('aria-label')
    expect(name).toContain('Critical')
    expect(name).toContain('Blocked')
    expect(name).toContain('+3 days')
    // The icons are decoration of a sentence a screen reader already reads.
    expect(screen.getByTestId('gantt-row-marks')).toHaveAttribute('aria-hidden')
  })

  // A mark and the bar it describes must not be able to drift apart: both read
  // the chart's own `gantt.*` tokens.
  it('paints each mark in the chart’s palette', () => {
    renderLabel({
      row: row({ isCriticalPath: true, isBlocked: true, delayDays: 3 }),
    })

    expect(screen.getByTestId('gantt-mark-critical')).toHaveAttribute(
      'stroke',
      BAR_CRITICAL,
    )
    expect(screen.getByTestId('gantt-mark-blocked')).toHaveAttribute(
      'stroke',
      BLOCKED_STROKE,
    )
    expect(screen.getByTestId('gantt-mark-delay')).toHaveAttribute(
      'stroke',
      BAR_DELAY,
    )
  })
})
