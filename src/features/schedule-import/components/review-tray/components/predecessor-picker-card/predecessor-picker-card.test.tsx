import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ScheduleReviewState } from '@/types'

import type { UnresolvedEdgeException } from '../../review-exceptions'

import { PredecessorPickerCard } from '.'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

function edgeOn(review: ScheduleReviewState): UnresolvedEdgeException {
  const successor = review.tasks[1]
  return {
    id: 'unresolved_edge:2',
    kind: 'unresolved_edge',
    blocking: false,
    successorTaskId: successor.id,
    edge: {
      successorRef: successor.ref ?? '2',
      successorTaskId: successor.id,
      sourceText: 'OBRAS PRELIMINRES',
      candidates: ['OBRAS PRELIMINARES'],
    },
  }
}

function renderCard(review = state(), tasks = review.tasks) {
  renderWithProviders(
    <PredecessorPickerCard
      projectId={review.project.id}
      exception={edgeOn(review)}
      tasks={tasks}
      dependencies={review.dependencies}
    />,
    { store: makeStore() },
  )
  return review
}

describe('PredecessorPickerCard', () => {
  it('quotes the unmatched name and says resolving it is optional', () => {
    const review = renderCard()

    expect(
      screen.getByText('Predecessor “OBRAS PRELIMINRES” matched no row'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `It was written on “${review.tasks[1].title}”. Pick the row it meant, or leave it — Lennix never invents a dependency.`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('tray-card')).toHaveAttribute(
      'data-blocking',
      'false',
    )
  })

  it('creates the dependency the user picked, with the type and lag they chose', async () => {
    let successorId = ''
    let body: Record<string, unknown> = {}
    server.use(
      http.post(
        '*/v1/tasks/:taskId/dependencies',
        async ({ request, params }) => {
          successorId = String(params.taskId)
          body = (await request.json()) as typeof body
          return HttpResponse.json({ id: 1 }, { status: 201 })
        },
      ),
    )
    const review = renderCard()

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Predecessor row' }),
      review.tasks[0].id,
    )
    // A file's reference can mean more than finish-to-start: the answer
    // carries the PDM shape instead of landing FS/0 for a second pass.
    await userEvent.click(screen.getByRole('button', { name: /^SS —/ }))
    const lag = screen.getByLabelText('Lag (days; negative starts earlier)')
    await userEvent.clear(lag)
    await userEvent.type(lag, '-2')
    await userEvent.click(screen.getByRole('button', { name: 'Link it' }))

    await waitFor(() => expect(successorId).toBe(review.tasks[1].id))
    expect(body).toEqual({
      depends_on_id: review.tasks[0].id,
      dependency_type: 'inter_phase',
      relationship_type: 'SS',
      lag_days: -2,
    })
  })

  it('groups the file’s own candidate ahead of the rest', () => {
    renderCard()

    const groups = screen
      .getByRole('combobox', { name: 'Predecessor row' })
      .querySelectorAll('optgroup')

    expect([...groups].map((group) => group.label)).toEqual([
      'Closest to what the file says',
      'Every other row',
    ])
    expect(groups[0].textContent).toContain('OBRAS PRELIMINARES')
  })

  it('says plainly when nothing in the schedule can precede the row', () => {
    const review = state()
    // The successor is the only row left, so no legal predecessor exists.
    renderCard(review, [review.tasks[1]])

    expect(
      screen.getByText(
        'No row in this schedule can precede it, so there is nothing to link.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
