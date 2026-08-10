import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ScheduleRow } from '@/features'
import { renderWithProviders } from '@/tests/render-with-providers'

import { SelectionPanel } from './selection-panel'

const row = (overrides: Partial<ScheduleRow> = {}): ScheduleRow => ({
  id: 's1',
  parentId: 'p1',
  level: 'subtask',
  title: 'Excavación de zanjas',
  status: 'in_progress',
  progress: 40,
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

type Props = Partial<Parameters<typeof SelectionPanel>[0]>

function renderPanel(overrides: Props = {}) {
  return renderWithProviders(
    <SelectionPanel
      row={row()}
      dependencyCount={2}
      onOpenRow={vi.fn()}
      onClear={vi.fn()}
      {...overrides}
    />,
  )
}

describe('SelectionPanel', () => {
  it('says the level and title of the row outright, with its dependency count', () => {
    renderPanel()

    const panel = screen.getByTestId('schedule-selection')
    // The chart carries the level as indent and fill alone; neither survives
    // being read as "the row I clicked".
    expect(panel).toHaveTextContent('Subactivity')
    expect(panel).toHaveTextContent('Excavación de zanjas')
    expect(panel).toHaveTextContent('Dependencies')
    expect(panel).toHaveTextContent('2')
  })

  it('labels every fact it shows — there is no header above this row', () => {
    renderPanel({
      row: row({ assigneeName: 'María García', location: 'Piso 3' }),
    })

    const panel = screen.getByTestId('schedule-selection')
    for (const label of ['Progress', 'Start', 'Due', 'Owner', 'Location']) {
      expect(panel).toHaveTextContent(label)
    }
    expect(panel).toHaveTextContent('María García')
    expect(panel).toHaveTextContent('Piso 3')
  })

  it('omits the facts the row has no value for', () => {
    renderPanel()

    const panel = screen.getByTestId('schedule-selection')
    // Location is subactivity-only and the source ref is import-only: an empty
    // labelled slot reads as a missing datum rather than an absent one.
    expect(panel).not.toHaveTextContent('Location')
    expect(panel).not.toHaveTextContent('Source row')
  })

  it('exposes exactly two actions: open, clear — editing and completing live in the detail', () => {
    renderPanel()

    const panel = screen.getByTestId('schedule-selection')
    const actions = screen.getAllByRole('button')
    // The dismiss is icon-only, so the word it would have carried is its
    // accessible name — nothing is said by shape alone.
    expect(
      actions.map(
        (button) => button.getAttribute('aria-label') ?? button.textContent,
      ),
    ).toEqual(['View Subactivity', 'Clear selection'])
    // Editing and completing moved into the task detail, where it is read.
    expect(panel).not.toHaveTextContent('Edit')
    expect(panel).not.toHaveTextContent('Mark done')
  })

  it('shows every badge the selected row carries, at every width', () => {
    renderPanel({
      row: row({
        isBlocked: true,
        isCriticalPath: true,
        atRisk: true,
        delayReason: 'weather_conditions',
        delayDays: 3,
      }),
    })

    // Nothing is counted away: the panel wraps down rather than hiding a
    // state the reader may have selected the row to check.
    const panel = screen.getByTestId('schedule-selection')
    expect(panel).toHaveTextContent('Blocked')
    expect(panel).toHaveTextContent('Critical path')
    expect(panel).toHaveTextContent('At risk')
  })

  it('sits in normal flow, not sticky, and scrolls itself into view instead', () => {
    // jsdom has no scrollIntoView; the spy stands in for the browser's.
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView

    renderPanel()

    // Not pinned: no sticky positioning left on the panel…
    expect(screen.getByTestId('schedule-selection')).not.toHaveStyle({
      position: 'sticky',
    })
    // …selecting brings the panel to the reader instead of pinning it there.
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' })
  })

  it('hides "Open" when the surface has nowhere to open a row', () => {
    renderPanel({ onOpenRow: undefined })

    expect(
      screen.queryByRole('button', { name: 'View Subactivity' }),
    ).not.toBeInTheDocument()
  })

  it('hands the whole row to the opener and clears on request', async () => {
    const user = userEvent.setup()
    const onOpenRow = vi.fn()
    const onClear = vi.fn()
    renderPanel({ onOpenRow, onClear })

    await user.click(screen.getByRole('button', { name: 'View Subactivity' }))
    // The caller needs level and parentId to route a subactivity to its
    // phase's address — an id alone could not tell the two levels apart.
    expect(onOpenRow).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 's1',
        parentId: 'p1',
        level: 'subtask',
      }),
    )

    await user.click(screen.getByRole('button', { name: 'Clear selection' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
