import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapExpenseResponseDTOToExpenseItem } from '@/services/expense'
import { makeStore } from '@/stores'
import { seedExpenseDTO } from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { ExpenseEditForm } from './expense-edit-form'

/** "Mano de obra excavacion", 28000, labor — a really seeded expense. */
function seededExpense() {
  return mapExpenseResponseDTOToExpenseItem(
    seedExpenseDTO(SEED_IDS.EXPENSE_P1_01),
  )
}

/** Records every PUT /v1/expenses/:id the modal fires. */
function captureUpdates() {
  const calls: { id: string; body: Record<string, unknown> }[] = []
  server.use(
    http.put('*/v1/expenses/:expenseId', async ({ params, request }) => {
      calls.push({
        id: String(params.expenseId),
        body: (await request.json()) as Record<string, unknown>,
      })
      return HttpResponse.json(seedExpenseDTO(SEED_IDS.EXPENSE_P1_01))
    }),
  )
  return calls
}

function renderModal(onOpenChange: (open: boolean) => void = () => {}) {
  return renderWithProviders(
    <ExpenseEditForm
      expense={seededExpense()}
      taskId={SEED_IDS.P1_TASK_FOUNDATION}
      projectId={SEED_IDS.PROJECT_TORRE_ID}
      open
      onOpenChange={onOpenChange}
    />,
    { store: makeStore() },
  )
}

describe('ExpenseEditForm', () => {
  it('opens pre-filled with the seeded expense, not with blanks', async () => {
    renderModal()

    expect(await screen.findByLabelText('Description')).toHaveValue(
      'Mano de obra excavacion',
    )
    expect(screen.getByLabelText('Amount')).toHaveValue('28,000.00')
    // The category select shows the current value's label.
    expect(screen.getByText('Labor')).toBeInTheDocument()
  })

  it('sends the edited fields in one PUT and closes', async () => {
    const calls = captureUpdates()
    const onOpenChange = vi.fn()
    renderModal(onOpenChange)

    const description = await screen.findByLabelText('Description')
    await userEvent.clear(description)
    await userEvent.type(description, 'Mano de obra ajustada')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(calls).toHaveLength(1)
    })
    expect(calls[0].id).toBe(SEED_IDS.EXPENSE_P1_01)
    // Untouched fields travel with their seeded values, edited ones with the
    // new value — the amount re-serialised to the API's 2-decimal string.
    const seeded = seedExpenseDTO(SEED_IDS.EXPENSE_P1_01)
    expect(calls[0].body).toEqual({
      description: 'Mano de obra ajustada',
      amount: seeded.amount,
      category: seeded.category,
      expense_date: seeded.expense_date,
      document_type: null,
      document_number: null,
    })
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('rejects clearing the amount — one representative invalid case', async () => {
    const calls = captureUpdates()
    renderModal()

    await userEvent.clear(await screen.findByLabelText('Amount'))
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(
      await screen.findByText('The amount is required'),
    ).toBeInTheDocument()
    expect(calls).toHaveLength(0)
  })
})
