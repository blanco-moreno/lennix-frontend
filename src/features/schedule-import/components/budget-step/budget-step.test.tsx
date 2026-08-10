import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ReviewProject, ReviewTask } from '@/types'

import {
  draftFromProject,
  type ProjectDetailsDraft,
} from '../../project-details-draft'

import { BudgetStep } from './budget-step'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/** The wizard owns the draft; this stands in for it. */
function Host({
  project = state().project,
  tasks = state().tasks,
}: {
  project?: ReviewProject
  tasks?: ReviewTask[]
}) {
  const [draft, setDraft] = useState<ProjectDetailsDraft>(() =>
    draftFromProject(project, tasks),
  )
  return (
    <BudgetStep
      project={project}
      tasks={tasks}
      draft={draft}
      onEdit={(patch) => setDraft((current) => ({ ...current, ...patch }))}
    />
  )
}

describe('BudgetStep', () => {
  it('offers one amount per main activity, opened on what the import gave it', () => {
    const tasks = state().tasks
    renderWithProviders(<Host tasks={tasks} />)

    for (const task of tasks) {
      expect(screen.getByLabelText(task.title)).toBeInTheDocument()
    }
  })

  it('sums the split itself instead of echoing the backend’s `allocated`', async () => {
    const tasks = [state().tasks[0]]
    renderWithProviders(
      <Host project={{ ...state().project, budget: 100000 }} tasks={tasks} />,
    )

    await userEvent.type(screen.getByLabelText(tasks[0].title), '30000')

    // The response says `allocated: 0` for every draft — rendering it would
    // answer "assigned 0" to someone who just assigned 30.000.
    const balance = screen.getByTestId('budget-step-total')
    expect(balance).toHaveTextContent('$30,000.00')
    expect(screen.getByTestId('budget-step-remainder')).toHaveTextContent(
      '$70,000.00',
    )
  })

  it('reports an overrun without blocking anything', async () => {
    const tasks = [state().tasks[0]]
    renderWithProviders(
      <Host project={{ ...state().project, budget: 1000 }} tasks={tasks} />,
    )

    await userEvent.type(screen.getByLabelText(tasks[0].title), '4000')

    expect(screen.getByText('Over budget')).toBeInTheDocument()
    expect(screen.getByTestId('budget-step-total')).toHaveTextContent(
      /over the project budget/,
    )
  })

  it('writes nothing on its own — the wizard has the one Save', () => {
    renderWithProviders(<Host />)

    expect(
      screen.queryByRole('button', { name: /save/i }),
    ).not.toBeInTheDocument()
  })

  it('has nothing to budget when the draft carries no activities', () => {
    renderWithProviders(<Host tasks={[]} />)

    expect(screen.getByText('No activities to budget yet')).toBeInTheDocument()
    expect(screen.queryByTestId('budget-step')).not.toBeInTheDocument()
  })
})
