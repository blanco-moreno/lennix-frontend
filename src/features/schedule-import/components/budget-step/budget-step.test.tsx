import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { CostSource, FileBudget, ReviewProject, ReviewTask } from '@/types'

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
  fileBudget,
  costSource,
  costsUnread,
}: {
  project?: ReviewProject
  tasks?: ReviewTask[]
  fileBudget?: FileBudget
  costSource?: CostSource | null
  costsUnread?: number
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
      fileBudget={fileBudget}
      costSource={costSource}
      costsUnread={costsUnread}
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
    const balance = screen.getByTestId('allocation-balance')
    expect(balance).toHaveTextContent('$30,000.00')
    expect(screen.getByTestId('allocation-remainder')).toHaveTextContent(
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
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Over by $3,000.00. You can still activate.',
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

    expect(screen.getByText('No main activities to budget')).toBeInTheDocument()
    expect(screen.queryByTestId('budget-step')).not.toBeInTheDocument()
  })

  describe('amounts that came from the file (IMP-13)', () => {
    it('says the amounts are the file’s, and which column they came from', () => {
      renderWithProviders(
        <Host fileBudget="applied" costSource="baseline" costsUnread={0} />,
      )

      const notice = screen.getByTestId('file-budget-notice')
      expect(notice).toHaveTextContent('Amounts taken from the file')
      expect(notice).toHaveTextContent(
        'Each phase starts with the baseline cost the file states.',
      )
      expect(notice).not.toHaveTextContent('could not be read')
      // A cost column never says whether VAT is in it; the budget is net.
      expect(notice).toHaveTextContent(
        'Lennix keeps budgets net, without VAT. The file does not say whether its amounts include VAT',
      )
    })

    it('counts the amounts it declined to read instead of guessing them', () => {
      renderWithProviders(
        <Host fileBudget="applied" costSource="stated" costsUnread={2} />,
      )

      expect(screen.getByTestId('file-budget-notice')).toHaveTextContent(
        '2 amounts in the file could not be read with certainty and were left empty.',
      )
    })

    it('says when the file’s amounts are too large to store', () => {
      renderWithProviders(<Host fileBudget="out_of_range" />)

      expect(screen.getByTestId('file-budget-notice')).toHaveTextContent(
        'Lennix stores amounts up to 9,999,999,999. Nothing was filled in; enter the budget by hand.',
      )
    })

    it('says nothing when the file states no costs', () => {
      renderWithProviders(<Host fileBudget="none" />)

      expect(screen.queryByTestId('file-budget-notice')).not.toBeInTheDocument()
    })
  })
})
