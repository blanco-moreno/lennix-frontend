/**
 * The full edit form. The assignee semantics — picked from the team, and
 * omitted entirely when untouched — are pinned through the whole detail in
 * ../task-detail-view.test.tsx; what is colocated here is the form's own contract.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import { DEFAULT_SEED_TASK_ID, seedTaskDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'
import type { Task } from '@/types'

import { TaskEditForm } from './task-edit-form'

/** The seeded phase, with a responsible so clearing one is expressible. */
const task = mapTaskDTOToTask(
  seedTaskDTO(DEFAULT_SEED_TASK_ID, {
    assignee_id: SEED_IDS.USER_MIGUEL_ID,
    assignee_name: 'Miguel Torres',
  }),
)

function capturePut() {
  const calls: Record<string, unknown>[] = []
  server.use(
    http.put('*/v1/tasks/:taskId', async ({ request }) => {
      calls.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedTaskDTO(DEFAULT_SEED_TASK_ID))
    }),
  )
  return calls
}

function renderModal(
  value: Task = task,
  onOpenChange: (open: boolean) => void = () => {},
) {
  return renderWithProviders(
    <TaskEditForm task={value} open onOpenChange={onOpenChange} />,
    { store: makeStore() },
  )
}

describe('TaskEditForm', () => {
  it('opens on the phase as it is', async () => {
    renderModal()

    expect(await screen.findByLabelText(/Main activity title/)).toHaveValue(
      task.title,
    )
  })

  it('saves the edited title and closes', async () => {
    const calls = capturePut()
    const onOpenChange = vi.fn()
    renderModal(task, onOpenChange)

    const title = await screen.findByLabelText(/Main activity title/)
    await userEvent.clear(title)
    await userEvent.type(title, 'Cimentacion reforzada')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toMatchObject({
      title: 'Cimentacion reforzada',
      priority: task.priority,
    })
    // Untouched, so omitted — sending it would reassign as a side effect.
    expect(calls[0].assignee_id).toBeUndefined()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("clears the responsible with '', the contract's explicit nobody", async () => {
    const calls = capturePut()
    renderModal()

    await userEvent.click(await screen.findByLabelText('Assignee'))
    await userEvent.click(
      await screen.findByRole('option', { name: 'Unassigned' }),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].assignee_id).toBe('')
  })

  it('refuses an empty title', async () => {
    // Representative invalid case — the schema is unit-tested in
    // src/schemas/task.test.ts.
    renderModal()

    await userEvent.clear(await screen.findByLabelText(/Main activity title/))

    expect(await screen.findByText('The title is required')).toBeInTheDocument()
  })

  it('reports a failure instead of closing', async () => {
    const errorToast = vi.spyOn(toast, 'error')
    const onOpenChange = vi.fn()
    server.use(
      http.put(
        '*/v1/tasks/:taskId',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderModal(task, onOpenChange)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Save changes' }),
    )

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Could not update the main activity',
      expect.anything(),
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    errorToast.mockRestore()
  })
})
