import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapScheduleReviewStateDTO } from '@/services/schedule-import'
import { makeStore } from '@/stores'
import { seedImportReviewStateDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { InlineRowEdit } from './inline-row-edit'

const review = () => mapScheduleReviewStateDTO(seedImportReviewStateDTO())

function renderEdit(level: 'task' | 'subtask' = 'task') {
  const state = review()
  const row = level === 'task' ? state.tasks[0] : state.tasks[0].subtasks[0]
  renderWithProviders(
    <InlineRowEdit projectId={state.project.id} level={level} row={row} />,
    { store: makeStore() },
  )
  return row
}

describe('InlineRowEdit', () => {
  it('is available on every row, closed until asked for', () => {
    const row = renderEdit()

    expect(
      screen.getByRole('button', { name: `Edit “${row.title}”` }),
    ).toBeInTheDocument()
    expect(screen.queryByTestId('inline-row-edit')).not.toBeInTheDocument()
  })

  it('offers a phase only its title — its dates derive from its subactivities', async () => {
    renderEdit('task')

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))

    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.queryByLabelText('Start')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Finish')).not.toBeInTheDocument()
  })

  it('writes only the fields the user actually changed', async () => {
    let body: Record<string, unknown> = {}
    let target = ''
    server.use(
      http.put('*/v1/tasks/:taskId', async ({ request, params }) => {
        target = String(params.taskId)
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: params.taskId })
      }),
    )
    const row = renderEdit()

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    const title = screen.getByLabelText('Name')
    await userEvent.clear(title)
    await userEvent.type(title, 'OBRAS PRELIMINARES (revisado)')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    // A phase save is a title-only patch: the task endpoint accepts no dates.
    await waitFor(() => expect(target).toBe(row.id))
    expect(body).toEqual({ title: 'OBRAS PRELIMINARES (revisado)' })
  })

  it('edits an activity through the subtask route', async () => {
    let target = ''
    let sent: { title?: string } = {}
    server.use(
      http.put(
        '*/v1/tasks/subtasks/:subtaskId',
        async ({ params, request }) => {
          target = String(params.subtaskId)
          sent = (await request.json()) as { title?: string }
          return HttpResponse.json({ id: params.subtaskId })
        },
      ),
    )
    const row = renderEdit('subtask')

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    // A subactivity keeps its date fields — only phases lose them.
    expect(screen.getByLabelText('Start')).toBeInTheDocument()
    expect(screen.getByLabelText('Finish')).toBeInTheDocument()
    const title = screen.getByLabelText('Name')
    await userEvent.clear(title)
    // Short on purpose: every keystroke re-renders the form, and a sentence
    // here put the test on the wrong side of the 5s timeout on CI. What the
    // typing has to prove is that the field reaches the request — so the
    // request is what gets asserted, which the long version never did.
    await userEvent.type(title, 'Revisada')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(target).toBe(row.id))
    expect(sent.title).toBe('Revisada')
  })

  it('says the edit becomes a pin, where the pin is made', async () => {
    renderEdit()

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))

    expect(
      screen.getByText(
        'Once you edit a row it is yours: a global re-read never overwrites it.',
      ),
    ).toBeInTheDocument()
  })

  it('sends nothing when nothing changed', async () => {
    let calls = 0
    server.use(
      http.put('*/v1/tasks/:taskId', ({ params }) => {
        calls += 1
        return HttpResponse.json({ id: params.taskId })
      }),
    )
    renderEdit()

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() =>
      expect(screen.queryByTestId('inline-row-edit')).not.toBeInTheDocument(),
    )
    expect(calls).toBe(0)
  })

  it('keeps the draft open and says so when the write fails', async () => {
    server.use(
      http.put('*/v1/tasks/:taskId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    renderEdit()

    await userEvent.click(screen.getByRole('button', { name: /^Edit/ }))
    const title = screen.getByLabelText('Name')
    await userEvent.clear(title)
    await userEvent.type(title, 'Otro nombre')
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      await screen.findByText('The change could not be saved. Try again.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('inline-row-edit')).toBeInTheDocument()
  })
})
