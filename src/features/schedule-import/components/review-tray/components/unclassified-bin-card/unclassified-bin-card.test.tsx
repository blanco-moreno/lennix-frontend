import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import {
  buildReviewExceptions,
  type UnclassifiedRowException,
} from '../../review-exceptions'
import { EMPTY_REVIEW_JOURNAL } from '../../review-journal'

import { UnclassifiedBinCard } from '.'

const state = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

const binException = (): UnclassifiedRowException => {
  const exception = buildReviewExceptions(state(), EMPTY_REVIEW_JOURNAL).find(
    (candidate): candidate is UnclassifiedRowException =>
      candidate.kind === 'unclassified_row',
  )
  if (!exception) throw new Error('the seeded draft lost its unclassified row')
  return exception
}

function renderCard(onDiscard = vi.fn()) {
  const review = state()
  renderWithProviders(
    <UnclassifiedBinCard
      projectId={review.project.id}
      exception={binException()}
      phases={review.tasks}
      onDiscard={onDiscard}
    />,
    { store: makeStore() },
  )
  return { review, onDiscard }
}

describe('UnclassifiedBinCard', () => {
  it('quotes the row and where it came from', () => {
    renderCard()

    expect(
      screen.getByText('Lennix could not place “TOTAL GENERAL”'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Sheet CARTA GANTT, row 17 · read as a footer total'),
    ).toBeInTheDocument()
  })

  it('places the row under the chosen phase, keeping the file’s own words', async () => {
    let placedUnder = ''
    let sentTitle = ''
    server.use(
      http.post('*/v1/tasks/:taskId/subtasks', async ({ request, params }) => {
        placedUnder = String(params.taskId)
        sentTitle = ((await request.json()) as { title: string }).title
        return HttpResponse.json({ id: 'new-subtask' }, { status: 201 })
      }),
    )
    const { review } = renderCard()

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Place it under a main activity' }),
      review.tasks[1].id,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Place' }))

    await waitFor(() => expect(placedUnder).toBe(review.tasks[1].id))
    expect(sentTitle).toBe('TOTAL GENERAL')
  })

  it('will not place a row nowhere', () => {
    renderCard()

    expect(screen.getByRole('button', { name: 'Place' })).toBeDisabled()
  })

  it('lets the user say it was never work — the other half of one mechanism', async () => {
    const { onDiscard } = renderCard()

    await userEvent.click(
      screen.getByRole('button', { name: 'Not part of the schedule' }),
    )

    expect(onDiscard).toHaveBeenCalledWith('CARTA GANTT:17')
  })

  it('says so when the row could not be placed', async () => {
    server.use(
      http.post('*/v1/tasks/:taskId/subtasks', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const { review } = renderCard()

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Place it under a main activity' }),
      review.tasks[0].id,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Place' }))

    expect(
      await screen.findByText('The row could not be placed. Try again.'),
    ).toBeInTheDocument()
  })
})
