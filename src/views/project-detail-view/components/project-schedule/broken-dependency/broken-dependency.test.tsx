import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ScheduleRow } from '@/features'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { DependencyNode } from '@/types'

import { BrokenDependency } from './broken-dependency'

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

const nodeTask = (id: string, title: string, isBlocked = false) => ({
  id,
  title,
  status: 'todo',
  priority: 'medium',
  progress: 0,
  startDate: null,
  dueDate: null,
  delayReason: null,
  delayDays: 0,
  isBlocked,
  forceStarted: false,
})

const brokenEdge = (
  overrides: Partial<DependencyNode> = {},
): DependencyNode => ({
  id: '9',
  task: nodeTask('p2', 'Estructura', true),
  dependsOn: nodeTask('gone', 'Movimiento de suelos'),
  relationshipType: 'FS',
  lagDays: 0,
  isBroken: true,
  ...overrides,
})

const rows = [
  row(),
  row({ id: 'p2', title: 'Estructura', isBlocked: true }),
  row({ id: 'p3', title: 'Terminaciones' }),
]

const noop = () => {}

describe('BrokenDependency', () => {
  it('names the deleted predecessor and says the row stays blocked', () => {
    renderWithProviders(
      <BrokenDependency
        edge={brokenEdge()}
        rows={rows}
        edges={[brokenEdge()]}
        onRelink={noop}
        onDiscard={noop}
      />,
    )

    expect(
      screen.getByText(/still depends on “Movimiento de suelos”/),
    ).toBeInTheDocument()
    expect(
      screen.getByText('It stays blocked until you do.'),
    ).toBeInTheDocument()
  })

  it('says the link is merely stale when a DONE-then-deleted predecessor keeps it satisfied', () => {
    renderWithProviders(
      <BrokenDependency
        edge={brokenEdge({ task: nodeTask('p3', 'Terminaciones') })}
        rows={rows}
        edges={[]}
        onRelink={noop}
        onDiscard={noop}
      />,
    )

    expect(screen.getByText(/work is not blocked/)).toBeInTheDocument()
  })

  it('offers a re-link and reports which pair the user picked', async () => {
    const user = userEvent.setup()
    const onRelink = vi.fn()
    const edge = brokenEdge()
    renderWithProviders(
      <BrokenDependency
        edge={edge}
        rows={rows}
        edges={[edge]}
        onRelink={onRelink}
        onDiscard={noop}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Now depends on'), 'p1')
    await user.click(screen.getByRole('button', { name: 'Re-link' }))

    expect(onRelink).toHaveBeenCalledWith(edge, 'p1', 'inter_phase')
  })

  it('never offers the row itself or a pair the backend would refuse', () => {
    renderWithProviders(
      <BrokenDependency
        edge={brokenEdge()}
        rows={[
          ...rows,
          row({
            id: 'a1',
            parentId: 'p1',
            level: 'subtask',
            title: 'Cerco',
          }),
        ]}
        edges={[]}
        onRelink={noop}
        onDiscard={noop}
      />,
    )

    const options = screen.getAllByRole('option').map((o) => o.textContent)
    expect(options).toContain('Obras preliminares')
    expect(options).toContain('Terminaciones')
    // The successor itself and an activity under another phase are not legal.
    expect(options).not.toContain('Estructura')
    expect(options).not.toContain('Cerco')
  })

  it('lets the user drop a link that no longer applies', async () => {
    const user = userEvent.setup()
    const onDiscard = vi.fn()
    const edge = brokenEdge()
    renderWithProviders(
      <BrokenDependency
        edge={edge}
        rows={rows}
        edges={[edge]}
        onRelink={noop}
        onDiscard={onDiscard}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Drop the link' }))
    expect(onDiscard).toHaveBeenCalledWith(edge)
  })

  it('says so when no legal replacement exists instead of showing an empty picker', () => {
    renderWithProviders(
      <BrokenDependency
        edge={brokenEdge()}
        rows={[row({ id: 'p2', title: 'Estructura' })]}
        edges={[]}
        onRelink={noop}
        onDiscard={noop}
      />,
    )

    expect(screen.getByText(/No row can legally precede/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Now depends on')).not.toBeInTheDocument()
  })

  it('surfaces a failed re-link instead of swallowing it', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <BrokenDependency
        edge={brokenEdge()}
        rows={rows}
        edges={[]}
        onRelink={async () => Promise.reject(new Error('boom'))}
        onDiscard={noop}
      />,
    )

    await user.selectOptions(screen.getByLabelText('Now depends on'), 'p1')
    await user.click(screen.getByRole('button', { name: 'Re-link' }))

    expect(
      await screen.findByText('Could not re-link. Try again.'),
    ).toBeInTheDocument()
  })
})
