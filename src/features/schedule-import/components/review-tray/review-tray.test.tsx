import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { signedInStore } from '@/tests/signed-in-store'
import type { ScheduleReviewState } from '@/types'

import { buildReviewExceptions } from './review-exceptions'
import { EMPTY_REVIEW_JOURNAL } from './review-journal'
import { ReviewTray } from './review-tray'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/** The seed with one predecessor name that matched no row. */
const withQuestion = (): ScheduleReviewState => {
  const review = state()
  const successor = review.tasks[0]
  return {
    ...review,
    unresolvedEdges: [
      {
        successorRef: successor.ref ?? '1',
        successorTaskId: successor.id,
        sourceText: 'MOV. DE TIERRA',
        candidates: [],
      },
    ],
  }
}

function renderTray(review = state(), store = signedInStore()) {
  const exceptions = buildReviewExceptions(review, EMPTY_REVIEW_JOURNAL)
  const onOpenRow = vi.fn()
  renderWithProviders(
    <ReviewTray
      projectId={review.project.id}
      state={review}
      exceptions={exceptions}
      onDiscardRow={vi.fn()}
      onOpenRow={onOpenRow}
    />,
    { store },
  )
  return { exceptions, onOpenRow }
}

describe('ReviewTray', () => {
  it('counts every open question once, and says nothing blocks go-live', () => {
    const { exceptions } = renderTray()

    expect(
      screen.getByRole('heading', { name: `${exceptions.length} to review` }),
    ).toBeInTheDocument()
    expect(screen.getAllByTestId('tray-card')).toHaveLength(exceptions.length)
    expect(screen.queryByText(/hold activation/)).not.toBeInTheDocument()
  })

  it('carries the loud readings with their one-flip reversal', () => {
    renderTray()

    const kinds = screen
      .getAllByTestId('tray-card')
      .map((card) => card.getAttribute('data-exception-kind'))
    expect(kinds[0]).toBe('assumption')
    expect(screen.getByTestId('date-order-toggle')).toBeInTheDocument()
  })

  it('sends a predecessor question to the row it was written on', async () => {
    const { exceptions, onOpenRow } = renderTray(withQuestion())
    const edge = exceptions.find(
      (exception) => exception.kind === 'unresolved_edge',
    )
    if (edge?.kind !== 'unresolved_edge') throw new Error('one was seeded')

    await userEvent.click(
      screen.getByRole('button', { name: 'Choose predecessor' }),
    )

    expect(onOpenRow).toHaveBeenCalledWith(edge.successorTaskId)
  })

  it('offers no link to whoever cannot change the graph', () => {
    renderTray(withQuestion(), makeStore())

    expect(
      screen.queryByRole('button', { name: 'Choose predecessor' }),
    ).not.toBeInTheDocument()
  })

  it('disappears entirely when the file left nothing to review', () => {
    const review = state()
    renderTray({
      ...review,
      ledger: [],
      report: {
        ...review.report,
        unclassified: [],
        unclassifiedTotal: 0,
        skippedEdges: [],
        skippedEdgesTotal: 0,
      },
      unresolvedEdges: [],
    })

    expect(screen.queryByTestId('review-tray')).not.toBeInTheDocument()
  })
})
