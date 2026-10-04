import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { ConfirmSummary } from './confirm-summary'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

const FITS = { assigned: 90_000, unassigned: 10_000, overrun: false }

describe('ConfirmSummary', () => {
  it('states what goes live with the schedule step’s own facts line', () => {
    const { tasks } = state()
    renderWithProviders(
      <ConfirmSummary tasks={tasks} dependencyCount={2} allocation={FITS} />,
    )

    expect(screen.getByTestId('schedule-facts')).toHaveTextContent(
      '2 dependencies',
    )
  })

  it('shows the budget step’s balance, overrun included', () => {
    const { tasks } = state()
    renderWithProviders(
      <ConfirmSummary
        tasks={tasks}
        dependencyCount={0}
        allocation={{ assigned: 90_000, unassigned: -40_000, overrun: true }}
      />,
    )

    expect(screen.getByText('Over budget')).toBeInTheDocument()
    expect(screen.getByTestId('allocation-remainder')).toHaveTextContent(
      '$40,000.00',
    )
  })

  it('does not repeat the obra’s identity — the wizard header carries it', () => {
    const { project, tasks } = state()
    renderWithProviders(
      <ConfirmSummary tasks={tasks} dependencyCount={0} allocation={FITS} />,
    )

    expect(screen.queryByText(project.name)).toBeNull()
  })

  it('carries no button — the go-live action lives in the wizard nav', () => {
    const { tasks } = state()
    renderWithProviders(
      <ConfirmSummary tasks={tasks} dependencyCount={0} allocation={FITS} />,
    )

    expect(screen.queryByRole('button')).toBeNull()
  })

  it('reports a failed activation without pretending anything was lost', () => {
    const { tasks } = state()
    renderWithProviders(
      <ConfirmSummary
        tasks={tasks}
        dependencyCount={0}
        allocation={FITS}
        failed
      />,
    )

    expect(
      screen.getByText(
        'The schedule could not be activated. Nothing was lost.',
      ),
    ).toBeInTheDocument()
  })
})
