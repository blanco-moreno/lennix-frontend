/**
 * The expenses tab is the one `trash-view.test.tsx` only ever shows empty:
 * this pins a populated row — description plus the formatted amount, the two
 * things that identify an expense — and the restore request it sends.
 */

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { makeStore } from '@/stores'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_EXPENSES } from '@/tests/seed'

import { ExpensesTab } from './expenses-tab'

/** Deletion is a runtime event the seed does not stamp for this row. */
const FIXTURE_DELETED_AT = '2026-07-24T12:00:00Z'

const expense = SEED_EXPENSES[0]

function serveTrashedExpenses() {
  server.use(
    http.get('*/v1/trash/expenses', () =>
      HttpResponse.json({
        items: [
          {
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            subtask_id: expense.subtaskId,
            deleted_at: FIXTURE_DELETED_AT,
            deleted_by: expense.createdBy,
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
        total_pages: 1,
      }),
    ),
  )
}

function renderTab() {
  return renderWithProviders(
    <ExpensesTab
      onPurge={() => undefined}
      canPurge={false}
      page={1}
      onPageChange={() => undefined}
    />,
    { store: makeStore() },
  )
}

describe('ExpensesTab', () => {
  it('identifies a trashed expense by description and formatted amount', async () => {
    serveTrashedExpenses()
    renderTab()

    expect(
      await screen.findByText('Mano de obra excavacion'),
    ).toBeInTheDocument()
    // The wire amount is '28000'; the row renders money, not a raw string.
    expect(screen.getByText('$28,000.00')).toBeInTheDocument()
  })

  it('restores through the expense endpoint with the row id', async () => {
    const restored: string[] = []
    serveTrashedExpenses()
    server.use(
      http.post('*/v1/trash/expenses/:id/restore', ({ params }) => {
        restored.push(String(params.id))
        return new HttpResponse(null, { status: 204 })
      }),
    )

    renderTab()

    await userEvent.click(
      await screen.findByRole('button', { name: 'Restore' }),
    )

    await waitFor(() => {
      expect(restored).toEqual([expense.id])
    })
  })
})
