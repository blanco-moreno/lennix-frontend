import { screen } from '@testing-library/react'

import { mapTaskDTOToTask } from '@/services/task'
import { DEFAULT_SEED_TASK_ID, seedTaskDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { TaskResponseDTO } from '@/types/dto/task-dto'
import { formatPercent } from '@/utils'

import { TaskOverviewTab } from './task-overview-tab'

/** Pure presentational surface — no store, no requests. */
function renderTab(overrides: Partial<TaskResponseDTO> = {}) {
  const task = mapTaskDTOToTask(seedTaskDTO(DEFAULT_SEED_TASK_ID, overrides))
  renderWithProviders(<TaskOverviewTab task={task} />)
  return task
}

describe('TaskOverviewTab', () => {
  it('shows the execution progress as a stat tile, same shape as the project header', () => {
    const task = renderTab({ progress: 42 })

    expect(screen.getByText('Execution progress')).toBeInTheDocument()
    expect(screen.getByText(formatPercent(task.progress))).toBeInTheDocument()
  })

  it('says how much of the activity’s calendar is behind and ahead', () => {
    renderTab({ start_date: '2026-01-10', due_date: '2026-01-20' })

    expect(screen.getByText('Total days')).toBeInTheDocument()
    expect(screen.getByText('Elapsed days')).toBeInTheDocument()
    expect(screen.getByText('Remaining days')).toBeInTheDocument()
  })

  // The header above it carries status, priority, assignee and the delay
  // banner. Repeating them here was three of the six cards this replaced.
  it('does not repeat what the card header already says', () => {
    renderTab({
      assignee_name: 'Miguel Torres',
      delay_reason: 'material_shortage',
      delay_days: 4,
    })

    expect(screen.queryByText('Miguel Torres')).not.toBeInTheDocument()
    expect(screen.queryByText('Assignee')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Main activity delayed by 4 days'),
    ).not.toBeInTheDocument()
  })
})
