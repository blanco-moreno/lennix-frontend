import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ReviewDependency } from '@/types'

import { SchedulePreview } from './schedule-preview'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

describe('SchedulePreview', () => {
  it('draws the real chart, not a bar list', () => {
    const { tasks, dependencies } = state()
    renderWithProviders(
      <SchedulePreview tasks={tasks} dependencies={dependencies} />,
    )

    expect(screen.getByTestId('schedule-gantt')).toBeInTheDocument()
    expect(screen.getByTestId('gantt-axis')).toBeInTheDocument()
  })

  it('draws the dependency arrows the review state carries', () => {
    const { tasks } = state()
    const edges: ReviewDependency[] = [
      {
        id: 1,
        taskId: tasks[1].id,
        dependsOnId: tasks[0].id,
        relationshipType: 'FS',
        lagDays: 0,
        source: 'file',
      },
    ]
    renderWithProviders(<SchedulePreview tasks={tasks} dependencies={edges} />)

    expect(screen.getAllByTestId('gantt-edge')).toHaveLength(1)
    expect(screen.getByTestId('schedule-preview-edges')).toHaveTextContent(
      '1 link between activities',
    )
  })

  it('offers the same zoom control the live schedule has', () => {
    const { tasks, dependencies } = state()
    renderWithProviders(
      <SchedulePreview tasks={tasks} dependencies={dependencies} />,
    )

    const zoom = screen.getByTestId('schedule-zoom')
    for (const label of ['Fit', 'Day', 'Week', 'Month']) {
      expect(zoom).toHaveTextContent(label)
    }
  })

  it('opens the first phase and folds the rest, one tap away', () => {
    const { tasks, dependencies } = state()
    renderWithProviders(
      <SchedulePreview tasks={tasks} dependencies={dependencies} />,
    )

    const toggles = screen.getAllByTestId('gantt-collapse-toggle')
    expect(toggles[0]).toHaveAttribute('aria-expanded', 'true')
    for (const toggle of toggles.slice(1)) {
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    }
  })

  it('states the import’s vitals: row counts and the full span', () => {
    const { tasks, dependencies } = state()
    renderWithProviders(
      <SchedulePreview tasks={tasks} dependencies={dependencies} />,
    )

    const summary = screen.getByTestId('schedule-preview-summary')
    expect(summary).toHaveTextContent(/phase/)
    expect(summary).toHaveTextContent(/activit/)
    expect(summary).toHaveTextContent(/day/)
  })

  it('is read-only: the confirm step previews, it does not edit', () => {
    const { tasks, dependencies } = state()
    renderWithProviders(
      <SchedulePreview tasks={tasks} dependencies={dependencies} />,
    )

    // The chart never edits the graph — links are managed in the row panel.
    expect(screen.queryByTestId('gantt-linking-banner')).not.toBeInTheDocument()
    expect(screen.getByTestId('schedule-preview-edges')).toHaveTextContent(
      'No links between activities',
    )
  })
})
