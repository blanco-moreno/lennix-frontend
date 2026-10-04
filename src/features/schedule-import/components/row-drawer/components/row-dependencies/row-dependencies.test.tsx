import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { signedInStore } from '@/tests/signed-in-store'
import type { ScheduleReviewState } from '@/types'

import { RowDependencies } from './row-dependencies'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/** Two main activities, the second waiting on the first. */
function linked(source: 'manual' | 'project_import') {
  const review = state()
  const [first, second] = review.tasks
  review.dependencies = [
    {
      id: 7,
      taskId: second.id,
      dependsOnId: first.id,
      relationshipType: 'SS',
      lagDays: 2,
      source,
    },
  ]
  return { review, first, second }
}

function renderSection(
  review: ScheduleReviewState,
  rowId: string,
  readOnly = false,
) {
  renderWithProviders(
    <RowDependencies
      projectId={review.project.id}
      state={review}
      rowId={rowId}
      questions={[]}
      readOnly={readOnly}
    />,
    { store: signedInStore() },
  )
}

describe('RowDependencies', () => {
  it('lists what the row waits on, badged with where it came from', () => {
    const { review, first, second } = linked('project_import')
    renderSection(review, second.id)

    expect(screen.getByText('Predecessors (1)')).toBeInTheDocument()
    expect(screen.getByText(first.title)).toBeInTheDocument()
    expect(screen.getByText('SS +2d')).toBeInTheDocument()
    expect(screen.getByText('From the file')).toBeInTheDocument()
  })

  it('lists only this row’s predecessors, never what waits on it', () => {
    const { review, first } = linked('manual')
    renderSection(review, first.id)

    expect(screen.getByText('Predecessors (0)')).toBeInTheDocument()
    expect(screen.getByText('No predecessors.')).toBeInTheDocument()
  })

  it('offers no add control to whoever cannot change the graph', () => {
    const { review, second } = linked('manual')
    renderSection(review, second.id, true)

    expect(screen.queryByTestId('dependency-add-open')).not.toBeInTheDocument()
  })
})
