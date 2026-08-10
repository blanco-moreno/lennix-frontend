import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import { server } from '@/mocks/server'
import { mapTaskDTOToTask } from '@/services/task'
import { makeStore } from '@/stores'
import { setUser } from '@/stores/slices/auth-slice'
import {
  DEFAULT_SEED_TASK_ID,
  seedSubtaskExpenseListDTO,
  seedTaskDTO,
} from '@/tests/fixtures'
import { renderWithProviders } from '@/tests/render-with-providers'
import { SEED_IDS } from '@/tests/seed'

import { TaskExpensesTab } from './task-expenses-tab'

/** The seeded Cimentacion phase: three subtasks, expenses on two of them. */
const task = mapTaskDTOToTask(seedTaskDTO(DEFAULT_SEED_TASK_ID))
const allExpenses = (task.subtasks ?? []).flatMap((sub) =>
  seedSubtaskExpenseListDTO(sub.id),
)
const excavationExpenses = seedSubtaskExpenseListDTO(SEED_IDS.P1_SUB_EXCAVATION)

/** Role ids: 1 owner (writes expenses), 99 unmapped (no permission at all). */
function renderTab(roleId = 1, value = task) {
  const store = makeStore()
  store.dispatch(
    setUser({
      userId: SEED_IDS.USER_CARLOS_ID,
      email: 'carlos.rodriguez@lennix-test.com',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      phone: null,
      isActive: true,
      planId: null,
      roleId,
      organizationId: SEED_IDS.ORG_LENNIX_ID,
    }),
  )
  return renderWithProviders(<TaskExpensesTab task={value} />, {
    store,
    route: `/projects/${task.projectId}/tasks/${task.id}`,
  })
}

describe('TaskExpensesTab', () => {
  it('lists every expense of every subactivity, with the count in the heading', async () => {
    renderTab()

    expect(
      await screen.findByText(`Expenses (${allExpenses.length})`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(excavationExpenses[0].description),
    ).toBeInTheDocument()
  })

  it('narrows to one subactivity through the filter', async () => {
    renderTab()
    await screen.findByText(`Expenses (${allExpenses.length})`)

    // The filter's Label carries no htmlFor, so the combobox is opened
    // through its displayed selection ("all" is preselected).
    await userEvent.click(screen.getByText('All subactivities'))
    await userEvent.click(
      await screen.findByRole('option', {
        name: 'Excavacion para cimentacion',
      }),
    )

    expect(
      await screen.findByText(`Expenses (${excavationExpenses.length})`),
    ).toBeInTheDocument()
    // An expense recorded against a sibling subactivity is filtered out.
    expect(
      screen.queryByText('Mano de obra cimentacion'),
    ).not.toBeInTheDocument()
  })

  it('says there is nothing to register against when the phase has no subactivities', () => {
    renderTab(1, { ...task, subtasks: [] })

    expect(screen.getByText('No subactivities')).toBeInTheDocument()
    expect(
      screen.getByText(
        'No subactivities yet. Create subactivities to register expenses against them.',
      ),
    ).toBeInTheDocument()
  })

  it('hides the write controls from a role without task.expenses.write', async () => {
    // Every one of the four roles writes expenses on an obra they belong to,
    // so the only holder-less case left is a role the frontend cannot resolve.
    renderTab(99)

    await screen.findByText(`Expenses (${allExpenses.length})`)
    expect(
      screen.queryByRole('button', { name: /Register expense/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument()
  })

  it('deletes an expense after a confirmation', async () => {
    const deletes: string[] = []
    server.use(
      http.delete('*/v1/expenses/:expenseId', ({ params }) => {
        deletes.push(String(params.expenseId))
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderTab()
    await screen.findByText(`Expenses (${allExpenses.length})`)

    const row = screen
      .getByText(excavationExpenses[0].description)
      .closest('tr') as HTMLElement
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }))

    const dialog = await screen.findByRole('dialog')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => expect(deletes).toEqual([excavationExpenses[0].id]))
  })

  it('admits it could not load rather than showing an empty table', async () => {
    server.use(
      http.get(
        '*/v1/expenses/projects/:projectId',
        () => new HttpResponse(null, { status: 500 }),
      ),
    )
    renderTab()

    expect(
      await screen.findByText('Could not load expenses.'),
    ).toBeInTheDocument()
  })
})
