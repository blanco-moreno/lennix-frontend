import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import { DEFAULT_SEED_TASK_ID, seedTaskDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { useTaskHeaderActions } from './use-task-header-actions'

const task = mapTaskDTOToTask(seedTaskDTO(DEFAULT_SEED_TASK_ID))

/** The hook has no surface of its own, so a harness exposes what it returns. */
function Harness({ onBack }: { onBack: () => void }) {
  const actions = useTaskHeaderActions(task, onBack)
  return (
    <>
      <button onClick={() => void actions.handleDelete()}>run-delete</button>
      <button onClick={() => actions.setShowBudgetForm(true)}>
        open-budget
      </button>
      <div data-testid="modal-states">
        {[
          actions.showDeleteDialog,
          actions.showBudgetForm,
          actions.showStatusModal,
          actions.showEditModal,
        ]
          .map(String)
          .join(',')}
      </div>
    </>
  )
}

function renderHarness() {
  const onBack = vi.fn()
  renderWithProviders(<Harness onBack={onBack} />, { store: makeStore() })
  return onBack
}

describe('useTaskHeaderActions', () => {
  it('starts with every modal closed and opens them independently', async () => {
    renderHarness()

    expect(screen.getByTestId('modal-states')).toHaveTextContent(
      'false,false,false,false',
    )
    await userEvent.click(screen.getByRole('button', { name: 'open-budget' }))
    expect(screen.getByTestId('modal-states')).toHaveTextContent(
      'false,true,false,false',
    )
  })

  it('deletes the seeded task, toasts success and leaves the page', async () => {
    const deletes: string[] = []
    server.use(
      http.delete('*/v1/tasks/:taskId', ({ params }) => {
        deletes.push(String(params.taskId))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const successToast = vi.spyOn(toast, 'success')
    const onBack = renderHarness()

    await userEvent.click(screen.getByRole('button', { name: 'run-delete' }))

    await waitFor(() => expect(deletes).toEqual([DEFAULT_SEED_TASK_ID]))
    await waitFor(() =>
      expect(successToast).toHaveBeenCalledWith('Main activity deleted', {
        id: 'taskDetail.taskDeleteSuccess',
      }),
    )
    expect(onBack).toHaveBeenCalledTimes(1)
    successToast.mockRestore()
  })

  it('toasts the error and stays on the page when the delete fails', async () => {
    server.use(
      http.delete('*/v1/tasks/:taskId', () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )
    const errorToast = vi.spyOn(toast, 'error')
    const onBack = renderHarness()

    await userEvent.click(screen.getByRole('button', { name: 'run-delete' }))

    await waitFor(() =>
      expect(errorToast).toHaveBeenCalledWith(
        'Could not delete the main activity',
        { id: 'taskDetail.taskDeleteError' },
      ),
    )
    expect(onBack).not.toHaveBeenCalled()
    errorToast.mockRestore()
  })
})
