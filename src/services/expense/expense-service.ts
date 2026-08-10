import type {
  BudgetVariance,
  CostReport,
  ExpenseItem,
  ProjectExpense,
} from '@/types'
import type {
  ExpenseCreateRequestDTO,
  ExpenseUpdateRequestDTO,
} from '@/types/dto/expense-dto'

import { api } from '../api-injector'
import { buildExpenseInvalidationTags, type ExpenseScope } from '../cache-tags'

import {
  createExpense,
  updateExpense,
  deleteExpense,
  listSubtaskExpenses,
  listProjectExpenses,
  getTaskVariance,
  getCostReport,
} from './expense-endpoint'
import {
  mapBudgetVarianceResponseDTOToBudgetVariance,
  mapCostReportResponseDTOToCostReport,
  mapExpenseResponseDTOToExpenseItem,
  mapProjectExpenseArrayToProjectExpenses,
} from './expense-mapper'

interface CreateExpenseArg {
  body: ExpenseCreateRequestDTO
  taskId: string
  projectId: string
}

interface UpdateExpenseArg extends ExpenseScope {
  id: string
  body: ExpenseUpdateRequestDTO
}

interface DeleteExpenseArg extends ExpenseScope {
  id: string
}

export const expenseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createExpense: builder.mutation<ExpenseItem, CreateExpenseArg>({
      query: ({ body }) => createExpense(body),
      transformResponse: mapExpenseResponseDTOToExpenseItem,
      invalidatesTags: (_result, _error, { body, taskId, projectId }) =>
        buildExpenseInvalidationTags({
          subtaskId: body.subtask_id,
          taskId,
          projectId,
        }),
    }),

    updateExpense: builder.mutation<ExpenseItem, UpdateExpenseArg>({
      query: ({ id, body }) => updateExpense({ id, body }),
      transformResponse: mapExpenseResponseDTOToExpenseItem,
      invalidatesTags: (
        _result,
        _error,
        { id, subtaskId, taskId, projectId },
      ) => [
        { type: 'Expense', id },
        ...buildExpenseInvalidationTags({ subtaskId, taskId, projectId }),
      ],
    }),

    deleteExpense: builder.mutation<void, DeleteExpenseArg>({
      query: ({ id }) => deleteExpense(id),
      invalidatesTags: (
        _result,
        _error,
        { id, subtaskId, taskId, projectId },
      ) => [
        { type: 'Expense', id },
        ...buildExpenseInvalidationTags({ subtaskId, taskId, projectId }),
        // Soft-delete: the expense lands in the papelera list.
        { type: 'Trash', id: 'expenses' },
      ],
    }),

    listSubtaskExpenses: builder.query<ProjectExpense[], string>({
      query: listSubtaskExpenses,
      transformResponse: mapProjectExpenseArrayToProjectExpenses,
      providesTags: (_result, _error, subtaskId) => [
        { type: 'Expense', id: `subtask-${subtaskId}` },
      ],
    }),

    listProjectExpenses: builder.query<
      ProjectExpense[],
      {
        projectId: string
        startDate?: string
        endDate?: string
        category?: string
      }
    >({
      query: listProjectExpenses,
      transformResponse: mapProjectExpenseArrayToProjectExpenses,
      providesTags: (_result, _error, { projectId }) => [
        { type: 'Expense', id: `project-${projectId}` },
      ],
    }),

    getTaskVariance: builder.query<BudgetVariance, string>({
      query: getTaskVariance,
      transformResponse: mapBudgetVarianceResponseDTOToBudgetVariance,
      providesTags: (_result, _error, taskId) => [
        { type: 'BudgetVariance', id: taskId },
      ],
    }),

    getCostReport: builder.query<CostReport, string>({
      query: getCostReport,
      transformResponse: mapCostReportResponseDTOToCostReport,
      providesTags: (_result, _error, projectId) => [
        { type: 'CostReport', id: projectId },
      ],
    }),
  }),
})

export const {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useListSubtaskExpensesQuery,
  useListProjectExpensesQuery,
  useGetTaskVarianceQuery,
  useGetCostReportQuery,
} = expenseApi
