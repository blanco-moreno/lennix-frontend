import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { seedExpenseDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ExpenseCreateForm } from './expense-create-form'

/** Records every POST /v1/expenses body the modal fires. */
function captureCreates() {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.post('*/v1/expenses', async ({ request }) => {
      bodies.push((await request.json()) as Record<string, unknown>)
      return HttpResponse.json(seedExpenseDTO(SEED_IDS.EXPENSE_P1_01), {
        status: 201,
      })
    }),
  )
  return bodies
}

function renderModal(onOpenChange: (open: boolean) => void = () => {}) {
  return renderWithProviders(
    <ExpenseCreateForm
      subtaskId={SEED_IDS.P1_SUB_EXCAVATION}
      taskId={SEED_IDS.P1_TASK_FOUNDATION}
      projectId={SEED_IDS.PROJECT_TORRE_ID}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('ExpenseCreateForm', () => {
  it('creates the expense from the filled form and closes', async () => {
    const bodies = captureCreates()
    const onOpenChange = vi.fn()
    renderModal(onOpenChange)

    await userEvent.type(
      await screen.findByLabelText('Description'),
      'Cemento adicional',
    )
    await userEvent.type(screen.getByLabelText('Amount'), '1500')
    await userEvent.click(screen.getByLabelText('Category'))
    await userEvent.click(await screen.findByText('Materials'))
    await userEvent.click(screen.getByText('Select date'))
    await userEvent.click(await screen.findByText('15'))
    await userEvent.click(
      screen.getByRole('button', { name: 'Create expense' }),
    )

    await waitFor(() => {
      expect(bodies).toHaveLength(1)
    })
    expect(bodies[0]).toEqual({
      subtask_id: SEED_IDS.P1_SUB_EXCAVATION,
      description: 'Cemento adicional',
      amount: '1500.00',
      category: 'materials',
      // The picker starts on the current month, so only the day is pinned.
      expense_date: expect.stringMatching(/^\d{4}-\d{2}-15$/) as unknown,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('requires a description — one representative invalid case', async () => {
    renderModal()

    const description = await screen.findByLabelText('Description')
    await userEvent.type(description, 'x')
    await userEvent.clear(description)

    expect(
      await screen.findByText('The description is required'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create expense' }),
    ).toBeDisabled()
  })
})
