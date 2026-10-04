import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ScheduleReviewState } from '@/types'

import { buildLedgerView, type LedgerCause } from '../../ledger-model'

import { LoudCause } from '.'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

/** The seed's one high-consequence cause: the start column read day-first. */
const seededCause = (review: ScheduleReviewState): LedgerCause =>
  buildLedgerView(review).loud[0]

function renderCause(review: ScheduleReviewState, cause: LedgerCause) {
  renderWithProviders(
    <LoudCause
      projectId={review.project.id}
      cause={cause}
      tasks={review.tasks}
    />,
    { store: makeStore() },
  )
}

describe('LoudCause', () => {
  it('is one review item carrying its one-flip reversal', () => {
    const review = state()
    renderCause(review, seededCause(review))

    expect(screen.getByTestId('tray-card')).toHaveAttribute(
      'data-exception-kind',
      'assumption',
    )
    expect(screen.getByTestId('date-order-toggle')).toBeInTheDocument()
  })

  it('offers no flip on a cause that is not a reversible date column', () => {
    const review = state()
    renderCause(review, { ...seededCause(review), flip: null })

    expect(screen.queryByTestId('date-order-toggle')).not.toBeInTheDocument()
    // The assumption itself still reads in full.
    expect(screen.getByText(/Affects 9 rows/)).toBeInTheDocument()
  })

  it('stays silent about the other reading when the entry has none', () => {
    const review = state()
    const cause = seededCause(review)
    renderCause(review, {
      ...cause,
      flip: null,
      entry: {
        ...cause.entry,
        alternativeValue: null,
        alternativeAction: 'none',
      },
    })

    expect(screen.queryByText(/The other reading/)).not.toBeInTheDocument()
  })
})
