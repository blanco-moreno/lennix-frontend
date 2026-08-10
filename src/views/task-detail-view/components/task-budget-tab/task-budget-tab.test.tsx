import { screen } from '@testing-library/react'

import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_TASK_ID,
  seedBudgetVarianceDTO,
  seedTaskDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { TaskResponseDTO } from '@/types/dto/task-dto'
import { formatMoney, formatPercent } from '@/utils'

import { TaskBudgetTab } from './task-budget-tab'

function renderTab(overrides: Partial<TaskResponseDTO> = {}) {
  const task = mapTaskDTOToTask(seedTaskDTO(DEFAULT_SEED_TASK_ID, overrides))
  renderWithProviders(<TaskBudgetTab task={task} />, { store: makeStore() })
  return task
}

describe('TaskBudgetTab', () => {
  it('summarizes assigned, spent and available while under budget', async () => {
    renderTab({ budget: '100000.00', spent: '25000.00' })

    expect(await screen.findByText('Budget summary')).toBeInTheDocument()
    expect(screen.getByText('Assigned budget')).toBeInTheDocument()
    expect(screen.getAllByText(formatMoney(100000)).length).toBeGreaterThan(0)
    expect(screen.getAllByText(formatMoney(25000)).length).toBeGreaterThan(0)
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(75000))).toBeInTheDocument()
    expect(screen.getByText(formatPercent(25, 1))).toBeInTheDocument()
    // Healthy, so no alarm.
    expect(screen.queryByText('Budget exceeded')).not.toBeInTheDocument()
  })

  it('turns Available into Over budget and raises the alert when spend passes the budget', async () => {
    renderTab({ budget: '1000.00', spent: '1500.00' })

    expect((await screen.findAllByText('Over budget')).length).toBeGreaterThan(
      0,
    )
    expect(screen.queryByText('Available')).not.toBeInTheDocument()
    // The magnitude of the overrun, not a negative number.
    expect(screen.getAllByText(formatMoney(500)).length).toBeGreaterThan(0)
    expect(screen.getByText('Budget exceeded')).toBeInTheDocument()
    expect(
      screen.getByText(
        `This main activity has exceeded its allocated budget by ${formatMoney(500)}.`,
      ),
    ).toBeInTheDocument()
  })

  it('shows the variance card once the seed-backed variance resolves', async () => {
    const variance = seedBudgetVarianceDTO(DEFAULT_SEED_TASK_ID)
    renderTab()

    expect(await screen.findByText('Budget variance')).toBeInTheDocument()
    expect(
      screen.getByText(
        formatPercent(Math.abs(variance.variance_percentage), 1),
      ),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(variance.is_over_budget ? 'Over budget' : 'In range')
        .length,
    ).toBeGreaterThan(0)
  })
})
