import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import toast from 'react-hot-toast'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { DEFAULT_SEED_TASK_ID, seedTaskDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'

import { TaskBudgetForm } from './task-budget-form'

/** Captures every budget PATCH the modal fires. */
function captureBudget() {
  const calls: Record<string, unknown>[] = []
  server.use(
    http.patch('*/v1/tasks/:taskId/budget', async ({ request }) => {
      calls.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedTaskDTO(DEFAULT_SEED_TASK_ID))
    }),
  )
  return calls
}

function renderModal(
  currentBudget: number | null = 50000,
  onOpenChange: (open: boolean) => void = () => {},
) {
  return renderWithProviders(
    <TaskBudgetForm
      taskId={DEFAULT_SEED_TASK_ID}
      currentBudget={currentBudget}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('TaskBudgetForm', () => {
  it('sends the typed amount serialized to two decimals and closes', async () => {
    const calls = captureBudget()
    const onOpenChange = vi.fn()
    const successToast = vi.spyOn(toast, 'success')
    renderModal(50000, onOpenChange)

    const input = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(input)
    await userEvent.type(input, '75500')
    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toEqual({ budget: '75500.00' })
    expect(successToast).toHaveBeenCalledWith(
      'Budget updated',
      expect.anything(),
    )
    expect(onOpenChange).toHaveBeenCalledWith(false)
    successToast.mockRestore()
  })

  it('opens on the current budget, so an unchanged submit re-sends it', async () => {
    const calls = captureBudget()
    renderModal(1250)

    // The CurrencyInput presents the stored number formatted for reading.
    expect(await screen.findByLabelText('Budget (USD)')).toHaveValue('1,250.00')

    await userEvent.click(screen.getByRole('button', { name: 'Update' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toEqual({ budget: '1250.00' })
  })

  it('refuses an empty budget', async () => {
    // Representative invalid case — the schema is unit-tested in
    // src/schemas/task.test.ts.
    renderModal(50000)

    const input = await screen.findByLabelText('Budget (USD)')
    await userEvent.clear(input)

    expect(
      await screen.findByText('The budget is required'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Update' })).toBeDisabled()
  })

  it('reports a failure instead of closing', async () => {
    const errorToast = vi.spyOn(toast, 'error')
    const onOpenChange = vi.fn()
    server.use(
      http.patch(
        '*/v1/tasks/:taskId/budget',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderModal(50000, onOpenChange)

    await userEvent.click(await screen.findByRole('button', { name: 'Update' }))

    await waitFor(() => expect(errorToast).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    errorToast.mockRestore()
  })
})
