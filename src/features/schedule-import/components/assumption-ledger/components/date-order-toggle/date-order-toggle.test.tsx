import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ReviewTask } from '@/types'

import { DateOrderToggle } from '.'

const review = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

function renderToggle(tasks: ReviewTask[] = review().tasks) {
  const projectId = review().project.id
  renderWithProviders(
    <DateOrderToggle projectId={projectId} tasks={tasks} column="start" />,
    { store: makeStore() },
  )
  return projectId
}

beforeEach(() => window.localStorage.clear())

describe('DateOrderToggle', () => {
  it('re-reads every ambiguous date in the column, once, at the cause', async () => {
    const written: { id: string; body: Record<string, string> }[] = []
    server.use(
      http.put('*/v1/tasks/:taskId', async ({ request, params }) => {
        written.push({
          id: String(params.taskId),
          body: (await request.json()) as Record<string, string>,
        })
        return HttpResponse.json({ id: params.taskId })
      }),
      http.put(
        '*/v1/tasks/subtasks/:subtaskId',
        async ({ request, params }) => {
          written.push({
            id: String(params.subtaskId),
            body: (await request.json()) as Record<string, string>,
          })
          return HttpResponse.json({ id: params.subtaskId })
        },
      ),
    )
    renderToggle()

    await userEvent.click(
      screen.getByRole('button', { name: 'Read it the other way' }),
    )

    // Only the three ambiguous subactivity dates move — phase rows never do:
    // their dates derive from their subactivities.
    await waitFor(() => expect(written).toHaveLength(3))
    expect(written.every((call) => 'start_date' in call.body)).toBe(true)
    expect(
      await screen.findByText(
        '3 dates were re-read. One more flip puts them back.',
      ),
    ).toBeInTheDocument()
  })

  it('names the rows the file itself settles', () => {
    renderToggle()

    expect(
      screen.getByText('1 date reads the same either way.'),
    ).toBeInTheDocument()
  })

  it('keeps a pinned edit and reports it instead of overwriting it', async () => {
    const tasks = review().tasks
    const pinned = { ...tasks[0].subtasks[0], edited: true }
    const touched: string[] = []
    server.use(
      http.put('*/v1/tasks/:taskId', ({ params }) => {
        touched.push(String(params.taskId))
        return HttpResponse.json({ id: params.taskId })
      }),
      http.put('*/v1/tasks/subtasks/:subtaskId', ({ params }) => {
        touched.push(String(params.subtaskId))
        return HttpResponse.json({ id: params.subtaskId })
      }),
    )
    renderToggle([
      { ...tasks[0], subtasks: [pinned, ...tasks[0].subtasks.slice(1)] },
      ...tasks.slice(1),
    ])

    await userEvent.click(
      screen.getByRole('button', { name: 'Read it the other way' }),
    )

    expect(
      await screen.findByText(
        '1 of your edits touches re-read cells — check them. They were kept as you left them.',
      ),
    ).toBeInTheDocument()
    expect(touched).not.toContain(pinned.id)
    expect(screen.getByTestId('flip-conflicts')).toHaveTextContent(
      `${pinned.title}: yours 2026-09-01 · re-read would say 2026-01-09`,
    )
  })

  it('reports the writes that failed rather than claiming the column moved', async () => {
    server.use(
      http.put('*/v1/tasks/:taskId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
      http.put('*/v1/tasks/subtasks/:subtaskId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderToggle()

    await userEvent.click(
      screen.getByRole('button', { name: 'Read it the other way' }),
    )

    expect(
      await screen.findByText('3 dates could not be re-read. Try again.'),
    ).toBeInTheDocument()
  })

  it('offers nothing to flip when both readings agree', () => {
    const tasks = review().tasks.map((task) => ({
      ...task,
      startDate: '2026-05-05',
      subtasks: task.subtasks.map((subtask) => ({
        ...subtask,
        startDate: '2026-05-05',
      })),
    }))
    renderToggle(tasks)

    expect(
      screen.getByText(
        'Every date in this column reads the same either way — there is nothing to flip.',
      ),
    ).toBeInTheDocument()
  })
})
