import { http, HttpResponse } from 'msw'

import {
  DEFAULT_SEED_SUBTASK_ID,
  resolveSeedProjectId,
  resolveSeedSubtaskId,
  resolveSeedTaskId,
  seedBudgetVarianceDTO,
  seedCostReportDTO,
  seedProjectExpenseListDTO,
  seedSubtaskExpenseListDTO,
} from '@/tests/fixtures'

/** The seed attaches several expenses to P1's excavation subtask. */
function defaultExpense() {
  return seedSubtaskExpenseListDTO(DEFAULT_SEED_SUBTASK_ID)[0]
}

export const createExpenseHandler = http.post('*/v1/expenses', () => {
  return HttpResponse.json(defaultExpense(), { status: 201 })
})

export const getExpenseHandler = http.get('*/v1/expenses/:expenseId', () => {
  return HttpResponse.json(defaultExpense())
})

export const updateExpenseHandler = http.put('*/v1/expenses/:expenseId', () => {
  return HttpResponse.json(defaultExpense())
})

export const deleteExpenseHandler = http.delete(
  '*/v1/expenses/:expenseId',
  () => {
    return new HttpResponse(null, { status: 204 })
  },
)

export const listSubtaskExpensesHandler = http.get(
  '*/v1/expenses/subtasks/:subtaskId',
  ({ params }) => {
    return HttpResponse.json(
      seedSubtaskExpenseListDTO(resolveSeedSubtaskId(params.subtaskId)),
    )
  },
)

export const listProjectExpensesHandler = http.get(
  '*/v1/expenses/projects/:projectId',
  ({ params }) => {
    return HttpResponse.json(
      seedProjectExpenseListDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const getTaskVarianceHandler = http.get(
  '*/v1/expenses/tasks/:taskId/variance',
  ({ params }) => {
    return HttpResponse.json(
      seedBudgetVarianceDTO(resolveSeedTaskId(params.taskId)),
    )
  },
)

export const getCostReportHandler = http.get(
  '*/v1/expenses/projects/:projectId/cost-report',
  ({ params }) => {
    return HttpResponse.json(
      seedCostReportDTO(resolveSeedProjectId(params.projectId)),
    )
  },
)

export const expenseHandlers = [
  createExpenseHandler,
  getExpenseHandler,
  updateExpenseHandler,
  deleteExpenseHandler,
  listSubtaskExpensesHandler,
  listProjectExpensesHandler,
  getTaskVarianceHandler,
  getCostReportHandler,
]
