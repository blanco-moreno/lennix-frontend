import type {
  ExpenseCreateRequestDTO,
  ExpenseUpdateRequestDTO,
} from '@/types/dto/expense-dto'

export const createExpense = (body: ExpenseCreateRequestDTO) => ({
  url: '/v1/expenses',
  method: 'POST',
  body,
})

export const updateExpense = ({
  id,
  body,
}: {
  id: string
  body: ExpenseUpdateRequestDTO
}) => ({
  url: `/v1/expenses/${id}`,
  method: 'PUT',
  body,
})

export const deleteExpense = (id: string) => ({
  url: `/v1/expenses/${id}`,
  method: 'DELETE',
})

export const listSubtaskExpenses = (subtaskId: string) =>
  `/v1/expenses/subtasks/${subtaskId}`

export const listProjectExpenses = ({
  projectId,
  startDate,
  endDate,
  category,
}: {
  projectId: string
  startDate?: string
  endDate?: string
  category?: string
}) => ({
  url: `/v1/expenses/projects/${projectId}`,
  params: {
    ...(startDate !== undefined && { start_date: startDate }),
    ...(endDate !== undefined && { end_date: endDate }),
    ...(category !== undefined && { category }),
  },
})

export const getTaskVariance = (taskId: string) =>
  `/v1/expenses/tasks/${taskId}/variance`

export const getCostReport = (projectId: string) =>
  `/v1/expenses/projects/${projectId}/cost-report`

export const uploadExpenseAttachment = ({
  id,
  formData,
}: {
  id: string
  formData: FormData
}) => ({
  url: `/v1/expenses/${id}/attachment`,
  method: 'POST',
  body: formData,
})

export const downloadExpenseAttachment = (id: string) => ({
  url: `/v1/expenses/${id}/attachment`,
  responseHandler: async (response: Response) => response.blob(),
})

export const deleteExpenseAttachment = (id: string) => ({
  url: `/v1/expenses/${id}/attachment`,
  method: 'DELETE',
})
