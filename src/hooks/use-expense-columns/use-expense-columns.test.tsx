import { screen } from '@testing-library/react'

import { DataTable } from '@/components/ui/data-table'
import { makeStore } from '@/stores'
import { displayedDate } from '@/tests/intl-date'
import { renderWithProviders } from '@/tests/render-with-providers'
import type { ProjectExpense } from '@/types'
import { formatMoney } from '@/utils'

import { useExpenseColumns } from './use-expense-columns'

const expense: ProjectExpense = {
  id: 'expense-1',
  subtaskId: 'subtask-1',
  description: 'Rebar delivery',
  amount: 1500.5,
  category: 'materials',
  expenseDate: '2026-07-01',
  createdBy: 'user-1',
  createdAt: '2026-07-01T12:00:00Z',
  taskId: 'task-1',
  taskTitle: 'Cimentacion',
  subtaskTitle: 'Excavacion',
}

function Harness() {
  const columns = useExpenseColumns()
  return <DataTable columns={columns} data={[expense]} emptyMessage="empty" />
}

describe('useExpenseColumns', () => {
  it('renders the six shared columns with formatted amount, date and category badge', () => {
    // Outside a project route the amounts read in USD, as before `BUD-10`.
    renderWithProviders(<Harness />, { store: makeStore() })

    for (const header of [
      'Main activity',
      'Subactivity',
      'Description',
      'Amount',
      'Category',
      'Date',
    ]) {
      expect(
        screen.getByRole('columnheader', { name: header }),
      ).toBeInTheDocument()
    }

    expect(screen.getByText('Cimentacion')).toBeInTheDocument()
    expect(screen.getByText('Excavacion')).toBeInTheDocument()
    expect(screen.getByText('Rebar delivery')).toBeInTheDocument()
    expect(screen.getByText(formatMoney(expense.amount))).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(
      screen.getByText(displayedDate(expense.expenseDate)),
    ).toBeInTheDocument()
  })
})
