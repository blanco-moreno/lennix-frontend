import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import {
  DEFAULT_SEED_PROJECT_ID,
  DEFAULT_SEED_TASK_ID,
  seedSubtaskListDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { SubtaskCreateForm } from './subtask-create-form'

/** Captures every create the modal fires, so "what was sent" is assertable. */
function captureCreate() {
  const calls: { body: unknown }[] = []
  server.use(
    http.post('*/v1/tasks/:taskId/subtasks', async ({ request }) => {
      calls.push({ body: await request.json() })
      return HttpResponse.json(seedSubtaskListDTO(DEFAULT_SEED_TASK_ID)[0], {
        status: 201,
      })
    }),
  )
  return calls
}

function renderModal(onOpenChange: (open: boolean) => void = () => {}) {
  return renderWithProviders(
    <SubtaskCreateForm
      taskId={DEFAULT_SEED_TASK_ID}
      parentTitle="Main activity"
      projectId={DEFAULT_SEED_PROJECT_ID}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('SubtaskCreateForm', () => {
  it('creates the subactivity with the trimmed fields and closes', async () => {
    const calls = captureCreate()
    const onOpenChange = vi.fn()
    renderModal(onOpenChange)

    await userEvent.type(screen.getByLabelText('Title'), '  Encofrado muros  ')
    await userEvent.type(screen.getByLabelText('Description'), ' Nivel 2 ')
    await userEvent.click(screen.getByLabelText('Priority'))
    await userEvent.click(await screen.findByText('High'))
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].body).toEqual({
      title: 'Encofrado muros',
      description: 'Nivel 2',
      priority: 'high',
      start_date: null,
      due_date: null,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('sends null, not an empty string, when no description is given', async () => {
    const calls = captureCreate()
    renderModal()

    await userEvent.type(screen.getByLabelText('Title'), 'Encofrado')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0].body).toMatchObject({ description: null })
  })

  it('keeps Create disabled until the title is present', async () => {
    // Representative invalid case; the schema rules themselves are unit-tested
    // in src/schemas/task.test.ts.
    renderModal()

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Title'), 'E')
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled()

    await userEvent.clear(screen.getByLabelText('Title'))
    expect(await screen.findByText('The title is required')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
  })

  it('cancels without sending anything', async () => {
    const calls = captureCreate()
    const onOpenChange = vi.fn()
    renderModal(onOpenChange)

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(calls).toHaveLength(0)
  })

  it('reports a failure and stays open', async () => {
    // Toasts render through the app-level <Toaster/>, which isn't mounted here.
    const errorToast = vi.spyOn(toast, 'error')
    const onOpenChange = vi.fn()
    server.use(
      http.post(
        '*/v1/tasks/:taskId/subtasks',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderModal(onOpenChange)

    await userEvent.type(screen.getByLabelText('Title'), 'Encofrado')
    await userEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(errorToast).toHaveBeenCalledWith(
      'Could not create the subactivity',
      expect.anything(),
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    errorToast.mockRestore()
  })
})
