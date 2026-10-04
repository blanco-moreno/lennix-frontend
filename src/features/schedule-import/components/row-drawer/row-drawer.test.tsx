import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { signedInStore } from '@/tests/signed-in-store'
import type { ScheduleReviewState } from '@/types'

import { buildReviewExceptions } from '../review-tray/review-exceptions'
import { EMPTY_REVIEW_JOURNAL } from '../review-tray/review-journal'

import { RowDrawer, type RowDrawerTarget } from './row-drawer'

const state = (): ScheduleReviewState =>
  mapScheduleReviewStateDTO(seedImportReviewStateDTO())

const group = (review: ScheduleReviewState) =>
  review.tasks.find((task) => task.subtasks.length > 0)!

function renderDrawer(target: RowDrawerTarget, review = state()) {
  const onClose = vi.fn()
  renderWithProviders(
    <RowDrawer
      projectId={review.project.id}
      state={review}
      exceptions={buildReviewExceptions(review, EMPTY_REVIEW_JOURNAL)}
      target={target}
      onClose={onClose}
    />,
    { store: signedInStore() },
  )
  return { onClose }
}

/** Captures the body of the next request matching the route. */
function capture(method: 'post' | 'put' | 'patch', route: string) {
  const bodies: unknown[] = []
  server.use(
    http[method](route, async ({ request }) => {
      bodies.push(await request.json())
      return HttpResponse.json({}, { status: method === 'post' ? 201 : 200 })
    }),
  )
  return bodies
}

describe('RowDrawer', () => {
  it('edits a subactivity’s name and dates under a labelled title', async () => {
    const review = state()
    const subtask = group(review).subtasks[0]
    const bodies = capture('put', '*/v1/tasks/subtasks/:id')
    const { onClose } = renderDrawer(
      { mode: 'edit', rowId: subtask.id },
      review,
    )

    expect(
      await screen.findByRole('dialog', { name: 'Subactivity' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Under “${group(review).title}”`),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Start')).toBeInTheDocument()

    const name = screen.getByLabelText('Name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Renamed')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(bodies).toEqual([{ title: 'Renamed' }]))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows a main activity’s dates as derived, never as fields', async () => {
    const review = state()
    renderDrawer({ mode: 'edit', rowId: group(review).id }, review)

    await screen.findByRole('dialog', { name: 'Main activity' })
    expect(screen.queryByLabelText('Start')).not.toBeInTheDocument()
    expect(
      screen.getByText('They come from its subactivities.'),
    ).toBeInTheDocument()
  })

  it('adds a main activity to the draft by name only', async () => {
    const bodies = capture('post', '*/v1/tasks/projects/:projectId/tasks')
    renderDrawer({ mode: 'create-task' })

    await screen.findByRole('dialog', { name: 'New main activity' })
    await userEvent.type(screen.getByLabelText('Name'), 'Paisajismo')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(bodies).toEqual([{ title: 'Paisajismo', is_draft: true }]),
    )
  })

  it('adds a subactivity under the main activity it was asked from', async () => {
    const review = state()
    const bodies = capture('post', '*/v1/tasks/:taskId/subtasks')
    renderDrawer({ mode: 'create-subtask', parentId: group(review).id }, review)

    await screen.findByRole('dialog', { name: 'New subactivity' })
    await userEvent.type(screen.getByLabelText('Name'), 'Riego')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(bodies).toEqual([
        { title: 'Riego', start_date: null, due_date: null },
      ]),
    )
  })

  it('will not create a row without a name', async () => {
    renderDrawer({ mode: 'create-task' })

    await screen.findByRole('dialog', { name: 'New main activity' })
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('opens on the row’s predecessor question when it has one', async () => {
    const review = state()
    const successor = review.tasks[0]
    review.unresolvedEdges = [
      {
        successorRef: successor.ref ?? '1',
        successorTaskId: successor.id,
        sourceText: 'MOV. DE TIERRA',
        candidates: [],
      },
    ]
    renderDrawer({ mode: 'edit', rowId: successor.id }, review)

    expect(
      await screen.findByText(
        `“MOV. DE TIERRA”, written on “${successor.title}”, matches no activity`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('row-dependencies')).toBeInTheDocument()
  })

  it('reports a subactivity’s progress, lowering the file’s figure included', async () => {
    const review = state()
    const parent = group(review)
    parent.subtasks[0] = { ...parent.subtasks[0], progress: 60 }
    const progress = capture('patch', '*/v1/tasks/subtasks/:id/progress')
    const fields = capture('put', '*/v1/tasks/subtasks/:id')
    const { onClose } = renderDrawer(
      { mode: 'edit', rowId: parent.subtasks[0].id },
      review,
    )

    const zero = await screen.findByRole('button', { name: '0%' })
    expect(zero).toBeEnabled()
    await userEvent.click(zero)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(progress).toEqual([{ progress: 0 }]))
    expect(fields).toEqual([])
    expect(onClose).toHaveBeenCalled()
  })

  it('offers no progress on a main activity — it derives from its subactivities', async () => {
    const review = state()
    renderDrawer({ mode: 'edit', rowId: group(review).id }, review)

    await screen.findByRole('dialog', { name: 'Main activity' })
    expect(screen.queryByRole('button', { name: '50%' })).toBeNull()
  })
})
