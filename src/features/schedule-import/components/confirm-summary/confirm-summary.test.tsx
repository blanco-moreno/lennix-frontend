import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ConfirmSummary } from './confirm-summary'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('ConfirmSummary', () => {
  it('counts what goes live and where the schedule starts and ends', () => {
    const { project, tasks } = state()
    renderWithProviders(<ConfirmSummary project={project} tasks={tasks} />)

    const subtasks = tasks.reduce(
      (total, task) => total + task.subtasks.length,
      0,
    )
    expect(screen.getByText(String(tasks.length))).toBeInTheDocument()
    expect(screen.getByText(String(subtasks))).toBeInTheDocument()
    expect(screen.getByText('Starts')).toBeInTheDocument()
    expect(screen.getByText('Ends')).toBeInTheDocument()
  })

  it('shows the budget go-live will write, not the file’s original', () => {
    const { project, tasks } = state()
    renderWithProviders(
      <ConfirmSummary
        project={{ ...project, budget: 100_000 }}
        tasks={tasks}
        details={{ budget: 250_000 }}
      />,
    )

    // A summary that echoed the file while the user re-budgeted the obra would
    // be a summary of the wrong thing.
    expect(screen.getAllByText('$250,000.00').length).toBeGreaterThan(0)
    expect(screen.queryByText('$100,000.00')).toBeNull()
  })

  it('does not repeat the obra’s identity — the wizard header carries it', () => {
    const { project, tasks } = state()
    renderWithProviders(<ConfirmSummary project={project} tasks={tasks} />)

    expect(screen.queryByText(project.name)).toBeNull()
    expect(screen.queryByText('Location')).toBeNull()
  })

  it('says what is left of the budget, and calls an overrun an overrun', () => {
    const { project, tasks } = state()
    const budgeted = tasks.map((task, index) => ({
      ...task,
      budget: index === 0 ? 90_000 : 0,
    }))

    const { unmount } = renderWithProviders(
      <ConfirmSummary
        project={{ ...project, budget: 100_000 }}
        tasks={budgeted}
      />,
    )
    expect(screen.getByText('Unallocated')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-summary-remainder')).toHaveTextContent(
      '$10,000.00',
    )
    unmount()

    renderWithProviders(
      <ConfirmSummary
        project={{ ...project, budget: 50_000 }}
        tasks={budgeted}
      />,
    )
    expect(screen.getByText('Over budget')).toBeInTheDocument()
    expect(screen.getByTestId('confirm-summary-remainder')).toHaveTextContent(
      '$40,000.00',
    )
  })

  it('carries no button — the go-live action lives in the wizard nav', () => {
    const { project, tasks } = state()
    renderWithProviders(<ConfirmSummary project={project} tasks={tasks} />)

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('reports a failed activation without pretending anything was lost', () => {
    const { project, tasks } = state()
    renderWithProviders(
      <ConfirmSummary project={project} tasks={tasks} failed />,
    )

    expect(
      screen.getByText(
        'The schedule could not be activated. Nothing was lost.',
      ),
    ).toBeInTheDocument()
  })
})
