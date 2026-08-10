import { screen } from '@testing-library/react'

import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ScheduleReviewState } from '@/types'

import { buildReviewExceptions } from './review-exceptions'
import { EMPTY_REVIEW_JOURNAL } from './review-journal'
import { ReviewTray } from './review-tray'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

function renderTray(review = state(), journal = EMPTY_REVIEW_JOURNAL) {
  const exceptions = buildReviewExceptions(review, journal)
  renderWithProviders(
    <ReviewTray
      projectId={review.project.id}
      state={review}
      exceptions={exceptions}
      onDiscardRow={vi.fn()}
    />,
    { store: makeStore() },
  )
  return exceptions
}

describe('ReviewTray', () => {
  it('counts what it asks about, and says none of it blocks go-live', () => {
    const exceptions = renderTray()

    expect(
      screen.getByText(`Review this (${exceptions.length})`),
    ).toBeInTheDocument()
    // Nothing here holds activation any more: the mirror subactivity a
    // childless phase needs is ms-bk's job, not a question for the user.
    expect(
      screen.getByText('The rest is optional — you can activate without it.'),
    ).toBeInTheDocument()
  })

  it('gives each exception exactly one mechanism, never two', () => {
    const exceptions = renderTray()

    const cards = screen.getAllByTestId('tray-card')
    expect(cards).toHaveLength(exceptions.length)

    // One card per exception; one primary control per card (the bin's discard
    // is the same mechanism's other outcome, not a second path to the same one).
    cards.forEach((card) => {
      const kind = card.getAttribute('data-exception-kind')
      const controls = card.querySelectorAll('button, select')
      expect(controls.length).toBe(kind === 'unclassified_row' ? 3 : 1)
    })
  })

  it('names the canvas edit as the floor for everything else', () => {
    renderTray()

    expect(
      screen.getByText(
        /is fixed by editing the row directly on the schedule below/,
      ),
    ).toBeInTheDocument()
  })

  it('says the rest is optional once nothing blocks', () => {
    const review = state()
    const filled: ScheduleReviewState = {
      ...review,
      tasks: review.tasks.map((task) =>
        task.subtasks.length > 0
          ? task
          : { ...task, subtasks: [review.tasks[0].subtasks[0]] },
      ),
    }
    renderTray(filled)

    expect(
      screen.getByText('The rest is optional — you can activate without it.'),
    ).toBeInTheDocument()
  })

  it('disappears entirely when the file left nothing to review', () => {
    const review = state()
    const clean: ScheduleReviewState = {
      ...review,
      tasks: review.tasks.filter((task) => task.subtasks.length > 0),
      report: { ...review.report, unclassified: [], unclassifiedTotal: 0 },
      unresolvedEdges: [],
    }
    renderTray(clean)

    expect(screen.queryByTestId('review-tray')).not.toBeInTheDocument()
  })
})
